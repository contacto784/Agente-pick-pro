import { useState, useEffect, useRef } from "react";

const C = { bg:"#0a0a0a",s1:"#111",s2:"#161616",b1:"#1e1e1e",b2:"#2a2a2a",green:"#c8f135",yellow:"#f1c035",red:"#ff6b6b",blue:"#35c8f1",text:"#e8e8e8",dim:"#555" };
const NAV = [{k:"home",i:"⚡",l:"Inicio"},{k:"ticket",i:"🎫",l:"Ticket"},{k:"monitor",i:"🔴",l:"Monitor"},{k:"compare",i:"⚖️",l:"Comparar"},{k:"ou",i:"📊",l:"O/U"},{k:"kelly",i:"💰",l:"Kelly"},{k:"history",i:"📋",l:"Historial"}];

const S = {
  app:   { background:C.bg, color:C.text, fontFamily:"system-ui,sans-serif", minHeight:"100vh", maxWidth:480, margin:"0 auto", paddingBottom:72 },
  hdr:   { padding:"12px 16px", borderBottom:`1px solid ${C.b1}`, display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:C.bg, zIndex:100 },
  logo:  { fontFamily:"Georgia,serif", fontSize:"1.35rem", color:C.green, fontWeight:"bold" },
  sub:   { display:"block", fontSize:"0.5rem", color:C.dim, fontFamily:"monospace", letterSpacing:2, marginTop:1 },
  page:  { padding:"14px 16px" },
  card:  { background:C.s2, border:`1px solid ${C.b2}`, borderRadius:8, padding:14, marginBottom:10 },
  btn:   (bg=C.green,fg="#000") => ({ background:bg, color:fg, border:"none", padding:"12px 16px", fontWeight:"bold", fontSize:"0.85rem", cursor:"pointer", borderRadius:6, width:"100%", marginBottom:10 }),
  btnSm: (on) => ({ background:on?"rgba(200,241,53,0.1)":"none", border:`1px solid ${on?C.green:C.b2}`, color:on?C.green:C.dim, padding:"4px 10px", fontSize:"0.58rem", cursor:"pointer", borderRadius:4, fontFamily:"monospace" }),
  inp:   { width:"100%", background:C.s2, border:`1px solid ${C.b2}`, color:C.text, padding:"10px 12px", fontSize:16, borderRadius:6, outline:"none" },
  sec:   { fontSize:"0.52rem", fontFamily:"monospace", color:C.dim, textTransform:"uppercase", letterSpacing:2, marginBottom:10, display:"flex", alignItems:"center", gap:8 },
  line:  { flex:1, height:1, background:C.b1 },
  nav:   { position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:C.s1, borderTop:`1px solid ${C.b1}`, display:"flex", zIndex:100 },
  navB:  (on) => ({ flex:1, padding:"10px 2px 12px", background:"none", border:"none", color:on?C.green:C.dim, fontSize:"0.46rem", letterSpacing:1, textTransform:"uppercase", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, fontFamily:"monospace" }),
  badge: (col) => ({ fontSize:"0.52rem", fontFamily:"monospace", padding:"2px 7px", borderRadius:3, background:`${col}18`, color:col, border:`1px solid ${col}28` }),
  spin:  { display:"flex", alignItems:"center", gap:8, background:C.s2, border:`1px solid ${C.b2}`, borderRadius:6, padding:"10px 14px", marginBottom:10, fontSize:"0.62rem", color:C.dim, fontFamily:"monospace" },
  dot:   (col,p) => ({ width:7, height:7, borderRadius:"50%", background:col, flexShrink:0, animation:p?"pulse 1.2s infinite":"none" }),
  err:   { background:"rgba(255,107,107,0.08)", border:"1px solid rgba(255,107,107,0.25)", borderRadius:6, padding:"10px 12px", fontSize:"0.68rem", color:C.red, marginBottom:10, fontFamily:"monospace" },
  lbl:   { fontSize:"0.48rem", fontFamily:"monospace", color:C.dim, textTransform:"uppercase", letterSpacing:1, marginBottom:4, display:"block" },
};

async function ai(prompt, search=false) {
  const body = { model:"claude-sonnet-4-20250514", max_tokens:1200, messages:[{role:"user",content:prompt}] };
  if (search) body.tools = [{type:"web_search_20250305",name:"web_search"}];
  const r = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.content.filter(b=>b.type==="text").map(b=>b.text).join("");
}
const gv = (txt,key) => { const m=txt.match(new RegExp(key+":\\s*(.+)")); return m?m[1].trim():""; };
const eC = (e) => { const n=parseFloat(e); return n<3.5?C.green:n<4.5?C.yellow:C.red; };
const sC = (s) => s==="GANANDO"||s==="GANADO"?C.green:s==="PERDIENDO"||s==="PERDIDO"?C.red:s==="EMPATE"?C.yellow:C.dim;

function Stat({val,lbl,col=C.text}) {
  return (
    <div style={{background:C.bg,border:`1px solid ${C.b1}`,borderRadius:4,padding:"8px 4px",textAlign:"center"}}>
      <div style={{fontWeight:"bold",fontSize:"1rem",color:col,lineHeight:1}}>{val||"—"}</div>
      <div style={{fontSize:"0.44rem",color:C.dim,fontFamily:"monospace",textTransform:"uppercase",marginTop:2}}>{lbl}</div>
    </div>
  );
}
function Spin({text}) { return <div style={S.spin}><div style={S.dot(C.green,true)}/>{text}</div>; }

function PickForm({onSave}) {
  const [f,setF] = useState({team:"",rival:"",odds:"",wager:"50",sport:"MLB",conf:"MEDIO",result:"pending"});
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
        {[["team","Equipo","Dodgers"],["rival","Rival","Angels"],["odds","Odds","-185"],["wager","Apuesta","50"]].map(([k,l,ph])=>(
          <div key={k}><label style={S.lbl}>{l}</label><input style={{...S.inp,padding:"7px 10px",fontSize:14}} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})} placeholder={ph}/></div>
        ))}
        <div><label style={S.lbl}>Deporte</label><select style={{...S.inp,padding:"7px 10px",fontSize:14}} value={f.sport} onChange={e=>setF({...f,sport:e.target.value})}><option>MLB</option><option>NBA</option><option>NFL</option></select></div>
        <div><label style={S.lbl}>Conf.</label><select style={{...S.inp,padding:"7px 10px",fontSize:14}} value={f.conf} onChange={e=>setF({...f,conf:e.target.value})}><option value="ALTO">Alto</option><option value="MEDIO">Medio</option><option value="BAJO">Bajo</option></select></div>
        <div style={{gridColumn:"1/-1"}}><label style={S.lbl}>Resultado</label><select style={{...S.inp,padding:"7px 10px",fontSize:14}} value={f.result} onChange={e=>setF({...f,result:e.target.value})}><option value="pending">Pendiente</option><option value="win">Ganado</option><option value="loss">Perdido</option></select></div>
      </div>
      <button style={S.btn()} onClick={()=>{if(!f.team)return;onSave(f,f.result);setF({team:"",rival:"",odds:"",wager:"50",sport:"MLB",conf:"MEDIO",result:"pending"});}}>Guardar</button>
    </div>
  );
}

