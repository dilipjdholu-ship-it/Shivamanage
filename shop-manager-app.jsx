import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// FONTS & GLOBALS
// ─────────────────────────────────────────────────────────────
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#F0F4F8;font-family:Inter,sans-serif;}
button{cursor:pointer;border:none;background:none;font-family:inherit;}
input,textarea,select{outline:none;font-family:inherit;}
textarea{resize:none;}
@keyframes pop{from{transform:scale(.5);opacity:0;}to{transform:scale(1);opacity:1;}}
@keyframes slide-up{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
@keyframes fade-in{from{opacity:0;}to{opacity:1;}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.45;}}
.pop{animation:pop .2s cubic-bezier(.34,1.56,.64,1);}
.slide-up{animation:slide-up .2s ease;}
.fade-in{animation:fade-in .18s ease;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:2px;}
`;

// ─────────────────────────────────────────────────────────────
// TOKENS
// ─────────────────────────────────────────────────────────────
const C = {
  bg:"#F0F4F8", surface:"#FFFFFF", border:"#E2E8F0",
  navy:"#1A2D5A", accent:"#1D4ED8", accentLight:"#EFF6FF",
  success:"#059669", successLight:"#ECFDF5",
  warn:"#D97706",   warnLight:"#FFFBEB",
  danger:"#DC2626", dangerLight:"#FEF2F2",
  purple:"#7C3AED", purpleLight:"#F5F3FF",
  text:"#0F172A", muted:"#64748B", mutedLight:"#94A3B8",
};
const F = { display:"'Space Grotesk',sans-serif", body:"'Inter',sans-serif" };

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const STAFF = ["DJ","Ravi","Priya","Suresh","Meena","Arjun","Lakshmi","Vijay","Sunita","Deepak"];
const SETUP_CODE = "SHOP2024"; // ← Change this to your own secret before deploying
const UNITS = ["pcs","kg","mtr","box","ltr","roll","bag","set","pair","sheet"];
const PALETTE= ["#1D4ED8","#0891B2","#7C3AED","#059669","#DC2626","#D97706","#BE185D","#65A30D"];
const CAT_ICONS=["🔧","🔩","⚡","🎨","🪣","🪟","🛒","📦","🔌","🪚"];

const ORDER_STATUS = {
  new:        { label:"New",        color:C.warn,    bg:C.warnLight,    icon:"🆕", next:"processing" },
  processing: { label:"Processing", color:C.accent,  bg:C.accentLight,  icon:"⚙️", next:"ready"      },
  ready:      { label:"Ready",      color:C.success, bg:C.successLight, icon:"✅", next:"delivered"  },
  delivered:  { label:"Delivered",  color:C.muted,   bg:"#F1F5F9",      icon:"📦", next:null         },
  cancelled:  { label:"Cancelled",  color:C.danger,  bg:C.dangerLight,  icon:"❌", next:null         },
};

const INITIAL_CATS = [
  { id:"cat-plumbing",  name:"Plumbing",   color:"#0891B2", icon:"🔧", collapsed:false,
    items:[{id:"p1",name:'PVC Pipe 1"',note:"6mm thickness",defaultSupplier:"Raj Traders",reqQty:20,reqUnit:"pcs",sortOrder:0,ordered:false,orderedBy:null,orderedAt:null,orderNote:null,orderQty:null,orderSupplier:null,orderDueDate:null},{id:"p2",name:'Ball Valve 1/2"',note:"",defaultSupplier:"",reqQty:10,reqUnit:"pcs",sortOrder:1,ordered:false,orderedBy:null,orderedAt:null,orderNote:null,orderQty:null,orderSupplier:null,orderDueDate:null}]},
  { id:"cat-hardware",  name:"Hardware",   color:"#D97706", icon:"🔩", collapsed:false,
    items:[{id:"h1",name:'GI Screws 4"',note:"stainless",defaultSupplier:"Metal House",reqQty:5,reqUnit:"box",sortOrder:0,ordered:false,orderedBy:null,orderedAt:null,orderNote:null,orderQty:null,orderSupplier:null,orderDueDate:null},{id:"h2",name:"Steel Wire 12G",note:"",defaultSupplier:"",reqQty:10,reqUnit:"kg",sortOrder:1,ordered:false,orderedBy:null,orderedAt:null,orderNote:null,orderQty:null,orderSupplier:null,orderDueDate:null}]},
  { id:"cat-electrical",name:"Electrical", color:"#7C3AED", icon:"⚡", collapsed:false,
    items:[{id:"e1",name:"MCB 32A",note:"Havells or Legrand",defaultSupplier:"Havells Dist.",reqQty:4,reqUnit:"pcs",sortOrder:0,ordered:false,orderedBy:null,orderedAt:null,orderNote:null,orderQty:null,orderSupplier:null,orderDueDate:null},{id:"e2",name:'PVC Conduit 1"',note:"",defaultSupplier:"",reqQty:10,reqUnit:"pcs",sortOrder:1,ordered:false,orderedBy:null,orderedAt:null,orderNote:null,orderQty:null,orderSupplier:null,orderDueDate:null}]},
  { id:"cat-paint",     name:"Paint",      color:"#059669", icon:"🎨", collapsed:false,
    items:[{id:"pa1",name:"Asian Paints 20L",note:"Brilliant White",defaultSupplier:"AP Depot",reqQty:3,reqUnit:"pcs",sortOrder:0,ordered:false,orderedBy:null,orderedAt:null,orderNote:null,orderQty:null,orderSupplier:null,orderDueDate:null}]},
];

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2); }
function fmtTime(iso){
  if(!iso) return "";
  const d=new Date(iso),now=new Date(),diff=Math.floor((now-d)/1000);
  if(diff<60) return "just now";
  if(diff<3600) return `${Math.floor(diff/60)} min ago`;
  if(diff<86400) return `${Math.floor(diff/3600)}h ago`;
  return d.toLocaleDateString("en-IN",{day:"numeric",month:"short"})+" · "+d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
}
function fmtDate(iso){ if(!iso) return ""; return new Date(iso).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); }
function fmtClockTime(iso){ if(!iso) return ""; return new Date(iso).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"}); }
function todayStr(){ return new Date().toISOString().slice(0,10); }
function fmtINR(n){ return "₹"+Number(n).toLocaleString("en-IN"); }
async function compressImage(file){
  return new Promise(resolve=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const MAX=900;
        let {width:w,height:h}=img;
        if(w>MAX||h>MAX){ if(w>h){h=Math.round(h/w*MAX);w=MAX;}else{w=Math.round(w/h*MAX);h=MAX;} }
        const canvas=document.createElement("canvas");
        canvas.width=w; canvas.height=h;
        canvas.getContext("2d").drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL("image/jpeg",0.72));
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
// Sharper/larger than compressImage — for product photos (e.g. tile designs)
// meant to look good shared to WhatsApp, not just as a reference thumbnail.
async function compressTilePhoto(file){
  return new Promise(resolve=>{
    const reader=new FileReader();
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        const MAX=1600;
        let {width:w,height:h}=img;
        if(w>MAX||h>MAX){ if(w>h){h=Math.round(h/w*MAX);w=MAX;}else{w=Math.round(w/h*MAX);h=MAX;} }
        const canvas=document.createElement("canvas");
        canvas.width=w; canvas.height=h;
        canvas.getContext("2d").drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL("image/jpeg",0.85));
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
function initials(n){ return (n||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); }
async function sget(k){
  try{
    const r=await window.storage.get(k,true);
    return r?JSON.parse(r.value):null;
  }catch(e){
    console.error("sget failed for key:",k,e);
    return null;
  }
}
async function sset(k,v){
  try{
    const result=await window.storage.set(k,JSON.stringify(v),true);
    return true;
  }catch(e){
    console.error("sset failed:",k,e);
    return false;
  }
}
async function hashPassword(pwd){
  const data=new TextEncoder().encode(pwd+"shopsalt9z");
  const hash=await crypto.subtle.digest("SHA-256",data);
  return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

// ─────────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────────
function Avatar({name,size=30,color=C.accent}){
  return <div style={{width:size,height:size,borderRadius:"50%",background:color,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.36,fontWeight:700,fontFamily:F.display,flexShrink:0}}>{initials(name)}</div>;
}

function StatusBadge({status}){
  const s=ORDER_STATUS[status]||ORDER_STATUS.new;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:999,background:s.bg,color:s.color,fontSize:11,fontWeight:700,fontFamily:F.body,whiteSpace:"nowrap"}}>{s.icon} {s.label}</span>;
}

function Modal({title,onClose,children,width=480,fullHeight}){
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200,padding:"0"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="slide-up" style={{background:C.surface,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:600,maxHeight:fullHeight?"95vh":"88vh",display:"flex",flexDirection:"column",boxShadow:"0 -8px 40px rgba(0,0,0,.18)"}}>
        <div style={{padding:"14px 18px 10px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{fontFamily:F.display,fontWeight:700,fontSize:15,color:C.text}}>{title}</span>
          <button onClick={onClose} style={{color:C.mutedLight,fontSize:22,lineHeight:1,padding:"0 4px"}}>×</button>
        </div>
        <div style={{overflowY:"auto",padding:18,flex:1}}>{children}</div>
      </div>
    </div>
  );
}

function Field({label,children,required}){
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:"block",fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>
        {label}{required&&<span style={{color:C.danger,marginLeft:2}}>*</span>}
      </label>
      {children}
    </div>
  );
}

function FInput({value,onChange,placeholder,type="text",style:s}){
  return <input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD",...s}}/>;
}

function Btn({children,onClick,variant="primary",size="md",disabled,style:s}){
  const base={display:"inline-flex",alignItems:"center",gap:6,borderRadius:9,fontFamily:F.body,fontWeight:700,border:"none",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,...(size==="sm"?{fontSize:12,padding:"6px 12px"}:{fontSize:13,padding:"10px 18px"})};
  const v={primary:{background:C.accent,color:"#fff"},success:{background:C.success,color:"#fff"},danger:{background:C.danger,color:"#fff"},ghost:{background:"transparent",color:C.accent,border:`1.5px solid ${C.border}`},dark:{background:C.navy,color:"#fff"}};
  return <button onClick={onClick} disabled={disabled} style={{...base,...v[variant],...s}}>{children}</button>;
}

function Toast({msg,onDone}){
  useEffect(()=>{ const t=setTimeout(onDone,2400); return()=>clearTimeout(t); },[]);
  return <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:C.text,color:"#fff",padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:500,zIndex:500,boxShadow:"0 4px 20px rgba(0,0,0,.3)",whiteSpace:"nowrap"}}>{msg}</div>;
}

// ─────────────────────────────────────────────────────────────
// SETUP SCREEN (3 steps: code → shops → admin)
// ─────────────────────────────────────────────────────────────
function SetupScreen({onSetup}){
  const [step,setStep]         = useState("code");
  const [code,setCode]         = useState("");
  const [codeErr,setCodeErr]   = useState(false);
  const [shopList,setShopList] = useState([
    {id:uid(),name:"Shivam Hardware",icon:"🔧",color:"#1D4ED8"},
    {id:uid(),name:"Satyam Traders", icon:"🏪",color:"#059669"},
  ]);
  const [name,setName]         = useState("");
  const [username,setUsername] = useState("admin");
  const [password,setPassword] = useState("");
  const [confirm,setConfirm]   = useState("");
  const [error,setError]       = useState("");
  const [loading,setLoading]   = useState(false);

  const S_ICONS =["🏪","🔧","🛒","📦","⚡","🎨","🔩","🪟","🏗","🧰"];
  const S_COLORS=["#1D4ED8","#059669","#D97706","#7C3AED","#DC2626","#0891B2","#BE185D","#65A30D"];

  function checkCode(){ if(code.trim()===SETUP_CODE){ setStep("shops"); setCodeErr(false); } else setCodeErr(true); }
  function updateShop(id,f,v){ setShopList(p=>p.map(s=>s.id===id?{...s,[f]:v}:s)); }
  function addShop(){ if(shopList.length>=5) return; setShopList(p=>[...p,{id:uid(),name:"",icon:"🏪",color:S_COLORS[p.length%S_COLORS.length]}]); }
  function removeShop(id){ if(shopList.length<=1) return; setShopList(p=>p.filter(s=>s.id!==id)); }

  async function setup(){
    if(!name.trim()||!username.trim()||!password){ setError("All fields required"); return; }
    if(password!==confirm){ setError("Passwords don't match"); return; }
    if(password.length<4){ setError("Min 4 characters"); return; }
    const valid=shopList.filter(s=>s.name.trim());
    if(!valid.length){ setError("At least one shop required"); return; }
    setLoading(true); setError("");
    try{
      const passwordHash=await hashPassword(password);
      const finalShops=valid.map(s=>({...s,name:s.name.trim()}));
      const admin={id:uid(),displayName:name.trim(),username:username.trim().toLowerCase(),passwordHash,role:"admin",shops:finalShops.map(s=>s.id),createdAt:new Date().toISOString()};
      const r1=await sset("shops",finalShops);
      const r2=await sset("shop-users",[admin]);
      if(r1===false||r2===false){
        setError("Could not save to database. Check Firebase rules — set .read and .write to true.");
        setLoading(false); return;
      }
      onSetup(finalShops,[admin],admin);
    }catch(e){
      setError("Error: "+e.message);
      setLoading(false);
    }
  }

  const IS={width:"100%",padding:"10px 12px",borderRadius:8,border:"1.5px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.08)",color:"#fff",fontSize:13,fontFamily:F.body};
  const stepNum={code:0,shops:1,admin:2}[step];

  return (
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{FONTS}</style>
      <div style={{width:56,height:56,borderRadius:16,background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:12}}>🏪</div>
      <h1 style={{fontFamily:F.display,fontWeight:700,fontSize:20,color:"#fff",marginBottom:4}}>Shop Manager Setup</h1>
      <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:20}}>
        {["Enter code","Set up shops","Create admin"].map((lbl,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:i<=stepNum?"#1D4ED8":"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff"}}>
              {i<stepNum?"✓":i+1}
            </div>
            {i<2&&<div style={{width:20,height:2,background:i<stepNum?"#1D4ED8":"rgba(255,255,255,.15)",borderRadius:1}}/>}
          </div>
        ))}
      </div>

      {step==="code"&&(
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:16,padding:22,width:"100%",maxWidth:320,border:"1.5px solid rgba(255,255,255,.1)"}}>
          <p style={{color:"rgba(255,255,255,.45)",fontSize:13,marginBottom:14,textAlign:"center"}}>Enter the setup code to begin.</p>
          <label style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.4)",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Setup code</label>
          <input value={code} onChange={e=>setCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&checkCode()} type="password" placeholder="Enter setup code"
            style={{...IS,marginBottom:10,letterSpacing:".15em"}}/>
          {codeErr&&<p style={{fontSize:12,color:"#FCA5A5",marginBottom:8,textAlign:"center"}}>Incorrect code</p>}
          <button onClick={checkCode} style={{width:"100%",padding:"11px",borderRadius:9,background:"#1D4ED8",color:"#fff",fontSize:14,fontWeight:700,fontFamily:F.body}}>Continue →</button>
        </div>
      )}

      {step==="shops"&&(
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:16,padding:20,width:"100%",maxWidth:420,border:"1.5px solid rgba(255,255,255,.1)"}}>
          <p style={{color:"rgba(255,255,255,.4)",fontSize:12,marginBottom:14}}>Name your shops — you can edit these later.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
            {shopList.map((shop,i)=>(
              <div key={shop.id} style={{background:"rgba(255,255,255,.06)",borderRadius:10,padding:"12px"}}>
                <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                  <select value={shop.icon} onChange={e=>updateShop(shop.id,"icon",e.target.value)}
                    style={{...IS,width:52,padding:"7px 4px",fontSize:18,textAlign:"center",flex:"none"}}>
                    {S_ICONS.map(ic=><option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <input value={shop.name} onChange={e=>updateShop(shop.id,"name",e.target.value)} placeholder={"Shop "+(i+1)+" name"}
                    style={{...IS,flex:1}}/>
                  {shopList.length>1&&<button onClick={()=>removeShop(shop.id)} style={{color:"rgba(255,120,120,.7)",fontSize:18,padding:"0 6px",flexShrink:0}}>×</button>}
                </div>
                <div style={{display:"flex",gap:6}}>
                  {S_COLORS.map(col=>(
                    <button key={col} onClick={()=>updateShop(shop.id,"color",col)}
                      style={{width:22,height:22,borderRadius:"50%",background:col,border:shop.color===col?"2.5px solid #fff":"2px solid transparent",flexShrink:0}}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {shopList.length<5&&<button onClick={addShop} style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:14,display:"block"}}>+ Add another shop</button>}
          <button onClick={()=>{ if(shopList.some(s=>s.name.trim())) setStep("admin"); }}
            style={{width:"100%",padding:"11px",borderRadius:9,background:"#1D4ED8",color:"#fff",fontSize:14,fontWeight:700,fontFamily:F.body}}>
            Continue → Create Admin
          </button>
        </div>
      )}

      {step==="admin"&&(
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:16,padding:22,width:"100%",maxWidth:340,border:"1.5px solid rgba(255,255,255,.1)"}}>
          <p style={{color:"rgba(255,255,255,.4)",fontSize:12,marginBottom:14,textAlign:"center"}}>Admin has access to all shops.</p>
          {[
            {lbl:"Your name",   val:name,     set:setName,     ph:"e.g. DJ",          t:"text"},
            {lbl:"Username",    val:username, set:setUsername, ph:"e.g. admin",        t:"text"},
            {lbl:"Password",    val:password, set:setPassword, ph:"Min 4 characters",  t:"password"},
            {lbl:"Confirm pwd", val:confirm,  set:setConfirm,  ph:"Repeat password",   t:"password"},
          ].map(f=>(
            <div key={f.lbl} style={{marginBottom:11}}>
              <label style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.4)",display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:".05em"}}>{f.lbl}</label>
              <input type={f.t} value={f.val} onChange={e=>f.set(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setup()} placeholder={f.ph} style={IS}/>
            </div>
          ))}
          {error&&<p style={{fontSize:12,color:"#FCA5A5",marginBottom:8,textAlign:"center"}}>{error}</p>}
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button onClick={()=>setStep("shops")} style={{padding:"11px 14px",borderRadius:9,border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.6)",fontSize:13,fontFamily:F.body}}>← Back</button>
            <button onClick={setup} disabled={loading} style={{flex:1,padding:"11px",borderRadius:9,background:"#1D4ED8",color:"#fff",fontSize:14,fontWeight:700,fontFamily:F.body}}>
              {loading?"Setting up…":"Finish Setup ✓"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────
function LoginScreen({users,onLogin}){
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [showPwd,setShowPwd]   = useState(false);
  const [error,setError]       = useState("");
  const [loading,setLoading]   = useState(false);

  async function login(){
    if(!username.trim()||!password) return;
    setLoading(true); setError("");
    try{
      if(!users||users.length===0){ setError("No accounts found. Please complete setup first."); setLoading(false); return; }
      const input=username.trim().toLowerCase();
      // Allow login with either username OR display name
      const found=users.find(u=>
        u.username===input ||
        u.displayName.toLowerCase()===input
      );
      if(!found){
        setError("Username not found. Try your display name or username from setup.");
        setLoading(false); return;
      }
      const hash=await hashPassword(password);
      if(hash!==found.passwordHash){
        setError("Incorrect password. Try again.");
        setLoading(false); return;
      }
      onLogin(found);
    }catch(e){
      setError("Login error: "+e.message);
      setLoading(false);
    }
  }

  return (
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{FONTS}</style>
      <div style={{width:64,height:64,borderRadius:18,background:"rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:16}}>🏪</div>
      <h1 style={{fontFamily:F.display,fontWeight:700,fontSize:24,color:"#fff",marginBottom:4}}>Shop Manager</h1>
      <p style={{color:"rgba(255,255,255,.4)",fontSize:13,marginBottom:32}}>Sign in to continue</p>
      <div style={{background:"rgba(255,255,255,.07)",borderRadius:16,padding:24,width:"100%",maxWidth:340,border:"1.5px solid rgba(255,255,255,.1)"}}>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.45)",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Name or Username</label>
          <input value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="e.g. DJ or admin" autoCapitalize="none"
            style={{width:"100%",padding:"12px 13px",borderRadius:9,border:"1.5px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.08)",color:"#fff",fontSize:14,fontFamily:F.body}}/>
        </div>
        <div style={{marginBottom:20,position:"relative"}}>
          <label style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.45)",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:".05em"}}>Password</label>
          <input type={showPwd?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Enter your password"
            style={{width:"100%",padding:"12px 40px 12px 13px",borderRadius:9,border:"1.5px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.08)",color:"#fff",fontSize:14,fontFamily:F.body}}/>
          <button onClick={()=>setShowPwd(p=>!p)} style={{position:"absolute",right:12,bottom:13,color:"rgba(255,255,255,.4)",fontSize:16,lineHeight:1}}>{showPwd?"🙈":"👁"}</button>
        </div>
        {error&&<p style={{fontSize:12,color:"#FCA5A5",marginBottom:12,textAlign:"center",fontWeight:500}}>{error}</p>}
        <button onClick={login} disabled={!username.trim()||!password||loading}
          style={{width:"100%",padding:"13px",borderRadius:9,background:username.trim()&&password?"#1D4ED8":"rgba(255,255,255,.15)",color:"#fff",fontSize:14,fontWeight:700,fontFamily:F.body}}>
          {loading?"Signing in…":"Sign In"}
        </button>
      </div>
      <p style={{color:"rgba(255,255,255,.2)",fontSize:11,marginTop:20}}>Contact your admin if you can't log in</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHOP SELECTOR
// ─────────────────────────────────────────────────────────────
function ShopSelector({shops,user,onSelect,onLogout}){
  return (
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{FONTS}</style>
      <div style={{textAlign:"center",marginBottom:28}}>
        <Avatar name={user} size={52} color="rgba(255,255,255,.2)"/>
        <h2 style={{fontFamily:F.display,fontWeight:700,fontSize:20,color:"#fff",marginTop:12,marginBottom:2}}>Welcome, {user}</h2>
        <p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Select a shop to manage</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:380}}>
        {shops.map(shop=>(
          <button key={shop.id} onClick={()=>onSelect(shop)}
            style={{padding:"18px 20px",borderRadius:14,border:"2px solid "+shop.color+"50",background:shop.color+"18",display:"flex",alignItems:"center",gap:14,textAlign:"left",width:"100%",transition:"transform .15s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            <div style={{width:50,height:50,borderRadius:13,background:shop.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>
              {shop.icon}
            </div>
            <div style={{flex:1}}>
              <p style={{fontFamily:F.display,fontWeight:700,fontSize:17,color:"#fff"}}>{shop.name}</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,.35)",marginTop:2}}>Tap to open →</p>
            </div>
          </button>
        ))}
      </div>
      <button onClick={onLogout} style={{marginTop:28,fontSize:12,color:"rgba(255,255,255,.3)",fontFamily:F.body}}>Log out</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// USER MANAGEMENT (admin only)
// ─────────────────────────────────────────────────────────────
function UserManagementModal({users,shopList,currentUser,onUpdate,onClose}){
  const [showAdd,setShowAdd]     = useState(false);
  const [newName,setNewName]     = useState("");
  const [newUser,setNewUser]     = useState("");
  const [newPwd,setNewPwd]       = useState("");
  const [newRole,setNewRole]     = useState("staff");
  const [newShops,setNewShops]   = useState([]);
  const [resettingId,setResettingId] = useState(null);
  const [resetPwd,setResetPwd]   = useState("");
  const [error,setError]         = useState("");
  const [loading,setLoading]     = useState(false);

  function toggleShop(shopId){ setNewShops(p=>p.includes(shopId)?p.filter(s=>s!==shopId):[...p,shopId]); }

  async function addUser(){
    if(!newName.trim()||!newUser.trim()||!newPwd){ setError("All fields required"); return; }
    if(users.some(u=>u.username===newUser.trim().toLowerCase())){ setError("Username already exists"); return; }
    if(newPwd.length<4){ setError("Password min 4 characters"); return; }
    const assignedShops = newRole==="admin" ? shopList.map(s=>s.id) : newShops;
    if(newRole==="staff"&&assignedShops.length===0){ setError("Assign at least one shop"); return; }
    setLoading(true);
    const passwordHash=await hashPassword(newPwd);
    const next=[...users,{id:uid(),displayName:newName.trim(),username:newUser.trim().toLowerCase(),passwordHash,role:newRole,shops:assignedShops,createdAt:new Date().toISOString()}];
    await sset("shop-users",next); onUpdate(next);
    setNewName(""); setNewUser(""); setNewPwd(""); setNewRole("staff"); setNewShops([]); setShowAdd(false); setError(""); setLoading(false);
  }

  async function resetPassword(userId){
    if(resetPwd.length<4){ setError("Password min 4 characters"); return; }
    setLoading(true);
    const passwordHash=await hashPassword(resetPwd);
    const next=users.map(u=>u.id===userId?{...u,passwordHash}:u);
    await sset("shop-users",next); onUpdate(next);
    setResettingId(null); setResetPwd(""); setError(""); setLoading(false);
  }

  async function deleteUser(userId){
    if(!window.confirm("Delete this staff account?")) return;
    const next=users.filter(u=>u.id!==userId);
    await sset("shop-users",next); onUpdate(next);
  }

  const roleColors={admin:C.accent,staff:C.muted};

  return (
    <Modal title="Manage Staff Accounts" onClose={onClose} fullHeight>
      <p style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.5}}>
        Only admins can create accounts. Staff cannot change their own login details.
      </p>
      <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:14}}>
        {users.map(u=>{
          const userShopNames = (u.shops||[]).map(sid=>shopList.find(s=>s.id===sid)?.name).filter(Boolean);
          return (
            <div key={u.id} style={{background:C.bg,borderRadius:10,padding:"12px 13px",border:"1px solid "+C.border}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <Avatar name={u.displayName} size={36} color={roleColors[u.role]||C.muted}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:700,color:C.text}}>{u.displayName}</p>
                  <p style={{fontSize:11,color:C.muted}}>@{u.username} · <span style={{color:roleColors[u.role],fontWeight:600,textTransform:"capitalize"}}>{u.role}</span></p>
                  {userShopNames.length>0&&<p style={{fontSize:11,color:C.mutedLight,marginTop:2}}>{userShopNames.join(" · ")}</p>}
                </div>
                {u.id===currentUser.id
                  ?<span style={{fontSize:11,color:C.mutedLight,padding:"3px 8px",border:"1px solid "+C.border,borderRadius:6}}>You</span>
                  :(
                    <div style={{display:"flex",gap:5}}>
                      <button onClick={()=>{ setResettingId(r=>r===u.id?null:u.id); setResetPwd(""); setError(""); }}
                        style={{fontSize:11,fontWeight:600,color:C.accent,padding:"4px 8px",borderRadius:6,border:"1px solid "+C.border,background:"#fff"}}>Reset pwd</button>
                      <button onClick={()=>deleteUser(u.id)}
                        style={{fontSize:11,fontWeight:600,color:C.danger,padding:"4px 8px",borderRadius:6,border:"1px solid "+C.danger+"30",background:"#fff"}}>Delete</button>
                    </div>
                  )
                }
              </div>
              {resettingId===u.id&&(
                <div className="slide-down" style={{marginTop:10,paddingTop:10,borderTop:"1px solid "+C.border,display:"flex",gap:7,alignItems:"center"}}>
                  <input type="password" value={resetPwd} onChange={e=>setResetPwd(e.target.value)} placeholder="New password (min 4 chars)"
                    style={{flex:1,padding:"7px 10px",borderRadius:7,border:"1.5px solid "+C.border,fontSize:12,color:C.text,background:"#fff"}}/>
                  <button onClick={()=>resetPassword(u.id)} disabled={!resetPwd||loading}
                    style={{padding:"7px 12px",borderRadius:7,background:C.success,color:"#fff",fontSize:12,fontWeight:700}}>Set</button>
                  <button onClick={()=>{ setResettingId(null); setError(""); }} style={{fontSize:12,color:C.muted}}>Cancel</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error&&<p style={{fontSize:12,color:C.danger,marginBottom:10,fontWeight:600}}>{error}</p>}

      {showAdd?(
        <div className="slide-down" style={{background:C.bg,borderRadius:10,padding:14,border:"1px solid "+C.border}}>
          <p style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12}}>New staff account</p>
          {[
            {lbl:"Full name", val:newName,set:setNewName,ph:"e.g. Ravi Kumar",  t:"text"},
            {lbl:"Username",  val:newUser,set:setNewUser,ph:"e.g. ravi",        t:"text"},
            {lbl:"Password",  val:newPwd, set:setNewPwd, ph:"Min 4 characters", t:"password"},
          ].map(f=>(
            <div key={f.lbl} style={{marginBottom:9}}>
              <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:3,textTransform:"uppercase",letterSpacing:".04em"}}>{f.lbl}</label>
              <input type={f.t} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid "+C.border,fontSize:13,color:C.text,background:"#fff"}}/>
            </div>
          ))}
          <div style={{marginBottom:10}}>
            <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".04em"}}>Role</label>
            <select value={newRole} onChange={e=>setNewRole(e.target.value)}
              style={{width:"100%",padding:"8px 10px",borderRadius:7,border:"1.5px solid "+C.border,fontSize:13,color:C.text,background:"#fff"}}>
              <option value="staff">Staff</option>
              <option value="admin">Admin (all shops)</option>
            </select>
          </div>
          {newRole==="staff"&&(
            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".04em"}}>Assign to shop(s)</label>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {shopList.map(shop=>(
                  <label key={shop.id} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"8px 10px",borderRadius:8,background:newShops.includes(shop.id)?shop.color+"15":"#fff",border:"1.5px solid "+(newShops.includes(shop.id)?shop.color:C.border)}}>
                    <input type="checkbox" checked={newShops.includes(shop.id)} onChange={()=>toggleShop(shop.id)}
                      style={{width:16,height:16,accentColor:shop.color,flexShrink:0}}/>
                    <span style={{fontSize:16}}>{shop.icon}</span>
                    <span style={{fontSize:13,fontWeight:600,color:C.text}}>{shop.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={addUser} disabled={loading}>{loading?"Adding…":"Add staff"}</Btn>
            <Btn variant="ghost" onClick={()=>{ setShowAdd(false); setError(""); setNewShops([]); }}>Cancel</Btn>
          </div>
        </div>
      ):(
        <button onClick={()=>setShowAdd(true)}
          style={{width:"100%",padding:"12px",borderRadius:10,border:"2px dashed "+C.border,color:C.accent,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"transparent"}}>
          + Add staff member
        </button>
      )}
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// BOTTOM NAV
// ─────────────────────────────────────────────────────────────
function BottomNav({section,setSection,badges}){
  const tabs=[
    {id:"dashboard", icon:"🏠", label:"Home"},
    {id:"orders",    icon:"🛒", label:"Orders",  badge:badges.orders},
    {id:"reorder",   icon:"📋", label:"Reorder", badge:badges.reorder},
    {id:"tasks",     icon:"✅", label:"Tasks",   badge:badges.tasks},
    {id:"shared",    icon:"🔄", label:"Shared",  badge:badges.shared},
  ];
  return (
    <nav style={{position:"fixed",bottom:0,left:0,right:0,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",flexDirection:"column",zIndex:100,boxShadow:"0 -2px 12px rgba(0,0,0,.07)"}}>
      <div style={{display:"flex"}}>
        {tabs.map(t=>{
          const active=section===t.id;
          return (
            <button key={t.id} onClick={()=>setSection(t.id)} style={{flex:1,padding:"7px 2px 9px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative",background:"none"}}>
              <div style={{position:"relative",display:"inline-block"}}>
                <span style={{fontSize:19,lineHeight:1,filter:active?"none":"grayscale(30%)",opacity:active?1:.6}}>{t.icon}</span>
                {t.badge>0&&<span style={{position:"absolute",top:-4,right:-6,background:C.danger,color:"#fff",borderRadius:999,fontSize:9,fontWeight:800,padding:"1px 4px",minWidth:14,textAlign:"center",animation:"pulse 1.8s ease-in-out infinite"}}>{t.badge}</span>}
              </div>
              <span style={{fontSize:9,fontWeight:active?700:500,color:active?C.accent:C.mutedLight,fontFamily:F.body}}>{t.label}</span>
              {active&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:28,height:2.5,borderRadius:2,background:C.accent}}/>}
            </button>
          );
        })}
      </div>
      {/* iPhone home bar safe area */}
      <div style={{height:"env(safe-area-inset-bottom)",background:C.surface}}/>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
function getGPSLocation(){
  return new Promise(resolve=>{
    if(!navigator.geolocation){ resolve(null); return; }
    const timer=setTimeout(()=>resolve(null),8000);
    navigator.geolocation.getCurrentPosition(
      pos=>{ clearTimeout(timer); resolve({lat:pos.coords.latitude,lng:pos.coords.longitude}); },
      ()=>{ clearTimeout(timer); resolve(null); },
      {timeout:7000}
    );
  });
}
function openMapLink(loc){ if(loc) window.open(`https://www.google.com/maps?q=${loc.lat},${loc.lng}`,"_blank"); }

