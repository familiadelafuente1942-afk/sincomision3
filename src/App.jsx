import { useState, useRef, useEffect } from "react";

let _notifListeners = [];
let _publicaciones  = [];
try { _publicaciones = JSON.parse(localStorage.getItem('sc_publicaciones') || '[]'); } catch {}

function emitirPublicacion(prop) {
  const evento = { id: Date.now(), prop, ts: Date.now(), visto: false };
  _publicaciones = [evento, ..._publicaciones].slice(0, 50);
  try { localStorage.setItem('sc_publicaciones', JSON.stringify(_publicaciones)); } catch {}
  _notifListeners.forEach(fn => fn(evento));
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification('Nueva propiedad en SinComision 🏠', {
      body: `${prop.tipo} en ${prop.barrio} · ${prop.moneda} ${prop.precio?.toLocaleString('es-AR')}`,
      icon: '/favicon.svg',
      tag: 'nueva-prop-' + evento.id,
    });
  }
}

function suscribirNotif(fn) {
  _notifListeners.push(fn);
  return () => { _notifListeners = _notifListeners.filter(f => f !== fn); };
}

const C = {
  bg:"#F5F5F2", surface:"#FFFFFF", bone:"#F5F5F2", edge:"#E8E8E8",
  line:"#EBEBEB", ink:"#090909", body:"#444444", sub:"#777777", ghost:"#BBBBBB",
  blue:"#0055FF", blueDm:"rgba(0,85,255,0.08)", blueRg:"rgba(0,85,255,0.20)", blueGl:"rgba(0,85,255,0.30)",
  green:"#34C759", greenDm:"rgba(52,199,89,0.08)", greenRg:"rgba(52,199,89,0.20)",
  red:"#FF3B30", redDm:"rgba(255,59,48,0.08)", orange:"#FF9500",
};
const AR = "'Archivo','Helvetica Neue',sans-serif";
const MN = "'DM Mono','Menlo',monospace";
const CSS = `@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap'); *,*::before,*::after{box-sizing:border-box;-webkit-tap-highlight-color:transparent;} ::-webkit-scrollbar{display:none;}*{scrollbar-width:none;} body{background:#F5F5F2;margin:0;} input::placeholder,textarea::placeholder{color:#BBBBBB;} @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}} @keyframes ping{0%{transform:scale(1);opacity:.9}80%,100%{transform:scale(2.2);opacity:0}}`;

const SEGS = [
  { id:"compra",      label:"Compra",      color:C.blue,    bg:C.blueDm,               bdr:C.blueRg               },
  { id:"alquiler",    label:"Alquiler",    color:C.green,   bg:C.greenDm,              bdr:C.greenRg              },
  { id:"temporario",  label:"Temporario",  color:"#E91E8C", bg:"rgba(233,30,140,.08)", bdr:"rgba(233,30,140,.22)" },
  { id:"desarrollos", label:"Desarrollos", color:"#E8860A", bg:"rgba(232,134,10,.08)", bdr:"rgba(232,134,10,.22)" },
  { id:"pozo",        label:"En Pozo",     color:"#7B4FD4", bg:"rgba(123,79,212,.08)", bdr:"rgba(123,79,212,.22)" },
];
const SEG = id => SEGS.find(s=>s.id===id)||SEGS[0];

const BANCOS = [
  { id:"hipotecario", nombre:"Banco Hipotecario", logo:"🏠", tasaUVA:3.5,  financiacion:80, plazoMax:30, cuotaIngreso:25, estado:"conectado",   leads:142, conv:8.3  },
  { id:"nacion",      nombre:"Banco Nación",      logo:"🇦🇷", tasaUVA:4.5,  financiacion:80, plazoMax:30, cuotaIngreso:25, estado:"conectado",   leads:284, conv:11.2 },
  { id:"provincia",   nombre:"Banco Provincia",   logo:"🏛️", tasaUVA:5.0,  financiacion:80, plazoMax:30, cuotaIngreso:25, estado:"beta",        leads:67,  conv:6.1  },
  { id:"ciudad",      nombre:"Banco Ciudad",      logo:"🏙️", tasaUVA:4.75, financiacion:75, plazoMax:20, cuotaIngreso:25, estado:"negociacion", leads:0,   conv:0    },
  { id:"galicia",     nombre:"Banco Galicia",     logo:"🔷", tasaUVA:5.5,  financiacion:75, plazoMax:30, cuotaIngreso:30, estado:"negociacion", leads:0,   conv:0    },
  { id:"santander",   nombre:"Santander",         logo:"🔴", tasaUVA:5.25, financiacion:80, plazoMax:30, cuotaIngreso:30, estado:"pendiente",   leads:0,   conv:0    },
  { id:"macro",       nombre:"Banco Macro",       logo:"🟡", tasaUVA:5.75, financiacion:80, plazoMax:30, cuotaIngreso:25, estado:"pendiente",   leads:0,   conv:0    },
  { id:"supervielle", nombre:"Supervielle",       logo:"🟢", tasaUVA:5.5,  financiacion:75, plazoMax:20, cuotaIngreso:30, estado:"pendiente",   leads:0,   conv:0    },
];

const ITEMS = [
  { id:1, seg:"compra",      tipo:"Departamento", amb:3, m2:78,  precio:168000, moneda:"USD", dir:"Thames 1240",     barrio:"Palermo",  piso:"7",  owner:"Marcela R.", verified:true, horasPubl:2,  desc:"Luminoso 3 ambientes con balcon corrido. Cocina integrada. Amenities completos. Expensas $85.000." },
  { id:2, seg:"compra",      tipo:"PH",           amb:4, m2:120, precio:285000, moneda:"USD", dir:"Arenales 2840",   barrio:"Recoleta", piso:"12", owner:"Fernando T.",verified:true, horasPubl:5,  desc:"PH en esquina con terraza privada 40m2. Remodelado 2024. Vistas abiertas. Expensas $120.000." },
  { id:3, seg:"compra",      tipo:"Departamento", amb:2, m2:52,  precio:128000, moneda:"USD", dir:"Juramento 890",   barrio:"Belgrano", piso:"4",  owner:"Luis P.",    verified:true, horasPubl:0.5,desc:"2 ambientes luminoso. Piso de madera. A metros del tren. Expensas $65.000." },
  { id:4, seg:"pozo",        tipo:"Edificio",     amb:0, m2:0,   precio:55000,  moneda:"USD", dir:"Humboldt 1560",   barrio:"Palermo",  piso:"—",  owner:"AYSA Dev",   verified:true, horasPubl:6,  desc:"Proyecto en pozo. 12 pisos. Cuotas en pesos ajustadas por CAC. Entrega 2028." },
  { id:5, seg:"desarrollos", tipo:"Torre",        amb:0, m2:0,   precio:95000,  moneda:"USD", dir:"Libertador 6800", barrio:"Nunez",    piso:"—",  owner:"Grupo IRSA", verified:true, horasPubl:48, desc:"Torre premium 18 pisos. 1 a 4 ambientes. Piscina, SUM y cocheras. Entrega 2027." },
  { id:6,  seg:"alquiler",   tipo:"Departamento", amb:2, m2:55,  precio:380000,  moneda:"ARS", dir:"Corrientes 5100",    barrio:"VCrespo",     piso:"3",  owner:"Carlos M.",   verified:true, horasPubl:3,  desc:"2 ambientes ideal pareja. Expensas incluidas. Subte B a 100m." },
  { id:7,  seg:"temporario", tipo:"Departamento", amb:2, m2:60,  precio:85,      moneda:"USD", dir:"Gurruchaga 1840",    barrio:"Palermo",     piso:"3",  owner:"Lucía M.",    verified:true, horasPubl:1,  desc:"Depto moderno con terraza. WiFi 500MB, Netflix, cocina equipada. Ideal parejas.", precioDia:85,  precioSemana:490,  precioMes:1600, maxHuespedes:2, rating:4.9, reviews:38, amenities:["WiFi","Cocina","Terraza","AC","Netflix"] },
  { id:8,  seg:"temporario", tipo:"Casa",         amb:4, m2:180, precio:120,     moneda:"USD", dir:"Olazabal 2340",      barrio:"Belgrano",    piso:"PB", owner:"Mariana R.",  verified:true, horasPubl:6,  desc:"Casa con jardín y parrilla. Perfecta para familias. 4 camas. Cochera incluida.", precioDia:120, precioSemana:700,  precioMes:2200, maxHuespedes:6, rating:4.8, reviews:22, amenities:["WiFi","Jardín","Parrilla","Cochera","Pileta"] },
  { id:9,  seg:"temporario", tipo:"Cabaña",       amb:2, m2:45,  precio:95,      moneda:"USD", dir:"Av. Bustillo km 18", barrio:"Bariloche",   piso:"PB", owner:"Diego T.",    verified:true, horasPubl:2,  desc:"Cabaña en el bosque con vista al lago. Hogar a leña. 15min del centro.", precioDia:95,  precioSemana:550,  precioMes:1800, maxHuespedes:4, rating:5.0, reviews:61, amenities:["WiFi","Hogar","Vista al lago","Cochera","Cocina"] },
  { id:10, seg:"temporario", tipo:"Departamento", amb:1, m2:35,  precio:65,      moneda:"USD", dir:"Alem 856",           barrio:"Mar del Plata",piso:"8",  owner:"Juan P.",     verified:true, horasPubl:0.5,desc:"Monoambiente frente al mar. Piso 8 con vista panorámica. Temporada alta disponible.", precioDia:65,  precioSemana:380,  precioMes:1100, maxHuespedes:2, rating:4.7, reviews:45, amenities:["WiFi","Vista al mar","AC","Cocina equipada"] },
  { id:11, seg:"temporario", tipo:"Chalet",       amb:3, m2:120, precio:150,     moneda:"USD", dir:"Los Aromos 234",     barrio:"Pinamar",     piso:"PB", owner:"Carla V.",    verified:true, horasPubl:4,  desc:"Chalet a 2 cuadras del mar. Jardín con parrilla. Temporada completa o quincenal.", precioDia:150, precioSemana:850,  precioMes:2800, maxHuespedes:8, rating:4.9, reviews:17, amenities:["WiFi","Parrilla","Jardín","Cochera 2 autos","Pileta"] },
  { id:12, seg:"temporario", tipo:"Loft",         amb:1, m2:50,  precio:75,      moneda:"USD", dir:"Thames 1560",        barrio:"Palermo",     piso:"2",  owner:"Sofía L.",    verified:true, horasPubl:3,  desc:"Loft industrial diseño. Doble altura, cocina americana. En el corazón de Palermo.", precioDia:75,  precioSemana:420,  precioMes:1400, maxHuespedes:2, rating:4.8, reviews:29, amenities:["WiFi","Smart TV","Cocina","Café incluido","AC"] },
];

const PLANES = [
  { id:"basico",    label:"Básico",    precio:8900,  dur:"30 días", popular:false, features:["1 propiedad","Fotos ilimitadas","Chat con interesados","Validación básica visitantes"] },
  { id:"destacado", label:"Destacado", precio:18900, dur:"60 días", popular:true,  features:["1 propiedad","Posición premium","Fotos ilimitadas","Validación DNI+selfie completa","Contrato digital","Soporte prioritario"] },
  { id:"pro",       label:"Pro",       precio:34900, dur:"90 días", popular:false, features:["Hasta 3 propiedades","Posición top","Video tour","Validación biométrica","Contratos ilimitados","Informe crediticio visitante","Soporte 24/7"] },
];