export default function App() {
  const now = new Date();
  const today = now.toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const dateStr = now.toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"}).toUpperCase();
  const timeStr = now.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});

  const [tab,setTab] = useState("home");
  const [games,setGames] = useState([]);
  const [gLoad,setGLoad] = useState(false);
  const [picks,setPicks] = useState([]);
  const [pLoad,setPLoad] = useState(false);
  const [pStep,setPStep] = useState("");
  const [parlays,setParlays] = useState([]);
  const [parLoad,setParLoad] = useState(false);
  const [ticket,setTicket] = useState([]);
  const [wager,setWager] = useState("50");
  const [lineLoad,setLineLoad] = useState(false);
  const [lineAlerts,setLineAlerts] = useState([]);
  const [lineOk,setLineOk] = useState(false);
  const [scores,setScores] = useState({});
  const [prevScores,setPrevScores] = useState({});
  const [scoreAlerts,setScoreAlerts] = useState([]);
  const [monOn,setMonOn] = useState(false);
  const [monLoad,setMonLoad] = useState(false);
  const monRef = useRef(null);
  const [pitcher,setPitcher] = useState(null);
  const [pitcherQ,setPitcherQ] = useState("");
  const [pitcherLoad,setPitcherLoad] = useState(false);
  const [pitcherErr,setPitcherErr] = useState("");
  const [history,setHistory] = useState(()=>{try{return JSON.parse(localStorage.getItem("ap_h")||"[]")}catch{return[]}});
  const [weekRep,setWeekRep] = useState(null);
  const [weekLoad,setWeekLoad] = useState(false);
  const [alerts,setAlerts] = useState([]);
  const [compare,setCompare] = useState(null);
  const [compareLoad,setCompareLoad] = useState(false);
  const [cmpForm,setCmpForm] = useState({t1:"",r1:"",o1:"",t2:"",r2:"",o2:""});
  const [ou,setOu] = useState(null);
  const [ouLoad,setOuLoad] = useState(false);
  const [ouForm,setOuForm] = useState({team1:"",team2:"",total:"",hora:""});
  const [kelly,setKelly] = useState(null);
  const [kellyForm,setKellyForm] = useState({odds:"",bankroll:"500",prob:""});

  useEffect(()=>{ autoLoad(); checkAlerts(); },[]);

  async function autoLoad() {
    setGLoad(true); setPLoad(true); setPStep("Buscando partidos y picks...");
    try {
      const t = await ai(`Lista partidos MLB y NBA de HOY ${today}. Una linea cada uno:\nJUEGO: [visitante] @ [local] | [hora PDT] | [MLB o NBA]`,true);
      const gs = t.split("\n").filter(l=>l.includes("JUEGO:")).map(l=>{
        const m=l.match(/JUEGO:\s*(.+?)\s*@\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(MLB|NBA)/i);
        return m?{away:m[1].trim(),home:m[2].trim(),time:m[3].trim(),sport:m[4].trim()}:null;
      }).filter(Boolean);
      if(gs.length>0){ setGames(gs); await genPicksFrom(gs); }
    } catch(e){console.error(e);}
    setGLoad(false); setPLoad(false); setPStep("");
  }

  async function checkAlerts() {
    try {
      const t = await ai(`Hoy ${today}. Hay lesiones de pitchers MLB anunciadas HOY? Si no hay nada responde: LIMPIO\nSi hay: ALERTA: equipo | detalle | ALTO o MEDIO`,true);
      if(!t.includes("LIMPIO")) {
        const lines = t.split("\n").filter(l=>l.startsWith("ALERTA:")).map(l=>{
          const p=l.replace("ALERTA:","").split("|").map(x=>x.trim());
          return {equipo:p[0],detalle:p[1],impacto:p[2]};
        }).filter(a=>a.equipo);
        setAlerts(lines);
      }
    } catch(e){}
  }

  async function genPicksFrom(gs) {
    const gsStr = (gs||games).filter(g=>g.sport==="MLB").map(g=>`${g.away} @ ${g.home} (${g.time})`).join(", ")||"MLB hoy";
    setPLoad(true); setPicks([]); setParlays([]);
    try {
      setPStep("Verificando pitchers y records...");
      const t = await ai(`Eres AgentePicks. HOY ${today}. MLB: ${gsStr}. Dame 5 picks rankeados:
PICK1_EQUIPO: · PICK1_RIVAL: · PICK1_HORA: · PICK1_LOCAL: SI/NO · PICK1_RECORD: · PICK1_PITCHER: nombre ERA WHIP · PICK1_RIVAL_PITCHER: nombre ERA · PICK1_LESIONES: · PICK1_PROB: % · PICK1_CONF: ALTO/MEDIO/BAJO · PICK1_RAZON: oracion
PICK2_EQUIPO: · PICK2_RIVAL: · PICK2_HORA: · PICK2_LOCAL: · PICK2_RECORD: · PICK2_PITCHER: · PICK2_RIVAL_PITCHER: · PICK2_LESIONES: · PICK2_PROB: · PICK2_CONF: · PICK2_RAZON:
PICK3_EQUIPO: · PICK3_RIVAL: · PICK3_HORA: · PICK3_LOCAL: · PICK3_RECORD: · PICK3_PITCHER: · PICK3_RIVAL_PITCHER: · PICK3_LESIONES: · PICK3_PROB: · PICK3_CONF: · PICK3_RAZON:
PICK4_EQUIPO: · PICK4_RIVAL: · PICK4_HORA: · PICK4_LOCAL: · PICK4_RECORD: · PICK4_PITCHER: · PICK4_RIVAL_PITCHER: · PICK4_LESIONES: · PICK4_PROB: · PICK4_CONF: · PICK4_RAZON:
PICK5_EQUIPO: · PICK5_RIVAL: · PICK5_HORA: · PICK5_LOCAL: · PICK5_RECORD: · PICK5_PITCHER: · PICK5_RIVAL_PITCHER: · PICK5_LESIONES: · PICK5_PROB: · PICK5_CONF: · PICK5_RAZON:`,true);
      const ps = [1,2,3,4,5].map(n=>({
        team:gv(t,`PICK${n}_EQUIPO`),rival:gv(t,`PICK${n}_RIVAL`),hora:gv(t,`PICK${n}_HORA`),
        isHome:gv(t,`PICK${n}_LOCAL`)==="SI",record:gv(t,`PICK${n}_RECORD`),
        pitcher:gv(t,`PICK${n}_PITCHER`),pitcherRival:gv(t,`PICK${n}_RIVAL_PITCHER`),
        lesiones:gv(t,`PICK${n}_LESIONES`),prob:gv(t,`PICK${n}_PROB`),
        conf:gv(t,`PICK${n}_CONF`),razon:gv(t,`PICK${n}_RAZON`),pick:"ML",rank:n,
      })).filter(p=>p.team);
      setPicks(ps);
    } catch(e){console.error(e);}
    setPLoad(false); setPStep("");
  }

  async function genParlays() {
    if(!picks.length){alert("Genera picks primero");return;}
    setParLoad(true); setParlays([]);
    const pl = picks.map(p=>`${p.team} vs ${p.rival} (${p.conf}, ${p.isHome?"LOCAL":"VISIT."})`).join(", ");
    try {
      const t = await ai(`Picks: ${pl}\nCrea 3 parlays distintos sin repetir equipos.\nPARLAY1_NOMBRE: · PARLAY1_LEGS: eq1, eq2, eq3 · PARLAY1_ODDS: +XXX · PARLAY1_RAZON: oracion\nPARLAY2_NOMBRE: · PARLAY2_LEGS: · PARLAY2_ODDS: · PARLAY2_RAZON:\nPARLAY3_NOMBRE: · PARLAY3_LEGS: · PARLAY3_ODDS: · PARLAY3_RAZON:`);
      const ps = [1,2,3].map(n=>({nombre:gv(t,`PARLAY${n}_NOMBRE`),legs:gv(t,`PARLAY${n}_LEGS`).split(",").map(l=>l.trim()).filter(Boolean),odds:gv(t,`PARLAY${n}_ODDS`),razon:gv(t,`PARLAY${n}_RAZON`)})).filter(p=>p.nombre&&p.legs.length);
      setParlays(ps);
    } catch(e){console.error(e);}
    setParLoad(false);
  }

  const inT = t => ticket.some(p=>p.team===t);
  const togT = pick => setTicket(prev=>prev.find(p=>p.team===pick.team)?prev.filter(p=>p.team!==pick.team):[...prev,pick]);
  const w = parseFloat(wager)||0;
  const odds = {2:260,3:420,4:900,5:1800}[ticket.length]||0;
  const payout = (w*odds/100).toFixed(2);
  const total = (w+parseFloat(payout)).toFixed(2);

  async function checkLines() {
    if(!ticket.length)return;
    setLineLoad(true); setLineAlerts([]); setLineOk(false);
    try {
      const teams = ticket.map(p=>`${p.team} vs ${p.rival}`).join(", ");
      const t = await ai(`Lineas moneyline actuales hoy ${today} para: ${teams}. Para cada equipo una linea:\nLINEA: equipo | apertura | actual | movimiento en puntos | razon`,true);
      const al = t.split("\n").filter(l=>l.startsWith("LINEA:")).map(l=>{
        const p=l.replace("LINEA:","").split("|").map(x=>x.trim());
        return {team:p[0],apertura:p[1],actual:p[2],mov:parseInt(p[3])||0,razon:p[4]};
      }).filter(a=>Math.abs(a.mov)>=15);
      setLineAlerts(al);
      setLineOk(al.length===0);
    } catch(e){console.error(e);}
    setLineLoad(false);
  }

  async function fetchScores() {
    if(!ticket.length)return;
    setMonLoad(true);
    try {
      const teams = ticket.map(p=>p.team).join(", ");
      const t = await ai(`Scores en vivo o final HOY ${today} para: ${teams}. Para cada uno:\nSCORE: equipo | X-Y | inning/FINAL/PENDIENTE | GANANDO/PERDIENDO/GANADO/PERDIDO/PENDIENTE`,true);
      const ns = {};
      const newAl = [];
      ticket.forEach(p=>{
        const line = t.split("\n").find(l=>l.startsWith("SCORE:")&&l.toLowerCase().includes(p.team.split(" ").slice(-1)[0].toLowerCase()));
        if(line){
          const parts = line.replace("SCORE:","").split("|").map(x=>x.trim());
          const score=parts[1]||"—"; const periodo=parts[2]||"—"; const status=parts[3]||"PENDIENTE";
          ns[p.team]={score,periodo,status};
          const prev=prevScores[p.team];
          if(prev&&prev.score!==score&&score!=="—"){
            const runs=score.split("-").map(Number); const pr=prev.score.split("-").map(Number);
            if(!isNaN(runs[0])&&!isNaN(pr[0])){
              if(runs[0]>pr[0]) newAl.push({msg:`${p.team} ANOTO — ${score}`,type:"good",time:timeStr});
              if(runs[1]>pr[1]) newAl.push({msg:`${p.rival} anoto — ${score}`,type:"bad",time:timeStr});
            }
          }
          if(prev&&prev.status!==status&&(status==="GANADO"||status==="PERDIDO"))
            newAl.push({msg:`${p.team} — ${status}`,type:status==="GANADO"?"good":"bad",time:timeStr});
        } else { ns[p.team]={score:"—",periodo:"—",status:"PENDIENTE"}; }
      });
      setPrevScores(ns); setScores(ns);
      if(newAl.length) setScoreAlerts(prev=>[...newAl,...prev].slice(0,20));
    } catch(e){console.error(e);}
    setMonLoad(false);
  }
  const startMon=()=>{setMonOn(true);fetchScores();monRef.current=setInterval(fetchScores,60000);};
  const stopMon=()=>{setMonOn(false);if(monRef.current){clearInterval(monRef.current);monRef.current=null;}};

  async function searchPitcher() {
    if(!pitcherQ.trim())return;
    setPitcherLoad(true); setPitcherErr(""); setPitcher(null);
    try {
      const t = await ai(`Stats 2026 y salud del pitcher MLB "${pitcherQ}" hoy ${today}.\nNOMBRE: · EQUIPO: · ERA: · WHIP: · WL: · K: · IP: · TENDENCIA: SUBIENDO/ESTABLE/BAJANDO · SALUD: ACTIVO/DUDOSO/LESIONADO · LESION: · ULTIMO: resultado ultimo juego · ANALISIS: dos oraciones · VEREDICTO: APOSTAR/PASAR/ESPERAR`,true);
      setPitcher({nombre:gv(t,"NOMBRE"),equipo:gv(t,"EQUIPO"),era:gv(t,"ERA"),whip:gv(t,"WHIP"),wl:gv(t,"WL"),k:gv(t,"K"),ip:gv(t,"IP"),tendencia:gv(t,"TENDENCIA"),salud:gv(t,"SALUD"),lesion:gv(t,"LESION"),ultimo:gv(t,"ULTIMO"),analisis:gv(t,"ANALISIS"),veredicto:gv(t,"VEREDICTO")});
    } catch(e){setPitcherErr(e.message||"Error.");}
    setPitcherLoad(false);
  }

  async function comparePicks() {
    if(!cmpForm.t1||!cmpForm.t2){alert("Ingresa los dos picks");return;}
    setCompareLoad(true); setCompare(null);
    try {
      const t = await ai(`Compara estos dos picks MLB HOY ${today}:\nPICK A: ${cmpForm.t1} ML vs ${cmpForm.r1} (odds: ${cmpForm.o1||"N/A"})\nPICK B: ${cmpForm.t2} ML vs ${cmpForm.r2} (odds: ${cmpForm.o2||"N/A"})\nEvalua pitcher, record, momentum, matchup, valor odds.\nA_PITCHER: · A_RECORD: · A_MOMENTUM: SUBIENDO/ESTABLE/BAJANDO · A_VALOR: EXCELENTE/BUENO/NEUTRAL/MALO · A_SCORE: 1-100\nB_PITCHER: · B_RECORD: · B_MOMENTUM: · B_VALOR: · B_SCORE: 1-100\nGANADOR: A o B · DIFERENCIA: CLARA o AJUSTADA · RAZON: dos oraciones · ADVERTENCIA:`,true);
      setCompare({
        a:{team:cmpForm.t1,rival:cmpForm.r1,odds:cmpForm.o1,pitcher:gv(t,"A_PITCHER"),record:gv(t,"A_RECORD"),momentum:gv(t,"A_MOMENTUM"),valor:gv(t,"A_VALOR"),score:gv(t,"A_SCORE")},
        b:{team:cmpForm.t2,rival:cmpForm.r2,odds:cmpForm.o2,pitcher:gv(t,"B_PITCHER"),record:gv(t,"B_RECORD"),momentum:gv(t,"B_MOMENTUM"),valor:gv(t,"B_VALOR"),score:gv(t,"B_SCORE")},
        ganador:gv(t,"GANADOR"),diferencia:gv(t,"DIFERENCIA"),razon:gv(t,"RAZON"),advertencia:gv(t,"ADVERTENCIA"),
      });
    } catch(e){console.error(e);}
    setCompareLoad(false);
  }

  async function analyzeOU() {
    if(!ouForm.team1||!ouForm.team2||!ouForm.total){alert("Ingresa equipos y total");return;}
    setOuLoad(true); setOu(null);
    try {
      const t = await ai(`Analiza Over/Under HOY ${today}: ${ouForm.team1} vs ${ouForm.team2}. Total kiosko: ${ouForm.total}.\nPITCHER1: nombre ERA · PITCHER2: nombre ERA · CARRERAS1: RPG local · CARRERAS2: RPG visitante · TOTAL_ESPERADO: numero · CLIMA: condicion · HISTORIAL: promedio carreras directo · TENDENCIA: OVER/UNDER ultimos 5 juegos · VALOR: OVER/UNDER/NEUTRO · CONFIANZA: ALTO/MEDIO/BAJO · RAZON: dos oraciones · PICK: OVER o UNDER con numero`,true);
      setOu({team1:ouForm.team1,team2:ouForm.team2,total:ouForm.total,pitcher1:gv(t,"PITCHER1"),pitcher2:gv(t,"PITCHER2"),carreras1:gv(t,"CARRERAS1"),carreras2:gv(t,"CARRERAS2"),totalEsperado:gv(t,"TOTAL_ESPERADO"),clima:gv(t,"CLIMA"),historial:gv(t,"HISTORIAL"),tendencia:gv(t,"TENDENCIA"),valor:gv(t,"VALOR"),confianza:gv(t,"CONFIANZA"),razon:gv(t,"RAZON"),pick:gv(t,"PICK")});
    } catch(e){console.error(e);}
    setOuLoad(false);
  }

  function calcKelly() {
    const o=parseFloat(kellyForm.odds), bank=parseFloat(kellyForm.bankroll)||500, prob=parseFloat(kellyForm.prob);
    if(isNaN(o)||isNaN(prob)){alert("Ingresa odds y probabilidad");return;}
    const dec=o>0?(o/100)+1:(100/Math.abs(o))+1;
    const b=dec-1, p=prob/100, q=1-p;
    const fk=((b*p-q)/b);
    const hk=fk/2, qk=fk/4;
    const impl=o>0?100/(o+100):Math.abs(o)/(Math.abs(o)+100);
    const edge=((p-impl)*100).toFixed(1);
    const hasEdge=p>impl;
    setKelly({o,bank,prob,dec:dec.toFixed(3),fk:(fk*100).toFixed(1),hk:(hk*100).toFixed(1),qk:(qk*100).toFixed(1),betF:Math.max(0,fk*bank).toFixed(2),betH:Math.max(0,hk*bank).toFixed(2),betQ:Math.max(0,qk*bank).toFixed(2),impl:(impl*100).toFixed(1),edge,hasEdge,rec:!hasEdge?"NONE":fk>0.25?"QUARTER":fk>0.15?"HALF":"FULL"});
  }

  const saveH=(pick,result)=>{
    const e={id:Date.now(),team:pick.team,rival:pick.rival||"",pick:pick.pick||"ML",date:new Date().toLocaleDateString("es-MX",{day:"numeric",month:"short"}),result,odds:pick.odds||"",wager:pick.wager||"50",sport:pick.sport||"MLB",conf:pick.conf||"MEDIO"};
    setHistory(prev=>{const u=[e,...prev].slice(0,100);localStorage.setItem("ap_h",JSON.stringify(u));return u;});
  };
  const updH=(id,result)=>setHistory(prev=>{const u=prev.map(x=>x.id===id?{...x,result}:x);localStorage.setItem("ap_h",JSON.stringify(u));return u;});
  const delH=(id)=>setHistory(prev=>{const u=prev.filter(x=>x.id!==id);localStorage.setItem("ap_h",JSON.stringify(u));return u;});

  async function genWeekly() {
    setWeekLoad(true); setWeekRep(null);
    const res=history.filter(p=>p.result!=="pending");
    const wins=res.filter(p=>p.result==="win").length;
    const net=res.reduce((a,p)=>{if(p.result==="win"&&p.odds){const n=parseFloat(p.odds),w2=parseFloat(p.wager||50);return a+(!isNaN(n)?(n>0?w2*n/100:w2*100/Math.abs(n)):w2);}return a-parseFloat(p.wager||50);},0);
    const hist=res.slice(0,15).map(p=>`${p.team}(${p.result==="win"?"W":"L"},${p.sport})`).join(", ");
    try {
      const t = await ai(`Reporte semanal: ${wins}W-${res.length-wins}L, Neto $${net.toFixed(0)}, picks: ${hist||"sin datos"}.\nTITULO: · RESUMEN: dos oraciones · MEJOR: · MEJORA: · PATRON: · CONSEJO: · PROYECCION:`);
      setWeekRep({titulo:gv(t,"TITULO"),resumen:gv(t,"RESUMEN"),mejor:gv(t,"MEJOR"),mejora:gv(t,"MEJORA"),patron:gv(t,"PATRON"),consejo:gv(t,"CONSEJO"),proyeccion:gv(t,"PROYECCION"),stats:{wins,losses:res.length-wins,pct:res.length>0?Math.round(wins/res.length*100):0,net}});
    } catch(e){console.error(e);}
    setWeekLoad(false);
  }

  // ── PAGES ─────────────────────────────────────────────────────────────────

  const Home = () => (
    <div style={S.page}>
      {(gLoad||pLoad)&&<div style={{background:"rgba(200,241,53,0.06)",border:`1px solid rgba(200,241,53,0.2)`,borderRadius:6,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}><div style={S.dot(C.green,true)}/><div style={{flex:1}}><div style={{fontSize:"0.72rem",fontWeight:600,color:C.green}}>Cargando picks del dia...</div><div style={{fontSize:"0.6rem",color:C.dim,fontFamily:"monospace",marginTop:2}}>{pStep||"Buscando partidos"}</div></div></div>}

      {alerts.map((a,i)=>(
        <div key={i} style={{background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.25)",borderRadius:6,padding:"10px 12px",marginBottom:8,display:"flex",gap:8,alignItems:"center"}}>
          <span>🚨</span><div style={{flex:1}}><b style={{color:C.red,fontSize:"0.78rem"}}>{a.equipo}</b><div style={{fontSize:"0.68rem",color:"#ccc",marginTop:2}}>{a.detalle}</div></div>
          <span style={S.badge(a.impacto==="ALTO"?C.red:C.yellow)}>{a.impacto}</span>
        </div>
      ))}

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:14}}>
        {[{l:"MLB",v:games.filter(g=>g.sport==="MLB").length||"—",c:C.text},{l:"Picks",v:picks.length,c:C.green},{l:"Ticket",v:ticket.length,c:C.yellow},{l:"NBA",v:games.filter(g=>g.sport==="NBA").length||"—",c:C.blue}].map((s,i)=>(
          <div key={i} style={{background:C.s2,border:`1px solid ${C.b1}`,borderRadius:6,padding:"10px 8px",textAlign:"center"}}>
            <div style={{fontWeight:"bold",fontSize:"1.1rem",color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:"0.46rem",color:C.dim,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:1,marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={S.sec}>Picks del dia<div style={S.line}/></div>
      {pLoad&&<Spin text={pStep||"Analizando..."}/>}
      {picks.map((p,i)=>(
        <div key={i} style={{...S.card,borderLeft:`3px solid ${p.conf==="ALTO"?C.green:C.yellow}`,marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontFamily:"monospace",fontSize:"0.52rem",background:i===0?C.green:C.b2,color:i===0?"#000":C.dim,padding:"1px 6px",borderRadius:3,fontWeight:"bold"}}>#{p.rank}</span>
                <span style={{fontWeight:600,fontSize:"0.9rem"}}>{p.team}</span>
                <span style={S.badge(p.isHome?C.blue:C.yellow)}>{p.isHome?"LOCAL":"VISIT."}</span>
                {p.record&&<span style={{fontSize:"0.5rem",fontFamily:"monospace",color:C.dim}}>{p.record}</span>}
              </div>
              <div style={{fontSize:"0.68rem",color:C.dim,marginBottom:5}}>vs {p.rival} · {p.hora}</div>
              {p.pitcher&&<div style={{background:C.bg,border:`1px solid ${C.b1}`,borderRadius:4,padding:"5px 8px",marginBottom:5,fontSize:"0.66rem"}}><span style={{color:C.green}}>⚾</span> {p.pitcher} <span style={{color:C.dim}}>· {p.pitcherRival}</span></div>}
              {p.lesiones&&p.lesiones!=="Sin lesiones"&&<div style={{fontSize:"0.6rem",color:C.red,marginBottom:4}}>⚠ {p.lesiones}</div>}
              <div style={{fontSize:"0.74rem",color:"#aaa",lineHeight:1.5}}>{p.razon}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,marginLeft:10}}>
              <span style={{fontFamily:"monospace",fontSize:"1.1rem",fontWeight:"bold",color:p.conf==="ALTO"?C.green:C.yellow}}>{p.prob}</span>
              <span style={S.badge(p.conf==="ALTO"?C.green:C.yellow)}>{p.conf}</span>
              <button style={S.btnSm(inT(p.team))} onClick={()=>togT(p)}>{inT(p.team)?"✓":"+"}</button>
            </div>
          </div>
          <div style={{background:C.b1,borderRadius:2,height:3,overflow:"hidden",marginTop:8}}>
            <div style={{width:p.prob,height:"100%",background:parseInt(p.prob)>=65?C.green:parseInt(p.prob)>=55?C.yellow:C.red,borderRadius:2}}/>
          </div>
        </div>
      ))}
      <button style={{...S.btn(),...(pLoad?{opacity:0.4,cursor:"not-allowed"}:{})}} disabled={pLoad} onClick={()=>genPicksFrom()}>
        {pLoad?"Analizando...":picks.length?"↻ Actualizar Picks":"Generar Picks"}
      </button>

      <div style={S.sec}>Parlays del dia<div style={S.line}/></div>
      {parLoad&&<Spin text="Generando 3 parlays..."/>}
      {parlays.map((p,i)=>{
        const cols=[C.green,C.yellow,C.red]; const col=cols[i];
        const o=parseInt(p.odds.replace("+",""))||0;
        return(
          <div key={i} style={{...S.card,borderLeft:`3px solid ${col}`,marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:"0.88rem",marginBottom:5}}>{p.nombre}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{p.legs.map((l,j)=><span key={j} style={{...S.badge(C.dim),fontSize:"0.58rem"}}>{l}</span>)}</div>
              </div>
              <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}>
                <div style={{fontFamily:"Georgia,serif",fontSize:"1.5rem",fontWeight:"bold",color:col,lineHeight:1}}>{p.odds}</div>
                <div style={{fontSize:"0.5rem",color:C.dim,fontFamily:"monospace"}}>{p.legs.length} legs</div>
              </div>
            </div>
            <div style={{fontSize:"0.72rem",color:"#aaa",marginBottom:8}}>{p.razon}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"0.6rem",fontFamily:"monospace",color:C.dim}}>$50→<span style={{color:C.green}}>${(50*o/100).toFixed(0)}</span> · $100→<span style={{color:C.green}}>${(100*o/100).toFixed(0)}</span></span>
              <button style={{...S.btnSm(false),color:col,borderColor:col}} onClick={()=>p.legs.forEach(leg=>{const pk=picks.find(pk=>pk.team.toLowerCase().includes(leg.toLowerCase().split(" ")[0]));if(pk&&!inT(pk.team))togT(pk);})}>+ Ticket</button>
            </div>
          </div>
        );
      })}
      <button style={{...S.btn(C.s2,C.dim),...{border:`1px solid ${C.b2}`},...(parLoad||!picks.length?{opacity:0.4,cursor:"not-allowed"}:{})}} disabled={parLoad||!picks.length} onClick={genParlays}>
        {parLoad?"Generando...":parlays.length?"↻ Regenerar Parlays":"Generar 3 Parlays"}
      </button>

      <div style={S.sec}>Partidos<div style={S.line}/>
        <button onClick={autoLoad} style={{background:"none",border:`1px solid ${C.b2}`,color:C.dim,padding:"3px 8px",fontSize:"0.52rem",borderRadius:3,cursor:"pointer"}}>↻</button>
      </div>
      {games.map((g,i)=>(
        <div key={i} style={{...S.card,padding:"9px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:"0.8rem",fontWeight:500}}>{g.away} @ {g.home}</div>
          <div style={{textAlign:"right"}}><div style={{fontSize:"0.6rem",fontFamily:"monospace",color:C.dim}}>{g.time}</div><div style={{fontSize:"0.48rem",fontFamily:"monospace",color:g.sport==="NBA"?C.blue:C.dim}}>{g.sport}</div></div>
        </div>
      ))}
    </div>
  );

  const Ticket = () => (
    <div style={S.page}>
      <div style={S.sec}>Armar Ticket<div style={S.line}/></div>
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {["25","50","100"].map(v=><button key={v} onClick={()=>setWager(v)} style={{flex:1,background:wager===v?C.green:C.s2,color:wager===v?"#000":C.dim,border:`1px solid ${wager===v?C.green:C.b2}`,padding:"10px 0",fontWeight:"bold",fontSize:"0.85rem",borderRadius:6,cursor:"pointer"}}>${v}</button>)}
        <input type="number" value={wager} onChange={e=>setWager(e.target.value)} style={{...S.inp,flex:1,textAlign:"center",padding:"10px 8px"}}/>
      </div>
      {[...picks,...games.filter(g=>g.sport==="NBA").map(g=>({team:g.home,rival:g.away,pick:"ML",conf:"MEDIO",hora:g.time}))].map((p,i)=>(
        <div key={i} onClick={()=>togT(p)} style={{background:inT(p.team)?"rgba(200,241,53,0.06)":C.s2,border:`1px solid ${inT(p.team)?C.green:C.b2}`,borderRadius:6,padding:"10px 14px",marginBottom:7,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontWeight:600,fontSize:"0.88rem"}}>{p.team} <span style={{color:C.dim,fontWeight:400,fontSize:"0.7rem"}}>ML</span></div><div style={{fontSize:"0.6rem",color:C.dim,marginTop:2}}>vs {p.rival} · {p.hora}</div></div>
          <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${inT(p.team)?C.green:C.b2}`,background:inT(p.team)?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.65rem",color:"#000"}}>{inT(p.team)?"✓":""}</div>
        </div>
      ))}
      {ticket.length>=2&&(
        <div style={{background:"rgba(200,241,53,0.05)",border:`1px solid rgba(200,241,53,0.2)`,borderRadius:8,padding:16,marginTop:4}}>
          <div style={{fontSize:"0.5rem",fontFamily:"monospace",color:C.green,textTransform:"uppercase",letterSpacing:2,marginBottom:10}}>Resumen</div>
          {ticket.map((p,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.b1}`}}>
              <div><div style={{fontSize:"0.82rem",fontWeight:500}}>{i+1}. {p.team} ML</div><div style={{fontSize:"0.58rem",color:C.dim}}>vs {p.rival} · {p.hora}</div></div>
              <button onClick={e=>{e.stopPropagation();togT(p);}} style={{background:"none",border:"none",color:C.dim,cursor:"pointer"}}>✕</button>
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:12}}>
            <Stat val={ticket.length} lbl="Legs"/><Stat val={`$${w}`} lbl="Apuesta"/><Stat val={`$${payout}`} lbl="Ganas" col={C.green}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:`1px solid ${C.b1}`}}>
            <span style={{fontSize:"0.58rem",fontFamily:"monospace",color:C.dim}}>Retorno total</span>
            <span style={{fontWeight:"bold",fontSize:"1.1rem",color:C.green}}>${total}</span>
          </div>
          <div style={{background:C.bg,border:`1px solid ${C.b1}`,borderRadius:6,padding:14,marginTop:10}}>
            <div style={{fontWeight:"bold",fontSize:"0.82rem",marginBottom:2}}>BOYD SPORTS</div>
            <div style={{fontSize:"0.5rem",fontFamily:"monospace",color:C.dim,marginBottom:8}}>Sam's Town · Las Vegas · {dateStr}</div>
            <div style={{fontSize:"0.58rem",fontFamily:"monospace",color:C.green,marginBottom:8}}>PARLAY {ticket.length} LEGS · ${wager} · +{odds}</div>
            {ticket.map((p,i)=><div key={i} style={{fontSize:"0.68rem",padding:"2px 0"}}>{i+1}. Busca <b style={{color:C.green}}>{p.team} At {p.rival}</b> → Money Line</div>)}
            <div style={{fontSize:"0.6rem",fontFamily:"monospace",color:C.yellow,marginTop:8}}>Selecciona PARLAY · Ingresa ${wager} · Confirma</div>
          </div>
          <button onClick={checkLines} disabled={lineLoad} style={{...S.btn(C.s2,C.dim),...{border:`1px solid ${C.b2}`,marginTop:10,marginBottom:6}}}>
            {lineLoad?"Verificando...":"Verificar Lineas"}
          </button>
          {lineAlerts.map((a,i)=><div key={i} style={S.err}>⚠ {a.team}: {a.mov>0?"+":""}{a.mov} pts → {a.actual} · {a.razon}</div>)}
          {lineOk&&<div style={{fontSize:"0.6rem",fontFamily:"monospace",color:C.green,paddingBottom:6}}>✓ Sin movimientos significativos</div>}
          <button onClick={()=>setTicket([])} style={S.btn(C.red)}>Limpiar Ticket</button>
        </div>
      )}
      {ticket.length<2&&<div style={{textAlign:"center",padding:20,fontSize:"0.65rem",color:C.dim,fontFamily:"monospace"}}>Selecciona 2+ picks para armar el parlay</div>}
    </div>
  );

  const Monitor = () => (
    <div style={S.page}>
      <div style={S.sec}>Monitor en Vivo<div style={S.line}/></div>
      {scoreAlerts.length>0&&(
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{fontSize:"0.52rem",fontFamily:"monospace",color:C.dim,textTransform:"uppercase",letterSpacing:2}}>Alertas de Score</div>
            <button onClick={()=>setScoreAlerts([])} style={{background:"none",border:"none",color:C.dim,fontSize:"0.6rem",cursor:"pointer",fontFamily:"monospace"}}>Limpiar</button>
          </div>
          {scoreAlerts.map((a,i)=>(
            <div key={i} style={{background:a.type==="good"?"rgba(200,241,53,0.08)":"rgba(255,107,107,0.08)",border:`1px solid ${a.type==="good"?"rgba(200,241,53,0.25)":"rgba(255,107,107,0.25)"}`,borderRadius:6,padding:"10px 12px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span>{a.type==="good"?"✅":"⚠️"}</span><div style={{fontWeight:600,fontSize:"0.82rem",color:a.type==="good"?C.green:C.red}}>{a.msg}</div></div>
              <div style={{fontSize:"0.52rem",fontFamily:"monospace",color:C.dim}}>{a.time}</div>
            </div>
          ))}
        </div>
      )}
      {ticket.length===0?<div style={{textAlign:"center",padding:32,fontSize:"0.65rem",color:C.dim,fontFamily:"monospace",lineHeight:1.8}}>Agrega picks al ticket<br/>para monitorear</div>:(
        <>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {!monOn?<button onClick={startMon} style={S.btn()}>Iniciar Monitor (60s)</button>:<button onClick={stopMon} style={S.btn(C.red)}>Detener Monitor</button>}
            <button onClick={fetchScores} disabled={monLoad} style={{...S.btn(C.s2,C.text),...{border:`1px solid ${C.b2}`,width:"auto",padding:"12px 16px",marginBottom:10}}}>↻</button>
          </div>
          {monOn&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,fontSize:"0.6rem",fontFamily:"monospace",color:C.green}}><div style={S.dot(C.red,true)}/>EN VIVO · 60s</div>}
          {monLoad&&<Spin text="Buscando scores..."/>}
          {ticket.map((p,i)=>{
            const sc=scores[p.team]; const col=sC(sc?.status||"PENDIENTE");
            return(
              <div key={i} style={{...S.card,borderLeft:`3px solid ${col}`,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontWeight:600,fontSize:"0.9rem"}}>{p.team}</div><div style={{fontSize:"0.65rem",color:C.dim,marginTop:2}}>vs {p.rival} · {p.hora}</div>
                    {sc?.score&&sc.score!=="—"&&<div style={{fontSize:"1.2rem",fontWeight:"bold",color:col,marginTop:4,fontFamily:"monospace"}}>{sc.score}</div>}
                    {sc?.periodo&&<div style={{fontSize:"0.6rem",color:C.dim,fontFamily:"monospace"}}>{sc.periodo}</div>}
                  </div>
                  <span style={S.badge(col)}>{sc?.status||"PENDIENTE"}</span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );

  const Pitcher = () => (
    <div style={S.page}>
      <div style={S.sec}>Analisis de Pitcher<div style={S.line}/></div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <input style={{...S.inp,flex:1}} placeholder="ej. Roki Sasaki..." value={pitcherQ} onChange={e=>setPitcherQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchPitcher()}/>
        <button style={{...S.btn(),...{width:"auto",padding:"12px 16px",marginBottom:0}}} onClick={searchPitcher}>Buscar</button>
      </div>
      {pitcherLoad&&<Spin text="Buscando stats y lesiones..."/>}
      {pitcherErr&&<div style={S.err}>{pitcherErr}</div>}
      {pitcher&&!pitcherLoad&&(
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <div style={{fontWeight:600,fontSize:"1rem"}}>{pitcher.nombre}</div>
            {pitcher.salud&&<span style={S.badge(pitcher.salud==="ACTIVO"?C.green:pitcher.salud==="LESIONADO"?C.red:C.yellow)}>{pitcher.salud}</span>}
          </div>
          <div style={{fontSize:"0.6rem",color:C.dim,fontFamily:"monospace",marginBottom:10}}>{pitcher.equipo} · 2026</div>
          {pitcher.lesion&&pitcher.lesion!=="Sin lesiones"&&<div style={{background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:4,padding:"7px 10px",marginBottom:10}}><div style={{fontSize:"0.6rem",fontFamily:"monospace",color:C.red,marginBottom:2}}>⚠ LESION</div><div style={{fontSize:"0.7rem"}}>{pitcher.lesion}</div></div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
            <Stat val={pitcher.era} lbl="ERA" col={eC(pitcher.era)}/><Stat val={pitcher.whip} lbl="WHIP" col={C.blue}/><Stat val={pitcher.wl} lbl="W-L"/><Stat val={pitcher.k} lbl="K"/>
          </div>
          <div style={{fontSize:"0.8rem",lineHeight:1.6,borderTop:`1px solid ${C.b1}`,paddingTop:10,marginBottom:10}}>{pitcher.analisis}</div>
          {pitcher.veredicto&&<div style={{textAlign:"center",padding:"10px",borderRadius:4,background:pitcher.veredicto==="APOSTAR"?"rgba(200,241,53,0.08)":"rgba(255,107,107,0.08)"}}><div style={{fontWeight:"bold",fontSize:"1rem",color:pitcher.veredicto==="APOSTAR"?C.green:pitcher.veredicto==="PASAR"?C.red:C.yellow}}>{pitcher.veredicto==="APOSTAR"?"✓ APOSTAR":pitcher.veredicto==="PASAR"?"✗ PASAR":"⚠ ESPERAR"}</div></div>}
        </div>
      )}
      {!pitcher&&!pitcherLoad&&<div style={{textAlign:"center",padding:32,fontSize:"0.65rem",color:C.dim,fontFamily:"monospace",lineHeight:1.8}}>Ingresa nombre del pitcher</div>}
    </div>
  );

  const Compare = () => {
    const mC=(m)=>m==="SUBIENDO"?C.green:m==="BAJANDO"?C.red:C.yellow;
    const vC=(v)=>v==="EXCELENTE"||v==="BUENO"?C.green:v==="NEUTRAL"?C.yellow:C.red;
    const scC=(s)=>{const n=parseInt(s);return n>=75?C.green:n>=60?C.yellow:C.red;};
    return(
      <div style={S.page}>
        <div style={S.sec}>Comparar 2 Picks<div style={S.line}/></div>
        <div style={{...S.card,padding:14}}>
          <div style={{fontSize:"0.52rem",fontFamily:"monospace",color:C.green,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Pick A</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <div><label style={S.lbl}>Equipo</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} placeholder="Dodgers" value={cmpForm.t1} onChange={e=>setCmpForm(f=>({...f,t1:e.target.value}))}/></div>
            <div><label style={S.lbl}>Rival</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} placeholder="Angels" value={cmpForm.r1} onChange={e=>setCmpForm(f=>({...f,r1:e.target.value}))}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={S.lbl}>Odds</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} placeholder="-196" value={cmpForm.o1} onChange={e=>setCmpForm(f=>({...f,o1:e.target.value}))}/></div>
          </div>
          <div style={{borderTop:`1px solid ${C.b1}`,paddingTop:10,marginBottom:10}}>
            <div style={{fontSize:"0.52rem",fontFamily:"monospace",color:C.yellow,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Pick B</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div><label style={S.lbl}>Equipo</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} placeholder="Rays" value={cmpForm.t2} onChange={e=>setCmpForm(f=>({...f,t2:e.target.value}))}/></div>
              <div><label style={S.lbl}>Rival</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} placeholder="Marlins" value={cmpForm.r2} onChange={e=>setCmpForm(f=>({...f,r2:e.target.value}))}/></div>
              <div style={{gridColumn:"1/-1"}}><label style={S.lbl}>Odds</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} placeholder="-138" value={cmpForm.o2} onChange={e=>setCmpForm(f=>({...f,o2:e.target.value}))}/></div>
            </div>
          </div>
          {picks.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:"0.5rem",fontFamily:"monospace",color:C.dim,textTransform:"uppercase",marginBottom:6}}>Cargar picks</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{picks.map((p,i)=><button key={i} style={{...S.btnSm(false),fontSize:"0.52rem",padding:"3px 8px"}} onClick={()=>setCmpForm(f=>f.t1?{...f,t2:p.team,r2:p.rival,o2:p.odds||""}:{...f,t1:p.team,r1:p.rival,o1:p.odds||""})}>{p.team.split(" ").slice(-1)[0]}</button>)}</div></div>}
          <button onClick={comparePicks} disabled={compareLoad} style={{...S.btn(),...(compareLoad?{opacity:0.4,cursor:"not-allowed"}:{})}}>{compareLoad?"Comparando...":"Comparar con IA"}</button>
        </div>
        {compareLoad&&<Spin text="Analizando los dos picks..."/>}
        {compare&&!compareLoad&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[{pick:compare.a,label:"A",col:C.green,win:compare.ganador==="A"},{pick:compare.b,label:"B",col:C.yellow,win:compare.ganador==="B"}].map((side,i)=>(
                <div key={i} style={{background:side.win?"rgba(200,241,53,0.06)":C.s2,border:`2px solid ${side.win?C.green:C.b2}`,borderRadius:8,padding:12,position:"relative"}}>
                  {side.win&&<div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:C.green,color:"#000",fontSize:"0.48rem",fontWeight:"bold",padding:"2px 10px",borderRadius:10,fontFamily:"monospace",whiteSpace:"nowrap"}}>GANADOR</div>}
                  <div style={{fontSize:"0.52rem",fontFamily:"monospace",color:side.col,textTransform:"uppercase",marginBottom:4}}>Pick {side.label}</div>
                  <div style={{fontWeight:700,fontSize:"0.85rem",marginBottom:2}}>{side.pick.team}</div>
                  <div style={{fontSize:"0.6rem",color:C.dim,marginBottom:8}}>vs {side.pick.rival}{side.pick.odds?` · ${side.pick.odds}`:""}</div>
                  <div style={{fontFamily:"Georgia,serif",fontSize:"2rem",fontWeight:"bold",color:scC(side.pick.score),textAlign:"center",lineHeight:1,marginBottom:4}}>{side.pick.score}</div>
                  <div style={{fontSize:"0.48rem",color:C.dim,fontFamily:"monospace",textTransform:"uppercase",textAlign:"center",marginBottom:8}}>Puntaje /100</div>
                  {[{l:"Pitcher",v:side.pick.pitcher},{l:"Record",v:side.pick.record},{l:"Momentum",v:side.pick.momentum,c:mC(side.pick.momentum)},{l:"Valor odds",v:side.pick.valor,c:vC(side.pick.valor)}].map((row,j)=>(
                    <div key={j} style={{padding:"4px 0",borderTop:`1px solid ${C.b1}`}}>
                      <div style={{fontSize:"0.44rem",color:C.dim,fontFamily:"monospace",textTransform:"uppercase"}}>{row.l}</div>
                      <div style={{fontSize:"0.65rem",color:row.c||C.text,marginTop:1}}>{row.v||"—"}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{...S.card,borderLeft:`3px solid ${C.green}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontWeight:700,fontSize:"0.9rem"}}>{compare.ganador==="A"?compare.a.team:compare.b.team} es mejor</div>
                <span style={S.badge(compare.diferencia==="CLARA"?C.green:C.yellow)}>{compare.diferencia}</span>
              </div>
              <div style={{fontSize:"0.8rem",lineHeight:1.6,marginBottom:10}}>{compare.razon}</div>
              {compare.advertencia&&compare.advertencia!=="Sin advertencias"&&<div style={{background:"rgba(241,192,53,0.08)",border:`1px solid rgba(241,192,53,0.2)`,borderRadius:4,padding:"8px 10px",marginBottom:10}}><div style={{fontSize:"0.52rem",fontFamily:"monospace",color:C.yellow,marginBottom:2}}>⚠ ADVERTENCIA</div><div style={{fontSize:"0.7rem"}}>{compare.advertencia}</div></div>}
              <button onClick={()=>{const win=compare.ganador==="A"?compare.a:compare.b;togT({team:win.team,rival:win.rival,pick:"ML",conf:"ALTO",hora:"Hoy",odds:win.odds});}} style={S.btn()}>+ Agregar al Ticket</button>
            </div>
          </>
        )}
        {!compare&&!compareLoad&&<div style={{textAlign:"center",padding:32,fontSize:"0.65rem",color:C.dim,fontFamily:"monospace",lineHeight:1.8}}>Ingresa dos picks<br/>y la IA decide cual es mejor</div>}
      </div>
    );
  };

  const OU = () => {
    const oC=(v)=>v==="OVER"?C.red:v==="UNDER"?C.blue:C.yellow;
    const oI=(v)=>v==="OVER"?"↑":v==="UNDER"?"↓":"→";
    return(
      <div style={S.page}>
        <div style={S.sec}>Detector Over/Under<div style={S.line}/></div>
        <div style={{...S.card,padding:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <div><label style={S.lbl}>Equipo Local</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} placeholder="Dodgers" value={ouForm.team1} onChange={e=>setOuForm(f=>({...f,team1:e.target.value}))}/></div>
            <div><label style={S.lbl}>Visitante</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} placeholder="Angels" value={ouForm.team2} onChange={e=>setOuForm(f=>({...f,team2:e.target.value}))}/></div>
            <div><label style={S.lbl}>Total kiosko</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} placeholder="8.5" value={ouForm.total} onChange={e=>setOuForm(f=>({...f,total:e.target.value}))}/></div>
            <div><label style={S.lbl}>Hora</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} placeholder="7:10 PM" value={ouForm.hora} onChange={e=>setOuForm(f=>({...f,hora:e.target.value}))}/></div>
          </div>
          {picks.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:"0.5rem",fontFamily:"monospace",color:C.dim,textTransform:"uppercase",marginBottom:6}}>Cargar picks</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{picks.map((p,i)=><button key={i} onClick={()=>setOuForm(f=>({...f,team1:p.isHome?p.team:p.rival,team2:p.isHome?p.rival:p.team,hora:p.hora}))} style={{...S.btnSm(ouForm.team1===(p.isHome?p.team:p.rival)),fontSize:"0.52rem",padding:"3px 8px"}}>{p.team.split(" ").slice(-1)[0]} vs {p.rival.split(" ").slice(-1)[0]}</button>)}</div></div>}
          <button onClick={analyzeOU} disabled={ouLoad} style={{...S.btn(),...(ouLoad?{opacity:0.4,cursor:"not-allowed"}:{})}}>{ouLoad?"Analizando...":"Analizar Over/Under"}</button>
        </div>
        {ouLoad&&<Spin text="Buscando pitchers y promedios..."/>}
        {ou&&!ouLoad&&(
          <>
            <div style={{...S.card,borderLeft:`3px solid ${oC(ou.valor)}`,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div><div style={{fontSize:"0.52rem",fontFamily:"monospace",color:C.dim,textTransform:"uppercase",marginBottom:4}}>Total: {ou.total}</div><div style={{fontWeight:700,fontSize:"0.9rem"}}>{ou.team1} vs {ou.team2}</div></div>
                <div style={{textAlign:"center"}}><div style={{fontFamily:"Georgia,serif",fontSize:"2.5rem",fontWeight:"bold",color:oC(ou.valor),lineHeight:1}}>{oI(ou.valor)}</div><span style={S.badge(oC(ou.valor))}>{ou.valor}</span></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
                <Stat val={ou.totalEsperado} lbl="Esperado" col={parseFloat(ou.totalEsperado)>parseFloat(ou.total)?C.red:C.blue}/>
                <Stat val={ou.carreras1} lbl={`RPG ${ou.team1.split(" ").slice(-1)[0]}`}/>
                <Stat val={ou.carreras2} lbl={`RPG ${ou.team2.split(" ").slice(-1)[0]}`}/>
              </div>
              <div style={{background:C.bg,border:`1px solid ${C.b1}`,borderRadius:4,padding:"8px 10px",marginBottom:8,fontSize:"0.7rem"}}>⚾ {ou.team1.split(" ").slice(-1)[0]}: {ou.pitcher1}<br/>⚾ {ou.team2.split(" ").slice(-1)[0]}: {ou.pitcher2}</div>
              {ou.clima&&<div style={{fontSize:"0.65rem",color:C.dim,marginBottom:4}}>☁ {ou.clima}</div>}
              {ou.historial&&<div style={{fontSize:"0.65rem",color:C.dim,marginBottom:4}}>📊 Historial: {ou.historial}</div>}
              {ou.tendencia&&<div style={{fontSize:"0.65rem",color:C.dim,marginBottom:8}}>📈 Tendencia: {ou.tendencia}</div>}
              <div style={{fontSize:"0.8rem",lineHeight:1.6,borderTop:`1px solid ${C.b1}`,paddingTop:10,marginBottom:10}}>{ou.razon}</div>
              <div style={{textAlign:"center",padding:"12px",borderRadius:6,background:`${oC(ou.valor)}10`,border:`1px solid ${oC(ou.valor)}30`}}>
                <div style={{fontWeight:"bold",fontSize:"1.2rem",color:oC(ou.valor)}}>{oI(ou.valor)} {ou.pick}</div>
                <div style={{fontSize:"0.52rem",fontFamily:"monospace",color:C.dim,marginTop:3}}>Confianza: {ou.confianza}</div>
              </div>
            </div>
            <div style={{...S.card,padding:"12px 14px"}}><div style={{fontSize:"0.52rem",fontFamily:"monospace",color:C.dim,textTransform:"uppercase",marginBottom:8}}>Como apostar en Boyd</div><div style={{fontSize:"0.72rem",lineHeight:1.8}}>1. Busca <b style={{color:C.green}}>{ou.team1} At {ou.team2}</b><br/>2. Selecciona <b style={{color:oC(ou.valor)}}>{ou.valor} {ou.total}</b><br/>3. Ingresa monto y confirma</div></div>
          </>
        )}
        {!ou&&!ouLoad&&<div style={{textAlign:"center",padding:32,fontSize:"0.65rem",color:C.dim,fontFamily:"monospace",lineHeight:1.8}}>Ingresa el juego y el total<br/>para analizar Over/Under</div>}
      </div>
    );
  };

  const Kelly = () => {
    const k=kelly;
    return(
      <div style={S.page}>
        <div style={S.sec}>Calculadora Kelly<div style={S.line}/></div>
        <div style={{background:"rgba(200,241,53,0.05)",border:`1px solid rgba(200,241,53,0.15)`,borderRadius:6,padding:"10px 14px",marginBottom:12,fontSize:"0.68rem",lineHeight:1.7,color:"#bbb"}}>Kelly te dice exactamente cuanto apostar segun tu ventaja real. Sobreapuesta y te quiebras. Subaposte y dejas dinero.</div>
        <div style={{...S.card,padding:14,marginBottom:12}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <div><label style={S.lbl}>Odds del kiosko</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} placeholder="-196" value={kellyForm.odds} onChange={e=>setKellyForm(f=>({...f,odds:e.target.value}))}/></div>
            <div><label style={S.lbl}>Bankroll ($)</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} type="number" placeholder="500" value={kellyForm.bankroll} onChange={e=>setKellyForm(f=>({...f,bankroll:e.target.value}))}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={S.lbl}>Tu probabilidad estimada (%)</label><input style={{...S.inp,padding:"8px 10px",fontSize:14}} type="number" placeholder="ej. 65" value={kellyForm.prob} onChange={e=>setKellyForm(f=>({...f,prob:e.target.value}))}/></div>
          </div>
          {picks.length>0&&<div style={{marginBottom:10}}><div style={{fontSize:"0.5rem",fontFamily:"monospace",color:C.dim,textTransform:"uppercase",marginBottom:6}}>Cargar desde picks</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{picks.filter(p=>p.prob).map((p,i)=><button key={i} onClick={()=>setKellyForm(f=>({...f,prob:p.prob?.replace("%","")||""}))} style={{...S.btnSm(false),fontSize:"0.52rem",padding:"3px 8px"}}>{p.team.split(" ").slice(-1)[0]} {p.prob}</button>)}</div></div>}
          <button onClick={calcKelly} style={S.btn()}>Calcular</button>
        </div>
        {k&&(
          <>
            <div style={{...S.card,borderLeft:`3px solid ${k.hasEdge?C.green:C.red}`,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div><div style={{fontSize:"0.52rem",fontFamily:"monospace",color:C.dim,textTransform:"uppercase",marginBottom:2}}>Edge</div><div style={{fontFamily:"Georgia,serif",fontSize:"2rem",fontWeight:"bold",color:k.hasEdge?C.green:C.red,lineHeight:1}}>{k.hasEdge?"+":""}{k.edge}%</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:"0.52rem",fontFamily:"monospace",color:C.dim}}>Prob odds · Tu estimado</div><div style={{fontFamily:"monospace",fontSize:"1rem",fontWeight:"bold",color:C.yellow}}>{k.impl}% · <span style={{color:C.green}}>{k.prob}%</span></div></div>
              </div>
              {!k.hasEdge&&<div style={{background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:4,padding:"8px 10px"}}><div style={{fontWeight:"bold",fontSize:"0.8rem",color:C.red}}>✗ SIN VENTAJA — No apostar</div></div>}
            </div>
            {k.hasEdge&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                {[{label:"Full Kelly",pct:k.fk+"%",amt:"$"+k.betF,col:C.red,desc:"Maximo — riesgoso",rec:k.rec==="FULL"},{label:"Half Kelly",pct:k.hk+"%",amt:"$"+k.betH,col:C.yellow,desc:"Equilibrado",rec:k.rec==="HALF"},{label:"1/4 Kelly",pct:k.qk+"%",amt:"$"+k.betQ,col:C.green,desc:"Conservador",rec:k.rec==="QUARTER"}].map((s,i)=>(
                  <div key={i} style={{background:s.rec?"rgba(200,241,53,0.08)":C.s2,border:`2px solid ${s.rec?C.green:C.b2}`,borderRadius:6,padding:"10px 8px",textAlign:"center",position:"relative"}}>
                    {s.rec&&<div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",background:C.green,color:"#000",fontSize:"0.42rem",fontWeight:"bold",padding:"1px 8px",borderRadius:8,fontFamily:"monospace",whiteSpace:"nowrap"}}>OPTIMO</div>}
                    <div style={{fontSize:"0.46rem",fontFamily:"monospace",color:C.dim,textTransform:"uppercase",marginBottom:4}}>{s.label}</div>
                    <div style={{fontFamily:"monospace",fontSize:"0.85rem",fontWeight:"bold",color:s.col,marginBottom:2}}>{s.pct}</div>
                    <div style={{fontFamily:"Georgia,serif",fontSize:"1.3rem",fontWeight:"bold",color:C.text,lineHeight:1,marginBottom:4}}>{s.amt}</div>
                    <div style={{fontSize:"0.44rem",color:C.dim,fontFamily:"monospace"}}>{s.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {!k&&<div style={{textAlign:"center",padding:32,fontSize:"0.65rem",color:C.dim,fontFamily:"monospace",lineHeight:1.8}}>Ingresa odds, bankroll y probabilidad<br/>para calcular el monto optimo</div>}
      </div>
    );
  };

  const History = () => {
    const res=history.filter(p=>p.result!=="pending");
    const wins=res.filter(p=>p.result==="win").length;
    const pct=res.length>0?Math.round(wins/res.length*100):0;
    const net=res.reduce((a,p)=>{if(p.result==="win"&&p.odds){const n=parseFloat(p.odds),w2=parseFloat(p.wager||50);return a+(!isNaN(n)?(n>0?w2*n/100:w2*100/Math.abs(n)):w2);}return a-parseFloat(p.wager||50);},0);
    const bySport=["MLB","NBA"].map(sp=>{const s=res.filter(p=>p.sport===sp||(!p.sport&&sp==="MLB"));const w=s.filter(p=>p.result==="win").length;return{sport:sp,total:s.length,wins:w,pct:s.length>0?Math.round(w/s.length*100):null};}).filter(s=>s.total>0);
    return(
      <div style={S.page}>
        <div style={S.sec}>Historial<div style={S.line}/></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>
          <Stat val={history.length} lbl="Total"/><Stat val={wins} lbl="Ganados" col={C.green}/><Stat val={res.length-wins} lbl="Perdidos" col={C.red}/><Stat val={res.length>0?pct+"%":"—"} lbl="Precision" col={pct>=60?C.green:pct>=50?C.yellow:C.red}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          <div style={{...S.card,padding:"12px 14px"}}><div style={{fontSize:"0.5rem",fontFamily:"monospace",color:C.dim,textTransform:"uppercase",marginBottom:4}}>Ganancia Neta</div><div style={{fontFamily:"Georgia,serif",fontSize:"1.5rem",fontWeight:"bold",color:net>=0?C.green:C.red,lineHeight:1}}>{net>=0?"+":"-"}${Math.abs(net).toFixed(0)}</div></div>
          {bySport.length>0&&<div style={{...S.card,padding:"12px 14px"}}><div style={{fontSize:"0.5rem",fontFamily:"monospace",color:C.dim,textTransform:"uppercase",marginBottom:6}}>Por Deporte</div>{bySport.map((s,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:"0.7rem"}}>{s.sport}</span><span style={{fontFamily:"monospace",fontSize:"0.7rem",color:s.pct>=60?C.green:C.yellow}}>{s.wins}-{s.total-s.wins} · {s.pct}%</span></div>)}</div>}
        </div>
        <button onClick={genWeekly} disabled={weekLoad||!history.length} style={{...S.btn(C.s2,C.dim),...{border:`1px solid ${C.b2}`},...(weekLoad||!history.length?{opacity:0.4,cursor:"not-allowed"}:{})}}>{weekLoad?"Generando...":"📋 Reporte Semanal"}</button>
        {weekLoad&&<Spin text="Analizando tu semana..."/>}
        {weekRep&&!weekLoad&&(
          <div style={{...S.card,borderLeft:`3px solid ${C.green}`,marginBottom:12}}>
            <div style={{fontWeight:700,fontSize:"0.95rem",marginBottom:6}}>{weekRep.titulo}</div>
            <div style={{fontSize:"0.78rem",lineHeight:1.6,marginBottom:8}}>{weekRep.resumen}</div>
            {[{i:"🏆",l:"Mejor momento",v:weekRep.mejor},{i:"📉",l:"Area de mejora",v:weekRep.mejora},{i:"🔍",l:"Patron",v:weekRep.patron},{i:"💡",l:"Consejo",v:weekRep.consejo},{i:"📈",l:"Proyeccion",v:weekRep.proyeccion}].map((s,j)=>(
              <div key={j} style={{padding:"7px 0",borderTop:`1px solid ${C.b1}`,display:"flex",gap:6}}><span style={{fontSize:"0.8rem",flexShrink:0}}>{s.i}</span><div><div style={{fontSize:"0.48rem",fontFamily:"monospace",color:C.dim,textTransform:"uppercase",marginBottom:2}}>{s.l}</div><div style={{fontSize:"0.72rem",lineHeight:1.5}}>{s.v}</div></div></div>
            ))}
          </div>
        )}
        <div style={S.sec}>Agregar Pick<div style={S.line}/></div>
        <div style={{...S.card,marginBottom:14}}><PickForm onSave={saveH}/></div>
        <div style={S.sec}>Picks<div style={S.line}/></div>
        {history.length===0?<div style={{textAlign:"center",padding:20,fontSize:"0.65rem",color:C.dim,fontFamily:"monospace"}}>Sin picks registrados</div>:history.map((p)=>(
          <div key={p.id} style={{...S.card,padding:"11px 14px",marginBottom:6,borderLeft:`3px solid ${p.result==="win"?C.green:p.result==="loss"?C.red:C.dim}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontWeight:600,fontSize:"0.88rem"}}>{p.team} {p.pick}</div><div style={{fontSize:"0.6rem",color:C.dim,marginTop:2}}>vs {p.rival} · {p.date} · {p.sport}{p.odds?` · ${p.odds}`:""}</div></div>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                {p.result==="pending"?(<><button onClick={()=>updH(p.id,"win")} style={{...S.btnSm(false),color:C.green,borderColor:C.green,padding:"3px 8px"}}>W</button><button onClick={()=>updH(p.id,"loss")} style={{...S.btnSm(false),color:C.red,borderColor:C.red,padding:"3px 8px"}}>L</button></>):<span style={S.badge(p.result==="win"?C.green:C.red)}>{p.result==="win"?"GANADO":"PERDIDO"}</span>}
                <button onClick={()=>delH(p.id)} style={{background:"none",border:"none",color:C.dim,cursor:"pointer",fontSize:"0.8rem"}}>✕</button>
              </div>
            </div>
          </div>
        ))}
        {history.length>0&&<button onClick={()=>{setHistory([]);localStorage.removeItem("ap_h");}} style={S.btn(C.red)}>Limpiar Historial</button>}
      </div>
    );
  };

  const navLabel = (n) => {
    if(n.k==="ticket"&&ticket.length>0) return `${n.l} (${ticket.length})`;
    if(n.k==="monitor"&&scoreAlerts.length>0) return `${n.l} (${scoreAlerts.length})`;
    if(n.k==="monitor"&&monOn) return `${n.l} •`;
    return n.l;
  };

  return (
    <div style={S.app}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
      <div style={S.hdr}>
        <div style={S.logo}>AgentePicks<span style={S.sub}>MLB · NBA · {dateStr}</span></div>
        <div style={{fontSize:"0.58rem",color:C.dim,fontFamily:"monospace",textAlign:"right"}}>{timeStr}<br/><span style={{color:ticket.length>0?C.yellow:C.dim}}>{ticket.length>0?`${ticket.length} en ticket`:"Sin ticket"}</span></div>
      </div>
      {tab==="home"&&<Home/>}
      {tab==="ticket"&&<Ticket/>}
      {tab==="monitor"&&<Monitor/>}
      {tab==="pitcher"&&<Pitcher/>}
      {tab==="compare"&&<Compare/>}
      {tab==="ou"&&<OU/>}
      {tab==="kelly"&&<Kelly/>}
      {tab==="history"&&<History/>}
      <div style={S.nav}>
        {NAV.map(n=>(
          <button key={n.k} style={S.navB(tab===n.k)} onClick={()=>setTab(n.k)}>
            <span style={{fontSize:"0.9rem",lineHeight:1}}>{n.i}</span>
            {navLabel(n)}
          </button>
        ))}
      </div>
    </div>
  );
}
