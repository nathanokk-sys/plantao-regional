/* ===== SALVAMENTO AUTOMÁTICO (no navegador) ===== */
function mkEvs(){return[
  {at:18,run:()=>{G.off.trop={until:G.t+120,why:'Reagente de troponina em falta. Previsão em 2 h.'};alert_(fmt(G.t)+' Laboratório: troponina indisponível por 2 horas.',true)}},
  {at:75,run:()=>{G.modal={k:'dil'};if(window.sfx)sfx('alarm')}},
  {at:130,run:()=>{if(G.beds.uti.used>0)G.beds.uti.used--;alert_(fmt(G.t)+' UTI: um leito foi liberado.')}},
  {at:150,run:()=>{G.beds.enf.used=Math.max(0,G.beds.enf.used-2);alert_(fmt(G.t)+' Enfermaria: duas altas, dois leitos liberados.')}},
  {at:250,run:()=>{G.beds.enf.used=Math.max(0,G.beds.enf.used-2);if(G.beds.ama)G.beds.ama.used=Math.max(0,G.beds.ama.used-1);alert_(fmt(G.t)+' Enfermaria e sala amarela liberaram leitos.')}}]}
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
    const g=S.G;g.evs=mkEvs().map((e,i)=>Object.assign(e,{done:!!(S.evd||[])[i]}));
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
    return'Plantão '+g.n+' · '+fmt(g.t)+' · '+done+' de '+g.slots.length+' pacientes resolvidos'}catch(e){return null}
}
function nextN(){try{return(JSON.parse(localStorage.getItem('pr_save')||'{"shifts":[]}').shifts.length||0)+1}catch(e){return 1}}
function resetAll(){['pr_cur','pr_save','pr_hist','pr_used'].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});G=null;UI.menu=false;UI.confirmReset=false}
function introHtml(){
  const sv=saveInfo(),mid=G&&!G.over;
  let hist='';try{const s=JSON.parse(localStorage.getItem('pr_save')||'{"shifts":[]}');if(s.shifts.length){const l=s.shifts[s.shifts.length-1];hist='<p>Plantões concluídos: <b>'+s.shifts.length+'</b>. Último: nota <b>'+l.score+'</b>, reputação '+l.rep+'.</p>'}}catch(e){}
  let btns='';
  if(mid)btns+='<button class="btn red" data-a="closemenu">Voltar ao plantão</button>';
  else if(sv)btns+='<button class="btn red" data-a="cont">Continuar plantão</button>';
  btns+='<button class="btn'+(sv||mid?'':' red')+'" data-a="start:proc">'+(sv||mid?'Novo plantão':'Iniciar plantão '+nextN())+'</button>';
  btns+='<button class="btn" data-a="reset">Começar do zero</button>';
  const conf=UI.confirmReset?'<div class="doc" style="border:3px double #9c2a1a;margin-top:10px"><p class="warn"><b>Começar do zero apaga tudo:</b> o plantão em andamento, as notas dos plantões concluídos e o histórico de pacientes e quadros já vistos. A trilha sonora escolhida continua.</p><div class="row"><button class="btn red" data-a="resetok">Apagar tudo e começar do zero</button><button class="btn paper" data-a="resetno">Cancelar</button></div></div>':'';
  return'<article class="doc px card"><h3>Hospital Regional <span>'+(mid?'Menu':'Parte 5 do protótipo')+'</span></h3><div class="big">PLANTÃO<br>REGIONAL</div>'
   +(mid?'':'<p>Você é o médico de Clínica Médica de um hospital regional do SUS no Vale do São Francisco. A noite é de superlotação, poucos leitos e decisões rápidas. Todos os pacientes têm 16 anos ou mais.</p>'
   +'<ul><li>Clique no rosto na fila para chamar um paciente. Vermelhos e laranjas pioram se esperarem.</li><li>Pergunte, examine, peça exames, prescreva com dose, via, frequência e duração, e defina o destino.</li><li>Cada ação consome tempo de jogo; o básico (monitor, acesso, O2) é feito pela enfermagem, sem custo. O diagnóstico nunca é revelado.</li><li>No fim, o relatório mostra acertos, erros evitáveis e o que ficou pendente.</li></ul>'
   +'<p>A cada plantão chegam 9 pacientes novos, sorteados de '+CASES.length+' quadros clínicos. Tudo roda no seu navegador, sem usar o Claude.</p>')
   +hist+(sv?'<p>Plantão salvo: <b>'+esc(sv)+'</b>. O jogo salva sozinho a cada ação.</p>':'')
   +((sv||mid)?'<p style="color:var(--ink2)">Iniciar um novo plantão descarta o plantão em andamento.</p>':'')
   +'<div class="row">'+btns+'</div>'+conf+'</article>';
}
