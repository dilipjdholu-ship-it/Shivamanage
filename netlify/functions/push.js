const ONESIGNAL_APP_ID = "94b9b25f-e314-4388-a806-6264e8e3dd46";
// REST key comes from a Netlify environment variable, never hardcoded here.
// Set it in: Netlify dashboard → Site settings → Environment variables → ONESIGNAL_REST_KEY
const ONESIGNAL_KEY = process.env.ONESIGNAL_REST_KEY;

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const { title, message } = JSON.parse(event.body || "{}");
  const results = [];

  // Payload for v1 API
  const v1Payload = JSON.stringify({
    app_id: ONESIGNAL_APP_ID,
    included_segments: ["Total Subscriptions"],
    headings: { en: title },
    contents: { en: message },
    url: "https://shivamanage.netlify.app"
  });

  // Payload for v2 API (slightly different structure)
  const v2Payload = JSON.stringify({
    app_id: ONESIGNAL_APP_ID,
    target_channel: "push",
    included_segments: ["Total Subscriptions"],
    headings: { en: title },
    contents: { en: message },
    url: "https://shivamanage.netlify.app"
  });

  const attempts = [
    // v2 API with Bearer
    { url: "https://api.onesignal.com/notifications",       auth: "Bearer " + ONESIGNAL_KEY, body: v2Payload },
    // v2 API with Key prefix
    { url: "https://api.onesignal.com/notifications",       auth: "Key " + ONESIGNAL_KEY,    body: v2Payload },
    // v1 API with Key prefix
    { url: "https://api.onesignal.com/api/v1/notifications",auth: "Key " + ONESIGNAL_KEY,    body: v1Payload },
    // v1 API with Bearer
    { url: "https://api.onesignal.com/api/v1/notifications",auth: "Bearer " + ONESIGNAL_KEY, body: v1Payload },
    // Old v1 with Basic
    { url: "https://onesignal.com/api/v1/notifications",    auth: "Basic " + ONESIGNAL_KEY,  body: v1Payload },
  ];

  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": attempt.auth },
        body: attempt.body
      });
      const data = await res.json();
      const label = attempt.auth.split(" ")[0] + " @ " + attempt.url.replace("https://","").split("/")[0];
      results.push({ label, errors: data.errors||null, id: data.id||null, recipients: data.recipients });

      if (!data.errors) {
        return {
          statusCode: 200,
          headers: { "Content-Type":"application/json","Access-Control-Allow-Origin":"*" },
          body: JSON.stringify({ success:true, recipients:data.recipients, id:data.id, _method:label })
        };
      }
    } catch(e) {
      results.push({ label: attempt.auth.split(" ")[0], networkError: e.message });
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type":"application/json","Access-Control-Allow-Origin":"*" },
    body: JSON.stringify({ success:false, results })
  };
};
