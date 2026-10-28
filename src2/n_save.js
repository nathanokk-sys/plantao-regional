/* ===== SALVAMENTO AUTOMÁTICO (no navegador) ===== */
function saveGame(){
  if(!G||G.over)return;
  try{
    const g=Object.assign({},G);
    g.pts=G.pts.map(P=>{const o=Object.assign({},P);o.asked=[...P.asked];o.examined=[...P.examined];o.orient=[...P.orient];delete o.off;return o});
    g.sched=G.sched.map(it=>Object.assign({},it,{P:it.P.id}));
    const evd=G.evs.map(e=>!!e.done);delete g.evs;
    localStorage.setItem('pr_cur',JSON.stringify({v:1,G:g,evd,tab:UI.tab}));
  }catch(e){}
}
function loadGame(){
  try{
    const S=JSON.parse(localStorage.getItem('pr_cur')||'null');if(!S||!S.G)return false;
    const g=S.G;g.evs=mkEvs(g.mode,g.posto).map((e,i)=>Object.assign(e,{done:!!(S.evd||[])[i]}));
    g.pts.forEach(P=>{P.asked=new Set(P.asked);P.examined=new Set(P.examined);P.orient=new Set(P.orient);P.mov=P.mov||{}});
    G=g;if(!G.beds.ama)G.beds.ama={cap:8,used:5};G.pts.forEach(P=>{P.off=sprite(P)});
    G.sched=G.sched.map(it=>Object.assign(it,{P:pt(it.P)})).filter(it=>it.P);
    UI.tab=S.tab||'anam';UI.destSel=null;UI.news=false;UI.menu=false;UI.msg='';UI.msg2='';
    return true;
  }catch(e){return false}
}
function saveInfo(){
  try{const S=JSON.parse(localStorage.getItem('pr_cur')||'null');if(!S||!S.G)return null;const g=S.G;
    const done=g.pts.filter(p=>p.st==='done'||p.st==='dead').length;
    return(g.mode==='visit'?'Turno de '+(g.turn==='uti'?'UTI':'enfermaria'):'Plantão '+g.n)+' · '+fmt(g.t)+' · '+done+' de '+g.slots.length+' pacientes resolvidos'}catch(e){return null}
}
function nextN(){try{return(JSON.parse(localStorage.getItem('pr_save')||'{"shifts":[]}').shifts.length||0)+1}catch(e){return 1}}
function resetAll(){['pr_cur','pr_save','pr_hist','pr_used','pr_week'].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});G=null;W=null;UI.menu=false;UI.confirmReset=false}