function AttendanceBanner({attendance,user,shopName,onUpdate,onOpen}){
  const [busy,setBusy]=useState(false);
  const today=ymd(new Date());
  const rec=(attendance||[]).find(a=>a.staffName===user&&a.date===today);

  async function checkIn(){
    setBusy(true);
    const loc=await getGPSLocation();
    const newRec={id:uid(),staffName:user,date:today,checkIn:new Date().toISOString(),checkInLoc:loc,checkOut:null,checkOutLoc:null,status:"present"};
    onUpdate([newRec,...attendance]);
    setBusy(false);
  }
  async function checkOut(){
    setBusy(true);
    const loc=await getGPSLocation();
    onUpdate(attendance.map(a=>a.id===rec.id?{...a,checkOut:new Date().toISOString(),checkOutLoc:loc}:a));
    setBusy(false);
  }

  if(rec&&rec.checkOut){
    const mins=Math.round((new Date(rec.checkOut)-new Date(rec.checkIn))/60000);
    return (
      <div onClick={onOpen} style={{background:C.successLight,border:`1.5px solid ${C.success}40`,borderRadius:12,padding:"12px 14px",marginBottom:16,cursor:"pointer"}}>
        <p style={{fontSize:12,fontWeight:700,color:C.success}}>✅ Checked out at {fmtClockTime(rec.checkOut)}</p>
        <p style={{fontSize:11,color:C.muted,marginTop:2}}>Worked {Math.floor(mins/60)}h {mins%60}m today · {shopName}</p>
      </div>
    );
  }
  return (
    <div style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
      <div onClick={onOpen} style={{cursor:"pointer",flex:1,minWidth:0}}>
        <p style={{fontSize:12,fontWeight:700,color:C.text}}>{rec?`Checked in at ${fmtClockTime(rec.checkIn)}`:"Not checked in yet"}</p>
        <p style={{fontSize:11,color:C.muted,marginTop:2}}>{shopName}</p>
      </div>
      <Btn size="sm" variant={rec?"danger":"success"} disabled={busy} onClick={rec?checkOut:checkIn}>
        {busy?"...":rec?"Check Out":"Check In"}
      </Btn>
    </div>
  );
}

