# Shop Manager

Shop management PWA for Shivam Hardware & Satyam Traders.

## Layout
```
shop-manager-app.jsx   ← source (edit this)
index.template.html    ← static wrapper (head scripts, Firebase init, OneSignal config)
build.sh                ← compiles the jsx into docs/index.html
docs/                    ← served by GitHub Pages (Settings → Pages → branch: main, folder: /docs)
netlify.toml, netlify/  ← for the Netlify production deploy (unused by GitHub Pages)
```

## Testing workflow (GitHub Pages — free, no build-minute limits)
```bash
# after editing shop-manager-app.jsx
./build.sh
git add -A
git commit -m "describe the change"
git push
```
GitHub Pages redeploys automatically in under a minute. Live at:
`https://<your-username>.github.io/<repo-name>/`

## Production deploy (Netlify)
When a version is ready for real use:
1. `./build.sh` to make sure `docs/index.html` is current.
2. Copy `docs/index.html`, `docs/manifest.json`, `docs/sw.js`, `docs/icon.svg`,
   `docs/OneSignalSDKWorker.js`, `netlify.toml`, and `netlify/` into a
   `ShopManager-PWA/` folder.
3. Drag that folder onto app.netlify.com → Deploys.

## Notes
- Push notifications call the Netlify function directly
  (`https://shivamanage.netlify.app/.netlify/functions/push`), so they work
  from GitHub Pages too — the function already sends
  `Access-Control-Allow-Origin: *`.
- `docs/manifest.json`'s `start_url` is `.` (relative) so the PWA installs
  correctly whether it's served from a domain root (Netlify) or a GitHub
  Pages project subpath (`/repo-name/`).
- Data lives entirely in Firebase — redeploying to either platform never
  touches shop data.
