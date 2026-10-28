/* ===== INTERFACE: estação de trabalho do médico ===== */
const UI={tab:'anam',F:{drug:'',dose:0,via:0,freq:'',dur:''},destSel:null,msg:'',snd:true};
/* som sintetizado (começa depois do primeiro clique) */
let AC=null;
function tn(f,d,ty,v,w,sl){if(!UI.snd||!AC)return;try{const t=AC.currentTime+(w||0),o=AC.createOscillator(),g=AC.createGain();o.type=ty||'square';o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(sl,t+d);g.gain.setValueAtTime(v||.04,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
window.sfx=k=>{if(!UI.snd||!AC)return;
  if(k==='click')tn(1300,.03,'square',.02);
  if(k==='blip')tn(700,.07,'square',.03);
  if(k==='alarm'){[0,.18,.36].forEach(w=>tn(980,.1,'square',.04,w))}
  if(k==='stamp'){tn(120,.18,'sine',.25,0,50)}
  if(k==='good'){tn(660,.12,'triangle',.06);tn(990,.2,'triangle',.06,.12)}
  if(k==='mid')tn(520,.25,'triangle',.06);
  if(k==='bad'){tn(330,.25,'sawtooth',.04,0,200);tn(200,.4,'sawtooth',.04,.2,120)}
  if(k==='flat')tn(900,1.4,'sine',.05);
  if(k==='bell'){[0,.5,1].forEach(w=>tn(880,1,'sine',.06,w))}};
const trLbl=t=>({VERMELHO:'Vermelho',LARANJA:'Laranja',AMARELO:'Amarelo',VERDE:'Verde',AZUL:'Azul'})[t];
const vAbn=(i,x)=>i===0?(+String(x).split('/')[0]>=180||+String(x).split('/')[0]<=95):i===1?(x>=110||x<=55):i===2?(x>=24||x<=10):i===3?x<=92:(x>=38||x<=35.5);

function renderTop(){
  const b=G.beds,u=k=>k==='emg'?b.emg.bg+active().length:b[k].used,ch=(n,k)=>{const x=u(k),c=b[k].cap;return'<span class="chip'+(x>=c?' full':'')+'">'+n+' <b>'+x+'/'+c+'</b></span>'};
  const m=(n,v)=>'<span class="meter">'+n+'<i><b style="width:'+Math.round(clamp(v))+'%"></b></i></span>';
  $('#top').innerHTML='<div class="brand">PLANTÃO REGIONAL<small>Hospital Regional · '+esc(shiftLbl())+'</small></div>'
   +'<div class="lcd" aria-label="Horário">'+fmt(Math.min(G.t,G.end))+'</div>'
   +'<div class="mini">'+ch('Emerg.','emg')+ch('Verde','obs')+ch('Amarela','ama')+ch('Enf.','enf')+ch('UTI','uti')+'<span class="chip">Insumos <b>'+G.ins+'</b></span><span class="chip">Pacientes <b>'+G.pts.filter(p=>p.st!=='wait').length+'/'+G.slots.length+'</b></span></div>'
   +'<div class="mini">'+m('Equipe',G.eq)+m('Reputação',G.rep)+'</div>'
   +'<div class="alerts" aria-live="polite" data-a="news" title="Toque para ver todas as mensagens" style="cursor:pointer">'+G.al.slice(0,3).map(a=>'<div class="'+(a.hot?'hot':'')+'">'+esc(a.txt)+'</div>').join('')+'</div>'
   +'<div class="mini"><button class="btn" data-a="menu">Menu</button><button class="btn'+(G.unread?' amber':'')+'" data-a="news">Mensagens'+(G.unread?' ('+G.unread+')':'')+'</button><button class="btn" data-a="snd" aria-pressed="'+UI.snd+'">Som: '+(UI.snd?'on':'off')+'</button></div><div class="musbox"><label for="trk">Trilha sonora</label><select id="trk" data-s="trk">'+trackSelectHtml()+'</select><div class="np" id="np">'+esc(npText())+'</div><button class="btn" data-a="mus" aria-pressed="'+MUS.on+'">'+(MUS.on?'Pausar música':'Tocar música')+'</button></div>';
}
function renderQueue(){
  const q=$('#queue'),L=active();
  const busy=G.filled<G.slots.length&&!G.pts.some(p=>p.st==='wait'),more=G.slots.length-G.filled;
  if(!L.length){q.innerHTML='<div class="qempty">'+(busy?'A recepção está fichando o próximo paciente…':'Fila vazia. <button class="btn amber" data-a="wait:5">Aguardar 5 min</button>')+(!busy&&more===0&&!G.pts.some(p=>p.st==='wait')?'<button class="btn red" data-a="finish">Encerrar plantão</button>':'')+'</div>';return}
  q.innerHTML=L.map(P=>{
    const w=(P.st==='queue'?Math.max(0,Math.floor(G.t-P.c.arr)):0),tags=[];if(P.returned)tags.push('<u>VOLTOU</u>');
    if(P.newRes>0)tags.push('<u>EX</u>');if(P.st==='reg')tags.push('<u>REG</u>');if(P.st==='emg')tags.push('<u>EMG</u>');
    return'<button class="qc" style="--tc:'+(P.c.visit?'var(--fg2)':'var(--tc-'+P.c.tri+')')+'" data-a="pick:'+P.id+'" aria-pressed="'+(G.act===P.id)+'"><canvas class="qt" data-id="'+P.id+'" width="48" height="48"></canvas><span>'+esc(P.c.nome.split(' ')[0])+'<br>'+P.c.idade+' anos</span><em>'+(P.c.visit?esc(P.c.secLbl||'Internado'):trLbl(P.c.tri))+(P.st==='queue'&&!P.c.visit?' · espera '+w+' min':'')+' '+tags.join('')+'</em></button>'}).join('')+(more>0?'<div class="qempty" style="font-size:17px;padding:0 8px">+'+more+' a caminho</div>':'');
  q.querySelectorAll('canvas.qt').forEach(cv=>{const P=pt(cv.dataset.id),X=cv.getContext('2d');if(X&&P&&P.off){X.imageSmoothingEnabled=false;X.drawImage(P.off,52,18,56,56,0,0,48,48)}});
}
function dlRow(k,v,unk){return'<div><dt>'+k+'</dt><dd'+(unk?' class="unk"':'')+'>'+(unk?'não investigado':esc(v))+'</dd></div>'}
function renderWork(){
  const P=cur(),w=$('#work');
  if(!P){w.innerHTML='<div class="doc px hint" style="color:var(--ink)">'+(active().length?'Chame um paciente da fila clicando no rosto. Pacientes vermelhos e laranjas pioram se esperarem.':'Nenhum paciente na fila no momento.')+'</div>';$('#decide').hidden=true;return}
  const c=P.c,mon=P.mov&&P.mov.mon!=null,v=mon?c.vit[P.stage]:P.lv.v,vs=[['PA','mmHg'],['FC','bpm'],['FR','irpm'],['SatO2','%'],['Temp','°C']];
  const g=k=>P.asked.has('g:'+k);
  const left='<div class="left"><div class="scene px"><canvas id="scene" width="160" height="120" aria-label="Retrato em pixel art de '+esc(c.nome)+'"></canvas></div>'
   +'<div class="doc px"><div class="stamp" style="color:'+(c.visit?'var(--ink2)':'var(--tc-'+c.tri+')')+'">'+(c.visit?'INTERNADO':'TRIAGEM<br>'+c.tri)+'</div><h3>Ficha de admissão <span>Atend. '+(4200+P.no)+'</span></h3>'
   +'<div class="idn">'+esc(c.nome)+'</div><dl class="dl">'+dlRow('Idade',c.idade+' anos · '+(c.sexo==='F'?'feminino':'masculino'))+dlRow('Origem',c.mun)+dlRow('Ocupação',c.ocup)+dlRow('Queixa',c.queixa)
   +dlRow('Doenças',c.comorb,!g('comorb'))+dlRow('Em uso',c.uso,!g('uso'))+(g('alerg')?dlRow('Alergias',c.alergiaTxt):dlRow('Alergias',c.alTri||'Triagem: não informado (reconfirmar)'))+'</dl></div>'
   +'<div class="doc px"><h3>Sinais vitais <span>'+(mon?'monitor contínuo':'aferidos às '+fmt(P.lv.t))+'</span></h3><div class="vit">'
   +vs.map((x,i)=>'<div class="v'+(vAbn(i,v[i])?' abn':'')+'"><label>'+x[0]+'</label><b>'+v[i]+'</b> <small>'+x[1]+'</small></div>').join('')+'</div>'
   +'<div class="row"><button class="btn paper" data-a="vit">Aferir de novo (1 min)</button><button class="btn paper" data-a="reav">Reavaliar (3 min)</button></div></div>'+movHtml(P)+'</div>';
  w.innerHTML=left+'<div class="right"><div class="tabs" role="tablist">'
   +[['anam','Anamnese'],['fis','Exame físico'],['ex','Exames'],['res','Resultados'],['rx','Prescrição'],['proc','Procedimentos e pedidos'],['pront','Prontuário']].map(([k,n])=>'<button class="tab" role="tab" data-a="tab:'+k+'" aria-selected="'+(UI.tab===k)+'">'+n+(k==='res'&&P.newRes>0?' *':'')+'</button>').join('')
   +'</div><div class="doc sheet px" id="sheet">'+tabHtml(P)+'</div></div>';
  renderDecide(P);
}
function logList(P,kind){
  const L=P.log.filter(x=>kind.includes(x.k));
  return L.length?'<ul class="qa">'+L.map(x=>'<li class="'+(x.fresh?'new':'')+'"><b>'+fmt(x.t)+' · '+esc(x.q)+'</b><br>'+esc(x.a)+'</li>').join('')+'</ul>':'<p class="hint" style="padding:6px 0;color:var(--ink2)">Nada registrado ainda.</p>';
}
function tabHtml(P){
  const c=P.c;
  if(UI.tab==='anam'){
    const extra=GEN_Q.filter(g=>!ESSQ.includes(g[0]));
    const qs=[...GEN_Q.filter(g=>ESSQ.includes(g[0])).map(([k,t])=>['g:'+k,t]),...c.perg.map((p,i)=>['p:'+i,p[0]]),...(UI.moreQ?extra.map(([k,t])=>['g:'+k,t]):[])];
    return'<h3>Anamnese dirigida <span>15 s por pergunta</span></h3><div class="grid">'+qs.map(([k,t])=>'<button class="btn paper opt'+(P.asked.has(k)?' on':'')+'" data-a="ask:'+k+'"'+(P.asked.has(k)?' disabled':'')+'>'+esc(t)+'</button>').join('')+'</div><div class="row"><button class="btn paper" data-a="moreq">'+(UI.moreQ?'Menos perguntas':'Mais perguntas ('+extra.length+')')+'</button></div><p class="sub">Respostas</p>'+logList(P,['q']);
  }
  if(UI.tab==='fis')return'<h3>Exame físico por sistemas <span>1 min por sistema</span></h3><div class="grid">'+SYS.map(([k,t])=>'<button class="btn paper opt'+(P.examined.has(k)?' on':'')+'" data-a="sys:'+k+'"'+(P.examined.has(k)?' disabled':'')+'>'+t+'</button>').join('')+'</div><p class="sub">Achados</p>'+logList(P,['x','r']);
  if(UI.tab==='ex'){
    const ids=Object.keys(EXAMS);
    const res=ids.filter(k=>P.ord[k]&&P.ord[k].done);
    return'<h3>Exames <span>insumos: '+G.ins+' de 100 · gastos '+(100-G.ins+(G.overCota||0))+'</span></h3><p style="margin:0 0 8px;color:var(--ink2);font-size:17px">Os insumos são a cota de exames do plantão. Se acabarem, ninguém morre por isso: ficam liberados só os exames de urgência para vermelhos e laranjas. Medidas iniciais (monitor, acesso, O2, glicemia, ECG, isolamento) também gastam insumos; medicações, não.</p><div class="row" style="margin:0 0 8px"><button class="btn paper'+(UI.urg?' on':'')+'" data-a="urg" aria-pressed="'+!!UI.urg+'">'+(UI.urg?'URGÊNCIA ligada: metade do tempo, +1 insumo':'Solicitar com URGÊNCIA')+'</button></div><div class="tabs subt">'+EXGROUPS.map((g,i)=>'<button class="tab" data-a="extab:'+i+'" aria-selected="'+((UI.exTab||0)===i)+'">'+g[0]+(g[1].some(k=>P.ord[k]&&P.ord[k].done)?' ·':'')+'</button>').join('')+'</div>'+(UI.exInfo&&EXINFO[UI.exInfo]?'<div class="infobox"><b>'+EXAMS[UI.exInfo].n+':</b> '+EXINFO[UI.exInfo]+' <button class="btn paper" data-a="exinfo:">Fechar</button></div>':'')+[EXGROUPS[UI.exTab||0]].map(([gn,L])=>'<div class="grid" style="margin-top:8px">'+L.filter(k=>EXAMS[k]).map(k=>{const o=P.ord[k],E=EXAMS[k],off=G.off[k]&&G.t<G.off[k].until;
      const st=o?(o.bad&&o.done?'problema · pedir de novo':o.done?'pronto':'pronto às '+fmt(o.due)):off?'indisponível · '+G.off[k].why:(UI.urg&&E.t>=20?Math.ceil(E.t/2)+' min (urgência) · custo '+(E.c+1):E.t+' min · custo '+E.c);
      return'<div class="exw"><button class="btn paper opt'+(o?' on':'')+(off&&!o?' unav':'')+'" data-a="ord:'+k+'"'+((o&&!(o.bad&&o.done))||off?' disabled':'')+(off&&!o?' title="'+esc(G.off[k].why)+'"':'')+'>'+E.n+'<small>'+st+'</small></button>'+(EXINFO[k]?'<button class="ibtn" data-a="exinfo:'+k+'" aria-label="O que é '+esc(E.n)+'">i</button>':'')+'</div>'}).join('')+'</div>').join('')
     +'<div class="row"><button class="btn paper" data-a="tab:res">Ver resultados ('+res.length+' pronto'+(res.length===1?'':'s')+(P.newRes>0?', novos':'')+')</button></div>';
  }
  if(UI.tab==='res')return resultsHtml(P);
  if(UI.tab==='proc'){const done=id=>P.rx.some(r=>r.id===id);
    return'<h3>Procedimentos <span>tempo de execução realista</span></h3><div class="grid">'+PROCS.map(([id,n,t])=>'<button class="btn paper opt'+(done(id)?' on':'')+'" data-a="proc:'+id+'"'+(done(id)?' disabled':'')+'>'+n+'<small>'+(done(id)?'feito':t+' min')+'</small></button>').join('')+'</div>'
     +'<p class="sub">Pedidos a outros serviços (1 min cada; pedir não garante que aconteça)</p><div class="grid">'+REQS.map(([id,n])=>'<button class="btn paper opt'+(done(id)?' on':'')+'" data-a="req:'+id+'"'+(done(id)?' disabled':'')+'>'+n+'<small>'+(done(id)?'pedido feito':'1 min')+'</small></button>').join('')+'</div>'
     +(UI.msg?'<p class="warn">'+esc(UI.msg)+'</p>':'')+'<p class="sub">Registro</p>'+logList(P,['p']);
  }
  if(UI.tab==='rx'){
    const F=UI.F,D=DRUGS[F.drug],keys=Object.keys(DRUGS).sort((a,b)=>DRUGS[a].n.localeCompare(DRUGS[b].n));
    const ci=Math.min(UI.rxCat||0,CATS.length-1),lst=CATS[ci][1].filter(k=>DRUGS[k]).sort((a,b)=>DRUGS[a].n.localeCompare(DRUGS[b].n,'pt'));
    let h='<h3>Prescrição <span>RENAME / protocolos do SUS</span></h3><div class="tabs subt">'+CATS.map((c,i)=>'<button class="tab" data-a="rxcat:'+i+'" aria-selected="'+(ci===i)+'">'+c[0]+'</button>').join('')+'</div>'
     +'<div class="grid drugs">'+lst.map(k=>{const dis=k!=='o2'&&P.rx.some(r=>r.id===k);return'<button class="btn paper opt'+(F.drug===k?' on':'')+'" data-a="drug:'+k+'"'+(dis?' disabled':'')+'>'+DRUGS[k].n+(dis?'<small>já prescrito</small>':'')+'</button>'}).join('')+'</div>'
     +'<div class="form">'+(D?'<label>Medicamento<b style="font-size:21px;color:var(--ink);text-transform:none;font-weight:400">'+D.n+'</b></label>':'<p style="margin:0;color:var(--ink2)">Escolha um medicamento acima.</p>');
    if(D){
      const fs=Object.keys(FREQ),dr=Object.keys(DUR);
      h+='<label>Dose<select data-s="dose">'+D.d.map((d,i)=>'<option value="'+i+'"'+(F.dose===i?' selected':'')+'>'+esc(d)+'</option>').join('')+'</select></label>'
       +'<label>Via<select data-s="via">'+D.v.map((d,i)=>'<option value="'+i+'"'+(F.via===i?' selected':'')+'>'+d+'</option>').join('')+'</select></label>'
       +'<label>Frequência<select data-s="freq">'+fs.map(k=>'<option value="'+k+'"'+(F.freq===k?' selected':'')+'>'+FREQ[k]+'</option>').join('')+'</select></label>'
       +'<label>Duração<select data-s="dur">'+dr.map(k=>'<option value="'+k+'"'+(F.dur===k?' selected':'')+'>'+DUR[k]+'</option>').join('')+'</select></label>'
       +(isEVrx(D,F.via)?'<label>Diluição<select data-s="dil">'+Object.keys(DIL).map(k=>'<option value="'+k+'"'+(F.dil===k?' selected':'')+'>'+DIL[k]+'</option>').join('')+'</select></label><label>Tempo de infusão<select data-s="inf">'+Object.keys(INF).map(k=>'<option value="'+k+'"'+(F.inf===k?' selected':'')+'>'+INF[k]+'</option>').join('')+'</select></label>':'');
    }
    h+='</div>'+(D&&['hemac','plaq','pfc','crio'].includes(F.drug)?'<p class="infobox">'+HEMOREF+'</p>':'')+(UI.msg?'<p class="warn">'+esc(UI.msg)+'</p>':'')+'<div class="row"><button class="btn paper" data-a="rxgo"'+(D?'':' disabled')+'>Prescrever (1 min)</button></div>';
    const rxLine=r=>{const d=DRUGS[r.id];if(d.v[0]==='Solicitação')return'<b>'+d.n+'</b> · pedido feito <small>('+fmt(r.t)+')</small>';return'<b>'+d.n+'</b> · '+esc(d.d[r.i])+' · '+d.v[r.via||0]+' · '+FREQ[r.freq]+' · '+DUR[r.dur]+(r.dil?' · '+DIL[r.dil]+' · '+INF[r.inf]:'')+(r.ccih?' · <span class="warn">aguardando CCIH</span>':'')+' <small>('+(r.carry?'prescrição anterior':fmt(r.t))+')</small>'};
    h+='<p class="sub">Prescrições ativas</p>'+(P.rx.length?'<ul class="rxl">'+P.rx.map((r,i)=>'<li>'+rxLine(r)+' <button class="btn paper sm" data-a="susp:'+i+'">Suspender</button></li>').join('')+'</ul>':'<p class="hint" style="padding:6px 0;color:var(--ink2)">Nenhuma prescrição.</p>')
     +(P.rxOff&&P.rxOff.length?'<p class="sub">Suspensas</p><ul class="rxl off">'+P.rxOff.map(r=>'<li>'+rxLine(r)+' <small>suspenso às '+fmt(r.off)+'</small></li>').join('')+'</ul>':'');
    return h;
  }
  const log=P.log.slice().reverse();
  return'<h3>Prontuário <span>hipótese e evolução</span></h3><div class="form"><label>Buscar hipótese<input type="search" data-s="dxq" value="'+esc(UI.dxq||'')+'" placeholder="digite parte do nome, ex.: leish"></label><label>Hipótese principal<select data-s="hyp"><option value="">'+(P.hyp?'Ainda sem hipótese':'Escolha na lista')+'</option>'+dxOpts(P,UI.dxq)+'</select></label></div>'+(P.hyp?'<p style="margin:4px 0;font-size:18px">Registrada: <b>'+esc((DXS.find(x=>x[0]===P.hyp)||[0,''])[1])+'</b></p>':'')
   +'<p class="sub">Nota de evolução</p><textarea id="note" data-s="note" placeholder="Registre sua evolução e raciocínio clínico.">'+esc(P.note)+'</textarea>'
   +'<p class="sub">Linha do tempo</p>'+(log.length?'<ul class="qa">'+log.map(x=>'<li><b>'+fmt(x.t)+' · '+esc(x.q)+'</b><br>'+esc(x.a)+'</li>').join('')+'</ul>':'<p class="hint" style="padding:6px 0;color:var(--ink2)">Sem registros.</p>');
}
function renderDecide(P){
  const d=$('#decide');if(!P){d.hidden=true;return}d.hidden=false;
  const info=k=>k==='UTI'?bedFree('uti')+' livres':k==='ENF'?bedFree('enf')+' livres':k==='OBS'?bedFree('obs')+' livres':k==='AMA'?bedFree('ama')+' livres':k==='ALTA'?'liberar o paciente':k==='EMG'?'manter monitorizado':'regulação ~60-100 min';
  d.innerHTML='<h4>CARIMBO DE DESTINO</h4>'+visitHint(P)+'<div class="dests">'+DESTS.map(([k,n])=>{const dis=(k==='UTI'&&bedFree('uti')<=0)||(k==='ENF'&&bedFree('enf')<=0)||(k==='OBS'&&bedFree('obs')<=0)||(k==='AMA'&&bedFree('ama')<=0);
    return'<button class="dest" data-a="dest:'+k+'" aria-pressed="'+(UI.destSel===k)+'"'+(dis?' disabled':'')+'>'+n+'<small>'+(dis?'lotado':info(k))+'</small></button>'}).join('')+'</div>'
   +(UI.destSel==='ALTA'?'<div class="orient">'+ORIENT.map(([k,n])=>'<label><input type="checkbox" data-s="or" value="'+k+'"'+(P.orient.has(k)?' checked':'')+'> '+n+'</label>').join('')+'</div>'+altaHtml(P):'')
   +(UI.msg2?'<p class="warn" style="color:#f0a79b;margin:0">'+esc(UI.msg2)+'</p>':'')
   +'<div class="row" style="margin:0"><button class="btn red" data-a="commit"'+(UI.destSel?'':' disabled')+'>Carimbar e despachar</button><button class="btn amber" data-a="wait:5">Aguardar 5 min</button></div>';
}
function altaHtml(P){
  const home=P.rx.filter(r=>{const D=DRUGS[r.id];return D&&D.v[0]!=='Solicitação'&&!isEVrx(D,r.via)&&!['IM'].includes(D.v[r.via||0])&&r.id!=='o2'&&(r.dur!=='u'||r.freq==='u')}),ev=P.rx.filter(r=>{const D=DRUGS[r.id];return D&&isEVrx(D,r.via)&&r.freq!=='u'&&!['u','h24'].includes(r.dur)});
  return'<div class="receita"><label>Retorno<select data-s="ret"><option value="">— escolha —</option>'+RET.map(([k,n])=>'<option value="'+k+'"'+(P.ret===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
   +'<p><b>Receita de alta (uso em casa):</b> '+(home.length?home.map(r=>DRUGS[r.id].n+' '+DRUGS[r.id].d[r.i]+' '+DRUGS[r.id].v[r.via||0]+' '+FREQ[r.freq].toLowerCase()+' por '+DUR[r.dur].toLowerCase()).map(esc).join('; '):'nenhum remédio por via oral. Para incluir, prescreva VO com duração em dias na aba Prescrição.')+'</p>'
   +(ev.length?'<p class="warn">Em uso EV contínuo: '+ev.map(r=>esc(DRUGS[r.id].n)).join(', ')+'. Em casa não há acesso venoso: suspenda e troque por VO.</p>':'')+'</div>';
}
function renderVeil(){
  const v=$('#veil');
  if(UI.menu){v.hidden=false;v.innerHTML=introHtml();return}
  if(UI.weekRep&&W){v.hidden=false;v.innerHTML=weekReportHtml();return}
  if(G&&UI.news&&!G.over){v.hidden=false;v.innerHTML='<article class="doc px card"><h3>Mensagens <span>'+fmt(G.t)+'</span></h3><p class="sub">Recados dos setores</p>'+(G.news.length?'<ul class="qa">'+G.news.map(n=>'<li class="'+(n.hot?'new':'')+'"><b>'+fmt(n.t)+' · '+esc(n.title)+'</b><br>'+esc(n.txt)+'</li>').join('')+'</ul>':'<p>Nenhum recado ainda. Pacientes que recebem alta não geram retorno de informação.</p>')+'<p class="sub">Histórico do plantão (mais recentes primeiro)</p><ul class="qa">'+G.al.map(a=>'<li class="'+(a.hot?'new':'')+'">'+esc(a.txt)+'</li>').join('')+'</ul><div class="row"><button class="btn red" data-a="closenews">Voltar ao plantão</button></div></article>';return}
  if(G&&G.modal&&G.modal.k==='dil'&&!G.over){
    v.hidden=false;v.innerHTML='<article class="doc px card"><h3>Ofício da direção <span>'+fmt(G.t)+'</span></h3><div class="big">Produtividade</div>'
     +'<p>A direção pede que você libere um leito da observação até as 21:00 para reduzir a fila. Como você responde?</p><div class="row" style="flex-direction:column;align-items:stretch">'
     +'<button class="btn paper" data-a="dil:1">Dar alta ao paciente do leito 4, estável e com alta já planejada para amanhã.</button>'
     +'<button class="btn paper" data-a="dil:2">Liberar o leito 6, com PA ainda 170/100 e sem acompanhamento definido, para atender à direção.</button>'
     +'<button class="btn paper" data-a="dil:3">Recusar e justificar por escrito que não há paciente apto à alta segura.</button></div></article>';return;
  }
  if(G&&G.over&&G.final){
    const F=G.final;
    v.hidden=false;v.innerHTML='<article class="doc px card"><h3>Passagem de plantão <span>relatório</span></h3><div class="big">Nota '+F.score+'/100</div><p><b>Preceptor (RQE):</b> "'+esc(F.rqe||(F.rqe=rqeFinal(F.score)))+'"</p>'
     +'<p>Média dos atendimentos: <b>'+F.avg+'</b>. Óbitos: <b>'+F.dead+'</b>. Altas inseguras: <b>'+F.unsafe+'</b>. Exames desnecessários: <b>'+F.exams+'</b>. Prescrições inadequadas: <b>'+F.rx+'</b>. Diagnósticos perdidos: <b>'+F.missed+'</b>. Decisões corretas: <b>'+F.right+'</b>.</p>'
     +'<p>Reputação '+Math.round(G.rep)+' · Confiança da equipe '+Math.round(G.eq)+' · Insumos restantes '+G.ins+'. A nota prioriza segurança e raciocínio clínico, não a rapidez.</p>'
     +(G.news.length?'<p class="sub">Recados dos setores</p><ul class="qa">'+G.news.slice().reverse().map(n=>'<li><b>'+fmt(n.t)+' · '+esc(n.title)+'</b><br>'+esc(n.txt)+'</li>').join('')+'</ul>':'')
     +(window.shiftOutcomes?shiftOutcomes():'')+'<p class="sub">Atendimentos deste turno</p><div class="rep">'+G.pts.map(P=>{const r=P.res;return'<div class="rp"><h4><span>'+esc(P.c.nome)+', '+P.c.idade+'</span><span class="tag t-'+r.cls+'">'+({otimo:'ÓTIMO',bom:'BOM',parcial:'PARCIAL',ruim:'RUIM',obito:'ÓBITO',pend:'PENDENTE'})[r.cls]+' · '+r.score+'</span></h4>'
      +'<div>'+esc(r.txt)+'</div>'+(r.errs.length?'<ul class="warn">'+r.errs.map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul>':'')+(r.goods.length?'<ul class="good">'+r.goods.map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul>':'')
      +'<div style="font-size:18px"><b>O que estava indicado:</b> '+esc(idealFor(P.c).join(' · '))+'</div><div style="color:var(--ink2);font-size:18px">'+esc(P.c.ensina)+'</div></div>'}).join('')+'</div>'
     +'<div class="row">'+nextBtns()+'</div></article>';return;
  }
  if(!G){v.hidden=false;v.innerHTML=introHtml();return}
  v.hidden=true;
}
function renderClock(){
  const c=$('#clockbar');if(!c)return;c.hidden=false;const left=Math.max(0,G.end-Math.floor(G.t)),P=cur(),sp=100-G.ins+(G.overCota||0);
  c.innerHTML='<span class="lcd">'+fmt(Math.min(G.t,G.end))+'</span><span>'+esc(shiftLbl())+' · faltam '+Math.floor(left/60)+'h'+pad(left%60)+'</span>'
   +'<span>Leitos livres: verde <b>'+bedFree('obs')+'</b> · amarela <b>'+bedFree('ama')+'</b> · enf <b>'+bedFree('enf')+'</b> · UTI <b>'+bedFree('uti')+'</b></span>'
   +'<span>Insumos <b>'+G.ins+'</b>/100 · gastos <b>'+sp+'</b></span>'
   +(P?'<span style="color:var(--tc-'+P.c.tri+')">Na mesa: '+esc(P.c.nome.split(' ')[0])+'</span>':'');
}
function render(){
  if(!G){$('#top').innerHTML='<div class="brand">PLANTÃO REGIONAL</div>';$('#queue').innerHTML='';$('#work').innerHTML='';$('#decide').hidden=true;$('#clockbar').hidden=true;renderVeil();return}
  renderClock();renderTop();renderQueue();renderWork();renderVeil();saveGame();if(window.saveWeek)saveWeek();
}
/* ===== eventos ===== */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(x){}}
  if(AC&&AC.state==='suspended')AC.resume();
  const a=b.dataset.a,i=a.indexOf(':'),k=i<0?a:a.slice(0,i),v=i<0?'':a.slice(i+1);
  if(k==='snd'){UI.snd=!UI.snd;render();return}
  if(k==='mus'){MUS.on=!MUS.on;render();return}
  if(k==='news'){UI.news=true;if(G)G.unread=0;render();return}
  if(k==='closenews'){UI.news=false;render();return}
  sfx('click');
  if(k==='menu'){UI.menu=true;UI.confirmReset=false;render();return}
  if(k==='closemenu'){UI.menu=false;UI.confirmReset=false;render();return}
  if(k==='cont'){if(!loadGame())UI.msg2='Não foi possível carregar o plantão salvo.';render();return}
  if(k==='reset'){UI.confirmReset=true;render();return}
  if(k==='resetno'){UI.confirmReset=false;render();return}
  if(k==='resetok'){resetAll();render();return}
  if(k==='start'){UI.news=false;UI.menu=false;UI.confirmReset=false;newShift(nextN(),v||'local');UI.tab='anam';UI.destSel=null;UI.msg='';UI.msg2='';render();return}
  if(k==='wk'){wkAction(v);render();return}
  if(!G||G.over)return;
  const P=cur();
  if(k==='dil'){resolveDil(+v);render();return}
  if(G.modal)return;
  UI.msg='';UI.msg2='';UI.movMsg='';
  if(k==='pick'){pick(v);UI.destSel=null;UI.tab='anam'}
  else if(k==='tab'){UI.tab=v;if(P&&v==='res')P.newRes=0}
  else if(k==='restab'){UI.resTab=+v}
  else if(k==='susp'&&P){UI.msg=suspRx(P,+v)||''}
  else if(k==='extab'){UI.exTab=+v;UI.exInfo=null}
  else if(k==='exinfo'){UI.exInfo=v||null}
  else if(k==='moreq'){UI.moreQ=!UI.moreQ}
  else if(k==='urg'){UI.urg=!UI.urg}
  else if(k==='rxcat'){UI.rxCat=+v}
  else if(k==='drug'){const F=UI.F;F.drug=v;F.dose=0;F.via=0;const D=DRUGS[v];if(D){F.freq=D.f.split(' ')[0];F.dur=D.dr.split(' ')[0];const dd=dlDefault(v);F.dil=dd.dil;F.inf=dd.inf}UI.msg=''}
  else if(k==='wait')adv(+v);
  else if(k==='finish')endShift();
  else if(!P)return;
  else if(k==='ask')askQ(P,v);
  else if(k==='proc'){UI.msg=doProc(P,v)||''}
  else if(k==='req'){UI.msg=doReq(P,v)||''}
  else if(k==='mov'){UI.movMsg=doMov(P,v)||''}
  else if(k==='sys')exam(P,v);
  else if(k==='vit')vitals(P);
  else if(k==='reav')reassess(P);
  else if(k==='ord'){UI.msg=order(P,v,false,UI.urg)||'';if(UI.msg){UI.msg2=UI.msg;UI.msg=''}}
  else if(k==='rxgo'){const F=UI.F;UI.msg=rxAdd(P,{drug:F.drug,dose:F.dose,via:F.via,freq:F.freq,dur:F.dur,dil:F.dil,inf:F.inf})||'';if(!UI.msg){UI.F={drug:'',dose:0,via:0,freq:'',dur:'',dil:'',inf:''}}}
  else if(k==='dest')UI.destSel=v;
  else if(k==='commit'){const r=commit(P,UI.destSel);if(r)UI.msg2=r;else{UI.destSel=null;sfx('stamp')}}
  if(G&&G.over){render();return}
  render();
});
document.addEventListener('change',e=>{
  const s=e.target.closest('[data-s]');if(!s||!G)return;const P=cur(),n=s.dataset.s,F=UI.F;
  if(n==='trk'){musSelect(s.value);renderTop();return}
  if(n==='drug'){F.drug=s.value;F.dose=0;F.via=0;const D=DRUGS[F.drug];if(D){F.freq=D.f.split(' ')[0];F.dur=D.dr.split(' ')[0];const dd=dlDefault(F.drug);F.dil=dd.dil;F.inf=dd.inf}}
  else if(n==='dose')F.dose=+s.value;else if(n==='via')F.via=+s.value;else if(n==='freq')F.freq=s.value;else if(n==='dur')F.dur=s.value;else if(n==='dil')F.dil=s.value;else if(n==='inf')F.inf=s.value;
  else if(n==='hyp'&&P)setHyp(P,s.value);
  else if(n==='ret'&&P){P.ret=s.value;return}
  else if(n==='dxq')return;
  else if(n==='or'&&P){s.checked?P.orient.add(s.value):P.orient.delete(s.value);return}
  if(n!=='hyp')renderWork();else renderWork();
});
document.addEventListener('input',e=>{const s=e.target.closest('[data-s=note]');if(s&&G&&cur()){cur().note=s.value;saveGame()}
  const q=e.target.closest('[data-s=dxq]');if(q&&G&&cur()){UI.dxq=q.value;const sel=document.querySelector('[data-s=hyp]');if(sel)sel.innerHTML='<option value="">'+(dxOpts(cur(),UI.dxq)?'Escolha na lista':'Nada encontrado')+'</option>'+dxOpts(cur(),UI.dxq)}});
/* animação do paciente na mesa: piscar, respirar, desconforto */
setInterval(()=>{
  if(!G||G.over)return;const P=cur(),cv=$('#scene');if(!P||!cv)return;
  const X=cv.getContext('2d');if(X)paint(X,P.look,animState(P,performance.now()));
},90);
render();