function DashboardScreen({user,custOrders,cats,tasks,priceItems,sopTemplates,sopRuns,tileDesigns,tileMovements,attendance,shopName,onUpdateAttendance,setSection}){
  const day = new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"});
  const today = new Date();

  const pendingOrders = custOrders.filter(o=>o.status==="new"||o.status==="processing").length;
  const readyOrders   = custOrders.filter(o=>o.status==="ready").length;
  const lowStock      = cats.reduce((s,c)=>s+c.items.filter(i=>i.qty!=null&&i.qty<i.reorderLevel).length,0);
  const reorderItems  = cats.reduce((s,c)=>s+c.items.filter(i=>!i.ordered).length,0);
  const openTasks     = tasks.filter(t=>t.status!=="done").length;
  const recentOrders  = [...custOrders].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,4);

  const sopDueTodayList = (sopTemplates||[]).filter(t=>t.active!==false&&t.frequency!=="once"&&sopDueToday(t,today));
  const sopDueCount = sopDueTodayList.filter(t=>{
    const pk=sopPeriodKey(t,today);
    const run=(sopRuns||[]).find(r=>r.sopId===t.id&&r.periodKey===pk);
    return !run||run.status!=="done";
  }).length;

  const activeTileDesigns = (tileDesigns||[]).filter(d=>d.active!==false);
  const outOfStockTiles = activeTileDesigns.filter(d=>{
    const bal=(tileMovements||[]).filter(m=>m.designId===d.id).reduce((s,m)=>s+(m.type==="in"?m.qty:-m.qty),0);
    return bal<=0;
  }).length;

  const cards=[
    { id:"orders",  icon:"🛒", title:"Customer Orders", stat:pendingOrders>0?`${pendingOrders} active`:"All clear", sub:readyOrders>0?`${readyOrders} ready for pickup`:"No pending orders", color:C.accent,   bg:C.accentLight,  urgent:pendingOrders>0 },
    { id:"reorder", icon:"📋", title:"Reorder List",    stat:`${reorderItems} items`,           sub:lowStock>0?`⚠️ ${lowStock} below stock level`:"Stock levels OK", color:"#0891B2",  bg:"#E0F2FE",      urgent:lowStock>0  },
    { id:"tasks",   icon:"✅", title:"Tasks",           stat:openTasks>0?`${openTasks} open`:"All done", sub:"Tap to assign or update",           color:C.purple,  bg:C.purpleLight,  urgent:openTasks>0 },
    { id:"sops",    icon:"🗓️", title:"SOPs",            stat:sopDueCount>0?`${sopDueCount} due today`:"All caught up", sub:"Checklists & routines", color:"#BE185D", bg:"#FDF2F8",      urgent:sopDueCount>0 },
    { id:"tiles",   icon:"🧱", title:"Tile Stock",      stat:`${activeTileDesigns.length} designs`, sub:outOfStockTiles>0?`⚠️ ${outOfStockTiles} out of stock`:"Stock levels OK", color:"#0D9488", bg:"#F0FDFA",      urgent:outOfStockTiles>0 },
    { id:"prices",  icon:"💰", title:"Price List",      stat:`${(priceItems||[]).length} items`, sub:"Search rates · share PDFs",               color:"#D97706",  bg:"#FFFBEB",      urgent:false },
  ];

  return (
    <div style={{padding:"16px 14px 8px"}}>
      {/* Greeting */}
      <div style={{marginBottom:20}}>
        <p style={{fontSize:12,color:C.muted,marginBottom:2}}>{day}</p>
        <h1 style={{fontFamily:F.display,fontWeight:700,fontSize:22,color:C.text}}>Good day, {user.split(" ")[0]} 👋</h1>
      </div>

      <AttendanceBanner attendance={attendance} user={user} shopName={shopName} onUpdate={onUpdateAttendance} onOpen={()=>setSection("attendance")}/>

      {/* Nav cards */}
      <div style={{display:"grid",gridTemplateColumns:"1fr",gap:10,marginBottom:22}}>
        {cards.map(card=>(
          <button key={card.id} onClick={()=>setSection(card.id)}
            style={{background:C.surface,borderRadius:14,padding:"16px",border:`1.5px solid ${card.urgent?card.color+"40":C.border}`,display:"flex",alignItems:"center",gap:14,textAlign:"left",width:"100%",boxShadow:card.urgent?`0 0 0 3px ${card.color}18`:"0 1px 4px rgba(0,0,0,.05)",transition:"transform .15s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.01)"}
            onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            {/* Icon circle */}
            <div style={{width:50,height:50,borderRadius:14,background:card.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
              {card.icon}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:12,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:".04em",marginBottom:2}}>{card.title}</p>
              <p style={{fontFamily:F.display,fontWeight:700,fontSize:18,color:card.urgent?card.color:C.text}}>{card.stat}</p>
              <p style={{fontSize:12,color:C.muted,marginTop:2}}>{card.sub}</p>
            </div>
            <span style={{color:C.mutedLight,fontSize:20,flexShrink:0}}>›</span>
          </button>
        ))}
      </div>

      {/* Recent customer orders */}
      {recentOrders.length>0&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <p style={{fontFamily:F.display,fontWeight:700,fontSize:15,color:C.text}}>Recent Orders</p>
            <button onClick={()=>setSection("orders")} style={{fontSize:12,color:C.accent,fontWeight:600}}>See all ›</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {recentOrders.map(o=>(
              <div key={o.id} onClick={()=>setSection("orders")} style={{background:C.surface,borderRadius:10,padding:"11px 13px",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
                {/* Photo thumbnail or icon */}
                {(o.photos||[]).length>0
                  ?<img src={o.photos[0]} alt="" style={{width:36,height:36,borderRadius:9,objectFit:"cover",flexShrink:0,border:`1px solid ${C.border}`}}/>
                  :<div style={{width:36,height:36,borderRadius:10,background:C.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🛒</div>
                }
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.customerName}</p>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginTop:2,flexWrap:"wrap"}}>
                    <p style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{o.items.map(i=>i.name).join(", ")}</p>
                    {(()=>{ const t=o.items.reduce((s,i)=>s+(parseFloat(i.qty)||0)*(parseFloat(i.rate)||0),0); return t>0?<span style={{fontSize:11,fontWeight:700,color:C.accent,whiteSpace:"nowrap"}}>{fmtINR(t)}</span>:null; })()}
                  </div>
                </div>
                <StatusBadge status={o.status}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHOTO LIGHTBOX
// ─────────────────────────────────────────────────────────────
function PhotoLightbox({photos,startIndex=0,onClose}){
  const [idx,setIdx]=useState(startIndex);
  useEffect(()=>{
    function onKey(e){ if(e.key==="Escape") onClose(); if(e.key==="ArrowRight") setIdx(i=>Math.min(i+1,photos.length-1)); if(e.key==="ArrowLeft") setIdx(i=>Math.max(i-1,0)); }
    window.addEventListener("keydown",onKey); return()=>window.removeEventListener("keydown",onKey);
  },[]);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <button onClick={onClose} style={{position:"absolute",top:16,right:16,color:"#fff",fontSize:28,lineHeight:1,padding:"4px 8px",zIndex:1}}>×</button>
      <img src={photos[idx]} alt="" onClick={e=>e.stopPropagation()} style={{maxWidth:"95vw",maxHeight:"80vh",objectFit:"contain",borderRadius:8}}/>
      {photos.length>1&&(
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:16}}>
          <button onClick={e=>{e.stopPropagation();setIdx(i=>Math.max(i-1,0));}} disabled={idx===0} style={{color:"#fff",fontSize:24,opacity:idx===0?.3:1,padding:"4px 10px"}}>‹</button>
          <div style={{display:"flex",gap:6}}>
            {photos.map((_,i)=><div key={i} onClick={e=>{e.stopPropagation();setIdx(i);}} style={{width:8,height:8,borderRadius:"50%",background:i===idx?"#fff":"rgba(255,255,255,.4)",cursor:"pointer"}}/>)}
          </div>
          <button onClick={e=>{e.stopPropagation();setIdx(i=>Math.min(i+1,photos.length-1));}} disabled={idx===photos.length-1} style={{color:"#fff",fontSize:24,opacity:idx===photos.length-1?.3:1,padding:"4px 10px"}}>›</button>
        </div>
      )}
      <p style={{color:"rgba(255,255,255,.4)",fontSize:12,marginTop:10}}>{idx+1} / {photos.length}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADD / EDIT ORDER MODAL
// ─────────────────────────────────────────────────────────────
function OrderFormModal({order,user,onSave,onClose}){
  const isEdit=!!order;
  const [customerName,setCustomerName] = useState(order?.customerName||"");
  const [phone,setPhone]               = useState(order?.phone||"");
  const [deliveryDate,setDeliveryDate] = useState(order?.deliveryDate||"");
  const [note,setNote]                 = useState(order?.note||"");
  const [items,setItems]               = useState(order?.items||[{id:uid(),name:"",qty:"",unit:"pcs",rate:""}]);
  const [photos,setPhotos]             = useState(order?.photos||[]);
  const [uploading,setUploading]       = useState(false);
  const [lightbox,setLightbox]         = useState(null);
  const photoRef                       = useRef(null);

  function addItem(){ setItems(p=>[...p,{id:uid(),name:"",qty:"",unit:"pcs",rate:""}]); }
  function removeItem(id){ setItems(p=>p.filter(i=>i.id!==id)); }
  function updateItem(id,field,val){ setItems(p=>p.map(i=>i.id===id?{...i,[field]:val}:i)); }

  async function handlePhotos(e){
    const files=[...e.target.files]; if(!files.length) return;
    setUploading(true);
    const compressed=await Promise.all(files.slice(0,5-photos.length).map(compressImage));
    setPhotos(p=>[...p,...compressed]); setUploading(false); e.target.value="";
  }

  const orderTotal=items.reduce((s,i)=>s+(parseFloat(i.qty)||0)*(parseFloat(i.rate)||0),0);

  function save(){
    if(!customerName.trim()) return;
    const validItems=items.filter(i=>i.name.trim());
    if(!validItems.length) return;
    onSave({
      id:order?.id||uid(), customerName:customerName.trim(), phone:phone.trim(),
      deliveryDate, note:note.trim(), photos,
      items:validItems.map(i=>({...i,qty:i.qty?parseFloat(i.qty):null,rate:i.rate?parseFloat(i.rate):null,name:i.name.trim()})),
      status:order?.status||"new", takenBy:order?.takenBy||user,
      createdAt:order?.createdAt||new Date().toISOString(), comments:order?.comments||[],
    });
  }

  return (
    <Modal title={isEdit?"Edit Order":"New Customer Order"} onClose={onClose} fullHeight>
      <Field label="Customer Name" required>
        <FInput value={customerName} onChange={setCustomerName} placeholder="e.g. Ramesh Sharma"/>
      </Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Phone (optional)">
          <FInput value={phone} onChange={setPhone} placeholder="9876543210" type="tel"/>
        </Field>
        <Field label="Delivery by">
          <FInput value={deliveryDate} onChange={setDeliveryDate} type="date"/>
        </Field>
      </div>

      {/* Items with optional rate */}
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
          <label style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em"}}>Items <span style={{color:C.danger}}>*</span></label>
          <span style={{fontSize:10,color:C.mutedLight}}>Rate is optional</span>
        </div>
        {/* Column headers */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 50px 54px 68px 16px",gap:5,marginBottom:5}}>
          {["Item name","Qty","Unit","₹ Rate",""].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:C.mutedLight,textTransform:"uppercase",letterSpacing:".04em"}}>{h}</span>)}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {items.map((item,idx)=>(
            <div key={item.id} style={{background:"#FAFBFD",borderRadius:8,border:`1px solid ${C.border}`,padding:"8px 10px"}}>
              {/* Row 1: Item name */}
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
                <input value={item.name} onChange={e=>updateItem(item.id,"name",e.target.value)} placeholder={`Item ${idx+1} name`}
                  style={{flex:1,padding:"7px 9px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#fff"}}/>
                {items.length>1&&<button onClick={()=>removeItem(item.id)} style={{color:C.mutedLight,fontSize:18,padding:"2px 6px",flexShrink:0}}>×</button>}
              </div>
              {/* Row 2: Qty, Unit, Rate */}
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input type="number" value={item.qty||""} onChange={e=>updateItem(item.id,"qty",e.target.value)} placeholder="Qty"
                  style={{width:60,padding:"6px 7px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:12,color:C.text,background:"#fff",textAlign:"center"}}/>
                <select value={item.unit||"pcs"} onChange={e=>updateItem(item.id,"unit",e.target.value)}
                  style={{flex:1,padding:"6px 4px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:12,background:"#fff",color:C.text}}>
                  {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                </select>
                <div style={{display:"flex",alignItems:"center",gap:3,flex:1}}>
                  <span style={{fontSize:12,color:C.muted}}>₹</span>
                  <input type="number" value={item.rate||""} onChange={e=>updateItem(item.id,"rate",e.target.value)} placeholder="Rate"
                    style={{flex:1,padding:"6px 7px",borderRadius:7,border:`1.5px solid ${C.accent}50`,fontSize:12,color:C.accent,fontWeight:600,background:"#fff",textAlign:"right"}}/>
                </div>
              </div>
              {/* Subtotal */}
              {item.qty&&item.rate&&(
                <div style={{textAlign:"right",marginTop:4,fontSize:11}}>
                  <span style={{color:C.muted}}>{item.qty} × ₹{item.rate} = </span>
                  <span style={{fontWeight:700,color:C.accent}}>{fmtINR(parseFloat(item.qty)*parseFloat(item.rate))}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:9}}>
          <button onClick={addItem} style={{fontSize:12,color:C.accent,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>+ Add item</button>
          {orderTotal>0&&(
            <div style={{background:C.accentLight,borderRadius:8,padding:"5px 12px",display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:11,color:C.muted}}>Total:</span>
              <span style={{fontSize:15,fontWeight:700,color:C.accent}}>{fmtINR(orderTotal)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Photos */}
      <div style={{marginBottom:12}}>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>
          Photos <span style={{fontSize:10,fontWeight:400,color:C.mutedLight,textTransform:"none",letterSpacing:0}}>(optional · max 5)</span>
        </label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
          {photos.map((src,i)=>(
            <div key={i} style={{position:"relative",flexShrink:0}}>
              <img src={src} alt="" onClick={()=>setLightbox(i)}
                style={{width:70,height:70,objectFit:"cover",borderRadius:9,border:`1.5px solid ${C.border}`,cursor:"pointer"}}/>
              <button onClick={()=>setPhotos(p=>p.filter((_,j)=>j!==i))}
                style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",background:C.danger,color:"#fff",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,border:"1.5px solid #fff"}}>×</button>
            </div>
          ))}
          {photos.length<5&&(
            <button onClick={()=>photoRef.current?.click()}
              style={{width:70,height:70,borderRadius:9,border:`2px dashed ${C.border}`,background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,color:C.muted,fontSize:10,fontWeight:600}}>
              {uploading?<span style={{fontSize:18}}>⏳</span>:<><span style={{fontSize:22}}>📷</span>Add photo</>}
            </button>
          )}
          <input ref={photoRef} type="file" accept="image/*" multiple onChange={handlePhotos} style={{display:"none"}}/>
        </div>
        {photos.length>0&&<p style={{fontSize:10,color:C.mutedLight,marginTop:5}}>Tap photo to preview · × to remove</p>}
      </div>

      <Field label="Note / instructions">
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Customer will pick up, urgent"
          rows={2} style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}/>
      </Field>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
        <p style={{fontSize:12,color:C.muted}}>Taken by: <b style={{color:C.text}}>{order?.takenBy||user}</b></p>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={save} disabled={!customerName.trim()||!items.some(i=>i.name.trim())}>{isEdit?"Save changes":"Add order"}</Btn>
        </div>
      </div>

      {lightbox!==null&&<PhotoLightbox photos={photos} startIndex={lightbox} onClose={()=>setLightbox(null)}/>}
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// ORDER DETAIL MODAL
// ─────────────────────────────────────────────────────────────
function OrderDetailModal({order,user,onUpdate,onDelete,onEdit,onClose}){
  const [comment,setComment] = useState("");
  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[order.comments]);

  const s = ORDER_STATUS[order.status]||ORDER_STATUS.new;

  function addComment(){
    if(!comment.trim()) return;
    const c={id:uid(),author:user,text:comment.trim(),time:new Date().toISOString()};
    onUpdate({...order,comments:[...(order.comments||[]),c]});
    setComment("");
  }

  function setStatus(status){
    onUpdate({...order,status,updatedBy:user,updatedAt:new Date().toISOString()});
  }

  const nextStatus = s.next;
  const nextS = nextStatus ? ORDER_STATUS[nextStatus] : null;

  const [lightbox,setLightbox] = useState(null);
  const orderTotal = (order.items||[]).reduce((s,i)=>s+(parseFloat(i.qty)||0)*(parseFloat(i.rate)||0),0);
  const hasRates   = (order.items||[]).some(i=>i.rate);

  return (
    <Modal title="Order Detail" onClose={onClose} fullHeight>
      {/* Customer */}
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${C.border}`}}>
        <div style={{width:44,height:44,borderRadius:12,background:C.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🛒</div>
        <div style={{flex:1}}>
          <h2 style={{fontFamily:F.display,fontWeight:700,fontSize:17,color:C.text,marginBottom:2}}>{order.customerName}</h2>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <StatusBadge status={order.status}/>
            {order.phone&&<a href={`tel:${order.phone}`} style={{fontSize:12,color:C.accent,fontWeight:600}}>📞 {order.phone}</a>}
            {order.deliveryDate&&<span style={{fontSize:12,color:C.warn,fontWeight:600}}>📅 By {fmtDate(order.deliveryDate)}</span>}
          </div>
          <p style={{fontSize:11,color:C.muted,marginTop:4}}>Taken by {order.takenBy} · {fmtTime(order.createdAt)}</p>
        </div>
        <button onClick={()=>onEdit(order)} style={{fontSize:12,color:C.accent,fontWeight:600,padding:"6px 10px",borderRadius:7,border:`1px solid ${C.accent}30`,flexShrink:0}}>✏️ Edit</button>
      </div>

      {/* Photos */}
      {(order.photos||[]).length>0&&(
        <div style={{marginBottom:14}}>
          <p style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>
            Photos ({order.photos.length})
          </p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {order.photos.map((src,i)=>(
              <img key={i} src={src} alt="" onClick={()=>setLightbox(i)}
                style={{width:80,height:80,objectFit:"cover",borderRadius:10,border:`1.5px solid ${C.border}`,cursor:"pointer"}}/>
            ))}
          </div>
        </div>
      )}

      {/* Items — billing table if rates present */}
      <div style={{marginBottom:14}}>
        <p style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Items</p>
        {hasRates?(
          <div style={{background:C.bg,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
            {/* Table header */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 70px 80px 90px",gap:0,background:"#F1F5F9",padding:"7px 11px",minWidth:320}}>
              {["Item","Qty","Rate","Amount"].map(h=><span key={h} style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".04em",textAlign:h==="Item"?"left":"right"}}>{h}</span>)}
            </div>
            {order.items.map((item,i)=>{
              const subtotal=(parseFloat(item.qty)||0)*(parseFloat(item.rate)||0);
              return (
                <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 70px 80px 90px",gap:0,padding:"9px 11px",borderTop:`1px solid ${C.border}`,alignItems:"center",minWidth:320}}>
                  <span style={{fontSize:13,fontWeight:600,color:C.text}}>{item.name}</span>
                  <span style={{fontSize:12,color:C.muted,textAlign:"right"}}>{item.qty||"—"} {item.unit}</span>
                  <span style={{fontSize:12,color:C.muted,textAlign:"right"}}>{item.rate?fmtINR(item.rate):"—"}</span>
                  <span style={{fontSize:12,fontWeight:700,color:subtotal?C.text:C.mutedLight,textAlign:"right"}}>{subtotal?fmtINR(subtotal):"—"}</span>
                </div>
              );
            })}
            </div>
            {/* Total row */}
            {orderTotal>0&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 11px",borderTop:`2px solid ${C.border}`,background:"#fff"}}>
                <span style={{fontSize:13,fontWeight:700,color:C.text}}>Order Total</span>
                <span style={{fontSize:16,fontWeight:700,color:C.accent}}>{fmtINR(orderTotal)}</span>
              </div>
            )}
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {order.items.map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",background:C.bg,borderRadius:8}}>
                <span style={{fontSize:14,color:C.muted}}>•</span>
                <span style={{flex:1,fontSize:13,color:C.text,fontWeight:500}}>{item.name}</span>
                {item.qty&&<span style={{fontSize:12,fontWeight:700,color:C.accent,background:C.accentLight,padding:"2px 8px",borderRadius:5}}>{item.qty} {item.unit}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note */}
      {order.note&&(
        <div style={{background:C.warnLight,borderRadius:8,padding:"9px 12px",marginBottom:14,fontSize:13,color:"#92400E",lineHeight:1.5}}>
          📋 {order.note}
        </div>
      )}

      {/* Status actions */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {nextS&&<Btn variant="success" onClick={()=>setStatus(nextStatus)}>Move to {nextS.icon} {nextS.label}</Btn>}
        {order.status!=="cancelled"&&order.status!=="delivered"&&(
          <Btn variant="ghost" onClick={()=>setStatus("cancelled")} style={{color:C.danger,borderColor:C.danger+"40"}}>Cancel order</Btn>
        )}
        {(order.status==="delivered"||order.status==="cancelled")&&(
          <Btn variant="ghost" onClick={()=>setStatus("new")} style={{color:C.warn}}>Reopen</Btn>
        )}
      </div>

      {/* Comments */}
      <div style={{marginBottom:12}}>
        <p style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>
          Updates ({(order.comments||[]).length})
        </p>
        <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:9,marginBottom:10}}>
          {(order.comments||[]).length===0&&<p style={{color:C.mutedLight,fontSize:13}}>No updates yet.</p>}
          {(order.comments||[]).map(c=>(
            <div key={c.id} className="fade-in" style={{display:"flex",gap:9,alignItems:"flex-start"}}>
              <Avatar name={c.author} size={26} color={c.author===user?C.accent:C.muted}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:8,alignItems:"baseline",marginBottom:3}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.text}}>{c.author}</span>
                  <span style={{fontSize:11,color:C.mutedLight}}>{fmtTime(c.time)}</span>
                </div>
                <div style={{background:c.author===user?C.accentLight:C.bg,borderRadius:"0 9px 9px 9px",padding:"7px 10px",fontSize:13,color:C.text,lineHeight:1.5}}>{c.text}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>
        <div style={{display:"flex",gap:7}}>
          <input value={comment} onChange={e=>setComment(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); addComment(); } }}
            placeholder="Add update… (Enter to send)"
            style={{flex:1,padding:"8px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}/>
          <Btn onClick={addComment} disabled={!comment.trim()} size="sm">Send</Btn>
        </div>
      </div>

      {/* Delete */}
      <div style={{paddingTop:12,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"flex-end"}}>
        <button onClick={()=>{ onDelete(order.id); onClose(); }} style={{fontSize:12,color:C.danger,padding:"6px 10px",borderRadius:7,border:`1px solid ${C.danger}30`}}>Delete order</button>
      </div>

      {lightbox!==null&&<PhotoLightbox photos={order.photos||[]} startIndex={lightbox} onClose={()=>setLightbox(null)}/>}
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// CUSTOMER ORDERS SCREEN
// ─────────────────────────────────────────────────────────────
function CustomerOrdersScreen({orders,user,onUpdate,onAdd,onDelete}){
  const [filter,setFilter]       = useState("new");
  const [showAdd,setShowAdd]     = useState(false);
  const [openOrder,setOpenOrder] = useState(null);
  const [editOrder,setEditOrder] = useState(null);

  const filtered = orders.filter(o=>o.status===filter);
  const sorted   = [...filtered].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  const statusCounts = {};
  orders.forEach(o=>{ statusCounts[o.status]=(statusCounts[o.status]||0)+1; });

  function handleSave(orderData){
    onAdd(orderData);
    setShowAdd(false);
    setEditOrder(null);
  }

  function handleUpdate(updated){
    onUpdate(updated);
    setOpenOrder(updated);
  }

  return (
    <div style={{padding:"14px 12px 8px"}}>
      {/* Header row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <h2 style={{fontFamily:F.display,fontWeight:700,fontSize:18,color:C.text}}>Customer Orders</h2>
          <p style={{fontSize:12,color:C.muted,marginTop:1}}>{orders.length} total · {statusCounts.ready||0} ready</p>
        </div>
        <Btn onClick={()=>setShowAdd(true)}>+ New order</Btn>
      </div>

      {/* Status filter — horizontal scroll, compact chips */}
      <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,marginBottom:12,WebkitOverflowScrolling:"touch"}}>
        {[["new","🆕 New"],["processing","⚙️ Processing"],["ready","✅ Ready"],["delivered","📦 Done"],["cancelled","❌ Cancelled"]].map(([k,lbl])=>{
          const count=statusCounts[k]||0;
          return (
            <button key={k} onClick={()=>setFilter(k)} style={{padding:"5px 10px",borderRadius:999,fontSize:11,fontWeight:filter===k?700:500,color:filter===k?"#fff":C.muted,background:filter===k?C.navy:"#fff",border:`1.5px solid ${filter===k?C.navy:C.border}`,whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",gap:4}}>
              {lbl}{count>0&&<span style={{background:filter===k?"rgba(255,255,255,.25)":C.bg,borderRadius:999,fontSize:10,padding:"0 5px",lineHeight:"16px"}}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Order list */}
      {sorted.length===0?(
        <div style={{textAlign:"center",padding:"48px 0",color:C.mutedLight,fontSize:14}}>
          {orders.length===0?"No orders yet. Add the first one above.":"No orders with this status."}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {sorted.map(o=>(
            <div key={o.id} onClick={()=>setOpenOrder(o)}
              style={{background:C.surface,borderRadius:12,padding:"13px 14px",border:`1.5px solid ${o.status==="ready"?C.success+"40":o.status==="cancelled"?C.danger+"20":C.border}`,cursor:"pointer",boxShadow:o.status==="ready"?"0 0 0 3px #05996918":"0 1px 3px rgba(0,0,0,.05)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{width:38,height:38,borderRadius:10,background:ORDER_STATUS[o.status]?.bg||C.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                  {ORDER_STATUS[o.status]?.icon||"🛒"}
                </div>
              <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,marginBottom:3}}>
                    <p style={{fontFamily:F.display,fontWeight:700,fontSize:14,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{o.customerName}</p>
                    <StatusBadge status={o.status}/>
                  </div>
                  <p style={{fontSize:12,color:C.muted,marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {o.items.map(i=>`${i.name}${i.qty?` ×${i.qty}`:""}`).join(" · ")}
                  </p>
                  <div style={{display:"flex",gap:8,marginTop:5,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontSize:11,color:C.muted}}>by {o.takenBy} · {fmtTime(o.createdAt)}</span>
                    {o.deliveryDate&&<span style={{fontSize:11,color:C.warn,fontWeight:600}}>📅 {fmtDate(o.deliveryDate)}</span>}
                    {(o.comments||[]).length>0&&<span style={{fontSize:11,color:C.muted}}>💬 {o.comments.length}</span>}
                    {(o.photos||[]).length>0&&<span style={{fontSize:11,color:C.purple}}>📷 {o.photos.length}</span>}
                    {(()=>{ const t=o.items.reduce((s,i)=>s+(parseFloat(i.qty)||0)*(parseFloat(i.rate)||0),0); return t>0?<span style={{fontSize:11,fontWeight:700,color:C.accent,background:C.accentLight,padding:"1px 6px",borderRadius:4}}>{fmtINR(t)}</span>:null; })()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd&&<OrderFormModal user={user} onSave={handleSave} onClose={()=>setShowAdd(false)}/>}
      {editOrder&&<OrderFormModal order={editOrder} user={user} onSave={handleSave} onClose={()=>setEditOrder(null)}/>}
      {openOrder&&(
        <OrderDetailModal
          order={orders.find(o=>o.id===openOrder.id)||openOrder}
          user={user}
          onUpdate={handleUpdate}
          onDelete={onDelete}
          onEdit={o=>{ setOpenOrder(null); setEditOrder(o); }}
          onClose={()=>setOpenOrder(null)}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REORDER SCREEN (embedded, shares storage with standalone app)
// ─────────────────────────────────────────────────────────────
function ReorderScreen({cats,user,onUpdateCats,showToast}){
  const [filter,setFilter]       = useState("pending");
  const [selMode,setSelMode]     = useState(false);
  const [selIds,setSelIds]       = useState(new Set());
  const [showShare,setShowShare] = useState(false);
  const [showAddCat,setShowAddCat] = useState(false);
  const [newCat,setNewCat]       = useState({name:"",color:PALETTE[0],icon:CAT_ICONS[0]});
  const [pendingId,setPendingId] = useState(null);
  const [editItemId,setEditItemId] = useState(null);

  const totalItems   = cats.reduce((s,c)=>s+c.items.length,0);
  const totalOrdered = cats.reduce((s,c)=>s+c.items.filter(i=>i.ordered).length,0);

  const visibleCats = cats.map(c=>({...c,items:c.items.filter(i=>filter==="pending"?!i.ordered:i.ordered)})).filter(c=>c.items.length>0);

  const allItems = cats.flatMap(c=>c.items);
  const itemsToShare = selIds.size>0 ? allItems.filter(i=>selIds.has(i.id)) : allItems.filter(i=>!i.ordered);

  function buildText(items){
    const date=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
    const lines=[`📋 *Order List — ${date}*`,""];
    items.forEach(i=>{ const q=i.reqQty?`${i.reqQty} ${i.reqUnit||"pcs"}`:""; lines.push(`• ${i.name}${q?` — *${q}*`:""}`); });
    lines.push("",`Total: *${items.length} item${items.length!==1?"s":""}*`);
    return lines.join("\n");
  }

  function updateCat(updated){ onUpdateCats(cats.map(c=>c.id===updated.id?updated:c)); }
  function deleteCat(id){ onUpdateCats(cats.filter(c=>c.id!==id)); }
  function toggleSel(id,forceRemove=false){ setSelIds(prev=>{ const n=new Set(prev); if(forceRemove||n.has(id)) n.delete(id); else n.add(id); return n; }); }

  function addCategory(){
    if(!newCat.name.trim()) return;
    onUpdateCats([...cats,{id:uid(),name:newCat.name.trim(),color:newCat.color,icon:newCat.icon,collapsed:false,items:[]}]);
    setShowAddCat(false); setNewCat({name:"",color:PALETTE[0],icon:CAT_ICONS[0]});
  }

  function handleItemOrder(cat,item,fields){
    const now=new Date().toISOString();
    onUpdateCats(cats.map(c=>c.id===cat.id?{...c,items:c.items.map(i=>i.id===item.id?{...i,ordered:true,orderedBy:user,orderedAt:now,...fields}:i)}:c));
    setPendingId(null);
  }

  function unorder(cat,itemId){
    onUpdateCats(cats.map(c=>c.id===cat.id?{...c,items:c.items.map(i=>i.id===itemId?{...i,ordered:false,orderedBy:null,orderedAt:null,orderNote:null,orderQty:null,orderSupplier:null,orderDueDate:null}:i)}:c));
  }

  return (
    <div style={{padding:"14px 12px 8px",paddingBottom:selMode?90:8}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        {selMode?(
          <>
            <span style={{fontFamily:F.display,fontWeight:700,fontSize:16,color:C.text}}>{selIds.size>0?`${selIds.size} selected`:"Tap to select"}</span>
            <div style={{display:"flex",gap:7}}>
              <Btn variant="ghost" size="sm" onClick={()=>{ setSelMode(false); setSelIds(new Set()); }}>Cancel</Btn>
              <Btn size="sm" onClick={()=>setShowShare(true)} disabled={selIds.size===0} style={{background:"#25D366"}}>💬 Share ({selIds.size})</Btn>
            </div>
          </>
        ):(
          <>
            <div>
              <h2 style={{fontFamily:F.display,fontWeight:700,fontSize:18,color:C.text}}>Reorder List</h2>
              <p style={{fontSize:12,color:C.muted,marginTop:1}}>{totalItems-totalOrdered} pending · {totalOrdered} ordered</p>
            </div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>setSelMode(true)} style={{padding:"6px 10px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:12,fontWeight:600,color:C.muted,background:C.surface}}>✓ Select</button>
              <Btn size="sm" onClick={()=>setShowShare(true)} style={{background:"#25D366",fontSize:12}}>💬</Btn>
            </div>
          </>
        )}
      </div>

      {/* Progress */}
      <div style={{height:5,background:"#E2E8F0",borderRadius:3,overflow:"hidden",marginBottom:10}}>
        <div style={{height:"100%",width:`${totalItems?totalOrdered/totalItems*100:0}%`,background:"linear-gradient(90deg,#059669,#10B981)",borderRadius:3,transition:"width .4s"}}/>
      </div>

      {/* Filter */}
      {!selMode&&(
        <div style={{display:"flex",gap:1,background:C.surface,borderRadius:8,padding:3,marginBottom:12,border:`1px solid ${C.border}`}}>
          {[["pending","Pending"],["ordered","Ordered"]].map(([k,lbl])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{flex:1,padding:"6px",borderRadius:6,fontSize:12,fontWeight:filter===k?700:500,color:filter===k?"#fff":C.muted,background:filter===k?C.navy:"transparent",border:"none"}}>{lbl}</button>
          ))}
        </div>
      )}

      {/* Categories */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {(selMode?cats:visibleCats).map(cat=>{
          const sorted=[...cat.items].sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));
          const orderedCount=sorted.filter(i=>i.ordered).length;
          return (
            <div key={cat.id} style={{background:C.surface,borderRadius:12,border:`1.5px solid ${C.border}`,overflow:"hidden"}}>
              {/* Cat header */}
              <div style={{borderLeft:`4px solid ${cat.color}`,padding:"11px 13px",display:"flex",alignItems:"center",gap:9,background:orderedCount===sorted.length&&sorted.length>0?"#F0FDF4":C.surface}}>
                <span style={{fontSize:18}}>{cat.icon}</span>
                <div style={{flex:1}}>
                  <p style={{fontFamily:F.display,fontWeight:700,fontSize:14,color:C.text}}>{cat.name}</p>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                    <div style={{flex:1,height:3,background:"#F1F5F9",borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${sorted.length?orderedCount/sorted.length*100:0}%`,background:cat.color,borderRadius:2,transition:"width .3s"}}/>
                    </div>
                    <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{orderedCount}/{sorted.length}</span>
                  </div>
                </div>
                {selMode&&sorted.length>0&&(
                  <button onClick={()=>{ const allSel=sorted.every(i=>selIds.has(i.id)); sorted.forEach(i=>{ if(allSel) toggleSel(i.id,true); else if(!selIds.has(i.id)) toggleSel(i.id); }); }}
                    style={{fontSize:11,fontWeight:600,color:C.accent,padding:"3px 8px",border:`1px solid ${C.border}`,borderRadius:6,background:"#fff"}}>
                    {sorted.every(i=>selIds.has(i.id))?"Deselect all":"Select all"}
                  </button>
                )}
              </div>
              {/* Items */}
              {sorted.map(item=>{
                const isSel=selIds.has(item.id);
                const isPending=pendingId===item.id;
                return (
                  <div key={item.id}>
                    <div style={{padding:"9px 12px",borderTop:`1px solid #F1F5F9`,display:"flex",alignItems:"center",gap:9,background:isSel?"#EFF6FF":item.ordered?"#F0FDF4":isPending?cat.color+"08":C.surface,cursor:selMode?"pointer":"default"}}
                      onClick={selMode?()=>toggleSel(item.id):undefined}>
                      {/* Selection or order checkbox */}
                      {selMode?(
                        <div style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${isSel?C.accent:C.border}`,background:isSel?C.accent:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {isSel&&<svg width={12} height={12} viewBox="0 0 20 20" fill="none"><path d="M4 10l5 5 7-8" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      ):(
                        <button onClick={()=>{ if(item.ordered) unorder(cat,item.id); else setPendingId(p=>p===item.id?null:item.id); }}
                          style={{width:24,height:24,borderRadius:5,border:`2px solid ${item.ordered?cat.color:C.border}`,background:item.ordered?cat.color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {item.ordered&&<svg className="pop" width={14} height={14} viewBox="0 0 20 20" fill="none"><path d="M4 10l5 5 7-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </button>
                      )}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                          <p style={{fontSize:13,fontWeight:600,color:item.ordered?C.muted:C.text}}>{item.name}</p>
                          {item.reqQty&&<span style={{fontSize:11,fontWeight:700,color:item.ordered?C.mutedLight:cat.color,background:item.ordered?"#F1F5F9":cat.color+"15",padding:"1px 6px",borderRadius:4,whiteSpace:"nowrap"}}>{item.reqQty} {item.reqUnit}</span>}
                        </div>
                        {/* Show item note */}
                        {item.note&&!item.ordered&&<p style={{fontSize:11,color:C.muted,marginTop:2}}>📝 {item.note}</p>}
                        {item.requestedBy&&!item.ordered&&<p style={{fontSize:10,color:C.mutedLight,marginTop:2}}>Requested by {item.requestedBy}</p>}
                        {item.ordered&&(
                          <div style={{marginTop:3,display:"flex",gap:5,flexWrap:"wrap"}}>
                            <span style={{fontSize:11,color:C.success,fontWeight:600}}>✓ by {item.orderedBy}</span>
                            {item.orderQty&&<span style={{fontSize:11,color:C.muted}}>📦 {item.orderQty}</span>}
                            {item.orderSupplier&&<span style={{fontSize:11,color:C.muted}}>🏪 {item.orderSupplier}</span>}
                            {item.orderDueDate&&<span style={{fontSize:11,color:C.warn}}>📅 {fmtDate(item.orderDueDate)}</span>}
                          </div>
                        )}
                      </div>
                      {/* Delete button — only in normal mode */}
                      {!selMode&&(
                        <button onClick={e=>{e.stopPropagation();onUpdateCats(cats.map(c=>c.id===cat.id?{...c,items:c.items.filter(i=>i.id!==item.id)}:c));}}
                          title="Remove item"
                          style={{color:"#CBD5E1",fontSize:17,padding:"3px 5px",flexShrink:0,lineHeight:1}}>×</button>
                      )}
                    </div>
                    {/* Inline order panel */}
                    {!selMode&&isPending&&!item.ordered&&(
                      <ReorderItemPanel item={item} color={cat.color} user={user} onConfirm={f=>handleItemOrder(cat,item,f)} onCancel={()=>setPendingId(null)}/>
                    )}
                  </div>
                );
              })}
              {/* Add item button */}
              {!selMode&&(
                <div style={{borderTop:`1px solid #F1F5F9`,display:"flex"}}>
                  <ReorderAddItem cat={cat} user={user} onAdd={item=>onUpdateCats(cats.map(c=>c.id===cat.id?{...c,items:[...c.items,item]}:c))}/>
                  <button onClick={()=>deleteCat(cat.id)} style={{padding:"9px 13px",fontSize:11,color:C.mutedLight}}>Delete</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!selMode&&(
        <button onClick={()=>setShowAddCat(true)} style={{width:"100%",marginTop:12,padding:"12px",borderRadius:11,border:`2px dashed ${C.border}`,color:C.mutedLight,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:"transparent"}}>
          + Add category
        </button>
      )}

      {/* Selection bottom bar */}
      {selMode&&(
        <div style={{position:"fixed",bottom:72,left:0,right:0,background:C.surface,borderTop:`2px solid ${C.border}`,padding:"11px 16px",display:"flex",alignItems:"center",gap:10,zIndex:90,boxShadow:"0 -4px 20px rgba(0,0,0,.1)"}}>
          <p style={{flex:1,fontSize:13,fontWeight:700,color:C.text}}>{selIds.size} item{selIds.size!==1?"s":""} selected</p>
          <Btn variant="ghost" size="sm" onClick={()=>{ setSelMode(false); setSelIds(new Set()); }}>Cancel</Btn>
          <button onClick={()=>setShowShare(true)} disabled={selIds.size===0}
            style={{padding:"9px 16px",borderRadius:9,background:selIds.size>0?"#25D366":"#CBD5E1",color:"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
            💬 Share {selIds.size>0?`(${selIds.size})`:""}
          </button>
        </div>
      )}

      {/* Share modal */}
      {showShare&&(
        <ShareText text={buildText(itemsToShare)} onClose={()=>setShowShare(false)}/>
      )}

      {/* Add category modal */}
      {showAddCat&&(
        <Modal title="Add category" onClose={()=>setShowAddCat(false)}>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:4,textTransform:"uppercase"}}>Name</label>
            <input autoFocus value={newCat.name} onChange={e=>setNewCat(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addCategory()} placeholder="e.g. Sanitary Fittings"
              style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text}}/>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:6,textTransform:"uppercase"}}>Icon</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{CAT_ICONS.map(ic=><button key={ic} onClick={()=>setNewCat(p=>({...p,icon:ic}))} style={{width:38,height:38,borderRadius:8,border:`2px solid ${newCat.icon===ic?C.accent:C.border}`,background:newCat.icon===ic?C.accentLight:"#fff",fontSize:19}}>{ic}</button>)}</div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:6,textTransform:"uppercase"}}>Color</label>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{PALETTE.map(col=><button key={col} onClick={()=>setNewCat(p=>({...p,color:col}))} style={{width:32,height:32,borderRadius:"50%",background:col,border:newCat.color===col?"3px solid "+C.text:"3px solid transparent"}}/>)}</div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn variant="ghost" onClick={()=>setShowAddCat(false)}>Cancel</Btn>
            <Btn onClick={addCategory} disabled={!newCat.name.trim()}>Add category</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ReorderItemPanel({item,color,user,onConfirm,onCancel}){
  const [qty,setQty]=useState(item.reqQty||"");
  const [supplier,setSupplier]=useState(item.defaultSupplier||"");
  const [dueDate,setDueDate]=useState("");
  const [note,setNote]=useState("");
  return (
    <div className="slide-up" style={{background:color+"0D",borderLeft:`3px solid ${color}`,padding:"11px 13px 13px"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <div><label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:3,textTransform:"uppercase"}}>QTY {item.reqQty&&<span style={{color,fontWeight:400}}>(need {item.reqQty})</span>}</label>
          <input type="number" value={qty} onChange={e=>setQty(e.target.value)} style={{width:"100%",padding:"7px 9px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:13,background:"#fff",color:C.text}}/></div>
        <div><label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:3,textTransform:"uppercase"}}>EXPECTED BY</label>
          <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={{width:"100%",padding:"7px 9px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:13,background:"#fff",color:C.text}}/></div>
      </div>
      <div style={{marginBottom:8}}><label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:3,textTransform:"uppercase"}}>SUPPLIER</label>
        <input value={supplier} onChange={e=>setSupplier(e.target.value)} placeholder="Supplier name" style={{width:"100%",padding:"7px 9px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:13,background:"#fff",color:C.text}}/></div>
      <div style={{marginBottom:10}}><label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:3,textTransform:"uppercase"}}>NOTE</label>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Optional note" style={{width:"100%",padding:"7px 9px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:13,background:"#fff",color:C.text}}/></div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <button onClick={()=>onConfirm({qty:qty?parseInt(qty):null,supplier:supplier.trim()||null,dueDate:dueDate||null,note:note.trim()||null})} style={{padding:"8px 14px",borderRadius:8,background:color,color:"#fff",fontSize:12,fontWeight:700}}>✓ Mark Ordered</button>
        <button onClick={onCancel} style={{fontSize:12,color:C.muted}}>Cancel</button>
        <span style={{fontSize:11,color:C.mutedLight,marginLeft:"auto"}}>by {user}</span>
      </div>
    </div>
  );
}

function ReorderAddItem({cat,user,onAdd}){
  const [adding,setAdding]=useState(false);
  const [name,setName]=useState("");
  const [qty,setQty]=useState("");
  const [unit,setUnit]=useState("pcs");
  const [note,setNote]=useState("");

  function add(){
    if(!name.trim()) return;
    onAdd({id:uid(),name:name.trim(),note:note.trim(),defaultSupplier:"",reqQty:qty?parseInt(qty):null,reqUnit:unit,requestedBy:user,requestedAt:new Date().toISOString(),sortOrder:cat.items.length,ordered:false,orderedBy:null,orderedAt:null,orderNote:null,orderQty:null,orderSupplier:null,orderDueDate:null});
    setName(""); setQty(""); setUnit("pcs"); setNote(""); setAdding(false);
  }

  if(!adding) return <button onClick={()=>setAdding(true)} style={{flex:1,padding:"9px 13px",fontSize:12,color:cat.color,fontWeight:600,textAlign:"left"}}>+ Add item</button>;
  return (
    <div style={{flex:1,padding:"10px 12px",display:"flex",flexDirection:"column",gap:7}}>
      {/* Row 1: name + qty + unit */}
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        <input autoFocus value={name} onChange={e=>setName(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter") document.getElementById("note-"+cat.id)?.focus(); if(e.key==="Escape"){setAdding(false);setName("");setNote("");} }}
          placeholder="Item name (required)"
          style={{flex:2,minWidth:100,padding:"6px 9px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:12,color:C.text,background:"#fff"}}/>
        <input type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="Qty"
          style={{width:52,padding:"6px 7px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:12,color:C.text,textAlign:"center",background:"#fff"}}/>
        <select value={unit} onChange={e=>setUnit(e.target.value)} style={{padding:"6px 5px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:11,background:"#fff",color:C.text}}>
          {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      {/* Row 2: note */}
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <input id={"note-"+cat.id} value={note} onChange={e=>setNote(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter") add(); if(e.key==="Escape"){setAdding(false);setName("");setNote("");} }}
          placeholder="📝 Note (optional) e.g. 6mm thickness, Havells brand"
          style={{flex:1,padding:"6px 9px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:11,color:C.muted,background:"#fff"}}/>
        <button onClick={add} disabled={!name.trim()} style={{padding:"6px 12px",borderRadius:7,background:name.trim()?cat.color:"#CBD5E1",color:"#fff",fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>Add</button>
        <button onClick={()=>{setAdding(false);setName("");setNote("");}} style={{fontSize:13,color:C.muted,padding:"4px"}}>✕</button>
      </div>
    </div>
  );
}

function ShareText({text,onClose}){
  const [copied,setCopied]=useState(false);
  function copy(){ navigator.clipboard.writeText(text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); }); }
  return (
    <Modal title="Share order list" onClose={onClose}>
      <div style={{background:"#F8FAFC",borderRadius:10,border:`1.5px solid ${C.border}`,padding:"13px 15px",marginBottom:14,maxHeight:220,overflowY:"auto"}}>
        <pre style={{fontFamily:F.body,fontSize:13,color:"#334155",lineHeight:1.8,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{text}</pre>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        <button onClick={()=>window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(text),"_blank")} style={{padding:"12px",borderRadius:10,background:"#25D366",color:"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>💬 WhatsApp</button>
        <button onClick={()=>window.open("sms:?body="+encodeURIComponent(text),"_blank")} style={{padding:"12px",borderRadius:10,background:C.navy,color:"#fff",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>📱 SMS</button>
      </div>
      <button onClick={copy} style={{width:"100%",padding:"11px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:13,fontWeight:600,color:copied?C.success:C.text,background:copied?C.successLight:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
        {copied?"✓ Copied to clipboard":"📋 Copy text"}
      </button>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// TASKS SCREEN
// ─────────────────────────────────────────────────────────────
function TasksScreen({tasks,user,shopUsers,onUpdateTasks}){
  const staffList = shopUsers.map(u=>u.displayName);
  const [showAdd,setShowAdd]   = useState(false);
  const [openTask,setOpenTask] = useState(null);
  const [filter,setFilter]     = useState("open");
  const [nt,setNt]             = useState({title:"",assignedTo:staffList[0]||"",priority:"normal"});
  const [comment,setComment]   = useState("");

  const visible=tasks.filter(t=>t.status===filter);
  const sorted=[...visible].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  function addTask(){
    if(!nt.title.trim()) return;
    const t={id:uid(),title:nt.title.trim(),assignedTo:nt.assignedTo,assignedBy:user,priority:nt.priority,status:"open",comments:[],createdAt:new Date().toISOString()};
    onUpdateTasks([t,...tasks]);
    setNt({title:"",assignedTo:staffList[0]||"",priority:"normal"}); setShowAdd(false);
  }

  function updateTask(updated){ onUpdateTasks(tasks.map(t=>t.id===updated.id?updated:t)); if(openTask?.id===updated.id) setOpenTask(updated); }
  function deleteTask(id){ onUpdateTasks(tasks.filter(t=>t.id!==id)); setOpenTask(null); }

  function addComment(task){
    if(!comment.trim()) return;
    const c={id:uid(),author:user,text:comment.trim(),time:new Date().toISOString()};
    updateTask({...task,comments:[...(task.comments||[]),c]});
    setComment("");
  }

  const SP={open:{bg:C.accentLight,color:C.accent,label:"Open"},
    "in-progress":{bg:C.warnLight,color:C.warn,label:"In progress"},
    done:{bg:C.successLight,color:C.success,label:"Done"}};

  const avatarColors=["#1D4ED8","#0891B2","#7C3AED","#059669","#DC2626","#D97706","#BE185D","#65A30D","#0F172A","#6B7280"];
  function staffColor(name){ return avatarColors[staffList.indexOf(name)%avatarColors.length]||C.accent; }

  return (
    <div style={{padding:"14px 12px 8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <h2 style={{fontFamily:F.display,fontWeight:700,fontSize:18,color:C.text}}>Tasks</h2>
          <p style={{fontSize:12,color:C.muted,marginTop:1}}>{tasks.filter(t=>t.status!=="done").length} open</p>
        </div>
        <Btn onClick={()=>setShowAdd(true)}>+ Assign task</Btn>
      </div>

      <div style={{display:"flex",gap:1,background:C.surface,borderRadius:8,padding:3,marginBottom:12,border:`1px solid ${C.border}`}}>
        {[["open","Open"],["in-progress","In Progress"],["done","Done"]].map(([k,lbl])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{flex:1,padding:"6px 4px",borderRadius:6,fontSize:11,fontWeight:filter===k?700:500,color:filter===k?"#fff":C.muted,background:filter===k?C.navy:"transparent",border:"none"}}>{lbl}</button>
        ))}
      </div>

      {sorted.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.mutedLight,fontSize:13}}>No tasks here.</div>}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {sorted.map(t=>{
          const sp=SP[t.status]||SP.open;
          return (
            <div key={t.id} onClick={()=>setOpenTask(t)} style={{background:C.surface,borderRadius:10,padding:"12px 13px",border:`1.5px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={t.assignedTo} size={34} color={staffColor(t.assignedTo)}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontFamily:F.display,fontWeight:700,fontSize:14,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</p>
                <p style={{fontSize:11,color:C.muted,marginTop:2}}>→ {t.assignedTo} · by {t.assignedBy} · {fmtTime(t.createdAt)}</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                <span style={{padding:"2px 8px",borderRadius:999,fontSize:11,fontWeight:700,background:sp.bg,color:sp.color}}>{sp.label}</span>
                {(t.comments||[]).length>0&&<span style={{fontSize:10,color:C.mutedLight}}>💬 {t.comments.length}</span>}
                {t.priority==="high"&&<span style={{fontSize:10,fontWeight:700,color:C.danger}}>HIGH</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add task modal */}
      {showAdd&&(
        <Modal title="Assign a task" onClose={()=>setShowAdd(false)}>
          <Field label="Task title" required>
            <FInput value={nt.title} onChange={v=>setNt(p=>({...p,title:v}))} placeholder="e.g. Count GI wire and update stock"/>
          </Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="Assign to">
              <select value={nt.assignedTo} onChange={e=>setNt(p=>({...p,assignedTo:e.target.value}))}
                style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}>
                {staffList.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select value={nt.priority} onChange={e=>setNt(p=>({...p,priority:e.target.value}))}
                style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </Field>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
            <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn onClick={addTask} disabled={!nt.title.trim()}>Assign task</Btn>
          </div>
        </Modal>
      )}

      {/* Task detail */}
      {openTask&&(()=>{
        const task=tasks.find(t=>t.id===openTask.id)||openTask;
        const sp=SP[task.status]||SP.open;
        return (
          <Modal title={task.title} onClose={()=>setOpenTask(null)} fullHeight>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
              <span style={{padding:"3px 10px",borderRadius:999,fontSize:12,fontWeight:700,background:sp.bg,color:sp.color}}>{sp.label}</span>
              <span style={{fontSize:13,color:C.muted}}>→ <b style={{color:C.text}}>{task.assignedTo}</b></span>
              <span style={{fontSize:13,color:C.muted}}>by {task.assignedBy}</span>
              {task.priority==="high"&&<span style={{fontSize:11,fontWeight:700,color:C.danger,background:C.dangerLight,padding:"2px 7px",borderRadius:5}}>HIGH</span>}
            </div>
            <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
              {["open","in-progress","done"].map(s=>(
                <button key={s} onClick={()=>updateTask({...task,status:s})}
                  style={{padding:"6px 12px",borderRadius:7,fontSize:12,fontWeight:task.status===s?700:500,color:task.status===s?"#fff":C.muted,background:task.status===s?C.navy:"transparent",border:`1.5px solid ${task.status===s?C.navy:C.border}`,textTransform:"capitalize"}}>
                  {s}
                </button>
              ))}
            </div>
            <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:9,marginBottom:12}}>
              {(task.comments||[]).length===0&&<p style={{color:C.mutedLight,fontSize:13}}>No updates yet.</p>}
              {(task.comments||[]).map(c=>(
                <div key={c.id} style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                  <Avatar name={c.author} size={26} color={staffColor(c.author)}/>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.text}}>{c.author}</span>
                      <span style={{fontSize:11,color:C.mutedLight}}>{fmtTime(c.time)}</span>
                    </div>
                    <div style={{background:C.bg,borderRadius:"0 9px 9px 9px",padding:"7px 10px",fontSize:13,color:C.text,lineHeight:1.5}}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:7,marginBottom:14}}>
              <input value={comment} onChange={e=>setComment(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); addComment(task); } }}
                placeholder="Add update… (Enter to send)"
                style={{flex:1,padding:"8px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}/>
              <Btn size="sm" onClick={()=>addComment(task)} disabled={!comment.trim()}>Send</Btn>
            </div>
            <div style={{paddingTop:12,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"flex-end"}}>
              <button onClick={()=>deleteTask(task.id)} style={{fontSize:12,color:C.danger,padding:"5px 10px",borderRadius:7,border:`1px solid ${C.danger}30`}}>Delete task</button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHARED SPACE — INTER-SHOP ITEM REQUESTS
// ─────────────────────────────────────────────────────────────

const SHARED_STATUS={
  pending:     {label:"Pending",      color:C.warn,    bg:C.warnLight,    icon:"⏳", next:"acknowledged"},
  acknowledged:{label:"Acknowledged", color:C.accent,  bg:C.accentLight,  icon:"👁", next:"fulfilled"},
  fulfilled:   {label:"Fulfilled",    color:C.success, bg:C.successLight, icon:"✅", next:null},
  cancelled:   {label:"Cancelled",    color:C.muted,   bg:"#F1F5F9",      icon:"❌", next:null},
};

function SStatusBadge({status}){
  const s=SHARED_STATUS[status]||SHARED_STATUS.pending;
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:999,background:s.bg,color:s.color,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{s.icon} {s.label}</span>;
}

// ── Add Request Modal ─────────────────────────────────────────
function AddSharedRequestModal({currentShop,otherShops,user,onSave,onClose}){
  const [toShop,setToShop]     = useState(otherShops[0]||null);
  const [items,setItems]       = useState([{id:uid(),name:"",qty:"",unit:"pcs"}]);
  const [note,setNote]         = useState("");
  const [priority,setPriority] = useState("normal");

  function addItem(){ setItems(p=>[...p,{id:uid(),name:"",qty:"",unit:"pcs"}]); }
  function removeItem(id){ if(items.length>1) setItems(p=>p.filter(i=>i.id!==id)); }
  function updateItem(id,f,v){ setItems(p=>p.map(i=>i.id===id?{...i,[f]:v}:i)); }

  function save(){
    const valid=items.filter(i=>i.name.trim());
    if(!valid.length||!toShop) return;
    onSave({
      id:uid(),
      fromShop:{id:currentShop.id,name:currentShop.name,icon:currentShop.icon,color:currentShop.color},
      toShop:  {id:toShop.id,    name:toShop.name,    icon:toShop.icon,    color:toShop.color},
      createdBy:user, createdAt:new Date().toISOString(),
      status:"pending", priority,
      items:valid.map(i=>({...i,qty:i.qty?parseInt(i.qty):null,name:i.name.trim()})),
      note:note.trim(), comments:[],
    });
  }

  if(!toShop) return null;

  return (
    <Modal title="Request items from another shop" onClose={onClose} fullHeight>
      {/* To shop */}
      <div style={{marginBottom:14}}>
        <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:".05em"}}>Send request to</label>
        {otherShops.length===1?(
          <div style={{padding:"12px 14px",borderRadius:10,background:toShop.color+"15",border:`1.5px solid ${toShop.color}40`,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{toShop.icon}</span>
            <span style={{fontFamily:F.display,fontWeight:700,color:toShop.color,fontSize:16}}>{toShop.name}</span>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {otherShops.map(s=>(
              <button key={s.id} onClick={()=>setToShop(s)} style={{padding:"12px 14px",borderRadius:10,background:toShop?.id===s.id?s.color+"18":"#F8FAFC",border:`1.5px solid ${toShop?.id===s.id?s.color:C.border}`,display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
                <span style={{fontSize:20}}>{s.icon}</span>
                <span style={{fontFamily:F.display,fontWeight:700,color:toShop?.id===s.id?s.color:C.text,fontSize:14}}>{s.name}</span>
                {toShop?.id===s.id&&<span style={{marginLeft:"auto",fontSize:14,color:s.color}}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
          <label style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em"}}>Items needed <span style={{color:C.danger}}>*</span></label>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 50px 54px 16px",gap:5,marginBottom:5}}>
          {["Item name","Qty","Unit",""].map(h=><span key={h} style={{fontSize:9,fontWeight:700,color:C.mutedLight,textTransform:"uppercase"}}>{h}</span>)}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {items.map(item=>(
            <div key={item.id} style={{display:"grid",gridTemplateColumns:"1fr 50px 54px 16px",gap:5,alignItems:"center"}}>
              <input value={item.name} onChange={e=>updateItem(item.id,"name",e.target.value)} placeholder="Item name"
                style={{padding:"8px 9px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:12,color:C.text,background:"#FAFBFD"}}/>
              <input type="number" value={item.qty||""} onChange={e=>updateItem(item.id,"qty",e.target.value)} placeholder="0"
                style={{padding:"8px 5px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:12,color:C.text,background:"#FAFBFD",textAlign:"center"}}/>
              <select value={item.unit||"pcs"} onChange={e=>updateItem(item.id,"unit",e.target.value)}
                style={{padding:"8px 4px",borderRadius:7,border:`1.5px solid ${C.border}`,fontSize:11,background:"#FAFBFD",color:C.text}}>
                {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </select>
              {items.length>1?<button onClick={()=>removeItem(item.id)} style={{color:C.mutedLight,fontSize:15}}>×</button>:<span/>}
            </div>
          ))}
        </div>
        <button onClick={addItem} style={{marginTop:7,fontSize:12,color:C.accent,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>+ Add item</button>
      </div>

      {/* Priority */}
      <Field label="Priority">
        <div style={{display:"flex",gap:8}}>
          {[["normal","Normal"],["urgent","🔴 Urgent"]].map(([k,lbl])=>(
            <button key={k} onClick={()=>setPriority(k)} style={{flex:1,padding:"8px",borderRadius:8,border:`1.5px solid ${priority===k?(k==="urgent"?C.danger:C.accent):C.border}`,background:priority===k?(k==="urgent"?C.dangerLight:C.accentLight):"#fff",fontSize:12,fontWeight:700,color:priority===k?(k==="urgent"?C.danger:C.accent):C.muted}}>
              {lbl}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Note (optional)">
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Customer waiting, please send today"
          rows={2} style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}/>
      </Field>

      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={!items.some(i=>i.name.trim())}>Send request</Btn>
      </div>
    </Modal>
  );
}

// ── Request Detail Modal ──────────────────────────────────────
function SharedRequestDetail({req,currentShop,user,onUpdate,onDelete,onClose}){
  const [comment,setComment]=useState("");
  const bottomRef=useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[req.comments]);

  const s=SHARED_STATUS[req.status]||SHARED_STATUS.pending;
  const isIncoming=req.toShop.id===currentShop.id;
  const canAdvance=isIncoming&&s.next;

  function advance(){
    if(!s.next) return;
    onUpdate({...req,status:s.next,updatedBy:user,updatedAt:new Date().toISOString()});
  }
  function cancel(){
    onUpdate({...req,status:"cancelled"});
  }
  function addComment(){
    if(!comment.trim()) return;
    const c={id:uid(),author:user,shopName:currentShop.name,shopColor:currentShop.color,text:comment.trim(),time:new Date().toISOString()};
    onUpdate({...req,comments:[...(req.comments||[]),c]});
    setComment("");
  }

  return (
    <Modal title="Item Request" onClose={onClose} fullHeight>
      {/* Direction + status */}
      <div style={{background:C.bg,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:8}}>
          <span style={{fontSize:14,fontWeight:700,color:req.fromShop.color}}>{req.fromShop.icon} {req.fromShop.name}</span>
          <span style={{fontSize:16,color:C.muted}}>→</span>
          <span style={{fontSize:14,fontWeight:700,color:req.toShop.color}}>{req.toShop.icon} {req.toShop.name}</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <SStatusBadge status={req.status}/>
          {req.priority==="urgent"&&<span style={{fontSize:10,fontWeight:700,color:C.danger,background:C.dangerLight,padding:"2px 7px",borderRadius:5}}>🔴 URGENT</span>}
          {isIncoming&&req.status==="pending"&&<span style={{fontSize:11,fontWeight:700,color:C.warn}}>← Action needed from your shop</span>}
        </div>
        <p style={{fontSize:11,color:C.muted,marginTop:6}}>Requested by {req.createdBy} · {fmtTime(req.createdAt)}</p>
      </div>

      {/* Items */}
      <div style={{marginBottom:14}}>
        <p style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Items requested</p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {req.items.map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",background:C.bg,borderRadius:8}}>
              <span style={{color:C.muted,fontSize:14}}>•</span>
              <span style={{flex:1,fontSize:13,fontWeight:500,color:C.text}}>{item.name}</span>
              {item.qty&&<span style={{fontSize:12,fontWeight:700,color:C.accent,background:C.accentLight,padding:"2px 8px",borderRadius:5}}>{item.qty} {item.unit}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      {req.note&&<div style={{background:C.warnLight,borderRadius:8,padding:"9px 12px",marginBottom:14,fontSize:13,color:"#92400E",lineHeight:1.5}}>📋 {req.note}</div>}

      {/* Status actions — only incoming shop can advance */}
      {(canAdvance||(isIncoming&&req.status!=="cancelled"&&req.status!=="fulfilled"))&&(
        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {canAdvance&&(
            <Btn variant="success" onClick={advance}>
              {req.status==="pending"?"✓ Acknowledge":"✓ Mark Fulfilled"}
            </Btn>
          )}
          {isIncoming&&req.status!=="cancelled"&&req.status!=="fulfilled"&&(
            <Btn variant="ghost" onClick={cancel} style={{color:C.danger,borderColor:C.danger+"40"}}>Cancel request</Btn>
          )}
        </div>
      )}

      {/* Comments thread */}
      <div style={{marginBottom:14}}>
        <p style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>
          Updates ({(req.comments||[]).length})
        </p>
        <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:9,marginBottom:10}}>
          {(req.comments||[]).length===0&&<p style={{color:C.mutedLight,fontSize:13}}>No updates yet. Add the first one.</p>}
          {(req.comments||[]).map(c=>(
            <div key={c.id} className="fade-in" style={{display:"flex",gap:9,alignItems:"flex-start"}}>
              <Avatar name={c.author} size={26} color={c.shopColor||C.accent}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:7,marginBottom:3,alignItems:"baseline",flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.text}}>{c.author}</span>
                  <span style={{fontSize:11,fontWeight:600,color:c.shopColor||C.accent}}>{c.shopName}</span>
                  <span style={{fontSize:11,color:C.mutedLight}}>{fmtTime(c.time)}</span>
                </div>
                <div style={{background:c.shopColor===currentShop.color?C.accentLight:C.bg,borderRadius:"0 9px 9px 9px",padding:"7px 10px",fontSize:13,color:C.text,lineHeight:1.5}}>{c.text}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>
        <div style={{display:"flex",gap:7}}>
          <input value={comment} onChange={e=>setComment(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addComment();}}}
            placeholder="Add update… (Enter to send)"
            style={{flex:1,padding:"8px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}/>
          <Btn size="sm" onClick={addComment} disabled={!comment.trim()}>Send</Btn>
        </div>
      </div>

      <div style={{paddingTop:12,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"flex-end"}}>
        <button onClick={()=>{onDelete(req.id);onClose();}} style={{fontSize:12,color:C.danger,padding:"5px 10px",borderRadius:7,border:`1px solid ${C.danger}30`}}>Delete request</button>
      </div>
    </Modal>
  );
}

// ── Shared Space Screen ───────────────────────────────────────
function SharedSpaceScreen({currentShop,allShops,user,sharedReqs,onUpdate}){
  const [showAdd,setShowAdd]   = useState(false);
  const [openReq,setOpenReq]   = useState(null);
  const [filter,setFilter]     = useState("incoming");

  const otherShops=allShops.filter(s=>s.id!==currentShop.id);
  const filtered=sharedReqs.filter(r=>
    filter==="incoming"?r.toShop.id===currentShop.id:r.fromShop.id===currentShop.id
  );
  const sorted=[...filtered].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const pendingIncoming=sharedReqs.filter(r=>r.toShop.id===currentShop.id&&r.status==="pending").length;

  // Dynamic filter labels based on shop names
  const otherName = otherShops.length===1 ? otherShops[0].name : "Other Shops";
  const filterTabs=[
    ["incoming",  `By ${otherName}`],
    ["outgoing",  `By ${currentShop.name}`],
  ];

  return (
    <div style={{padding:"14px 12px 8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <h2 style={{fontFamily:F.display,fontWeight:700,fontSize:18,color:C.text}}>Shared Space</h2>
          <p style={{fontSize:12,color:C.muted,marginTop:1}}>Inter-shop item requests</p>
        </div>
        {otherShops.length>0&&<Btn onClick={()=>setShowAdd(true)}>+ Request items</Btn>}
      </div>

      {/* Filter tabs */}
      <div style={{display:"flex",gap:1,background:C.surface,borderRadius:8,padding:3,marginBottom:12,border:`1px solid ${C.border}`}}>
        {filterTabs.map(([k,lbl])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{flex:1,padding:"7px 4px",borderRadius:6,fontSize:11,fontWeight:filter===k?700:500,color:filter===k?"#fff":C.muted,background:filter===k?C.navy:"transparent",border:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {lbl}
            {k==="incoming"&&pendingIncoming>0&&<span style={{background:C.danger,color:"#fff",borderRadius:999,fontSize:10,fontWeight:800,padding:"1px 5px",flexShrink:0}}>{pendingIncoming}</span>}
          </button>
        ))}
      </div>

      {/* Shop direction legend */}
      {allShops.length>1&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {allShops.map(s=>(
            <span key={s.id} style={{fontSize:11,fontWeight:s.id===currentShop.id?700:400,color:s.color,background:s.color+"15",padding:"3px 9px",borderRadius:5}}>
              {s.icon} {s.name}{s.id===currentShop.id?" (you)":""}
            </span>
          ))}
        </div>
      )}

      {/* Request list */}
      {sorted.length===0?(
        <div style={{textAlign:"center",padding:"40px 0",color:C.mutedLight,fontSize:14}}>
          <div style={{fontSize:44,marginBottom:12}}>🔄</div>
          <p style={{fontWeight:600,color:C.muted}}>No inter-shop requests yet</p>
          <p style={{fontSize:12,marginTop:6}}>Tap "+ Request items" to send items needed from another shop.</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {sorted.map(req=>{
            const isIncoming=req.toShop.id===currentShop.id;
            const isPending=req.status==="pending";
            return (
              <div key={req.id} onClick={()=>setOpenReq(req)}
                style={{background:C.surface,borderRadius:12,padding:"13px 14px",border:`1.5px solid ${isPending&&isIncoming?C.warn+"60":C.border}`,cursor:"pointer",boxShadow:isPending&&isIncoming?"0 0 0 3px "+C.warn+"14":"0 1px 3px rgba(0,0,0,.04)"}}>
                {/* Direction */}
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:700,color:req.fromShop.color}}>{req.fromShop.icon} {req.fromShop.name}</span>
                  <span style={{fontSize:14,color:C.mutedLight}}>→</span>
                  <span style={{fontSize:12,fontWeight:700,color:req.toShop.color}}>{req.toShop.icon} {req.toShop.name}</span>
                  {isIncoming&&<span style={{fontSize:10,fontWeight:700,color:"#fff",background:isIncoming&&isPending?C.warn:C.muted,padding:"1px 6px",borderRadius:4}}>{isPending?"ACTION NEEDED":"INCOMING"}</span>}
                </div>
                {/* Items */}
                <p style={{fontSize:13,color:C.text,marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {req.items.map(i=>`${i.name}${i.qty?` ×${i.qty} ${i.unit}`:""}`).join(" · ")}
                </p>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <SStatusBadge status={req.status}/>
                  {req.priority==="urgent"&&<span style={{fontSize:10,fontWeight:700,color:C.danger}}>🔴 URGENT</span>}
                  <span style={{fontSize:11,color:C.muted}}>by {req.createdBy} · {fmtTime(req.createdAt)}</span>
                  {(req.comments||[]).length>0&&<span style={{fontSize:11,color:C.muted}}>💬 {req.comments.length}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd&&otherShops.length>0&&(
        <AddSharedRequestModal currentShop={currentShop} otherShops={otherShops} user={user}
          onSave={req=>{ onUpdate([req,...sharedReqs]); setShowAdd(false); }}
          onClose={()=>setShowAdd(false)}/>
      )}
      {openReq&&(
        <SharedRequestDetail
          req={sharedReqs.find(r=>r.id===openReq.id)||openReq}
          currentShop={currentShop} user={user}
          onUpdate={updated=>{ onUpdate(sharedReqs.map(r=>r.id===updated.id?updated:r)); setOpenReq(updated); }}
          onDelete={id=>{ onUpdate(sharedReqs.filter(r=>r.id!==id)); setOpenReq(null); }}
          onClose={()=>setOpenReq(null)}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRICE LIST SCREEN
// ─────────────────────────────────────────────────────────────
function PriceListScreen({priceItems,priceDocs,user,onUpdateItems,onUpdateDocs}){
  const [tab,setTab]           = useState("items");
  const [search,setSearch]     = useState("");
  const [showAdd,setShowAdd]   = useState(false);
  const [editItem,setEditItem] = useState(null);
  const [ni,setNi]             = useState({code:"",name:"",unit:"pcs",price:"",category:""});
  const [uploading,setUploading] = useState(false);
  const fileRef                = useRef(null);

  const filtered = priceItems.filter(i=>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.code||"").toLowerCase().includes(search.toLowerCase()) ||
    (i.category||"").toLowerCase().includes(search.toLowerCase())
  );

  function saveItem(){
    if(!ni.name.trim()||!ni.price) return;
    const item={id:editItem?.id||uid(),code:ni.code.trim(),name:ni.name.trim(),unit:ni.unit,price:parseFloat(ni.price),category:ni.category.trim(),updatedBy:user,updatedAt:new Date().toISOString()};
    if(editItem) onUpdateItems(priceItems.map(i=>i.id===editItem.id?item:i));
    else onUpdateItems([item,...priceItems]);
    setNi({code:"",name:"",unit:"pcs",price:"",category:""}); setShowAdd(false); setEditItem(null);
  }

  function deleteItem(id){ onUpdateItems(priceItems.filter(i=>i.id!==id)); }

  async function uploadDoc(e){
    const file=e.target.files[0]; if(!file) return;
    if(file.size>3*1024*1024){ alert("File too large. Max 3MB."); e.target.value=""; return; }
    setUploading(true);
    const reader=new FileReader();
    reader.onload=ev=>{
      const doc={id:uid(),name:file.name,fileType:file.type,fileData:ev.target.result,size:file.size,uploadedBy:user,uploadedAt:new Date().toISOString()};
      onUpdateDocs([doc,...priceDocs]); setUploading(false);
    };
    reader.readAsDataURL(file); e.target.value="";
  }

  function viewDoc(doc){
    const a=document.createElement("a");
    a.href=doc.fileData; a.target="_blank"; a.rel="noopener";
    a.click();
  }

  function openAddItem(){ setEditItem(null); setNi({code:"",name:"",unit:"pcs",price:"",category:""}); setShowAdd(true); }
  function openEditItem(item){ setEditItem(item); setNi({code:item.code||"",name:item.name,unit:item.unit,price:item.price,category:item.category||""}); setShowAdd(true); }

  const categories=[...new Set(priceItems.map(i=>i.category).filter(Boolean))];

  return (
    <div style={{padding:"14px 12px 8px"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <h2 style={{fontFamily:F.display,fontWeight:700,fontSize:18,color:C.text}}>Price List</h2>
          <p style={{fontSize:12,color:C.muted,marginTop:1}}>{priceItems.length} items · {priceDocs.length} documents</p>
        </div>
        <Btn size="sm" onClick={tab==="items"?openAddItem:()=>fileRef.current?.click()}>
          {tab==="items"?"+ Add item":"📎 Upload"}
        </Btn>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:1,background:C.surface,borderRadius:8,padding:3,marginBottom:12,border:`1px solid ${C.border}`}}>
        {[["items","📋 Items"],["docs","📄 Documents"]].map(([k,lbl])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"7px",borderRadius:6,fontSize:12,fontWeight:tab===k?700:500,color:tab===k?"#fff":C.muted,background:tab===k?C.navy:"transparent",border:"none"}}>{lbl}</button>
        ))}
      </div>

      {/* ITEMS TAB */}
      {tab==="items"&&(
        <>
          {/* Search */}
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search by name, code or category…"
            style={{width:"100%",padding:"10px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:C.surface,marginBottom:10}}/>

          {filtered.length===0?(
            <div style={{textAlign:"center",padding:"36px 0",color:C.mutedLight,fontSize:14}}>
              {search?"No items match your search.":"No items yet. Tap + Add item to start."}
            </div>
          ):(
            <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
              {/* Column headers */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 54px 72px 28px",gap:0,padding:"7px 12px",background:"#F8FAFD",borderBottom:`1.5px solid ${C.border}`}}>
                {["Item","Unit","Rate",""].map(h=><span key={h} style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".04em"}}>{h}</span>)}
              </div>
              {filtered.map((item,i)=>(
                <div key={item.id} style={{display:"grid",gridTemplateColumns:"1fr 54px 72px 28px",gap:0,padding:"10px 12px",borderTop:i>0?`1px solid #F1F5F9`:"none",alignItems:"center"}} onClick={()=>openEditItem(item)}>
                  <div style={{minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p>
                    <div style={{display:"flex",gap:6,marginTop:2}}>
                      {item.code&&<span style={{fontSize:10,color:C.muted,fontFamily:"monospace"}}>{item.code}</span>}
                      {item.category&&<span style={{fontSize:10,color:C.accent,background:C.accentLight,padding:"0 5px",borderRadius:3}}>{item.category}</span>}
                    </div>
                  </div>
                  <span style={{fontSize:12,color:C.muted}}>{item.unit}</span>
                  <span style={{fontSize:13,fontWeight:700,color:C.accent}}>{fmtINR(item.price)}</span>
                  <button onClick={e=>{e.stopPropagation();deleteItem(item.id);}} style={{color:"#CBD5E1",fontSize:16,padding:"2px 4px"}}>×</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* DOCUMENTS TAB */}
      {tab==="docs"&&(
        <>
          <input ref={fileRef} type="file" accept="application/pdf,image/*" onChange={uploadDoc} style={{display:"none"}}/>
          {uploading&&<div style={{textAlign:"center",padding:"20px",color:C.muted,fontSize:13}}>Uploading…</div>}
          {priceDocs.length===0&&!uploading?(
            <div style={{textAlign:"center",padding:"36px 0",color:C.mutedLight,fontSize:14}}>
              <div style={{fontSize:40,marginBottom:10}}>📄</div>
              <p>No documents yet.</p>
              <p style={{fontSize:12,marginTop:4}}>Upload PDF price lists to share with staff.</p>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {priceDocs.map(doc=>(
                <div key={doc.id} style={{background:C.surface,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:10,background:"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
                    {doc.fileType==="application/pdf"?"📄":"🖼️"}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</p>
                    <p style={{fontSize:11,color:C.muted,marginTop:2}}>
                      {(doc.size/1024).toFixed(0)} KB · by {doc.uploadedBy} · {fmtTime(doc.uploadedAt)}
                    </p>
                  </div>
                  <div style={{display:"flex",gap:8,flexShrink:0}}>
                    <button onClick={()=>viewDoc(doc)} style={{fontSize:13,color:C.accent,fontWeight:700,padding:"6px 10px",borderRadius:7,border:`1px solid ${C.border}`}}>View</button>
                    <button onClick={()=>onUpdateDocs(priceDocs.filter(d=>d.id!==doc.id))} style={{fontSize:13,color:C.danger,padding:"6px 8px",borderRadius:7,border:`1px solid ${C.danger}30`}}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add / Edit item modal */}
      {showAdd&&(
        <Modal title={editItem?"Edit item":"Add price item"} onClose={()=>{setShowAdd(false);setEditItem(null);}}>
          <Field label="Item code (optional)">
            <FInput value={ni.code} onChange={v=>setNi(p=>({...p,code:v}))} placeholder="e.g. PVC-001, HW-042"/>
          </Field>
          <Field label="Item name" required>
            <FInput value={ni.name} onChange={v=>setNi(p=>({...p,name:v}))} placeholder="e.g. PVC Pipe 1 inch"/>
          </Field>
          <Field label="Category (optional)">
            <FInput value={ni.category} onChange={v=>setNi(p=>({...p,category:v}))} placeholder="e.g. Pipes, Electrical, Paint"/>
          </Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="Unit">
              <select value={ni.unit} onChange={e=>setNi(p=>({...p,unit:e.target.value}))}
                style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}>
                {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Selling price (₹)" required>
              <FInput type="number" value={ni.price} onChange={v=>setNi(p=>({...p,price:v}))} placeholder="0"/>
            </Field>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
            <Btn variant="ghost" onClick={()=>{setShowAdd(false);setEditItem(null);}}>Cancel</Btn>
            <Btn onClick={saveItem} disabled={!ni.name.trim()||!ni.price}>{editItem?"Save changes":"Add item"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SOP CHECKLISTS SCREEN
// ─────────────────────────────────────────────────────────────
const SOP_DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const CAT_COLORS=["#1D4ED8","#0891B2","#7C3AED","#059669","#D97706","#DC2626","#BE185D","#65A30D","#0F172A","#6B7280"];

function ymd(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

function sopPeriodKey(tpl,date){
  if(tpl.frequency==="daily") return ymd(date);
  if(tpl.frequency==="weekly"){
    const d=new Date(date); const wd=(d.getDay()+6)%7; d.setDate(d.getDate()-wd);
    return "W"+ymd(d);
  }
  if(tpl.frequency==="monthly") return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
  return null; // "once" — every run is fresh, no period bucket
}
function sopDueToday(tpl,date){
  if(tpl.frequency==="daily") return true;
  if(tpl.frequency==="weekly") return tpl.dayOfWeek===date.getDay();
  if(tpl.frequency==="monthly") return tpl.dayOfMonth===date.getDate();
  return false;
}
function sopDaysUntil(tpl,date){
  if(tpl.frequency==="weekly") return (tpl.dayOfWeek-date.getDay()+7)%7;
  if(tpl.frequency==="monthly"){
    const dim=new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
    let diff=tpl.dayOfMonth-date.getDate(); if(diff<0) diff+=dim; return diff;
  }
  return 99;
}
function sopUpcoming(tpl,date){ const d=sopDaysUntil(tpl,date); return d>0&&d<=6; }
function fmtSopTime(t){
  if(!t) return "";
  const [h,m]=t.split(":").map(Number);
  const ampm=h>=12?"PM":"AM"; const h12=h%12||12;
  return `${h12}:${String(m).padStart(2,"0")} ${ampm}`;
}
function sopTimeSort(a,b){
  if(a.startTime&&b.startTime) return a.startTime.localeCompare(b.startTime);
  if(a.startTime) return -1;
  if(b.startTime) return 1;
  return 0;
}
function sopWhen(tpl){
  let base;
  if(tpl.frequency==="daily") base="Every day";
  else if(tpl.frequency==="weekly") base="Every "+SOP_DAYS[tpl.dayOfWeek];
  else if(tpl.frequency==="monthly") base="Day "+tpl.dayOfMonth+" of month";
  else base="One-off";
  return tpl.startTime ? base+" · "+fmtSopTime(tpl.startTime) : base;
}

function SOPsScreen({templates,runs,sopCats,shopUsers,user,isAdmin,onUpdateTemplates,onUpdateRuns,onUpdateSopCats}){
  function blankTpl(){ return {title:"",categoryId:"",frequency:"daily",dayOfWeek:1,dayOfMonth:1,startTime:"",assignedTo:[],steps:[{id:uid(),text:""}]}; }

  const [showAdd,setShowAdd]       = useState(false);
  const [editTpl,setEditTpl]       = useState(null);
  const [runTplId,setRunTplId]     = useState(null);
  const [runId,setRunId]           = useState(null);
  const [historyTpl,setHistoryTpl] = useState(null);
  const [nt,setNt]                 = useState(blankTpl());
  const [showCats,setShowCats]     = useState(false);
  const [newCat,setNewCat]         = useState({name:"",icon:"📌",color:CAT_COLORS[0]});
  const today=new Date();

  const active=(templates||[]).filter(t=>t.active!==false);
  const recurring=active.filter(t=>t.frequency!=="once");
  const dueToday=recurring.filter(t=>sopDueToday(t,today)).sort(sopTimeSort);
  const upcoming=recurring.filter(t=>!sopDueToday(t,today)).sort((a,b)=>sopDaysUntil(a,today)-sopDaysUntil(b,today)||sopTimeSort(a,b));
  const oneOffs=active.filter(t=>t.frequency==="once");

  function catFor(tpl){ return sopCats.find(c=>c.id===tpl.categoryId); }
  function runFor(tpl){
    const matches=runs.filter(r=>r.sopId===tpl.id);
    if(tpl.frequency==="once") return matches.sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt))[0]||null;
    const pk=sopPeriodKey(tpl,today);
    return matches.find(r=>r.periodKey===pk)||null;
  }
  function startNewRun(tpl){
    const run={id:uid(),sopId:tpl.id,periodKey:sopPeriodKey(tpl,today),startedBy:user,startedAt:new Date().toISOString(),
      stepStates:tpl.steps.map(s=>({stepId:s.id,done:false,doneBy:null,doneAt:null,note:""})),
      status:"in-progress",completedBy:null,completedAt:null};
    onUpdateRuns([run,...runs]);
    setRunTplId(tpl.id); setRunId(run.id);
  }

  function openTemplate(tpl){
    let run=runFor(tpl);
    if(!run){
      run={id:uid(),sopId:tpl.id,periodKey:sopPeriodKey(tpl,today),startedBy:user,startedAt:new Date().toISOString(),
        stepStates:tpl.steps.map(s=>({stepId:s.id,done:false,doneBy:null,doneAt:null,note:""})),
        status:"in-progress",completedBy:null,completedAt:null};
      onUpdateRuns([run,...runs]);
    }
    setRunTplId(tpl.id); setRunId(run.id);
  }

  function toggleStep(run,stepId){
    const stepStates=run.stepStates.map(s=>s.stepId!==stepId?s:
      s.done?{...s,done:false,doneBy:null,doneAt:null}:{...s,done:true,doneBy:user,doneAt:new Date().toISOString()});
    const allDone=stepStates.length>0&&stepStates.every(s=>s.done);
    const updated={...run,stepStates,status:allDone?"done":"in-progress",
      completedBy:allDone?user:null,completedAt:allDone?new Date().toISOString():null};
    onUpdateRuns(runs.map(r=>r.id===run.id?updated:r));
  }

  function updateStepNote(run,stepId,note){
    const stepStates=run.stepStates.map(s=>s.stepId===stepId?{...s,note}:s);
    onUpdateRuns(runs.map(r=>r.id===run.id?{...r,stepStates}:r));
  }

  function openEdit(tpl){
    setEditTpl(tpl);
    setNt({title:tpl.title,categoryId:tpl.categoryId||"",frequency:tpl.frequency,dayOfWeek:tpl.dayOfWeek??1,dayOfMonth:tpl.dayOfMonth??1,startTime:tpl.startTime||"",assignedTo:tpl.assignedTo||[],steps:tpl.steps.map(s=>({...s}))});
    setShowAdd(true);
  }
  function openAdd(){ setEditTpl(null); setNt(blankTpl()); setShowAdd(true); }

  function saveTemplate(){
    const steps=nt.steps.map(s=>({...s,text:s.text.trim()})).filter(s=>s.text);
    if(!nt.title.trim()||steps.length===0) return;
    const tpl={id:editTpl?.id||uid(),title:nt.title.trim(),categoryId:nt.categoryId||null,
      frequency:nt.frequency,dayOfWeek:nt.frequency==="weekly"?Number(nt.dayOfWeek):null,
      dayOfMonth:nt.frequency==="monthly"?Number(nt.dayOfMonth):null,startTime:nt.startTime||null,assignedTo:nt.assignedTo||[],steps,active:true};
    if(editTpl) onUpdateTemplates(templates.map(t=>t.id===editTpl.id?tpl:t));
    else onUpdateTemplates([tpl,...templates]);
    setShowAdd(false); setEditTpl(null);
  }
  function deactivateTemplate(id){ onUpdateTemplates(templates.map(t=>t.id===id?{...t,active:false}:t)); setShowAdd(false); }

  function toggleAssignee(name){
    setNt(p=>({...p,assignedTo:p.assignedTo.includes(name)?p.assignedTo.filter(n=>n!==name):[...p.assignedTo,name]}));
  }

  function addCategory(){
    if(!newCat.name.trim()) return;
    onUpdateSopCats([...sopCats,{id:uid(),name:newCat.name.trim(),icon:newCat.icon.trim()||"📌",color:newCat.color}]);
    setNewCat({name:"",icon:"📌",color:CAT_COLORS[0]});
  }
  function deleteCategory(id){
    onUpdateSopCats(sopCats.filter(c=>c.id!==id));
    if(templates.some(t=>t.categoryId===id)) onUpdateTemplates(templates.map(t=>t.categoryId===id?{...t,categoryId:null}:t));
  }

  const openRun = runId ? runs.find(r=>r.id===runId) : null;
  const openTpl = runTplId ? templates.find(t=>t.id===runTplId) : null;

  function Row({tpl}){
    const cat=catFor(tpl);
    const run=runFor(tpl);
    const done=run&&run.status==="done";
    const stepsDone=run?run.stepStates.filter(s=>s.done).length:0;
    return (
      <div style={{background:C.surface,borderRadius:10,padding:"12px 13px",border:`1.5px solid ${done?C.success+"40":C.border}`,display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
        <div onClick={()=>openTemplate(tpl)} style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0,cursor:"pointer"}}>
          <div style={{width:38,height:38,borderRadius:10,background:cat?cat.color+"20":"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{cat?cat.icon:"🗓️"}</div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontFamily:F.display,fontWeight:700,fontSize:14,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tpl.title}</p>
            <p style={{fontSize:11,color:C.muted,marginTop:2}}>{sopWhen(tpl)}{cat?" · "+cat.name:""}{tpl.assignedTo&&tpl.assignedTo.length>0?" · 👤 "+tpl.assignedTo.join(", "):""}</p>
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          {done?<span style={{fontSize:11,fontWeight:700,color:C.success}}>✅ Done</span>
            :run?<span style={{fontSize:11,fontWeight:700,color:C.warn}}>{stepsDone}/{tpl.steps.length}</span>
            :<span style={{fontSize:11,color:C.mutedLight}}>Not started</span>}
          <div style={{marginTop:4,display:"flex",gap:8,justifyContent:"flex-end"}}>
            {tpl.frequency==="once"&&done&&<button onClick={()=>startNewRun(tpl)} style={{fontSize:10,color:C.accent,fontWeight:600}}>▶ Start new</button>}
            {isAdmin&&<button onClick={()=>setHistoryTpl(tpl)} style={{fontSize:10,color:C.accent,fontWeight:600}}>History</button>}
            {isAdmin&&<button onClick={()=>openEdit(tpl)} style={{fontSize:10,color:C.muted,fontWeight:600}}>Edit</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"14px 12px 8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <h2 style={{fontFamily:F.display,fontWeight:700,fontSize:18,color:C.text}}>SOPs</h2>
          <p style={{fontSize:12,color:C.muted,marginTop:1}}>{dueToday.length} due today</p>
        </div>
        {isAdmin&&(
          <div style={{display:"flex",gap:8}}>
            <Btn variant="ghost" size="sm" onClick={()=>setShowCats(true)}>🏷️ Categories</Btn>
            <Btn onClick={openAdd}>+ New SOP</Btn>
          </div>
        )}
      </div>

      {dueToday.length>0&&<>
        <p style={{fontSize:11,fontWeight:700,color:C.danger,textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>🔴 Due today</p>
        {dueToday.map(t=><Row key={t.id} tpl={t}/>)}
      </>}

      {upcoming.length>0&&<>
        <p style={{fontSize:11,fontWeight:700,color:C.warn,textTransform:"uppercase",letterSpacing:".05em",margin:"14px 0 8px"}}>🟡 Upcoming</p>
        {upcoming.map(t=><Row key={t.id} tpl={t}/>)}
      </>}

      {oneOffs.length>0&&<>
        <p style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".05em",margin:"14px 0 8px"}}>⚪ One-off procedures</p>
        {oneOffs.map(t=><Row key={t.id} tpl={t}/>)}
      </>}

      {active.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.mutedLight,fontSize:13}}>No SOPs set up yet.{isAdmin?" Tap + New SOP to add one.":""}</div>}

      {/* Add/Edit template modal */}
      {showAdd&&(
        <Modal title={editTpl?"Edit SOP":"New SOP"} onClose={()=>setShowAdd(false)}>
          <Field label="Title" required><FInput value={nt.title} onChange={v=>setNt(p=>({...p,title:v}))} placeholder="e.g. Opening checklist"/></Field>
          <Field label="Category (optional)">
            <select value={nt.categoryId} onChange={e=>setNt(p=>({...p,categoryId:e.target.value}))}
              style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}>
              <option value="">None</option>
              {sopCats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </Field>
          <Field label="Frequency">
            <select value={nt.frequency} onChange={e=>setNt(p=>({...p,frequency:e.target.value}))}
              style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="once">One-off</option>
            </select>
          </Field>
          {nt.frequency==="weekly"&&(
            <Field label="Day of week">
              <select value={nt.dayOfWeek} onChange={e=>setNt(p=>({...p,dayOfWeek:e.target.value}))}
                style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}>
                {SOP_DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
              </select>
            </Field>
          )}
          {nt.frequency==="monthly"&&(
            <Field label="Day of month">
              <select value={nt.dayOfMonth} onChange={e=>setNt(p=>({...p,dayOfMonth:e.target.value}))}
                style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}>
                {Array.from({length:28},(_,i)=>i+1).map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          )}
          <Field label="Start time (optional)">
            <FInput type="time" value={nt.startTime} onChange={v=>setNt(p=>({...p,startTime:v}))}/>
          </Field>
          <Field label="Assign to (optional — leave blank for anyone)">
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {shopUsers.map(u=>{
                const on=nt.assignedTo.includes(u.displayName);
                return (
                  <button key={u.id} onClick={()=>toggleAssignee(u.displayName)}
                    style={{padding:"6px 12px",borderRadius:999,fontSize:12,fontWeight:600,border:`1.5px solid ${on?C.accent:C.border}`,background:on?C.accentLight:"#fff",color:on?C.accent:C.muted}}>
                    {u.displayName}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Steps" required>
            {nt.steps.map((s,i)=>(
              <div key={s.id} style={{display:"flex",gap:6,marginBottom:6}}>
                <FInput value={s.text} onChange={v=>setNt(p=>({...p,steps:p.steps.map(x=>x.id===s.id?{...x,text:v}:x)}))} placeholder={`Step ${i+1}`}/>
                <button onClick={()=>setNt(p=>({...p,steps:p.steps.filter(x=>x.id!==s.id)}))} style={{color:C.danger,fontSize:16,padding:"0 8px"}}>×</button>
              </div>
            ))}
            <button onClick={()=>setNt(p=>({...p,steps:[...p.steps,{id:uid(),text:""}]}))} style={{fontSize:12,color:C.accent,fontWeight:600}}>+ Add step</button>
          </Field>
          <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:8}}>
            {editTpl?<Btn variant="danger" size="sm" onClick={()=>deactivateTemplate(editTpl.id)}>Deactivate</Btn>:<span/>}
            <div style={{display:"flex",gap:8}}>
              <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
              <Btn onClick={saveTemplate}>{editTpl?"Save changes":"Create SOP"}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Run checklist modal */}
      {openRun&&openTpl&&(
        <Modal title={openTpl.title} onClose={()=>{setRunTplId(null);setRunId(null);}}>
          <p style={{fontSize:12,color:C.muted,marginBottom:12}}>{sopWhen(openTpl)} · started by {openRun.startedBy}</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {openTpl.steps.map(step=>{
              const st=openRun.stepStates.find(s=>s.stepId===step.id)||{done:false,note:""};
              return (
                <div key={step.id} style={{borderRadius:9,border:`1.5px solid ${st.done?C.success+"40":C.border}`,background:st.done?C.successLight:"#fff",overflow:"hidden"}}>
                  <div onClick={()=>toggleStep(openRun,step.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",cursor:"pointer"}}>
                    <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${st.done?C.success:C.border}`,background:st.done?C.success:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,flexShrink:0}}>{st.done?"✓":""}</div>
                    <div style={{flex:1}}>
                      <p style={{fontSize:13,color:C.text,textDecoration:st.done?"line-through":"none",opacity:st.done?.6:1}}>{step.text}</p>
                      {st.done&&<p style={{fontSize:10,color:C.mutedLight,marginTop:1}}>{st.doneBy} · {fmtTime(st.doneAt)}</p>}
                    </div>
                  </div>
                  {st.done&&(
                    <div style={{padding:"0 12px 10px 44px"}}>
                      <input value={st.note||""} onChange={e=>updateStepNote(openRun,step.id,e.target.value)} placeholder="Add a note (optional)"
                        style={{width:"100%",padding:"6px 9px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:12,color:C.text,background:"#fff"}}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {openRun.status==="done"&&<p style={{marginTop:14,fontSize:12,fontWeight:700,color:C.success,textAlign:"center"}}>✅ Completed by {openRun.completedBy}</p>}
        </Modal>
      )}

      {/* History modal */}
      {historyTpl&&(
        <Modal title={historyTpl.title+" — history"} onClose={()=>setHistoryTpl(null)}>
          {(()=>{
            const past=runs.filter(r=>r.sopId===historyTpl.id).sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt));
            if(past.length===0) return <p style={{fontSize:13,color:C.mutedLight,textAlign:"center",padding:"20px 0"}}>No runs yet.</p>;
            return past.map(r=>{
              const noted=r.stepStates.filter(s=>s.note&&s.note.trim());
              return (
                <div key={r.id} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.text}}>{fmtDate(r.startedAt)}</span>
                    <span style={{fontSize:12,fontWeight:700,color:r.status==="done"?C.success:C.warn}}>{r.status==="done"?"✅ Done":"⏳ Incomplete"}</span>
                  </div>
                  <p style={{fontSize:11,color:C.muted,marginTop:2}}>{r.status==="done"?`Completed by ${r.completedBy}`:`Started by ${r.startedBy}`} · {r.stepStates.filter(s=>s.done).length}/{r.stepStates.length} steps</p>
                  {noted.length>0&&(
                    <div style={{marginTop:6,paddingLeft:10,borderLeft:`2px solid ${C.border}`}}>
                      {noted.map(s=>{
                        const step=historyTpl.steps.find(x=>x.id===s.stepId);
                        return <p key={s.stepId} style={{fontSize:11,color:C.muted,marginBottom:3}}><b style={{color:C.text}}>{step?step.text:"Step"}:</b> {s.note}</p>;
                      })}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </Modal>
      )}

      {/* Category manager modal */}
      {showCats&&(
        <Modal title="SOP Categories" onClose={()=>setShowCats(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {sopCats.length===0&&<p style={{fontSize:13,color:C.mutedLight,textAlign:"center",padding:"12px 0"}}>No categories yet.</p>}
            {sopCats.map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:9,border:`1.5px solid ${C.border}`}}>
                <div style={{width:30,height:30,borderRadius:8,background:c.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{c.icon}</div>
                <span style={{flex:1,fontSize:13,fontWeight:600,color:C.text}}>{c.name}</span>
                <button onClick={()=>deleteCategory(c.id)} style={{color:C.danger,fontSize:16,padding:"0 8px"}}>×</button>
              </div>
            ))}
          </div>
          <Field label="Add a category">
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <FInput value={newCat.icon} onChange={v=>setNewCat(p=>({...p,icon:v}))} style={{width:50,textAlign:"center"}} placeholder="🏷️"/>
              <FInput value={newCat.name} onChange={v=>setNewCat(p=>({...p,name:v}))} placeholder="Category name"/>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {CAT_COLORS.map(col=>(
                <button key={col} onClick={()=>setNewCat(p=>({...p,color:col}))}
                  style={{width:24,height:24,borderRadius:"50%",background:col,border:newCat.color===col?`2.5px solid ${C.text}`:"2px solid transparent"}}/>
              ))}
            </div>
            <Btn onClick={addCategory} disabled={!newCat.name.trim()} size="sm">+ Add category</Btn>
          </Field>
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TILE STOCK SCREEN
// ─────────────────────────────────────────────────────────────
const TILE_UNITS=["Boxes","Sq.ft","Pieces"];

function TileStockScreen({designs,movements,tileCats,user,isAdmin,onUpdateDesigns,onUpdateMovements,onUpdateTileCats}){
  function blankDesign(){ return {code:"",categoryId:"",size:"",unit:"Boxes",sellingPrice:"",purchaseRate:"",photo:""}; }

  const [showAdd,setShowAdd]       = useState(false);
  const [editDesign,setEditDesign] = useState(null);
  const [openId,setOpenId]         = useState(null);
  const [showCats,setShowCats]     = useState(false);
  const [newCat,setNewCat]         = useState({name:"",icon:"🧱",color:CAT_COLORS[0]});
  const [nd,setNd]                 = useState(blankDesign());
  const [uploading,setUploading]   = useState(false);
  const [moveType,setMoveType]     = useState(null);
  const [moveQty,setMoveQty]       = useState("");
  const [moveNote,setMoveNote]     = useState("");
  const photoRef                   = useRef(null);

  const active = (designs||[]).filter(d=>d.active!==false);
  const openDesign = openId ? designs.find(d=>d.id===openId) : null;

  function catFor(d){ return tileCats.find(c=>c.id===d.categoryId); }
  function balanceFor(id){ return movements.filter(m=>m.designId===id).reduce((s,m)=>s+(m.type==="in"?m.qty:-m.qty),0); }

  function addCategory(){
    if(!newCat.name.trim()) return;
    onUpdateTileCats([...tileCats,{id:uid(),name:newCat.name.trim(),icon:newCat.icon.trim()||"🧱",color:newCat.color}]);
    setNewCat({name:"",icon:"🧱",color:CAT_COLORS[0]});
  }
  function deleteCategory(id){
    onUpdateTileCats(tileCats.filter(c=>c.id!==id));
    if(designs.some(d=>d.categoryId===id)) onUpdateDesigns(designs.map(d=>d.categoryId===id?{...d,categoryId:null}:d));
  }

  async function handlePhoto(e){
    const file=e.target.files[0]; if(!file) return;
    setUploading(true);
    const compressed=await compressTilePhoto(file);
    setNd(p=>({...p,photo:compressed}));
    setUploading(false); e.target.value="";
  }

  function openAdd(){ setEditDesign(null); setNd(blankDesign()); setShowAdd(true); }
  function openEdit(d){
    setEditDesign(d);
    setNd({code:d.code,categoryId:d.categoryId||"",size:d.size||"",unit:d.unit||"Boxes",
      sellingPrice:d.sellingPrice??"",purchaseRate:isAdmin?(d.purchaseRate??""):"",photo:d.photo||""});
    setShowAdd(true);
  }

  function saveDesign(){
    if(!nd.code.trim()) return;
    const design={
      id:editDesign?.id||uid(), code:nd.code.trim(), categoryId:nd.categoryId||null,
      size:nd.size.trim(), unit:nd.unit,
      sellingPrice:nd.sellingPrice?parseFloat(nd.sellingPrice):null,
      // Staff never see purchaseRate, so never let their save wipe an admin-set value.
      purchaseRate: isAdmin ? (nd.purchaseRate?parseFloat(nd.purchaseRate):null) : (editDesign?.purchaseRate ?? null),
      photo:nd.photo||"", active:true,
      addedBy:editDesign?.addedBy||user, createdAt:editDesign?.createdAt||new Date().toISOString(),
    };
    if(editDesign) onUpdateDesigns(designs.map(d=>d.id===editDesign.id?design:d));
    else onUpdateDesigns([design,...designs]);
    setShowAdd(false); setEditDesign(null);
  }
  function deactivateDesign(id){ onUpdateDesigns(designs.map(d=>d.id===id?{...d,active:false}:d)); setShowAdd(false); }

  function logMovement(){
    const q=parseFloat(moveQty);
    if(!q||q<=0||!openId) return;
    const m={id:uid(),designId:openId,type:moveType,qty:q,note:moveNote.trim(),by:user,at:new Date().toISOString()};
    onUpdateMovements([m,...movements]);
    setMoveType(null); setMoveQty(""); setMoveNote("");
  }

  async function shareDesign(d){
    const cat=catFor(d);
    const parts=[d.code];
    if(cat) parts.push(cat.name);
    if(d.size) parts.push(d.size);
    if(d.sellingPrice) parts.push(`₹${d.sellingPrice}`);
    const text=parts.join(" · ");
    try{
      if(d.photo && navigator.canShare){
        const blob=await (await fetch(d.photo)).blob();
        const file=new File([blob],`tile-${d.code}.jpg`,{type:"image/jpeg"});
        if(navigator.canShare({files:[file]})){ await navigator.share({files:[file],text}); return; }
      }
      if(navigator.share){ await navigator.share({text}); return; }
    }catch(e){}
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank");
  }

  return (
    <div style={{padding:"14px 12px 8px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <h2 style={{fontFamily:F.display,fontWeight:700,fontSize:18,color:C.text}}>Tile Stock</h2>
          <p style={{fontSize:12,color:C.muted,marginTop:1}}>{active.length} designs</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" size="sm" onClick={()=>setShowCats(true)}>🏷️ Categories</Btn>
          <Btn onClick={openAdd}>+ Add design</Btn>
        </div>
      </div>

      {active.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.mutedLight,fontSize:13}}>No tile designs yet. Tap + Add design to start.</div>}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {active.map(d=>{
          const cat=catFor(d);
          const bal=balanceFor(d.id);
          return (
            <div key={d.id} onClick={()=>setOpenId(d.id)} style={{background:C.surface,borderRadius:10,padding:"10px 12px",border:`1.5px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
              {d.photo?
                <img src={d.photo} alt="" style={{width:44,height:44,borderRadius:9,objectFit:"cover",flexShrink:0}}/>
                :<div style={{width:44,height:44,borderRadius:9,background:cat?cat.color+"20":"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{cat?cat.icon:"🧱"}</div>
              }
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontFamily:F.display,fontWeight:700,fontSize:14,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.code}</p>
                <p style={{fontSize:11,color:C.muted,marginTop:2}}>{cat?cat.name:"Uncategorized"}{d.size?" · "+d.size:""}</p>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <p style={{fontSize:14,fontWeight:700,color:bal<=0?C.danger:C.text}}>{bal} {d.unit}</p>
                {d.sellingPrice&&<p style={{fontSize:11,color:C.muted}}>{fmtINR(d.sellingPrice)}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit design modal */}
      {showAdd&&(
        <Modal title={editDesign?"Edit Design":"New Tile Design"} onClose={()=>setShowAdd(false)}>
          <Field label="Code" required><FInput value={nd.code} onChange={v=>setNd(p=>({...p,code:v}))} placeholder="e.g. GVT-4521"/></Field>
          <Field label="Category">
            <select value={nd.categoryId} onChange={e=>setNd(p=>({...p,categoryId:e.target.value}))}
              style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}>
              <option value="">None</option>
              {tileCats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="Size"><FInput value={nd.size} onChange={v=>setNd(p=>({...p,size:v}))} placeholder="e.g. 2x2 ft"/></Field>
            <Field label="Unit">
              <select value={nd.unit} onChange={e=>setNd(p=>({...p,unit:e.target.value}))}
                style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}>
                {TILE_UNITS.map(u=><option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
          </div>
          <div style={{display:"grid",gridTemplateColumns:isAdmin?"1fr 1fr":"1fr",gap:10}}>
            <Field label="Selling price (₹)"><FInput type="number" value={nd.sellingPrice} onChange={v=>setNd(p=>({...p,sellingPrice:v}))} placeholder="0"/></Field>
            {isAdmin&&<Field label="Purchase rate (₹) — admin only"><FInput type="number" value={nd.purchaseRate} onChange={v=>setNd(p=>({...p,purchaseRate:v}))} placeholder="0"/></Field>}
          </div>
          <Field label="Photo (optional)">
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {nd.photo&&<img src={nd.photo} alt="" style={{width:60,height:60,borderRadius:9,objectFit:"cover"}}/>}
              <button onClick={()=>photoRef.current?.click()} style={{padding:"8px 12px",borderRadius:8,border:`1.5px dashed ${C.border}`,fontSize:12,color:C.muted,fontWeight:600}}>
                {uploading?"⏳ Uploading...":nd.photo?"Change photo":"📷 Add photo"}
              </button>
              <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
            </div>
          </Field>
          <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:8}}>
            {editDesign?<Btn variant="danger" size="sm" onClick={()=>deactivateDesign(editDesign.id)}>Deactivate</Btn>:<span/>}
            <div style={{display:"flex",gap:8}}>
              <Btn variant="ghost" onClick={()=>setShowAdd(false)}>Cancel</Btn>
              <Btn onClick={saveDesign} disabled={!nd.code.trim()}>{editDesign?"Save changes":"Add design"}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Category manager modal */}
      {showCats&&(
        <Modal title="Tile Categories" onClose={()=>setShowCats(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {tileCats.length===0&&<p style={{fontSize:13,color:C.mutedLight,textAlign:"center",padding:"12px 0"}}>No categories yet.</p>}
            {tileCats.map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:9,border:`1.5px solid ${C.border}`}}>
                <div style={{width:30,height:30,borderRadius:8,background:c.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>{c.icon}</div>
                <span style={{flex:1,fontSize:13,fontWeight:600,color:C.text}}>{c.name}</span>
                <button onClick={()=>deleteCategory(c.id)} style={{color:C.danger,fontSize:16,padding:"0 8px"}}>×</button>
              </div>
            ))}
          </div>
          <Field label="Add a category">
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              <FInput value={newCat.icon} onChange={v=>setNewCat(p=>({...p,icon:v}))} style={{width:50,textAlign:"center"}} placeholder="🏷️"/>
              <FInput value={newCat.name} onChange={v=>setNewCat(p=>({...p,name:v}))} placeholder="Category name"/>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
              {CAT_COLORS.map(col=>(
                <button key={col} onClick={()=>setNewCat(p=>({...p,color:col}))}
                  style={{width:24,height:24,borderRadius:"50%",background:col,border:newCat.color===col?`2.5px solid ${C.text}`:"2px solid transparent"}}/>
              ))}
            </div>
            <Btn onClick={addCategory} disabled={!newCat.name.trim()} size="sm">+ Add category</Btn>
          </Field>
        </Modal>
      )}

      {/* Design detail modal */}
      {openDesign&&(()=>{
        const cat=catFor(openDesign);
        const bal=balanceFor(openDesign.id);
        const history=movements.filter(m=>m.designId===openDesign.id).sort((a,b)=>new Date(b.at)-new Date(a.at));
        return (
          <Modal title={openDesign.code} onClose={()=>{setOpenId(null);setMoveType(null);setMoveQty("");setMoveNote("");}} fullHeight>
            {openDesign.photo&&<img src={openDesign.photo} alt="" style={{width:"100%",maxHeight:220,objectFit:"cover",borderRadius:10,marginBottom:12}}/>}
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
              {cat&&<span style={{fontSize:11,fontWeight:600,color:cat.color,background:cat.color+"15",padding:"3px 9px",borderRadius:6}}>{cat.icon} {cat.name}</span>}
              {openDesign.size&&<span style={{fontSize:11,color:C.muted,background:C.bg,padding:"3px 9px",borderRadius:6}}>{openDesign.size}</span>}
              {openDesign.sellingPrice&&<span style={{fontSize:11,fontWeight:600,color:C.accent,background:C.accentLight,padding:"3px 9px",borderRadius:6}}>Sell: {fmtINR(openDesign.sellingPrice)}</span>}
              {isAdmin&&openDesign.purchaseRate&&<span style={{fontSize:11,fontWeight:600,color:C.warn,background:C.warnLight,padding:"3px 9px",borderRadius:6}}>Buy: {fmtINR(openDesign.purchaseRate)}</span>}
            </div>

            <div style={{textAlign:"center",padding:"14px 0",background:C.bg,borderRadius:10,marginBottom:12}}>
              <p style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:".05em"}}>Current balance</p>
              <p style={{fontSize:26,fontWeight:800,color:bal<=0?C.danger:C.text,fontFamily:F.display}}>{bal} <span style={{fontSize:14,fontWeight:600,color:C.muted}}>{openDesign.unit}</span></p>
            </div>

            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <Btn variant="success" onClick={()=>setMoveType(moveType==="in"?null:"in")} style={{flex:1}}>+ Stock In</Btn>
              <Btn variant="danger" onClick={()=>setMoveType(moveType==="out"?null:"out")} style={{flex:1}}>− Stock Out</Btn>
            </div>

            {moveType&&(
              <div style={{background:"#FAFBFD",border:`1.5px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:14}}>
                <p style={{fontSize:12,fontWeight:700,color:moveType==="in"?C.success:C.danger,marginBottom:8}}>{moveType==="in"?"Stock In":"Stock Out"}</p>
                <div style={{marginBottom:8}}>
                  <FInput type="number" value={moveQty} onChange={setMoveQty} placeholder={`Qty (${openDesign.unit})`}/>
                </div>
                <FInput value={moveNote} onChange={setMoveNote} placeholder="Note (optional) e.g. supplier, invoice no."/>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
                  <Btn variant="ghost" size="sm" onClick={()=>{setMoveType(null);setMoveQty("");setMoveNote("");}}>Cancel</Btn>
                  <Btn size="sm" onClick={logMovement} disabled={!moveQty||parseFloat(moveQty)<=0}>Log it</Btn>
                </div>
              </div>
            )}

            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <Btn variant="ghost" size="sm" onClick={()=>{setOpenId(null);openEdit(openDesign);}}>✏️ Edit</Btn>
              <Btn variant="ghost" size="sm" onClick={()=>shareDesign(openDesign)}>📤 Share</Btn>
            </div>

            <p style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>History ({history.length})</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {history.length===0&&<p style={{fontSize:13,color:C.mutedLight,textAlign:"center",padding:"16px 0"}}>No stock movements yet.</p>}
              {history.map(m=>(
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:C.bg,borderRadius:8}}>
                  <span style={{fontSize:13}}>{m.type==="in"?"📥":"📤"}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,fontWeight:600,color:C.text}}>{m.type==="in"?"+":"−"}{m.qty} {openDesign.unit}{m.note?" · "+m.note:""}</p>
                    <p style={{fontSize:10,color:C.mutedLight}}>{m.by} · {fmtTime(m.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ATTENDANCE SCREEN
// ─────────────────────────────────────────────────────────────
function AttendanceScreen({attendance,shopUsers,user,isAdmin,onUpdate}){
  const [month,setMonth]   = useState(()=>{const d=new Date();return {y:d.getFullYear(),m:d.getMonth()};});
  const [editRec,setEditRec] = useState(null);
  const [viewRec,setViewRec] = useState(null);

  const daysInMonth = new Date(month.y,month.m+1,0).getDate();
  const days = Array.from({length:daysInMonth},(_,i)=>i+1);
  const monthLabel = new Date(month.y,month.m,1).toLocaleDateString("en-IN",{month:"long",year:"numeric"});
  const todayKey = ymd(new Date());

  function dateKeyFor(d){ return ymd(new Date(month.y,month.m,d)); }
  function recordFor(staffName,d){ return attendance.find(a=>a.staffName===staffName&&a.date===dateKeyFor(d)); }

  const staffList = isAdmin ? shopUsers.map(u=>u.displayName) : [user];

  function openCell(staffName,d){
    const rec=recordFor(staffName,d);
    if(!isAdmin){ if(rec) setViewRec(rec); return; }
    setEditRec({
      staffName, date:dateKeyFor(d),
      status: rec?.status || "absent",
      checkInTime: rec?.checkIn ? new Date(rec.checkIn).toTimeString().slice(0,5) : "",
      checkOutTime: rec?.checkOut ? new Date(rec.checkOut).toTimeString().slice(0,5) : "",
      existing: rec||null,
    });
  }

  function saveRecord(){
    const existing=editRec.existing;
    const checkIn = editRec.checkInTime ? new Date(`${editRec.date}T${editRec.checkInTime}`).toISOString() : null;
    const checkOut = editRec.checkOutTime ? new Date(`${editRec.date}T${editRec.checkOutTime}`).toISOString() : null;
    const rec={
      id:existing?.id||uid(), staffName:editRec.staffName, date:editRec.date,
      checkIn, checkInLoc:existing?.checkInLoc||null,
      checkOut, checkOutLoc:existing?.checkOutLoc||null,
      status:editRec.status,
    };
    if(existing) onUpdate(attendance.map(a=>a.id===existing.id?rec:a));
    else onUpdate([rec,...attendance]);
    setEditRec(null);
  }
  function deleteRecord(){
    if(editRec.existing) onUpdate(attendance.filter(a=>a.id!==editRec.existing.id));
    setEditRec(null);
  }

  return (
    <div style={{padding:"14px 12px 8px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={()=>setMonth(p=>{const d=new Date(p.y,p.m-1,1);return {y:d.getFullYear(),m:d.getMonth()};})} style={{fontSize:18,padding:"4px 12px",color:C.muted}}>‹</button>
        <p style={{fontFamily:F.display,fontWeight:700,fontSize:15,color:C.text}}>{monthLabel}</p>
        <button onClick={()=>setMonth(p=>{const d=new Date(p.y,p.m+1,1);return {y:d.getFullYear(),m:d.getMonth()};})} style={{fontSize:18,padding:"4px 12px",color:C.muted}}>›</button>
      </div>

      <div style={{display:"flex",gap:14,marginBottom:16,fontSize:11,color:C.muted}}>
        <span><span style={{display:"inline-block",width:9,height:9,borderRadius:2,background:C.success,marginRight:4}}/>Present</span>
        <span><span style={{display:"inline-block",width:9,height:9,borderRadius:2,background:C.warn,marginRight:4}}/>Half-day</span>
        <span><span style={{display:"inline-block",width:9,height:9,borderRadius:2,background:C.danger,marginRight:4}}/>Absent</span>
      </div>

      {staffList.map(staffName=>(
        <div key={staffName} style={{marginBottom:18}}>
          <p style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>{staffName}</p>
          <div style={{overflowX:"auto",display:"flex",gap:4,paddingBottom:4}}>
            {days.map(d=>{
              const rec=recordFor(staffName,d);
              const isToday=dateKeyFor(d)===todayKey;
              let bg="#F1F5F9", color=C.mutedLight, label="";
              if(rec){
                if(rec.status==="present"){bg=C.success;color="#fff";label="P";}
                else if(rec.status==="half-day"){bg=C.warn;color="#fff";label="H";}
                else if(rec.status==="absent"){bg=C.danger;color="#fff";label="A";}
              }
              return (
                <button key={d} onClick={()=>openCell(staffName,d)}
                  style={{minWidth:30,height:36,borderRadius:7,background:bg,color,fontSize:10,fontWeight:700,border:isToday?`2px solid ${C.text}`:"none",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
                  <span style={{fontSize:8,opacity:.85}}>{d}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Admin: add/edit a day's record */}
      {editRec&&(
        <Modal title={`${editRec.staffName} — ${fmtDate(editRec.date)}`} onClose={()=>setEditRec(null)}>
          <Field label="Status">
            <select value={editRec.status} onChange={e=>setEditRec(p=>({...p,status:e.target.value}))}
              style={{width:"100%",padding:"9px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:13,color:C.text,background:"#FAFBFD"}}>
              <option value="present">Present</option>
              <option value="half-day">Half-day</option>
              <option value="absent">Absent</option>
            </select>
          </Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Field label="Check-in time"><FInput type="time" value={editRec.checkInTime} onChange={v=>setEditRec(p=>({...p,checkInTime:v}))}/></Field>
            <Field label="Check-out time"><FInput type="time" value={editRec.checkOutTime} onChange={v=>setEditRec(p=>({...p,checkOutTime:v}))}/></Field>
          </div>
          {editRec.existing&&(editRec.existing.checkInLoc||editRec.existing.checkOutLoc)&&(
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              {editRec.existing.checkInLoc&&<button onClick={()=>openMapLink(editRec.existing.checkInLoc)} style={{fontSize:11,color:C.accent,fontWeight:600}}>📍 Check-in location</button>}
              {editRec.existing.checkOutLoc&&<button onClick={()=>openMapLink(editRec.existing.checkOutLoc)} style={{fontSize:11,color:C.accent,fontWeight:600}}>📍 Check-out location</button>}
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"space-between",marginTop:8}}>
            {editRec.existing?<Btn variant="danger" size="sm" onClick={deleteRecord}>Delete</Btn>:<span/>}
            <div style={{display:"flex",gap:8}}>
              <Btn variant="ghost" onClick={()=>setEditRec(null)}>Cancel</Btn>
              <Btn onClick={saveRecord}>Save</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Staff: read-only day detail */}
      {viewRec&&(
        <Modal title={fmtDate(viewRec.date)} onClose={()=>setViewRec(null)}>
          <p style={{fontSize:13,color:C.text,marginBottom:8}}>Status: <b>{viewRec.status}</b></p>
          {viewRec.checkIn&&(
            <p style={{fontSize:13,color:C.text,marginBottom:6}}>Check-in: {fmtClockTime(viewRec.checkIn)}
              {viewRec.checkInLoc&&<button onClick={()=>openMapLink(viewRec.checkInLoc)} style={{marginLeft:8,fontSize:11,color:C.accent,fontWeight:600}}>📍 Location</button>}
            </p>
          )}
          {viewRec.checkOut&&(
            <p style={{fontSize:13,color:C.text}}>Check-out: {fmtClockTime(viewRec.checkOut)}
              {viewRec.checkOutLoc&&<button onClick={()=>openMapLink(viewRec.checkOutLoc)} style={{marginLeft:8,fontSize:11,color:C.accent,fontWeight:600}}>📍 Location</button>}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────
export default function App(){
  const [shopUsers,setShopUsers]     = useState(null);
  const [shopList,setShopList]       = useState(null);
  const [currentUser,setCurrentUser] = useState(null);
  const [currentShop,setCurrentShop] = useState(null);
  const [user,setUser]               = useState("");
  const [section,setSection]         = useState("dashboard");
  const [custOrders,setCustOrders]   = useState([]);
  const [cats,setCats]               = useState(null);
  const [tasks,setTasks]             = useState([]);
  const [sharedReqs,setSharedReqs]   = useState([]);
  const [priceItems,setPriceItems]   = useState([]);
  const [priceDocs,setPriceDocs]     = useState([]);
  const [sopTemplates,setSopTemplates] = useState([]);
  const [sopRuns,setSopRuns]         = useState([]);
  const [sopCats,setSopCats]         = useState([]);
  const [tileCats,setTileCats]         = useState([]);
  const [tileDesigns,setTileDesigns]   = useState([]);
  const [tileMovements,setTileMovements] = useState([]);
  const [attendance,setAttendance]       = useState([]);
  const [loading,setLoading]         = useState(true);
  const [toast,setToast]             = useState(null);
  const [showUserMgmt,setShowUserMgmt] = useState(false);

  // Restore session from localStorage on mount (24 hour expiry)
  useEffect(()=>{
    try{
      const saved=localStorage.getItem("shop_session");
      if(saved){
        const session=JSON.parse(saved);
        const hoursAgo=(Date.now()-session.loginTime)/(1000*60*60);
        if(hoursAgo<24 && session.user){
          setCurrentUser(session.user);
          setUser(session.user.displayName);
        } else {
          localStorage.removeItem("shop_session"); // expired
        }
      }
    }catch(e){ try{ localStorage.removeItem("shop_session"); }catch{} }
  },[]);

  // Load global config + shared requests on mount
  useEffect(()=>{
    Promise.all([sget("shop-users"),sget("shops"),sget("shared-requests")]).then(([u,s,sr])=>{
      setShopUsers(u||[]); setShopList(s||[]); setSharedReqs(sr||[]);
    });
    const sharedInterval=setInterval(async()=>{
      const sr=await sget("shared-requests");
      if(sr) setSharedReqs(sr);
    },5000);
    return()=>clearInterval(sharedInterval);
  },[]);

  // Load shop data when shop is selected
  useEffect(()=>{
    if(!user||!currentShop) return;
    setLoading(true);
    const sid=currentShop.id;
    async function load(){
      const [c,ct,t,pi,pd,st,sr,sc,tc,td,tm,att]=await Promise.all([sget(sid+"/customer-orders"),sget(sid+"/reorder-cats"),sget(sid+"/tasks-v2"),sget(sid+"/price-items"),sget(sid+"/price-docs"),sget(sid+"/sop-templates"),sget(sid+"/sop-runs"),sget(sid+"/sop-categories"),sget(sid+"/tile-categories"),sget(sid+"/tile-designs"),sget(sid+"/tile-movements"),sget(sid+"/staff-attendance")]);
      setCustOrders(c||[]); setCats(ct||INITIAL_CATS); setTasks(t||[]); setPriceItems(pi||[]); setPriceDocs(pd||[]);
      setSopTemplates(st||[]); setSopRuns(sr||[]); setSopCats(sc||[]);
      setTileCats(tc||[]); setTileDesigns(td||[]); setTileMovements(tm||[]);
      setAttendance(att||[]);
      setLoading(false);
    }
    load();
    const interval=setInterval(async()=>{
      const [c,ct,t,sr,td,tm,att]=await Promise.all([sget(sid+"/customer-orders"),sget(sid+"/reorder-cats"),sget(sid+"/tasks-v2"),sget(sid+"/sop-runs"),sget(sid+"/tile-designs"),sget(sid+"/tile-movements"),sget(sid+"/staff-attendance")]);
      if(c) setCustOrders(c); if(ct) setCats(ct); if(t) setTasks(t); if(sr) setSopRuns(sr); if(td) setTileDesigns(td); if(tm) setTileMovements(tm); if(att) setAttendance(att);
    },5000);
    return()=>clearInterval(interval);
  },[user,currentShop]);

  function handleLogin(userObj){
    // Save session to localStorage — persists for 24 hours
    try{
      localStorage.setItem("shop_session", JSON.stringify({
        user:{ id:userObj.id, displayName:userObj.displayName, username:userObj.username, role:userObj.role, shops:userObj.shops },
        loginTime: Date.now()
      }));
    }catch(e){}
    setCurrentUser(userObj); setUser(userObj.displayName); setCurrentShop(null); setLoading(true);
  }

  function handleLogout(){
    try{ localStorage.removeItem("shop_session"); }catch(e){}
    setCurrentUser(null); setUser(""); setCurrentShop(null); setSection("dashboard");
    setCustOrders([]); setCats(null); setTasks([]); setLoading(true);
  }
  function switchShop(){
    setCurrentShop(null); setSection("dashboard");
    setCustOrders([]); setCats(null); setTasks([]); setLoading(true);
  }

  const sid=currentShop?.id||"";
  async function saveCustOrders(next){ setCustOrders(next); await sset(sid+"/customer-orders",next); }
  async function saveCats(next){ setCats(next); await sset(sid+"/reorder-cats",next); }
  async function saveTasks(next){
    const added=next.filter(t=>!tasks.some(x=>x.id===t.id));
    setTasks(next); await sset(sid+"/tasks-v2",next);
    added.forEach(t=>{
      if(window.pushNotify){
        const tag=t.priority==="high"?"🔴 HIGH — ":"";
        window.pushNotify(`✅ New Task — ${t.title}`,`${tag}Assigned to ${t.assignedTo} by ${t.assignedBy}`);
      }
    });
  }
  async function saveSharedReqs(next){
    const added=next.filter(r=>!sharedReqs.some(s=>s.id===r.id));
    setSharedReqs(next); await sset("shared-requests",next);
    added.forEach(r=>{
      if(window.pushNotify){
        const urgentTag=r.priority==="urgent"?"🔴 URGENT — ":"";
        window.pushNotify(
          `${urgentTag}Item Request from ${r.fromShop.name}`,
          `${r.items.slice(0,2).map(i=>i.name).join(", ")} → ${r.toShop.name}`
        );
      }
    });
  }
  async function savePriceItems(next){ setPriceItems(next); await sset(sid+"/price-items",next); }
  async function savePriceDocs(next){ setPriceDocs(next); await sset(sid+"/price-docs",next); }
  async function saveSopTemplates(next){ setSopTemplates(next); await sset(sid+"/sop-templates",next); }
  async function saveSopCats(next){ setSopCats(next); await sset(sid+"/sop-categories",next); }
  async function saveTileCats(next){ setTileCats(next); await sset(sid+"/tile-categories",next); }
  async function saveTileDesigns(next){ setTileDesigns(next); await sset(sid+"/tile-designs",next); }
  async function saveTileMovements(next){ setTileMovements(next); await sset(sid+"/tile-movements",next); }
  async function saveAttendance(next){
    next.forEach(rec=>{
      const prev=attendance.find(a=>a.id===rec.id);
      if(!prev && rec.checkIn && window.pushNotify){
        window.pushNotify(`🕐 ${rec.staffName} checked in`, `${currentShop.name} · ${fmtClockTime(rec.checkIn)}`);
      } else if(prev && !prev.checkOut && rec.checkOut && window.pushNotify){
        const mins=Math.round((new Date(rec.checkOut)-new Date(rec.checkIn))/60000);
        window.pushNotify(`🕐 ${rec.staffName} checked out`, `${currentShop.name} · ${fmtClockTime(rec.checkOut)} (worked ${Math.floor(mins/60)}h ${mins%60}m)`);
      }
    });
    setAttendance(next);
    await sset(sid+"/staff-attendance",next);
  }
  async function saveSopRuns(next){
    const justCompleted=next.filter(r=>{
      const prev=sopRuns.find(x=>x.id===r.id);
      return r.status==="done" && (!prev||prev.status!=="done");
    });
    setSopRuns(next); await sset(sid+"/sop-runs",next);
    justCompleted.forEach(r=>{
      if(window.pushNotify){
        const tpl=sopTemplates.find(t=>t.id===r.sopId);
        window.pushNotify(`🗓️ ${tpl?tpl.title:"SOP"} completed`,`Done by ${r.completedBy||user}`);
      }
    });
  }

  function upsertOrder(order){
    const isNew=!custOrders.some(o=>o.id===order.id);
    saveCustOrders(custOrders.some(o=>o.id===order.id)?custOrders.map(o=>o.id===order.id?order:o):[order,...custOrders]);
    if(isNew && window.pushNotify){
      const items=order.items.slice(0,2).map(i=>i.name).join(", ")+(order.items.length>2?` +${order.items.length-2} more`:"");
      window.pushNotify(`🛒 New Order — ${order.customerName}`,`${items} · added by ${user}`);
    } else if(!isNew && window.pushNotify){
      window.pushNotify(`✏️ Order Updated — ${order.customerName}`,`Edited by ${user}`);
    }
  }
  function updateOrder(order){
    const prev=custOrders.find(o=>o.id===order.id);
    saveCustOrders(custOrders.map(o=>o.id===order.id?order:o));
    if(order.status==="ready"&&prev&&prev.status!=="ready"&&window.pushNotify){
      window.pushNotify(`✅ Ready for Pickup — ${order.customerName}`,`Confirmed by ${user}`);
    }
    if(order.status==="processing"&&prev&&prev.status==="new"&&window.pushNotify){
      window.pushNotify(`⚙️ Order In Progress — ${order.customerName}`,`Being processed by ${user}`);
    }
  }
  function deleteOrder(id){ saveCustOrders(custOrders.filter(o=>o.id!==id)); }

  const badges={
    orders:  custOrders.filter(o=>o.status==="new"||o.status==="processing").length,
    reorder: cats?cats.reduce((s,c)=>s+c.items.filter(i=>!i.ordered).length,0):0,
    tasks:   tasks.filter(t=>t.status!=="done").length,
    shared:  currentShop?sharedReqs.filter(r=>r.toShop?.id===currentShop.id&&r.status==="pending").length:0,
  };

  const Spinner = ()=>(
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{FONTS}</style><p style={{color:"rgba(255,255,255,.4)",fontSize:14}}>Loading…</p>
    </div>
  );

  // ── Auth gates ──────────────────────────────────────────────
  if(shopUsers===null||shopList===null) return <Spinner/>;
  if(shopUsers.length===0||shopList.length===0)
    return <SetupScreen onSetup={(shops,users,admin)=>{ setShopList(shops); setShopUsers(users); handleLogin(admin); }}/>;
  if(!currentUser) return <LoginScreen users={shopUsers} onLogin={handleLogin}/>;

  // Determine which shops this user can access
  const userShops = currentUser.role==="admin"
    ? shopList
    : shopList.filter(s=>(currentUser.shops||[]).includes(s.id));

  // Shop selector (if user has multiple shops or no shop selected yet)
  if(!currentShop){
    if(userShops.length===1){
      // Auto-select if only one shop — use setTimeout to avoid render loop
      setTimeout(()=>setCurrentShop(userShops[0]),0);
      return <Spinner/>;
    }
    return <ShopSelector shops={userShops} user={user} onSelect={setCurrentShop} onLogout={handleLogout}/>;
  }

  if(loading||!cats) return <Spinner/>;

  const isAdmin=currentUser.role==="admin";
  const multiShop=userShops.length>1;
  const sectionTitle={dashboard:"",orders:"Customer Orders",reorder:"Reorder List",tasks:"Tasks",shared:"Shared Space",prices:"Price List",sops:"SOPs",tiles:"Tile Stock",attendance:"Attendance"};

  return (
    <div style={{minHeight:"100vh",minHeight:"100dvh",background:C.bg,paddingBottom:"calc(72px + env(safe-area-inset-bottom))"}}>
      <style>{FONTS}</style>

      <header style={{background:C.navy,padding:"0 14px",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:700,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:50}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {section!=="dashboard"&&<button onClick={()=>setSection("dashboard")} style={{color:"rgba(255,255,255,.6)",fontSize:20,padding:"0 4px"}}>‹</button>}
            {section==="dashboard"?(
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{currentShop.icon}</span>
                <div>
                  <p style={{fontFamily:F.display,fontWeight:700,fontSize:15,color:"#fff",lineHeight:1}}>{currentShop.name}</p>
                  {multiShop&&<button onClick={switchShop} style={{fontSize:9,color:currentShop.color,fontWeight:700,lineHeight:1,marginTop:1,textTransform:"uppercase",letterSpacing:".04em"}}>Switch shop ▾</button>}
                </div>
              </div>
            ):(
              <span style={{fontFamily:F.display,fontWeight:700,fontSize:17,color:"#fff"}}>{sectionTitle[section]}</span>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            {isAdmin&&(
              <button onClick={()=>setShowUserMgmt(true)}
                style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.75)",padding:"4px 9px",borderRadius:6,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)"}}>
                👥 Staff
              </button>
            )}
            {isAdmin&&(
              <button onClick={()=>window._testPush&&window._testPush()}
                title="Test push notification"
                style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.6)",padding:"4px 8px",borderRadius:6,border:"1px solid rgba(255,255,255,.15)"}}>
                🔔
              </button>
            )}
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <Avatar name={user} size={24} color="rgba(255,255,255,.25)"/>
              <div>
                <p style={{fontSize:12,color:"rgba(255,255,255,.85)",lineHeight:1,fontWeight:600}}>{user}</p>
                <p style={{fontSize:9,color:"rgba(255,255,255,.35)",lineHeight:1,marginTop:2,textTransform:"capitalize"}}>{currentUser.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{fontSize:11,color:"rgba(255,255,255,.4)",padding:"4px 7px",borderRadius:6,border:"1px solid rgba(255,255,255,.12)"}}>
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Full-width content — each section fills screen edge to edge */}
      <div style={{width:"100%",background:C.bg,minHeight:"calc(100dvh - 50px - 72px)"}}>
        {section==="dashboard"&&<DashboardScreen user={user} custOrders={custOrders} cats={cats} tasks={tasks} priceItems={priceItems} sopTemplates={sopTemplates} sopRuns={sopRuns} tileDesigns={tileDesigns} tileMovements={tileMovements} attendance={attendance} shopName={currentShop.name} onUpdateAttendance={saveAttendance} setSection={setSection}/>}
        {section==="orders"&&<CustomerOrdersScreen orders={custOrders} user={user} onUpdate={updateOrder} onAdd={upsertOrder} onDelete={deleteOrder}/>}
        {section==="reorder"&&<ReorderScreen cats={cats} user={user} onUpdateCats={saveCats} showToast={setToast}/>}
        {section==="tasks"&&<TasksScreen tasks={tasks} user={user} shopUsers={shopUsers.filter(u=>(u.shops||[]).includes(currentShop.id)||u.role==="admin")} onUpdateTasks={saveTasks}/>}
        {section==="shared"&&<SharedSpaceScreen currentShop={currentShop} allShops={shopList} user={user} sharedReqs={sharedReqs} onUpdate={saveSharedReqs}/>}
        {section==="prices"&&<PriceListScreen priceItems={priceItems} priceDocs={priceDocs} user={user} onUpdateItems={savePriceItems} onUpdateDocs={savePriceDocs}/>}
        {section==="sops"&&<SOPsScreen templates={sopTemplates} runs={sopRuns} sopCats={sopCats} shopUsers={shopUsers.filter(u=>(u.shops||[]).includes(currentShop.id)||u.role==="admin")} user={user} isAdmin={isAdmin} onUpdateTemplates={saveSopTemplates} onUpdateRuns={saveSopRuns} onUpdateSopCats={saveSopCats}/>}
        {section==="tiles"&&<TileStockScreen designs={tileDesigns} movements={tileMovements} tileCats={tileCats} user={user} isAdmin={isAdmin} onUpdateDesigns={saveTileDesigns} onUpdateMovements={saveTileMovements} onUpdateTileCats={saveTileCats}/>}
        {section==="attendance"&&<AttendanceScreen attendance={attendance} shopUsers={shopUsers.filter(u=>(u.shops||[]).includes(currentShop.id)||u.role==="admin")} user={user} isAdmin={isAdmin} onUpdate={saveAttendance}/>}
      </div>

      <BottomNav section={section} setSection={setSection} badges={badges}/>

      {showUserMgmt&&isAdmin&&(
        <UserManagementModal users={shopUsers} shopList={shopList} currentUser={currentUser} onUpdate={u=>setShopUsers(u)} onClose={()=>setShowUserMgmt(false)}/>
      )}

      {toast&&<Toast msg={toast} onDone={()=>setToast(null)}/>}
    </div>
  );
}