const TC = 1300;

function calcCuota(capitalARS, tasaAnual, plazoAnios) {
  const n = plazoAnios*12, r = tasaAnual/100/12;
  return capitalARS*(r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
}

function Sep() { return <div style={{height:1,background:C.line}}/>; }
function Row({children,style={}}) { return <div style={{display:"flex",alignItems:"center",...style}}>{children}</div>; }
function Card({children,style={}}) { return <div style={{background:C.surface,borderRadius:18,overflow:"hidden",border:`1px solid ${C.edge}`,boxShadow:"0 1px 6px rgba(0,0,0,.06)",...style}}>{children}</div>; }

function Badge({label,color=C.blue,bg=C.blueDm,bdr=C.blueRg,sm}) {
  return <span style={{display:"inline-flex",alignItems:"center",padding:sm?"2px 8px":"4px 10px",borderRadius:20,background:bg,border:`1px solid ${bdr}`,fontSize:sm?9:10,fontWeight:700,color,fontFamily:MN,letterSpacing:0.8,whiteSpace:"nowrap"}}>{label}</span>;
}

function NavBar({title,onBack,right}) {
  return (
    <div style={{background:"rgba(245,245,242,0.96)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.edge}`,flexShrink:0}}>
      <Row style={{padding:"12px 16px",justifyContent:"space-between"}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",minWidth:60}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke={C.blue} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontSize:17,color:C.blue,fontFamily:AR,fontWeight:500}}>Volver</span>
        </button>
        <span style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:AR,letterSpacing:-0.3}}>{title}</span>
        <div style={{minWidth:60,display:"flex",justifyContent:"flex-end"}}>{right||null}</div>
      </Row>
    </div>
  );
}

function Btn({label,onClick,disabled,ghost,full,sm,danger}) {
  const base = {width:full?"100%":"auto",padding:sm?"11px 18px":"15px 22px",borderRadius:14,fontWeight:800,fontSize:sm?13:15,cursor:disabled?"not-allowed":"pointer",fontFamily:AR,letterSpacing:-0.2,border:"none",transition:"all .15s"};
  if(danger) return <button onClick={onClick} style={{...base,background:"#FEF2F2",color:C.red,border:`1px solid #FECACA`}}>{label}</button>;
  if(ghost)  return <button onClick={onClick} disabled={disabled} style={{...base,background:C.bone,color:C.body,border:`1.5px solid ${C.edge}`,opacity:disabled?.5:1}}>{label}</button>;
  return <button onClick={onClick} disabled={disabled} style={{...base,background:disabled?C.ghost:C.blue,color:"#fff",boxShadow:disabled?"none":`0 6px 22px ${C.blueGl}`,opacity:disabled?.5:1}}>{label}</button>;
}

function MartaAvatar({size=32,small=false}) {
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:small?"none":`0 4px 16px ${C.blueGl}`}}>
      <svg width={small?12:16} height={small?12:16} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(255,255,255,0.25)"/>
      </svg>
    </div>
  );
}

function EstadoDot({estado}) {
  const M = {conectado:{c:C.green,l:"CONECTADO",p:true},beta:{c:C.orange,l:"BETA",p:false},negociacion:{c:C.blue,l:"NEGOCIACIÓN",p:false},pendiente:{c:C.ghost,l:"PRÓXIMAMENTE",p:false}};
  const e = M[estado]||M.pendiente;
  return (
    <Row style={{gap:6}}>
      <div style={{position:"relative",width:8,height:8}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:e.c}}/>
        {e.p&&<div style={{position:"absolute",inset:0,borderRadius:"50%",background:e.c,animation:"ping 2s infinite"}}/>}
      </div>
      <div style={{fontSize:9,fontWeight:700,color:e.c,fontFamily:MN,letterSpacing:1}}>{e.l}</div>
    </Row>
  );
}

async function callIA(messages, system) {
  try {
  const res = await fetch("/api/chat",{
  method:"POST", headers:{"Content-Type":"application/json"},
  body:JSON.stringify({max_tokens:1000,system,messages}),});
    const data = await res.json();
    if(data.error) return "No pude consultar ahora. Intentá de nuevo.";
    return (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("\n")||"Sin respuesta.";
  } catch { return "Error de conexión."; }
}

function PanelFinanciero({item, onClose}) {
  const [perfil,setPerfil] = useState({ingreso:null,ahorro:null,situacion:null,plazo:20});
  const [fase,setFase]     = useState("perfil");
  const [msgs,setMsgs]     = useState([]);
  const [input,setInput]   = useState("");
  const [busy,setBusy]     = useState(false);
  const endRef = useRef();
  const set = (k,v) => setPerfil(p=>({...p,[k]:v}));
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  const anticipo    = Math.round(item.precio*.2);
  const gastos      = Math.round(item.precio*.08);
  const necesario   = anticipo+gastos;
  const prestamoARS = Math.round(item.precio*.8)*TC;
  const cuotaEst    = perfil.ingreso?Math.round(calcCuota(prestamoARS,BANCOS[0].tasaUVA,perfil.plazo)):null;
  const pctIng      = cuotaEst&&perfil.ingreso?(cuotaEst/perfil.ingreso*100):null;
  const califica    = pctIng?pctIng<=25:null;
  const ahorroOk    = perfil.ahorro?perfil.ahorro>=necesario:null;

  const systemFin = `Sos Marta, asesora financiera de SinComision Argentina. PROPIEDAD: ${item.tipo} en ${item.barrio}, ${item.dir}. Precio: ${item.moneda} ${item.precio.toLocaleString("es-AR")}. PERFIL USUARIO: ingreso $${perfil.ingreso?.toLocaleString("es-AR")||"—"} ARS/mes · ahorro USD ${perfil.ahorro?.toLocaleString("es-AR")||"—"} · ${perfil.situacion||"no especificado"} · plazo ${perfil.plazo} años BANCOS: ${BANCOS.slice(0,6).map(b=>`${b.nombre} UVA ${b.tasaUVA}% / ${b.financiacion}% / ${b.plazoMax}a`).join(" | ")} TC: 1 USD = ${TC} ARS. Español rioplatense, sin asteriscos, máx 4 oraciones.`;

  const analizar = async () => {
    setFase("chat"); setBusy(true);
    const msg = `Quiero comprar: ${item.tipo} en ${item.barrio} USD ${item.precio.toLocaleString("es-AR")}. Ingreso $${perfil.ingreso?.toLocaleString("es-AR")} ARS/mes, ahorro USD ${perfil.ahorro?.toLocaleString("es-AR")}, ${perfil.situacion||"empleado"}, plazo ${perfil.plazo} años. ¿Puedo comprarla?`;
    const r = await callIA([{role:"user",content:msg}],systemFin);
    setMsgs([{role:"user",content:msg},{role:"assistant",content:r}]);
    setBusy(false);
  };

  const sendChat = async () => {
    if(!input.trim()||busy) return;
    const n=[...msgs,{role:"user",content:input}]; setMsgs(n); setInput(""); setBusy(true);
    const r = await callIA(n,systemFin);
    setMsgs(x=>[...x,{role:"assistant",content:r}]); setBusy(false);
  };

  const SUGE=["¿Cuánto sería la cuota en 5 años?","¿Qué banco me conviene más?","¿Puedo sumar ingresos con mi pareja?","¿Hay líneas Procrear ahora?","¿Conviene UVA o tasa fija?"];
  const SITS=["Relación de dependencia","Monotributista","Autónomo","Profesional","Jubilado"];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(9,9,9,.55)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{background:C.bg,borderRadius:"24px 24px 0 0",maxHeight:"93vh",display:"flex",flexDirection:"column",overflow:"hidden",animation:"up .3s ease"}}>
        <div style={{flexShrink:0,background:C.surface,borderBottom:`1px solid ${C.edge}`}}>
          <div style={{padding:"12px 0 0",textAlign:"center"}}><div style={{width:36,height:4,borderRadius:2,background:C.ghost,display:"inline-block"}}/></div>
          <div style={{padding:"12px 20px 16px"}}>
            <Row style={{justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:9,color:C.blue,letterSpacing:3,fontFamily:MN,marginBottom:4}}>MOTOR FINANCIERO IA · MARTA</div>
                <div style={{fontSize:19,fontWeight:900,color:C.ink,fontFamily:AR,letterSpacing:-0.5,lineHeight:1.2}}>¿Cómo comprás<br/>esta propiedad?</div>
              </div>
              <button onClick={onClose} style={{background:C.bone,border:`1px solid ${C.edge}`,borderRadius:"50%",width:32,height:32,cursor:"pointer",color:C.sub,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
            </Row>
            <div style={{marginTop:12,background:C.bone,borderRadius:12,padding:"10px 14px",border:`1px solid ${C.edge}`}}>
              <Row style={{justifyContent:"space-between"}}>
                <div><div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:AR}}>{item.tipo} · {item.barrio}</div><div style={{fontSize:11,color:C.sub,fontFamily:AR}}>{item.dir}</div></div>
                <div><div style={{fontSize:16,fontWeight:900,color:C.blue,fontFamily:AR,textAlign:"right"}}>{item.moneda} {item.precio.toLocaleString("es-AR")}</div></div>
              </Row>
            </div>
          </div>
        </div>

        {fase==="perfil" && (
          <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px"}}>
            <div style={{background:C.surface,border:`1.5px solid ${C.blueRg}`,borderRadius:16,padding:"16px",marginBottom:20}}>
              <div style={{fontSize:9,color:C.blue,letterSpacing:2.5,fontFamily:MN,marginBottom:12}}>CALCULADORA RÁPIDA</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:cuotaEst?10:0}}>
                {[{l:"Anticipo (20%)",v:`USD ${anticipo.toLocaleString("es-AR")}`,c:C.orange},{l:"Préstamo (80%)",v:`USD ${Math.round(item.precio*.8).toLocaleString("es-AR")}`,c:C.blue},{l:"Gastos escritura",v:`USD ${gastos.toLocaleString("es-AR")}`,c:C.red},{l:"Total necesario",v:`USD ${necesario.toLocaleString("es-AR")}`,c:C.ink}].map(({l,v,c})=>(
                  <div key={l} style={{background:C.bone,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.edge}`}}>
                    <div style={{fontSize:8,color:C.ghost,fontFamily:MN,letterSpacing:1.5,marginBottom:3}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:800,color:c,fontFamily:AR}}>{v}</div>
                  </div>
                ))}
              </div>
              {cuotaEst&&<div style={{background:califica?C.greenDm:C.redDm,border:`1px solid ${califica?C.greenRg:"rgba(255,59,48,.2)"}`,borderRadius:10,padding:"10px 14px"}}><Row style={{justifyContent:"space-between"}}><div><div style={{fontSize:8,color:C.ghost,fontFamily:MN,letterSpacing:1.5,marginBottom:2}}>CUOTA EST.</div><div style={{fontSize:20,fontWeight:900,color:califica?C.green:C.red,fontFamily:AR}}>${cuotaEst.toLocaleString("es-AR")}/mes</div><div style={{fontSize:10,color:C.sub,fontFamily:AR,marginTop:2}}>{pctIng?.toFixed(0)}% de tu ingreso</div></div><div style={{fontSize:22}}>{califica?"✅":"⚠️"}</div></Row></div>}
              {perfil.ahorro&&<div style={{marginTop:8,padding:"8px 12px",background:ahorroOk?C.greenDm:C.redDm,border:`1px solid ${ahorroOk?C.greenRg:"rgba(255,59,48,.2)"}`,borderRadius:10}}><div style={{fontSize:12,color:ahorroOk?C.green:C.red,fontFamily:AR,fontWeight:600}}>{ahorroOk?`✓ Tenés suficiente ahorro`:`⚠ Te faltan USD ${(necesario-perfil.ahorro).toLocaleString("es-AR")}`}</div></div>}
            </div>
            <div style={{fontSize:9,color:C.ghost,letterSpacing:2.5,fontFamily:MN,marginBottom:12}}>TU PERFIL FINANCIERO</div>
            {[{label:"INGRESO NETO MENSUAL (ARS)",prefix:"$",key:"ingreso",ph:"500.000"},{label:"AHORRO DISPONIBLE (USD)",prefix:"USD",key:"ahorro",ph:"30.000"}].map(({label,prefix,key,ph})=>(
              <div key={key} style={{marginBottom:12}}>
                <div style={{fontSize:9,color:C.ghost,letterSpacing:2,fontFamily:MN,marginBottom:6}}>{label}</div>
                <Row style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:12,padding:"0 16px",gap:8}}>
                  <span style={{color:C.sub,fontFamily:MN,fontSize:14}}>{prefix}</span>
                  <input type="number" value={perfil[key]||""} onChange={e=>set(key,Number(e.target.value))} placeholder={ph} style={{flex:1,background:"none",border:"none",outline:"none",color:C.ink,fontSize:16,fontFamily:AR,fontWeight:700,padding:"13px 0"}}/>
                </Row>
              </div>
            ))}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,color:C.ghost,letterSpacing:2,fontFamily:MN,marginBottom:8}}>SITUACIÓN LABORAL</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{SITS.map(s=><button key={s} onClick={()=>set("situacion",s)} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${perfil.situacion===s?C.blue:C.edge}`,background:perfil.situacion===s?C.blueDm:"transparent",color:perfil.situacion===s?C.blue:C.sub,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:AR}}>{s}</button>)}</div>
            </div>
            <div style={{marginBottom:24}}>
              <div style={{fontSize:9,color:C.ghost,letterSpacing:2,fontFamily:MN,marginBottom:8}}>PLAZO DEL CRÉDITO</div>
              <Row style={{gap:8}}>{[10,15,20,25,30].map(p=><button key={p} onClick={()=>set("plazo",p)} style={{flex:1,padding:"10px 0",borderRadius:10,border:`1px solid ${perfil.plazo===p?C.blue:C.edge}`,background:perfil.plazo===p?C.blueDm:"transparent",color:perfil.plazo===p?C.blue:C.sub,fontSize:12,fontWeight:perfil.plazo===p?700:400,cursor:"pointer",fontFamily:MN}}>{p}a</button>)}</Row>
            </div>
            <button onClick={analizar} disabled={!perfil.ingreso} style={{width:"100%",padding:"16px",borderRadius:14,border:"none",background:perfil.ingreso?C.blue:C.ghost,color:"#fff",fontWeight:900,fontSize:15,cursor:perfil.ingreso?"pointer":"not-allowed",fontFamily:AR,boxShadow:perfil.ingreso?`0 6px 22px ${C.blueGl}`:"none"}}>
              {perfil.ingreso?"⚡ Analizar — todos los bancos con IA":"Ingresá tu sueldo para continuar"}
            </button>
          </div>
        )}

        {fase==="chat" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{flexShrink:0,padding:"10px 16px",background:C.surface,borderBottom:`1px solid ${C.edge}`}}>
              <button onClick={()=>setFase("perfil")} style={{background:"none",border:"none",color:C.blue,cursor:"pointer",fontFamily:AR,fontSize:12}}>← Modificar perfil</button>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
              {msgs.map((m,i)=>(
                <div key={i} style={{display:"flex",flexDirection:m.role==="user"?"row-reverse":"row",gap:10,alignItems:"flex-end",marginBottom:12}}>
                  {m.role==="assistant"&&<MartaAvatar size={28} small/>}
                  <div style={{maxWidth:"82%",padding:"12px 15px",fontSize:14,lineHeight:1.65,borderRadius:m.role==="user"?"18px 18px 4px 18px":"4px 18px 18px 18px",background:m.role==="user"?C.blue:C.surface,border:m.role==="assistant"?`1px solid ${C.edge}`:"none",color:m.role==="user"?"#fff":C.ink,fontFamily:AR,whiteSpace:"pre-wrap"}}>{m.content}</div>
                </div>
              ))}
              {busy&&<Row style={{gap:10,marginBottom:12}}><MartaAvatar size={28} small/><div style={{background:C.surface,borderRadius:"4px 18px 18px 18px",padding:"14px 18px",border:`1px solid ${C.edge}`,display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.ghost,animation:"pulse 1.3s infinite",animationDelay:`${i*.22}s`}}/>)}</div></Row>}
              {!busy&&msgs.length<=2&&<div style={{marginTop:8}}><div style={{display:"flex",flexDirection:"column",gap:8}}>{SUGE.map(q=><button key={q} onClick={()=>setInput(q)} style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:10,padding:"10px 14px",cursor:"pointer",textAlign:"left",color:C.body,fontSize:12,fontFamily:AR}}>{q}</button>)}</div></div>}
              <div ref={endRef}/>
            </div>
            <div style={{flexShrink:0,borderTop:`1px solid ${C.edge}`,padding:"12px 16px",paddingBottom:"max(12px,env(safe-area-inset-bottom))",background:C.surface,display:"flex",gap:10,alignItems:"center"}}>
              <div style={{flex:1,background:C.bone,borderRadius:22,border:`1px solid ${C.edge}`,padding:"0 14px",display:"flex",alignItems:"center"}}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Preguntale a Marta..." style={{flex:1,background:"none",border:"none",outline:"none",color:C.ink,fontSize:15,fontFamily:AR,padding:"11px 0"}}/>
              </div>
              <button onClick={sendChat} disabled={busy||!input.trim()} style={{width:38,height:38,borderRadius:"50%",flexShrink:0,background:busy||!input.trim()?C.ghost:C.blue,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetalleTemporario({item, onBack, favs, onFav}) {
  const [noches,setNoches] = useState(3);
  const [modo,setModo]     = useState("dia");
  const [reservado,setReservado] = useState(false);
  const isFav = favs.some(f=>f.id===item.id);

  const precio = modo==="semana" ? item.precioSemana : modo==="mes" ? item.precioMes : item.precioDia;
  const label  = modo==="semana" ? "semana" : modo==="mes" ? "mes" : "noche";
  const total  = modo==="dia" ? precio * noches : precio;
  const tarifa = Math.round(total * 0.12);
  const totalFinal = total + tarifa;

  if(reservado) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:32,textAlign:"center",background:C.bg}}>
      <div style={{fontSize:56}}>🎉</div>
      <div style={{fontSize:24,fontWeight:900,color:C.ink,fontFamily:AR}}>¡Reserva confirmada!</div>
      <div style={{fontSize:14,color:C.sub,fontFamily:AR,lineHeight:1.7}}>{item.tipo} en {item.barrio}<br/>Check-in: mañana · {noches} noches</div>
      <Btn label="Volver al inicio" ghost full onClick={onBack}/>
    </div>
  );

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <NavBar title="Alquiler temporario" onBack={onBack}
        right={<button onClick={()=>onFav(item)} style={{background:"none",border:"none",cursor:"pointer"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={C.red} strokeWidth="1.9" fill={isFav?C.red:"none"} strokeLinejoin="round"/></svg></button>}
      />
      <div style={{flex:1,overflowY:"auto",paddingBottom:100}}>
        <div style={{height:240,background:"linear-gradient(150deg,rgba(233,30,140,.1),#F5F5F2)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <div style={{opacity:.06,fontSize:120}}>🏠</div>
          <div style={{position:"absolute",bottom:14,left:14}}>
            <div style={{fontSize:24,fontWeight:900,color:C.ink,fontFamily:AR}}>USD {item.precioDia}<span style={{fontSize:13,fontWeight:400,color:C.sub}}>/noche</span></div>
            <div style={{fontSize:12,color:C.sub,fontFamily:AR}}>{item.tipo} · {item.barrio} · hasta {item.maxHuespedes} huéspedes</div>
          </div>
          <div style={{position:"absolute",bottom:14,right:14,background:"rgba(255,255,255,.95)",borderRadius:12,padding:"6px 12px"}}>
            <Row style={{gap:5}}><div style={{fontSize:14}}>⭐</div><div style={{fontSize:14,fontWeight:900,color:C.ink,fontFamily:AR}}>{item.rating}</div><div style={{fontSize:11,color:C.sub,fontFamily:AR}}>({item.reviews})</div></Row>
          </div>
        </div>
        <div style={{padding:"20px 16px"}}>
          <Card style={{marginBottom:14}}>
            <div style={{padding:"16px"}}>
              <div style={{fontSize:18,fontWeight:700,color:C.ink,fontFamily:AR,marginBottom:8}}>{item.tipo} · {item.amb} amb · {item.m2}m2</div>
              <Sep/>
              <div style={{paddingTop:12,fontSize:14,color:C.body,fontFamily:AR,lineHeight:1.7}}>{item.desc}</div>
            </div>
          </Card>
          <Card style={{marginBottom:14}}>
            <div style={{padding:"16px"}}>
              <div style={{fontSize:9,color:C.ghost,letterSpacing:2,fontFamily:MN,marginBottom:12}}>LO QUE INCLUYE</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {(item.amenities||[]).map(a=>(
                  <div key={a} style={{background:C.bone,borderRadius:10,padding:"8px 14px",fontSize:12,fontWeight:600,color:C.ink,fontFamily:AR,border:`1px solid ${C.edge}`}}>{a}</div>
                ))}
              </div>
            </div>
          </Card>
          <div style={{fontSize:9,color:C.ghost,letterSpacing:2.5,fontFamily:MN,marginBottom:10}}>MODALIDAD</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
            {[{k:"dia",l:"Por noche",v:`USD ${item.precioDia}`},{k:"semana",l:"Por semana",v:`USD ${item.precioSemana}`},{k:"mes",l:"Por mes",v:`USD ${item.precioMes}`}].map(({k,l,v})=>(
              <button key={k} onClick={()=>setModo(k)} style={{padding:"12px 8px",borderRadius:14,border:`1.5px solid ${modo===k?"#E91E8C":C.edge}`,background:modo===k?"rgba(233,30,140,.08)":"transparent",color:modo===k?"#E91E8C":C.sub,cursor:"pointer",textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,fontFamily:MN,marginBottom:4}}>{l.toUpperCase()}</div>
                <div style={{fontSize:14,fontWeight:900,color:modo===k?"#E91E8C":C.ink,fontFamily:AR}}>{v}</div>
              </button>
            ))}
          </div>
          {modo==="dia"&&(
            <div style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:14,padding:"14px 16px",marginBottom:16}}>
              <div style={{fontSize:9,color:C.ghost,letterSpacing:2,fontFamily:MN,marginBottom:10}}>CANTIDAD DE NOCHES</div>
              <Row style={{justifyContent:"space-between",alignItems:"center"}}>
                <button onClick={()=>setNoches(n=>Math.max(1,n-1))} style={{width:36,height:36,borderRadius:"50%",border:`1.5px solid ${C.edge}`,background:C.bone,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:28,fontWeight:900,color:C.ink,fontFamily:AR}}>{noches}</div>
                  <div style={{fontSize:11,color:C.sub,fontFamily:AR}}>{noches===1?"noche":"noches"}</div>
                </div>
                <button onClick={()=>setNoches(n=>n+1)} style={{width:36,height:36,borderRadius:"50%",border:`1.5px solid ${C.blue}`,background:C.blueDm,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",color:C.blue}}>+</button>
              </Row>
            </div>
          )}
          <div style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:14,padding:"14px 16px",marginBottom:14}}>
            <Row style={{justifyContent:"space-between",paddingTop:4}}>
              <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:AR}}>Total</div>
              <div style={{fontSize:20,fontWeight:900,color:"#E91E8C",fontFamily:AR}}>USD {totalFinal}</div>
            </Row>
          </div>
        </div>
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${C.edge}`,padding:"14px 16px",paddingBottom:"max(14px,env(safe-area-inset-bottom))"}}>
        <Row style={{justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:C.ink,fontFamily:AR}}>USD {totalFinal}</div>
            <div style={{fontSize:11,color:C.sub,fontFamily:AR}}>{modo==="dia"?`${noches} noches + servicio`:label+" + servicio"}</div>
          </div>
          <button onClick={()=>setReservado(true)} style={{padding:"14px 28px",borderRadius:14,background:"#E91E8C",border:"none",color:"#fff",fontWeight:900,fontSize:15,cursor:"pointer",fontFamily:AR}}>Reservar →</button>
        </Row>
      </div>
    </div>
  );
}

function Detalle({item, onBack, favs, onFav, onBancos}) {
  const [showFin,setShowFin] = useState(false);
  const s = SEG(item.seg);
  const isFav = favs.some(f=>f.id===item.id);
  const anticipo = Math.round(item.precio*.2);
  const gastos   = Math.round(item.precio*.08);

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <NavBar title={s.label} onBack={onBack} right={<button onClick={()=>onFav(item)} style={{background:"none",border:"none",cursor:"pointer"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={C.red} strokeWidth="1.9" fill={isFav?C.red:"none"} strokeLinejoin="round"/></svg></button>}/>
      <div style={{flex:1,overflowY:"auto"}}>
        <div style={{height:220,background:`linear-gradient(150deg,${s.bg},${C.bone})`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          <div style={{opacity:.07,fontSize:100}}>🏠</div>
          <div style={{position:"absolute",bottom:16,left:16}}>
            <div style={{fontSize:28,fontWeight:900,color:C.ink,fontFamily:AR}}>{item.moneda} {item.precio.toLocaleString("es-AR")}</div>
            {item.m2>0&&<div style={{fontSize:12,color:C.sub,fontFamily:AR}}>USD {Math.round(item.precio/item.m2).toLocaleString("es-AR")}/m2 · {item.barrio}</div>}
          </div>
          {item.horasPubl<=2&&<div style={{position:"absolute",top:12,right:12,padding:"4px 10px",background:"rgba(255,59,48,.08)",border:"1px solid rgba(255,59,48,.25)",borderRadius:20,display:"flex",alignItems:"center",gap:5}}><div style={{width:5,height:5,borderRadius:"50%",background:C.red,position:"relative"}}><div style={{position:"absolute",inset:0,borderRadius:"50%",background:C.red,animation:"ping 2s infinite"}}/></div><div style={{fontSize:9,fontWeight:700,color:C.red,fontFamily:MN}}>RECIÉN PUBLICADO</div></div>}
        </div>
        <div style={{padding:"20px 16px 0"}}>
          <Card style={{marginBottom:14}}>
            <div style={{padding:"18px 16px"}}>
              <Row style={{justifyContent:"space-between",marginBottom:12}}>
                <div>
                  <div style={{fontSize:18,fontWeight:700,color:C.ink,fontFamily:AR,marginBottom:4}}>{item.tipo}{item.amb>0?` ${item.amb} ambientes`:""}{item.m2>0?` · ${item.m2}m2`:""}</div>
                  <div style={{fontSize:13,color:C.sub,fontFamily:AR}}>{item.dir} · {item.barrio}</div>
                </div>
                <Badge label={s.label} color={s.color} bg={s.bg} bdr={s.bdr}/>
              </Row>
              <Sep/>
              <div style={{paddingTop:12,fontSize:14,color:C.body,lineHeight:1.7,fontFamily:AR}}>{item.desc}</div>
            </div>
          </Card>
          <Card style={{marginBottom:14}}>
            <div style={{padding:"14px 16px"}}>
              <Row style={{gap:12}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:C.bone,border:`1.5px solid ${C.blue}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>👤</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:AR,marginBottom:3}}>{item.owner}</div>
                  <div style={{fontSize:11,color:C.blue,fontFamily:MN,letterSpacing:0.5}}>PROPIETARIO VERIFICADO · DIRECTO</div>
                </div>
              </Row>
            </div>
          </Card>
          <div onClick={()=>setShowFin(true)} style={{background:C.ink,borderRadius:18,padding:"20px",marginBottom:12,cursor:"pointer",boxShadow:"0 8px 32px rgba(0,0,0,.18)"}}>
            <Row style={{gap:14,marginBottom:16}}>
              <MartaAvatar size={48}/>
              <div>
                <div style={{fontSize:18,fontWeight:900,color:"#fff",fontFamily:AR,lineHeight:1.1}}>¿Cómo comprás<br/>esta propiedad?</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.4)",fontFamily:MN,letterSpacing:1.5,marginTop:5}}>MARTA IA · {BANCOS.filter(b=>b.estado==="conectado").length} BANCOS EN TIEMPO REAL</div>
              </div>
            </Row>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
              {[{l:"Anticipo",v:`USD ${anticipo.toLocaleString("es-AR")}`},{l:"Mejor tasa",v:`UVA ${BANCOS[0].tasaUVA}%`},{l:"Gastos extra",v:`USD ${gastos.toLocaleString("es-AR")}`}].map(({l,v})=>(
                <div key={l} style={{background:"rgba(255,255,255,.07)",borderRadius:10,padding:"10px",border:"1px solid rgba(255,255,255,.1)"}}>
                  <div style={{fontSize:7,color:"rgba(255,255,255,.4)",fontFamily:MN,letterSpacing:1.5,marginBottom:3}}>{l}</div>
                  <div style={{fontSize:12,fontWeight:800,color:"#fff",fontFamily:AR}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.blue,borderRadius:10,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:14,fontWeight:900,color:"#fff",fontFamily:AR}}>Analizar con IA →</div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          {item.seg==="compra"&&<button onClick={onBancos} style={{width:"100%",padding:"14px",borderRadius:14,background:C.bone,border:`1.5px solid ${C.edge}`,color:C.body,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:AR,marginBottom:12}}>🏦 Ver todas las ofertas bancarias</button>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:32}}>
            <button style={{padding:"14px",borderRadius:14,background:"#25D366",border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:AR}}>WhatsApp</button>
            <button style={{padding:"14px",borderRadius:14,background:C.bone,border:`1.5px solid ${C.edge}`,color:C.body,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:AR}}>Llamar</button>
          </div>
        </div>
      </div>
      {showFin&&<PanelFinanciero item={item} onClose={()=>setShowFin(false)}/>}
    </div>
  );
}

function NotifBanner({notif, onTap, onClose}) {
  useEffect(() => { const t = setTimeout(onClose, 6000); return ()=>clearTimeout(t); }, []);
  return (
    <div onClick={onTap} style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"min(430px,100vw)",zIndex:999,padding:"env(safe-area-inset-top,12px) 16px 0",animation:"up .35s ease"}}>
      <div style={{background:C.ink,borderRadius:18,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 32px rgba(0,0,0,.35)",margin:"8px 0"}}>
        <div style={{width:40,height:40,borderRadius:12,background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:20}}>🏠</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:AR}}>Nueva propiedad publicada</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.6)",fontFamily:AR,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{notif.prop.tipo} en {notif.prop.barrio} · {notif.prop.moneda} {notif.prop.precio?.toLocaleString("es-AR")}</div>
        </div>
        <button onClick={e=>{e.stopPropagation();onClose();}} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:"50%",width:20,height:20,cursor:"pointer",color:"rgba(255,255,255,.6)",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
    </div>
  );
}

function PantallaListo({plan, datos, onVolver}) {
  const [consultas,setConsultas] = useState(0);
  const [vistas,setVistas]       = useState(0);
  const [msgs,setMsgs]           = useState([]);
  const idPub = useRef("SC-"+Date.now().toString().slice(-6));

  useEffect(()=>{
    const nombres=["Martina G.","Carlos R.","Ana L.","Diego M.","Sofía P."];
    const preguntas=["¿Está disponible para visita?","¿Cuánto son las expensas?","¿El precio es negociable?","¿Tiene cochera?"];
    const ivV=setInterval(()=>setVistas(v=>v+Math.floor(Math.random()*2)+1),2000);
    const timers=[3000,8000,14000].map((t,i)=>setTimeout(()=>{
      const nombre=nombres[Math.floor(Math.random()*nombres.length)];
      const pregunta=preguntas[Math.floor(Math.random()*preguntas.length)];
      setConsultas(c=>c+1);
      setMsgs(m=>[...m,{id:Date.now()+i,nombre,texto:pregunta,ts:new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}]);
    },t));
    return()=>{ clearInterval(ivV); timers.forEach(clearTimeout); };
  },[]);

  return (
    <div style={{flex:1,overflowY:"auto",padding:"24px 16px 40px",background:C.bg}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:72,height:72,borderRadius:20,background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 10px 40px ${C.blueGl}`,fontSize:36}}>✓</div>
        <div style={{fontSize:26,fontWeight:900,color:C.ink,fontFamily:AR}}>¡Publicado!</div>
        <div style={{fontSize:14,color:C.sub,fontFamily:AR,marginTop:6,lineHeight:1.6}}>Tu propiedad ya está visible.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
        {[{l:"VISTAS",v:vistas,c:C.blue},{l:"CONSULTAS",v:consultas,c:consultas>0?C.green:C.ghost}].map(({l,v,c})=>(
          <div key={l} style={{background:C.surface,border:`1.5px solid ${v>0?c+"33":C.edge}`,borderRadius:16,padding:"16px",textAlign:"center"}}>
            <div style={{fontSize:9,color:v>0?c:C.ghost,fontFamily:MN,letterSpacing:2,marginBottom:6}}>{l}</div>
            <div style={{fontSize:32,fontWeight:900,color:v>0?c:C.ghost,fontFamily:AR}}>{v}</div>
          </div>
        ))}
      </div>
      {msgs.length>0&&(
        <div style={{marginBottom:20,display:"flex",flexDirection:"column",gap:8}}>
          {msgs.map(m=>(
            <div key={m.id} style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:14,padding:"12px 14px",animation:"up .3s ease",display:"flex",gap:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:C.blueDm,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>👤</div>
              <div style={{flex:1}}>
                <Row style={{justifyContent:"space-between",marginBottom:4}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:AR}}>{m.nombre}</div>
                  <div style={{fontSize:9,color:C.ghost,fontFamily:MN}}>{m.ts}</div>
                </Row>
                <div style={{fontSize:13,color:C.body,fontFamily:AR}}>{m.texto}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Btn label="Ir al marketplace" full onClick={onVolver}/>
    </div>
  );
}

function ModalHerramienta({tool, onClose}) {
  const [input,setInput]   = useState("");
  const [result,setResult] = useState("");
  const [busy,setBusy]     = useState(false);

  const configs = {
    tasador: {
      titulo:"🏠 Tasador IA", sub:"Estimá el valor de tu propiedad",
      placeholder:"Ej: Depto 3 ambientes 75m2 en Palermo, piso 5, con balcón",
      system:`Sos un tasador inmobiliario experto en el mercado argentino. Analizás propiedades y das estimación de valor en USD. Incluí: valor estimado, precio/m2 de la zona, factores clave. Sin asteriscos.`,
      prompt: v => `Tasá esta propiedad: ${v}`,
    },
    estafas: {
      titulo:"🔍 Detector de estafas", sub:"Analizá señales de alerta",
      placeholder:"Pegá el texto del aviso o describí la situación…",
      system:`Sos experto en seguridad inmobiliaria argentina. Detectás señales de estafa. Dás nivel de riesgo BAJO/MEDIO/ALTO/MUY ALTO. Sin asteriscos.`,
      prompt: v => `Analizá esta publicación: ${v}`,
    },
    icl: {
      titulo:"📊 Calculadora ICL", sub:"Calculá el ajuste de tu alquiler",
      placeholder:"Ej: Alquiler actual $450.000, fecha contrato: marzo 2024",
      system:`Sos especialista en contratos de alquiler argentinos. Calculás ajustes ICL del BCRA y CER. Explicás Ley 27.551. Sin asteriscos.`,
      prompt: v => `Calculá el ajuste: ${v}`,
    },
    barrio: {
      titulo:"📈 Informe de barrio", sub:"Precio/m2 y tendencias por zona",
      placeholder:"Ej: Palermo, Villa Crespo, Belgrano…",
      system:`Sos analista del mercado inmobiliario argentino. Generás informes de barrio con precio/m2, tendencias, comparaciones. Sin asteriscos.`,
      prompt: v => `Informe del barrio: ${v}`,
    },
  };

  const cfg = configs[tool];
  const analizar = async () => {
    if(!input.trim()) return;
    setBusy(true); setResult("");
    const r = await callIA([{role:"user",content:cfg.prompt(input)}], cfg.system);
    setResult(r); setBusy(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(9,9,9,.6)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{background:C.bg,borderRadius:"24px 24px 0 0",maxHeight:"88vh",display:"flex",flexDirection:"column",overflow:"hidden",animation:"up .3s ease"}}>
        <div style={{flexShrink:0,background:C.surface,borderBottom:`1px solid ${C.edge}`,padding:"16px 20px"}}>
          <div style={{textAlign:"center",marginBottom:8}}><div style={{width:36,height:4,borderRadius:2,background:C.ghost,display:"inline-block"}}/></div>
          <Row style={{justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:18,fontWeight:900,color:C.ink,fontFamily:AR}}>{cfg.titulo}</div>
              <div style={{fontSize:12,color:C.sub,fontFamily:AR,marginTop:3}}>{cfg.sub}</div>
            </div>
            <button onClick={onClose} style={{background:C.bone,border:`1px solid ${C.edge}`,borderRadius:"50%",width:32,height:32,cursor:"pointer",color:C.sub,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </Row>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px"}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder={cfg.placeholder} rows={4}
            style={{width:"100%",background:C.surface,border:`1px solid ${C.edge}`,borderRadius:14,padding:"14px 16px",fontSize:14,fontFamily:AR,color:C.ink,outline:"none",resize:"vertical",lineHeight:1.6,marginBottom:12}}/>
          <button onClick={analizar} disabled={busy||!input.trim()} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:busy||!input.trim()?C.ghost:C.blue,color:"#fff",fontWeight:900,fontSize:15,cursor:busy||!input.trim()?"not-allowed":"pointer",fontFamily:AR,marginBottom:16}}>
            {busy?"Analizando…":"⚡ Analizar ahora"}
          </button>
          {busy&&<div style={{textAlign:"center",padding:"20px 0"}}><div style={{width:32,height:32,border:`3px solid ${C.blueDm}`,borderTopColor:C.blue,borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/></div>}
          {result&&(
            <div style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:16,padding:"16px"}}>
              <div style={{fontSize:9,color:C.blue,letterSpacing:2,fontFamily:MN,marginBottom:10}}>RESULTADO IA</div>
              <div style={{fontSize:14,color:C.ink,fontFamily:AR,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{result}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModalAlerta({onClose}) {
  const [form,setForm] = useState({barrio:"",tipo:"compra",maxPrecio:""});
  const [ok,setOk] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const guardar = () => {
    try {
      const alertas = JSON.parse(localStorage.getItem("sc_alertas")||"[]");
      alertas.push({...form, id:Date.now()});
      localStorage.setItem("sc_alertas", JSON.stringify(alertas));
    } catch {}
    setOk(true);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(9,9,9,.6)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div style={{background:C.bg,borderRadius:"24px 24px 0 0",maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden",animation:"up .3s ease"}}>
        <div style={{flexShrink:0,background:C.surface,borderBottom:`1px solid ${C.edge}`,padding:"16px 20px"}}>
          <div style={{textAlign:"center",marginBottom:8}}><div style={{width:36,height:4,borderRadius:2,background:C.ghost,display:"inline-block"}}/></div>
          <Row style={{justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:18,fontWeight:900,color:C.ink,fontFamily:AR}}>🔔 Crear alerta</div>
            <button onClick={onClose} style={{background:C.bone,border:`1px solid ${C.edge}`,borderRadius:"50%",width:32,height:32,cursor:"pointer",color:C.sub,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </Row>
        </div>
        {ok ? (
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:32,textAlign:"center"}}>
            <div style={{fontSize:48}}>✅</div>
            <div style={{fontSize:18,fontWeight:900,color:C.ink,fontFamily:AR}}>¡Alerta creada!</div>
            <button onClick={onClose} style={{padding:"13px 28px",borderRadius:14,background:C.blue,border:"none",color:"#fff",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:AR}}>Listo</button>
          </div>
        ) : (
          <div style={{flex:1,overflowY:"auto",padding:"20px 16px 32px"}}>
            {[{l:"BARRIO O ZONA",k:"barrio",ph:"Ej: Palermo, Belgrano…"},{l:"PRECIO MÁXIMO (USD)",k:"maxPrecio",ph:"Ej: 150000"}].map(({l,k,ph})=>(
              <div key={k} style={{marginBottom:14}}>
                <div style={{fontSize:9,color:C.ghost,letterSpacing:2.5,fontFamily:MN,marginBottom:6}}>{l}</div>
                <input value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{width:"100%",background:C.surface,border:`1px solid ${C.edge}`,borderRadius:12,padding:"13px 16px",fontSize:15,fontFamily:AR,color:C.ink,outline:"none"}}/>
              </div>
            ))}
            <button onClick={guardar} disabled={!form.barrio} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",background:form.barrio?C.blue:C.ghost,color:"#fff",fontWeight:900,fontSize:15,cursor:form.barrio?"pointer":"not-allowed",fontFamily:AR}}>
              Crear alerta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Marketplace({onItem}) {
  const [seg,setSeg]       = useState("todos");
  const [showFiltros,setShowFiltros] = useState(false);
  const [showAlerta,setShowAlerta]   = useState(false);
  const [herramienta,setHerramienta] = useState(null);
  const [filtros,setFiltros] = useState({minM2:0,maxPrecio:0,amb:0});
  const setF = (k,v) => setFiltros(f=>({...f,[k]:v}));
  const hayFiltros = filtros.minM2>0||filtros.maxPrecio>0||filtros.amb>0;

  const vis = ITEMS.filter(l=>{
    if(seg!=="todos"&&l.seg!==seg) return false;
    if(filtros.maxPrecio>0&&l.precio>filtros.maxPrecio) return false;
    if(filtros.minM2>0&&l.m2<filtros.minM2) return false;
    if(filtros.amb>0&&l.amb<filtros.amb) return false;
    return true;
  });

  const CATS = [
    {id:"todos",      label:"Todos",    color:C.ink,    bg:"rgba(9,9,9,.06)",      bdr:"rgba(9,9,9,.15)"},
    {id:"compra",     label:"Comprar",  color:C.blue,   bg:C.blueDm,               bdr:C.blueRg},
    {id:"alquiler",   label:"Alquilar", color:C.green,  bg:C.greenDm,              bdr:C.greenRg},
    {id:"temporario", label:"Temporario",color:"#E91E8C",bg:"rgba(233,30,140,.08)",bdr:"rgba(233,30,140,.22)"},
    {id:"desarrollos",label:"Proyectos",color:"#E8860A",bg:"rgba(232,134,10,.08)", bdr:"rgba(232,134,10,.22)"},
    {id:"pozo",       label:"En Pozo",  color:"#7B4FD4",bg:"rgba(123,79,212,.08)", bdr:"rgba(123,79,212,.22)"},
  ];

  const HERRAMIENTAS = [
    {id:"tasador",label:"🏠 Tasador IA",sub:"¿Cuánto vale?"},
    {id:"estafas",label:"🔍 Detector estafas",sub:"¿Es legítimo?"},
    {id:"icl",    label:"📊 Calculadora ICL",sub:"Ajuste alquiler"},
    {id:"barrio", label:"📈 Informe barrio",sub:"Datos de zona"},
  ];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.edge}`,flexShrink:0,padding:"16px 16px 0"}}>
        <Row style={{justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontSize:10,color:C.blue,letterSpacing:3.5,fontFamily:MN,marginBottom:4}}>PROPIEDADES DIRECTAS</div>
            <div style={{fontSize:24,fontWeight:900,color:C.ink,fontFamily:AR,letterSpacing:-1.5,lineHeight:1}}>Sin<span style={{color:C.blue}}>Comision</span></div>
          </div>
          <Row style={{gap:8}}>
            <button onClick={()=>setShowAlerta(true)} style={{width:36,height:36,borderRadius:10,background:C.bone,border:`1.5px solid ${C.edge}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={C.sub} strokeWidth="1.8" strokeLinecap="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={C.sub} strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <button onClick={()=>setShowFiltros(f=>!f)} style={{height:36,padding:"0 14px",borderRadius:10,background:hayFiltros?C.blueDm:C.bone,border:`1.5px solid ${hayFiltros?C.blueRg:C.edge}`,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:700,color:hayFiltros?C.blue:C.sub,fontFamily:AR}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Filtros
            </button>
          </Row>
        </Row>
        {showFiltros&&(
          <div style={{background:C.bone,borderRadius:14,padding:"14px",marginBottom:12,border:`1px solid ${C.edge}`}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              {[{l:"PRECIO MÁX (USD)",k:"maxPrecio",ph:"sin límite"},{l:"SUPERFICIE MÍN (M2)",k:"minM2",ph:"sin límite"},{l:"AMBIENTES MÍN",k:"amb",ph:"todos"}].map(({l,k,ph})=>(
                <div key={k}>
                  <div style={{fontSize:8,color:C.ghost,fontFamily:MN,letterSpacing:1.5,marginBottom:4}}>{l}</div>
                  <input type="number" value={filtros[k]||""} onChange={e=>setF(k,Number(e.target.value))} placeholder={ph}
                    style={{width:"100%",background:C.surface,border:`1px solid ${C.edge}`,borderRadius:8,padding:"9px 12px",fontSize:13,fontFamily:AR,color:C.ink,outline:"none"}}/>
                </div>
              ))}
            </div>
            {hayFiltros&&<button onClick={()=>setFiltros({minM2:0,maxPrecio:0,amb:0})} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${C.red}`,background:C.redDm,color:C.red,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:AR}}>Limpiar</button>}
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,paddingBottom:14}}>
          {CATS.map(s=>(
            <button key={s.id} onClick={()=>setSeg(s.id)} style={{padding:"10px 8px",borderRadius:14,border:`1.5px solid ${seg===s.id?s.bdr:C.edge}`,background:seg===s.id?s.bg:"transparent",color:seg===s.id?s.color:C.sub,fontSize:11,fontWeight:seg===s.id?700:400,cursor:"pointer",fontFamily:AR,textAlign:"center"}}>{s.label}</button>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto"}}>
        <div style={{padding:"14px 16px 0"}}>
          <div style={{fontSize:9,color:C.ghost,letterSpacing:2.5,fontFamily:MN,marginBottom:10}}>HERRAMIENTAS IA GRATUITAS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {HERRAMIENTAS.map(h=>(
              <button key={h.id} onClick={()=>setHerramienta(h.id)} style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:14,padding:"12px 14px",cursor:"pointer",textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:AR}}>{h.label}</div>
                <div style={{fontSize:10,color:C.sub,fontFamily:AR}}>{h.sub}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{padding:"0 16px 40px"}}>
          {vis.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.ghost,fontFamily:MN,fontSize:11,letterSpacing:2}}>SIN RESULTADOS</div>}
          {vis.map((item,i)=>{
            const s=SEG(item.seg);
            return (
              <div key={item.id} onClick={()=>onItem(item)} style={{background:C.surface,borderRadius:18,marginBottom:14,overflow:"hidden",border:`1px solid ${C.edge}`,boxShadow:"0 2px 10px rgba(0,0,0,.06)",cursor:"pointer",animation:`up .3s ease ${i*.04}s both`}}>
                <div style={{height:160,background:`linear-gradient(150deg,${s.bg},${C.bone})`,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg style={{opacity:.06}} width="90" height="90" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3L21 9.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/></svg>
                  <div style={{position:"absolute",top:12,left:12}}><Badge label={s.label} color={s.color} bg={s.bg} bdr={s.bdr} sm/></div>
                  <div style={{position:"absolute",bottom:12,left:14}}>
                    <div style={{fontSize:20,fontWeight:900,color:C.ink,fontFamily:AR}}>{item.moneda} {item.precio.toLocaleString("es-AR")}</div>
                    {item.m2>0&&<div style={{fontSize:10,color:C.sub,fontFamily:AR}}>USD {Math.round(item.precio/item.m2).toLocaleString("es-AR")}/m2</div>}
                  </div>
                  {item.horasPubl<=2&&<div style={{position:"absolute",top:12,right:12,padding:"3px 8px",background:"rgba(255,59,48,.08)",border:"1px solid rgba(255,59,48,.25)",borderRadius:20,display:"flex",alignItems:"center",gap:4}}><div style={{width:5,height:5,borderRadius:"50%",background:C.red}}/><div style={{fontSize:8,fontWeight:700,color:C.red,fontFamily:MN}}>NUEVO</div></div>}
                </div>
                <div style={{padding:"13px 14px"}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:AR,marginBottom:4}}>{item.tipo}{item.amb>0?` ${item.amb} amb`:""}{item.m2>0?` · ${item.m2}m2`:""}</div>
                  <div style={{fontSize:12,color:C.sub,fontFamily:AR,marginBottom:8}}>{item.dir} · {item.barrio}</div>
                  <div style={{fontSize:12,color:C.body,fontFamily:AR,lineHeight:1.5}}>{item.desc.slice(0,90)}…</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showAlerta  && <ModalAlerta onClose={()=>setShowAlerta(false)}/>}
      {herramienta && <ModalHerramienta tool={herramienta} onClose={()=>setHerramienta(null)}/>}
    </div>
  );
}

function PantallaBancos({onBack}) {
  const [tab,setTab]=useState("oferta");
  const INGRESO=850000;
  const PRESTAMO_ARS=150000*.8*TC;
  const PLAZO=20;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <NavBar title="Bancos conectados" onBack={onBack}/>
      <div style={{flexShrink:0,background:C.surface,borderBottom:`1px solid ${C.edge}`,padding:"12px 16px 0"}}>
        <Row style={{gap:0}}>
          {[{id:"oferta",l:"Oferta en vivo"},{id:"metricas",l:"Métricas"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",border:"none",background:"none",cursor:"pointer",borderBottom:`2px solid ${tab===t.id?C.blue:"transparent"}`,color:tab===t.id?C.blue:C.sub,fontSize:12,fontWeight:tab===t.id?700:400,fontFamily:AR}}>{t.l}</button>
          ))}
        </Row>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 40px"}}>
        {tab==="oferta"&&BANCOS.filter(b=>b.estado==="conectado"||b.estado==="beta").map((b,i)=>{
          const cuota=Math.round(calcCuota(PRESTAMO_ARS,b.tasaUVA,Math.min(PLAZO,b.plazoMax)));
          const pct=(cuota/INGRESO*100);
          const ok=pct<=b.cuotaIngreso;
          return (
            <div key={b.id} style={{background:C.surface,border:`1.5px solid ${i===0?C.blue:C.edge}`,borderRadius:18,padding:"16px",marginBottom:10}}>
              <Row style={{justifyContent:"space-between",marginBottom:12}}>
                <Row style={{gap:12}}><div style={{fontSize:26}}>{b.logo}</div><div><div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:AR}}>{b.nombre}</div><EstadoDot estado={b.estado}/></div></Row>
                {i===0&&<Badge label="MEJOR TASA" color={C.blue} bg={C.blueDm} bdr={C.blueRg}/>}
              </Row>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                {[{l:"TASA UVA",v:`${b.tasaUVA}%`},{l:"FINANCIA",v:`${b.financiacion}%`},{l:"PLAZO MÁX",v:`${b.plazoMax}a`}].map(({l,v})=>(
                  <div key={l} style={{background:C.bone,borderRadius:10,padding:"10px",border:`1px solid ${C.edge}`}}><div style={{fontSize:7,color:C.ghost,fontFamily:MN,letterSpacing:1.5,marginBottom:3}}>{l}</div><div style={{fontSize:14,fontWeight:900,color:C.ink,fontFamily:AR}}>{v}</div></div>
                ))}
              </div>
              <div style={{background:ok?C.greenDm:C.redDm,border:`1px solid ${ok?C.greenRg:"rgba(255,59,48,.2)"}`,borderRadius:10,padding:"10px 14px"}}>
                <Row style={{justifyContent:"space-between"}}>
                  <div><div style={{fontSize:18,fontWeight:900,color:ok?C.green:C.red,fontFamily:AR}}>${cuota.toLocaleString("es-AR")}/mes</div><div style={{fontSize:10,color:C.sub}}>{pct.toFixed(0)}% del ingreso</div></div>
                  <div style={{fontSize:20}}>{ok?"✅":"⚠️"}</div>
                </Row>
              </div>
            </div>
          );
        })}
        {tab==="metricas"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[{l:"Leads enviados",v:"493",c:C.blue},{l:"Pre-aprobaciones",v:"61",c:C.green},{l:"Revenue",v:"$4.2M",c:C.ink},{l:"Tiempo respuesta",v:"212ms",c:C.sub}].map(({l,v,c})=>(
              <div key={l} style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:14,padding:"14px"}}><div style={{fontSize:9,color:C.ghost,fontFamily:MN,letterSpacing:1.5,marginBottom:6}}>{l.toUpperCase()}</div><div style={{fontSize:22,fontWeight:900,color:c,fontFamily:AR}}>{v}</div></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PantallaPublicar({onBack}) {
  const [paso,setPaso]   = useState(1);
  const [plan,setPlan]   = useState(null);
  const [datos,setDatos] = useState({nombre:"",apellido:"",dni:"",telefono:"",email:""});
  const [checks,setChecks]=useState({terminos:false,privacidad:false,visitas:false,resp:false});
  const [metodo,setMetodo]=useState(null);
  const [listo,setListo]  =useState(false);
  const [pagando,setPag]  =useState(false);
  const setD=(k,v)=>setDatos(x=>({...x,[k]:v}));
  const toggleCk=k=>setChecks(c=>({...c,[k]:!c[k]}));

  if(listo) return <PantallaListo plan={plan} datos={datos} onVolver={onBack}/>;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <NavBar title={["Elegí tu plan","Tus datos","Términos legales","Método de pago"][paso-1]} onBack={()=>paso>1?setPaso(p=>p-1):onBack()}/>
      <div style={{flexShrink:0,padding:"12px 20px",background:C.surface,borderBottom:`1px solid ${C.edge}`}}>
        <div style={{display:"flex",gap:4}}>{Array.from({length:4},(_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<paso?C.blue:C.line}}/>)}</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px 40px"}}>
        {paso===1&&(
          <div>
            <div style={{fontSize:28,fontWeight:900,color:C.ink,fontFamily:AR,marginBottom:6}}>Elegí tu plan</div>
            <div style={{fontSize:14,color:C.sub,fontFamily:AR,marginBottom:24}}>Sin comisión cuando vendés. Solo pagás la publicación.</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
              {PLANES.map(p=>{
                const active=plan?.id===p.id;
                return (
                  <div key={p.id} onClick={()=>setPlan(p)} style={{background:C.surface,border:`2px solid ${active?C.blue:C.edge}`,borderRadius:18,padding:"18px 16px",cursor:"pointer",position:"relative"}}>
                    {p.popular&&<div style={{position:"absolute",top:-10,right:16}}><Badge label="MÁS POPULAR" color={C.blue} bg={C.blueDm} bdr={C.blueRg}/></div>}
                    <Row style={{justifyContent:"space-between",marginBottom:12}}>
                      <div><div style={{fontSize:18,fontWeight:900,color:active?C.blue:C.ink,fontFamily:AR}}>{p.label}</div><div style={{fontSize:10,color:C.ghost,fontFamily:MN}}>{p.dur}</div></div>
                      <div><div style={{fontSize:22,fontWeight:900,color:active?C.blue:C.ink,fontFamily:AR}}>${p.precio.toLocaleString("es-AR")}</div><div style={{fontSize:9,color:C.ghost,fontFamily:MN}}>ARS + IVA</div></div>
                    </Row>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {p.features.map(f=>(
                        <Row key={f} style={{gap:8}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke={active?C.blue:C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg><div style={{fontSize:13,color:C.body,fontFamily:AR}}>{f}</div></Row>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <Btn label="Continuar →" full onClick={()=>plan&&setPaso(2)} disabled={!plan}/>
          </div>
        )}
        {paso===2&&(
          <div>
            <div style={{fontSize:24,fontWeight:900,color:C.ink,fontFamily:AR,marginBottom:20}}>Tus datos</div>
            <div style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:16,padding:"16px",marginBottom:20}}>
              {[{l:"NOMBRE",k:"nombre",ph:"Juan"},{l:"APELLIDO",k:"apellido",ph:"García"},{l:"DNI / CUIT",k:"dni",ph:"20.345.678"},{l:"EMAIL",k:"email",ph:"juan@gmail.com",t:"email"}].map(({l,k,ph,t})=>(
                <div key={k} style={{marginBottom:14}}>
                  <div style={{fontSize:9,color:C.ghost,letterSpacing:2.5,fontFamily:MN,marginBottom:6}}>{l}</div>
                  <input type={t||"text"} value={datos[k]} onChange={e=>setD(k,e.target.value)} placeholder={ph} style={{width:"100%",background:C.bone,border:`1px solid ${C.edge}`,borderRadius:12,padding:"13px 16px",fontSize:15,fontFamily:AR,color:C.ink,outline:"none"}}/>
                </div>
              ))}
            </div>
            <Btn label="Continuar →" full onClick={()=>datos.nombre&&datos.apellido&&datos.dni&&datos.email&&setPaso(3)} disabled={!datos.nombre||!datos.apellido||!datos.dni||!datos.email}/>
          </div>
        )}
        {paso===3&&(
          <div>
            <div style={{fontSize:24,fontWeight:900,color:C.ink,fontFamily:AR,marginBottom:20}}>Términos legales</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
              {[{id:"terminos",t:"Términos y condiciones"},{id:"privacidad",t:"Política de privacidad"},{id:"visitas",t:"Protocolo de visitas"},{id:"resp",t:"Responsabilidad civil"}].map(c=>(
                <div key={c.id} onClick={()=>toggleCk(c.id)} style={{background:C.surface,border:`1.5px solid ${checks[c.id]?C.green:C.edge}`,borderRadius:14,padding:"14px 16px",cursor:"pointer"}}>
                  <Row style={{gap:12}}>
                    <div style={{width:22,height:22,borderRadius:6,background:checks[c.id]?C.green:"transparent",border:`2px solid ${checks[c.id]?C.green:C.ghost}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {checks[c.id]&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:checks[c.id]?C.green:C.ink,fontFamily:AR}}>{c.t}</div>
                  </Row>
                </div>
              ))}
            </div>
            <Btn label="Aceptar y pagar →" full onClick={()=>setPaso(4)} disabled={!Object.values(checks).every(Boolean)}/>
          </div>
        )}
        {paso===4&&(
          pagando?(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,padding:32,minHeight:300}}>
              <div style={{width:60,height:60,border:`4px solid ${C.blueDm}`,borderTopColor:C.blue,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
              <div style={{fontSize:18,fontWeight:700,color:C.ink,fontFamily:AR}}>Procesando pago...</div>
            </div>
          ):(
            <div>
              <div style={{fontSize:24,fontWeight:900,color:C.ink,fontFamily:AR,marginBottom:20}}>Método de pago</div>
              <div style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:16,padding:"16px",marginBottom:20}}>
                <Row style={{justifyContent:"space-between",paddingTop:4}}>
                  <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:AR}}>Total</div>
                  <div style={{fontSize:20,fontWeight:900,color:C.blue,fontFamily:AR}}>$ {Math.round((plan?.precio||0)*1.21).toLocaleString("es-AR")}</div>
                </Row>
              </div>
              {[{id:"mp",logo:"💳",t:"Mercado Pago",c:"#009EE3"},{id:"cbu",logo:"🏦",t:"Transferencia bancaria",c:C.green}].map(m=>(
                <div key={m.id} onClick={()=>setMetodo(m.id)} style={{background:C.surface,border:`2px solid ${metodo===m.id?m.c:C.edge}`,borderRadius:16,padding:"18px 16px",marginBottom:10,cursor:"pointer"}}>
                  <Row style={{gap:14}}>
                    <div style={{width:44,height:44,borderRadius:12,background:m.c+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{m.logo}</div>
                    <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:AR}}>{m.t}</div>
                    {metodo===m.id&&<div style={{marginLeft:"auto",width:20,height:20,borderRadius:"50%",background:m.c,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                  </Row>
                </div>
              ))}
              <div style={{marginTop:12}}>
                <Btn label={metodo?"Pagar ahora →":"Elegí un método"} full onClick={async()=>{
                  if(!metodo) return;
                  setPag(true);
                  await new Promise(r=>setTimeout(r,2500));
                  setPag(false);
                  emitirPublicacion({tipo:"Departamento",barrio:"Palermo",moneda:"USD",precio:168000,owner:datos.nombre+" "+datos.apellido});
                  setListo(true);
                }} disabled={!metodo}/>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

const SC_CHAT = "sc_marta_historial";
const SC_META = "sc_marta_meta";
const cargarHistorial = () => { try { return JSON.parse(localStorage.getItem(SC_CHAT)||"[]"); } catch { return []; } };
const guardarHistorial = m => { try { localStorage.setItem(SC_CHAT, JSON.stringify(m.slice(-30))); } catch {} };
const cargarMeta  = () => { try { return JSON.parse(localStorage.getItem(SC_META)||"{}"); } catch { return {}; } };
const guardarMeta = d => { try { localStorage.setItem(SC_META, JSON.stringify({...cargarMeta(),...d})); } catch {} };

function PantallaMarta({onExplorar}) {
  const histInicial = cargarHistorial();
  const metaInicial = cargarMeta();

  const [msgs,setMsgs]         = useState(histInicial);
  const [input,setInput]       = useState("");
  const [busy,setBusy]         = useState(false);
  const [grabando,setGrabando] = useState(false);
  const [transcrib,setTranscrib] = useState("");
  const [chatAbierto,setChatAbierto] = useState(histInicial.length > 0);
  const endRef  = useRef();
  const recRef  = useRef(null);
  const synthRef = useRef(typeof window!=="undefined"?window.speechSynthesis:null);

  useEffect(()=>{
    if(msgs.length > 0) guardarHistorial(msgs);
    endRef.current?.scrollIntoView({behavior:"smooth"});
  },[msgs]);

  useEffect(()=>{
    const ultima = metaInicial.ultimaVisita || 0;
    guardarMeta({ultimaVisita: Date.now()});
    if(histInicial.length === 0) {
      setMsgs([{role:"assistant",content:"¡Hola! Soy Marta, tu asesora en SinComision — encontrás propiedades directo con el dueño, sin pagar comisión.\n\n¿Qué estás buscando?"}]);
      setChatAbierto(true);
    }
  },[]);

  const buildSystem = () => {
    return `Sos Marta, asesora inmobiliaria de SinComision Argentina. Sos como una amiga que sabe mucho del mercado — empática, directa, nunca robótica.
ESTILO: Hablás en español rioplatense. Máximo 3 oraciones. Terminás siempre con UNA pregunta.
NUNCA decís "Como IA…". Nunca das listas largas.`;
  };

  function hablar(texto) {
    if(!synthRef.current) return;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(texto);
    utt.lang="es-AR"; utt.rate=1.05;
    synthRef.current.speak(utt);
  }

  const send = async(t) => {
    const txt = t||input.trim();
    if(!txt||busy) return;
    if(!chatAbierto) setChatAbierto(true);
    const n = [...msgs,{role:"user",content:txt}];
    setMsgs(n); setInput(""); setBusy(true);
    const r = await callIA(n.map(m=>({role:m.role,content:m.content})), buildSystem());
    const nuevos = [...n, {role:"assistant",content:r}];
    setMsgs(nuevos);
    guardarHistorial(nuevos);
    guardarMeta({ultimaVisita: Date.now()});
    hablar(r); setBusy(false);
  };

  function toggleGrabacion() {
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    if(grabando) { recRef.current?.stop(); setGrabando(false); setTranscrib(""); return; }
    synthRef.current?.cancel();
    const rec = new SR();
    rec.lang="es-AR"; rec.interimResults=true; rec.continuous=false;
    rec.onresult = e => {
      let final="",inter="";
      for(let r of e.results) { if(r.isFinal) final+=r[0].transcript; else inter+=r[0].transcript; }
      setTranscrib(inter||final);
      if(final.trim()) { setGrabando(false); setTranscrib(""); send(final.trim()); }
    };
    rec.onend=()=>{ setGrabando(false); setTranscrib(""); };
    rec.onerror=()=>{ setGrabando(false); setTranscrib(""); };
    recRef.current=rec; rec.start(); setGrabando(true);
  }

  const STATS = [
    {v:"0%",l:"Sin comisión"},{v:"10K+",l:"Propiedades"},{v:"6",l:"Bancos"},{v:"4.9★",l:"Valoración"},
  ];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.bg,overflow:"hidden"}}>
      {!chatAbierto && (
        <div style={{flex:1,overflowY:"auto"}}>
          <div style={{background:C.ink,padding:"28px 20px 32px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-60,right:-60,width:200,height:200,borderRadius:"50%",background:C.blueDm,filter:"blur(60px)"}}/>
            <Row style={{justifyContent:"space-between",marginBottom:24,position:"relative"}}>
              <div>
                <div style={{fontSize:28,fontWeight:600,color:"#fff",fontFamily:AR,letterSpacing:-1.5}}>Sin<span style={{color:C.blue}}>Comision</span></div>
                <div style={{fontSize:9,color:"rgba(255,255,255,.4)",letterSpacing:3.5,fontFamily:MN,marginTop:4}}>PROPIEDADES DIRECTAS · ARGENTINA</div>
              </div>
              <div style={{position:"relative"}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(255,255,255,0.25)"/></svg>
                </div>
                <div style={{position:"absolute",bottom:1,right:1,width:12,height:12,borderRadius:"50%",background:C.green,border:"2.5px solid #090909"}}>
                  <div style={{position:"absolute",inset:0,borderRadius:"50%",background:C.green,animation:"ping 2s infinite"}}/>
                </div>
              </div>
            </Row>
            <div style={{position:"relative",marginBottom:28}}>
              <div style={{fontSize:36,fontWeight:600,color:"#fff",fontFamily:AR,letterSpacing:-2,lineHeight:1.05,marginBottom:10}}>Tu próxima<br/>propiedad,<br/><span style={{color:C.blue}}>sin pagar</span><br/><span style={{color:C.blue}}>comisión.</span></div>
              <div style={{fontSize:14,color:"rgba(255,255,255,.55)",fontFamily:AR,lineHeight:1.7}}>Comprá, alquilá o temporario directo con el dueño.</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,position:"relative"}}>
              {STATS.map(({v,l})=>(
                <div key={l} style={{background:"rgba(255,255,255,.07)",borderRadius:12,padding:"10px 8px",textAlign:"center",border:"1px solid rgba(255,255,255,.1)"}}>
                  <div style={{fontSize:15,fontWeight:600,color:"#fff",fontFamily:AR}}>{v}</div>
                  <div style={{fontSize:8,color:"rgba(255,255,255,.45)",fontFamily:MN,letterSpacing:0.5,marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{padding:"20px 16px"}}>
            <div style={{background:C.surface,borderRadius:18,border:`2px solid ${C.edge}`,overflow:"hidden",marginBottom:20}}>
              <div style={{padding:"4px 14px 0",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.edge}`}}>
                <MartaAvatar size={28} small/>
                <div style={{flex:1,padding:"12px 0"}}>
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="¿Qué propiedad estás buscando?" style={{width:"100%",background:"none",border:"none",outline:"none",color:C.ink,fontSize:15,fontFamily:AR}}/>
                </div>
              </div>
              <Row style={{padding:"10px 14px",justifyContent:"flex-end"}}>
                <button onClick={()=>send()} disabled={busy||!input.trim()} style={{padding:"8px 20px",borderRadius:10,background:busy||!input.trim()?C.ghost:C.blue,border:"none",cursor:"pointer",color:"#fff",fontWeight:600,fontSize:13,fontFamily:AR}}>
                  {busy?"...":"Preguntar →"}
                </button>
              </Row>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              {[
                {titulo:"Comprar",sub:"Departamentos, PHs, casas",color:C.blue,bg:C.blueDm,bdr:C.blueRg},
                {titulo:"Alquilar",sub:"Contratos directos",color:C.green,bg:C.greenDm,bdr:C.greenRg},
                {titulo:"Temporario",sub:"Por noche o temporada",color:"#E91E8C",bg:"rgba(233,30,140,.08)",bdr:"rgba(233,30,140,.22)"},
                {titulo:"Proyectos",sub:"En pozo y desarrollos",color:"#7B4FD4",bg:"rgba(123,79,212,.08)",bdr:"rgba(123,79,212,.22)"},
              ].map(({titulo,sub,color,bg,bdr})=>(
                <div key={titulo} onClick={onExplorar} style={{background:C.surface,border:`1.5px solid ${bdr}`,borderRadius:18,padding:"16px 14px",cursor:"pointer"}}>
                  <div style={{fontSize:14,fontWeight:500,color:C.ink,fontFamily:AR,marginBottom:3}}>{titulo}</div>
                  <div style={{fontSize:11,color:C.sub,fontFamily:AR,lineHeight:1.4}}>{sub}</div>
                  <div style={{marginTop:10,display:"inline-block",padding:"4px 10px",borderRadius:20,background:bg,border:`1px solid ${bdr}`,fontSize:9,fontWeight:500,color,fontFamily:MN}}>VER →</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {chatAbierto && (
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{flexShrink:0,background:C.ink,padding:"12px 16px"}}>
            <Row style={{justifyContent:"space-between"}}>
              <Row style={{gap:10}}>
                <MartaAvatar size={32}/>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:"#fff",fontFamily:AR}}>Marta IA</div>
                  <Row style={{gap:5}}><div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/><div style={{fontSize:9,color:"rgba(255,255,255,.5)",fontFamily:MN}}>EN LÍNEA</div></Row>
                </div>
              </Row>
              <button onClick={()=>setChatAbierto(false)} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",cursor:"pointer",color:"rgba(255,255,255,.5)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>↙</button>
            </Row>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",flexDirection:m.role==="user"?"row-reverse":"row",gap:10,alignItems:"flex-end",marginBottom:12}}>
                {m.role==="assistant"&&<MartaAvatar size={28} small/>}
                <div style={{maxWidth:"80%",padding:"12px 15px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"4px 18px 18px 18px",background:m.role==="user"?C.blue:C.surface,border:m.role==="assistant"?`1px solid ${C.edge}`:"none",fontSize:15,lineHeight:1.6,color:m.role==="user"?"#fff":C.ink,fontFamily:AR,whiteSpace:"pre-wrap"}}>{m.content}</div>
              </div>
            ))}
            {grabando&&transcrib&&<div style={{padding:"10px 14px",background:C.blueDm,border:`1px solid ${C.blueRg}`,borderRadius:12,marginBottom:10,fontSize:13,color:C.blue,fontFamily:AR}}>{transcrib}…</div>}
            {busy&&<Row style={{gap:10,marginBottom:12}}><MartaAvatar size={28} small/><div style={{background:C.surface,borderRadius:"4px 18px 18px 18px",padding:"14px 18px",border:`1px solid ${C.edge}`,display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.ghost,animation:"pulse 1.3s infinite",animationDelay:`${i*.22}s`}}/>)}</div></Row>}
            <div ref={endRef}/>
          </div>
          <div style={{flexShrink:0,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${C.edge}`,padding:"10px 16px",paddingBottom:"max(10px,env(safe-area-inset-bottom))",display:"flex",gap:8,alignItems:"center"}}>
            <div style={{flex:1,background:C.bone,borderRadius:22,border:`1px solid ${C.edge}`,padding:"0 14px",display:"flex",alignItems:"center"}}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={grabando?"Escuchando...":"Preguntale a Marta..."} style={{flex:1,background:"none",border:"none",outline:"none",color:C.ink,fontSize:15,fontFamily:AR,padding:"11px 0"}}/>
            </div>
            <button onClick={toggleGrabacion} style={{width:38,height:38,borderRadius:"50%",flexShrink:0,background:grabando?C.blue:C.bone,border:`1.5px solid ${grabando?C.blue:C.edge}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              {grabando&&<div style={{position:"absolute",inset:-4,borderRadius:"50%",border:`1.5px solid ${C.blue}`,opacity:.4,animation:"ping 1.4s ease-out infinite"}}/>}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="9" y="2" width="6" height="11" rx="3" stroke={grabando?"#fff":C.sub} strokeWidth="1.8" fill={grabando?"rgba(255,255,255,.2)":"none"}/><path d="M5 10C5 14.418 8.134 18 12 18C15.866 18 19 14.418 19 10" stroke={grabando?"#fff":C.sub} strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="18" x2="12" y2="22" stroke={grabando?"#fff":C.sub} strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <button onClick={()=>send()} disabled={busy||!input.trim()} style={{width:38,height:38,borderRadius:"50%",flexShrink:0,background:busy||!input.trim()?C.ghost:C.blue,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab,setTab]       = useState("marta");
  const [screen,setScreen] = useState("home");
  const [item,setItem]     = useState(null);
  const [favs,setFavs]     = useState([]);
  const [notif,setNotif]   = useState(null);

  useEffect(()=>{
    const unsub = suscribirNotif(evento => setNotif(evento));
    if(typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return unsub;
  },[]);

  const toggleFav = p => setFavs(f=>f.some(x=>x.id===p.id)?f.filter(x=>x.id!==p.id):[...f,p]);
  const goDetalle = i => { setItem(i); setScreen("detalle"); };
  const goBack    = () => { setScreen("home"); setItem(null); };
  const isDeep    = screen==="detalle" || screen==="bancos";

  const NAV = [
    { k:"marta",    label:"Marta",    icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2L13.5 9.5L21 11L13.5 12.5L12 20L10.5 12.5L3 11L10.5 9.5L12 2Z" stroke={a?C.blue:C.ghost} strokeWidth="1.8" strokeLinejoin="round" fill={a?C.blueDm:"none"}/></svg> },
    { k:"explorar", label:"Explorar", icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke={a?C.blue:C.ghost} strokeWidth="1.9" strokeLinejoin="round" fill={a?C.blueDm:"none"}/><path d="M9 4V17M15 7V20" stroke={a?C.blue:C.ghost} strokeWidth="1.9"/></svg> },
    { k:"publicar", label:"Publicar", icon:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="#fff" strokeWidth="2.3" strokeLinecap="round"/></svg>, special:true },
    { k:"favoritos",label:"Guardados",icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={a?C.red:C.ghost} strokeWidth="1.9" fill={a?C.red:"none"} strokeLinejoin="round"/></svg> },
    { k:"cuenta",   label:"Mi cuenta",icon:(a)=><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={a?C.blue:C.ghost} strokeWidth="1.8"/><path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={a?C.blue:C.ghost} strokeWidth="1.8" strokeLinecap="round"/></svg> },
  ];

  return (
    <div style={{height:"100dvh",background:C.bg,color:C.ink,fontFamily:AR,display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto",overflow:"hidden"}}>
      <style>{CSS}</style>
      <div style={{height:"env(safe-area-inset-top,0px)",background:C.surface,flexShrink:0}}/>
      {notif && <NotifBanner notif={notif} onTap={()=>{setNotif(null);setTab("explorar");setScreen("home");}} onClose={()=>setNotif(null)}/>}

      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {screen==="detalle" && item && item.seg==="temporario"
          ? <DetalleTemporario item={item} onBack={goBack} favs={favs} onFav={toggleFav}/>
          : screen==="detalle" && item
          ? <Detalle item={item} onBack={goBack} favs={favs} onFav={toggleFav} onBancos={()=>setScreen("bancos")}/>
          : null
        }
        {screen==="bancos" && <PantallaBancos onBack={()=>setScreen("detalle")}/>}

        {!isDeep && (
          <>
            {tab==="marta"     && <PantallaMarta onExplorar={()=>setTab("explorar")}/>}
            {tab==="explorar"  && <Marketplace onItem={goDetalle}/>}
            {tab==="publicar"  && <PantallaPublicar onBack={()=>setTab("explorar")}/>}
            {screen==="publicar"&& <PantallaPublicar onBack={()=>{setScreen("home");setTab("explorar");}}/>}
            {tab==="favoritos" && (
              <div style={{flex:1,overflowY:"auto",padding:"24px 16px"}}>
                <div style={{fontSize:26,fontWeight:900,color:C.ink,fontFamily:AR,marginBottom:20}}>Guardados</div>
                {favs.length===0
                  ? <div style={{textAlign:"center",padding:"60px 0",color:C.ghost,fontFamily:MN,fontSize:11,letterSpacing:2}}>GUARDÁ PROPIEDADES DESDE EL MARKETPLACE</div>
                  : favs.map(it=>(
                    <div key={it.id} onClick={()=>goDetalle(it)} style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:14,padding:"14px",marginBottom:10,cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
                      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:AR}}>{it.tipo} · {it.barrio}</div><div style={{fontSize:12,color:C.sub,fontFamily:AR}}>{it.dir}</div></div>
                      <div style={{fontSize:15,fontWeight:900,color:C.blue,fontFamily:AR}}>{it.moneda} {it.precio.toLocaleString("es-AR")}</div>
                    </div>
                  ))
                }
              </div>
            )}
            {tab==="cuenta" && (
              <div style={{flex:1,overflowY:"auto",padding:"24px 16px"}}>
                <div style={{fontSize:22,fontWeight:700,color:C.ink,fontFamily:AR,marginBottom:20}}>Mi cuenta</div>
                <div style={{background:C.surface,border:`1px solid ${C.edge}`,borderRadius:16,padding:"20px",textAlign:"center"}}>
                  <MartaAvatar size={56}/>
                  <div style={{fontSize:15,color:C.sub,fontFamily:AR,marginTop:16}}>Registrate para guardar tus búsquedas y recibir alertas personalizadas.</div>
                  <div style={{marginTop:16}}><Btn label="Crear cuenta" full onClick={()=>{}}/></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!isDeep && (
        <div style={{background:"rgba(255,255,255,0.97)",backdropFilter:"blur(20px)",borderTop:`1px solid ${C.edge}`,display:"flex",flexShrink:0,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
          {NAV.map(n=>{
            const active=tab===n.k;
            return (
              <button key={n.k} onClick={()=>{ if(n.k==="publicar"){setTab("publicar");setScreen("home");}else{setTab(n.k);setScreen("home");} }} style={{flex:1,padding:"9px 0 7px",border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
                {active&&!n.special&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:28,height:2,borderRadius:1,background:C.blue}}/>}
                {n.special
                  ? <div style={{width:48,height:32,borderRadius:10,background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 16px ${C.blueGl}`}}>{n.icon()}</div>
                  : <div style={{width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center"}}>{n.icon(active)}</div>}
                <div style={{fontSize:9,fontWeight:active?700:400,fontFamily:MN,letterSpacing:active?1:0.5,color:n.special?C.blue:active?C.blue:C.ghost}}>{n.label.toUpperCase()}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
