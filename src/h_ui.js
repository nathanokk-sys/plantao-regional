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
  $('#top').innerHTML='<div class="brand">PLANTÃO REGIONAL<small>Hospital Regional · Plantão '+G.n+' · Rotina normal</small></div>'
   +'<div class="lcd" aria-label="Horário">'+fmt(Math.min(G.t,G.end))+'</div>'
   +'<div class="mini">'+ch('Emerg.','emg')+ch('Obs.','obs')+ch('Enf.','enf')+ch('UTI','uti')+'<span class="chip">Insumos <b>'+G.ins+'</b></span><span class="chip">Pacientes <b>'+G.pts.filter(p=>p.st!=='wait').length+'/'+G.slots.length+'</b></span></div>'
   +'<div class="mini">'+m('Equipe',G.eq)+m('Reputação',G.rep)+'</div>'
   +'<div class="alerts" aria-live="polite">'+G.al.slice(0,3).map(a=>'<div class="'+(a.hot?'hot':'')+'">'+esc(a.txt)+'</div>').join('')+'</div>'
   +'<div class="mini"><button class="btn" data-a="menu">Menu</button><button class="btn'+(G.unread?' amber':'')+'" data-a="news">Recados'+(G.unread?' ('+G.unread+')':'')+'</button><button class="btn" data-a="snd" aria-pressed="'+UI.snd+'">Som: '+(UI.snd?'on':'off')+'</button></div><div class="musbox"><label for="trk">Trilha sonora</label><select id="trk" data-s="trk">'+trackSelectHtml()+'</select><div class="np" id="np">'+esc(npText())+'</div><button class="btn" data-a="mus" aria-pressed="'+MUS.on+'">'+(MUS.on?'Pausar música':'Tocar música')+'</button></div>';
}
function renderQueue(){
  const q=$('#queue'),L=active();
  const busy=G.filled<G.slots.length&&!G.pts.some(p=>p.st==='wait'),more=G.slots.length-G.filled;
  if(!L.length){q.innerHTML='<div class="qempty">'+(busy?'A recepção está fichando o próximo paciente…':'Fila vazia. <button class="btn amber" data-a="wait:5">Aguardar 5 min</button>')+(!busy&&more===0&&!G.pts.some(p=>p.st==='wait')?'<button class="btn red" data-a="finish">Encerrar plantão</button>':'')+'</div>';return}
  q.innerHTML=L.map(P=>{
    const w=(P.st==='queue'?Math.max(0,Math.floor(G.t-P.c.arr)):0),tags=[];if(P.returned)tags.push('<u>VOLTOU</u>');
    if(P.newRes>0)tags.push('<u>EX</u>');if(P.st==='reg')tags.push('<u>REG</u>');if(P.st==='emg')tags.push('<u>EMG</u>');
    return'<button class="qc" style="--tc:var(--tc-'+P.c.tri+')" data-a="pick:'+P.id+'" aria-pressed="'+(G.act===P.id)+'"><canvas class="qt" data-id="'+P.id+'" width="48" height="48"></canvas><span>'+esc(P.c.nome.split(' ')[0])+'<br>'+P.c.idade+' anos</span><em>'+trLbl(P.c.tri)+(P.st==='queue'?' · espera '+w+' min':'')+' '+tags.join('')+'</em></button>'}).join('')+(more>0?'<div class="qempty" style="font-size:17px;padding:0 8px">+'+more+' a caminho</div>':'');
  q.querySelectorAll('canvas.qt').forEach(cv=>{const P=pt(cv.dataset.id),X=cv.getContext('2d');if(X&&P&&P.off){X.imageSmoothingEnabled=false;X.drawImage(P.off,52,18,56,56,0,0,48,48)}});
}
function dlRow(k,v,unk){return'<div><dt>'+k+'</dt><dd'+(unk?' class="unk"':'')+'>'+(unk?'não investigado':esc(v))+'</dd></div>'}
function renderWork(){
  const P=cur(),w=$('#work');
  if(!P){w.innerHTML='<div class="doc px hint" style="color:var(--ink)">'+(active().length?'Chame um paciente da fila clicando no rosto. Pacientes vermelhos e laranjas pioram se esperarem.':'Nenhum paciente na fila no momento.')+'</div>';$('#decide').hidden=true;return}
  const c=P.c,mon=P.mov&&P.mov.mon!=null,v=mon?c.vit[P.stage]:P.lv.v,vs=[['PA','mmHg'],['FC','bpm'],['FR','irpm'],['SatO2','%'],['Temp','°C']];
  const g=k=>P.asked.has('g:'+k);
  const left='<div class="left"><div class="scene px"><canvas id="scene" width="160" height="120" aria-label="Retrato em pixel art de '+esc(c.nome)+'"></canvas></div>'
   +'<div class="doc px"><div class="stamp" style="color:var(--tc-'+c.tri+')">TRIAGEM<br>'+c.tri+'</div><h3>Ficha de admissão <span>Atend. '+(4200+P.no)+'</span></h3>'
   +'<div class="idn">'+esc(c.nome)+'</div><dl class="dl">'+dlRow('Idade',c.idade+' anos · '+(c.sexo==='F'?'feminino':'masculino'))+dlRow('Origem',c.mun)+dlRow('Ocupação',c.ocup)+dlRow('Queixa',c.queixa)
   +dlRow('Doenças',c.comorb,!g('comorb'))+dlRow('Em uso',c.uso,!g('uso'))+dlRow('Alergias',c.alergiaTxt,!g('alerg'))+'</dl></div>'
   +'<div class="doc px"><h3>Sinais vitais <span>'+(mon?'monitor contínuo':'aferidos às '+fmt(P.lv.t))+'</span></h3><div class="vit">'
   +vs.map((x,i)=>'<div class="v'+(vAbn(i,v[i])?' abn':'')+'"><label>'+x[0]+'</label><b>'+v[i]+'</b> <small>'+x[1]+'</small></div>').join('')+'</div>'
   +'<div class="row"><button class="btn paper" data-a="vit">Aferir de novo (1 min)</button><button class="btn paper" data-a="reav">Reavaliar (3 min)</button></div></div>'+movHtml(P)+'</div>';
  w.innerHTML=left+'<div class="right"><div class="tabs" role="tablist">'
   +[['anam','Anamnese'],['fis','Exame físico'],['ex','Exames'],['rx','Prescrição'],['pront','Prontuário']].map(([k,n])=>'<button class="tab" role="tab" data-a="tab:'+k+'" aria-selected="'+(UI.tab===k)+'">'+n+(k==='ex'&&P.newRes>0?' *':'')+'</button>').join('')
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
    const qs=[...GEN_Q.map(([k,t])=>['g:'+k,t]),...c.perg.map((p,i)=>['p:'+i,p[0]])];
    return'<h3>Anamnese dirigida <span>15 s por pergunta</span></h3><div class="grid">'+qs.map(([k,t])=>'<button class="btn paper opt'+(P.asked.has(k)?' on':'')+'" data-a="ask:'+k+'"'+(P.asked.has(k)?' disabled':'')+'>'+esc(t)+'</button>').join('')+'</div><p class="sub">Respostas</p>'+logList(P,['q']);
  }
  if(UI.tab==='fis')return'<h3>Exame físico por sistemas <span>1 min por sistema</span></h3><div class="grid">'+SYS.map(([k,t])=>'<button class="btn paper opt'+(P.examined.has(k)?' on':'')+'" data-a="sys:'+k+'"'+(P.examined.has(k)?' disabled':'')+'>'+t+'</button>').join('')+'</div><p class="sub">Achados</p>'+logList(P,['x','r']);
  if(UI.tab==='ex'){
    const ids=Object.keys(EXAMS);
    const res=ids.filter(k=>P.ord[k]&&P.ord[k].done);
    return'<h3>Exames e imagem <span>insumos: '+G.ins+'</span></h3><div class="grid">'+ids.map(k=>{const o=P.ord[k],E=EXAMS[k],off=G.off[k]&&G.t<G.off[k].until;
      const st=o?(o.done?'pronto':'pronto às '+fmt(o.due)):off?'indisponível':E.t+' min · custo '+E.c;
      return'<button class="btn paper opt'+(o?' on':'')+'" data-a="ord:'+k+'"'+(o?' disabled':'')+'>'+E.n+'<small>'+st+'</small></button>'}).join('')
     +'</div><p class="sub">Resultados</p>'+(res.length?'<ul class="qa">'+res.map(k=>'<li><b>'+EXAMS[k].n+'</b><br>'+esc(P.c.res[k]||'Sem alterações relevantes.')+'</li>').join('')+'</ul>':'<p class="hint" style="padding:6px 0;color:var(--ink2)">Nenhum resultado disponível.</p>');
  }
  if(UI.tab==='rx'){
    const F=UI.F,D=DRUGS[F.drug],keys=Object.keys(DRUGS).sort((a,b)=>DRUGS[a].n.localeCompare(DRUGS[b].n));
    let h='<h3>Prescrição <span>RENAME / protocolos do SUS</span></h3><div class="form"><label>Medicamento<select data-s="drug"><option value="">Selecione</option>'+keys.map(k=>'<option value="'+k+'"'+(F.drug===k?' selected':'')+(P.rx.some(r=>r.id===k)?' disabled':'')+'>'+DRUGS[k].n+'</option>').join('')+'</select></label>';
    if(D){
      const fs=Object.keys(FREQ),dr=Object.keys(DUR);
      h+='<label>Dose<select data-s="dose">'+D.d.map((d,i)=>'<option value="'+i+'"'+(F.dose===i?' selected':'')+'>'+esc(d)+'</option>').join('')+'</select></label>'
       +'<label>Via<select data-s="via">'+D.v.map((d,i)=>'<option value="'+i+'"'+(F.via===i?' selected':'')+'>'+d+'</option>').join('')+'</select></label>'
       +'<label>Frequência<select data-s="freq">'+fs.map(k=>'<option value="'+k+'"'+(F.freq===k?' selected':'')+'>'+FREQ[k]+'</option>').join('')+'</select></label>'
       +'<label>Duração<select data-s="dur">'+dr.map(k=>'<option value="'+k+'"'+(F.dur===k?' selected':'')+'>'+DUR[k]+'</option>').join('')+'</select></label>';
    }
    h+='</div>'+(UI.msg?'<p class="warn">'+esc(UI.msg)+'</p>':'')+'<div class="row"><button class="btn paper" data-a="rxgo"'+(D?'':' disabled')+'>Prescrever (2 min)</button></div>';
    h+='<p class="sub">Prescrições ativas</p>'+(P.rx.length?'<ul class="rxl">'+P.rx.map(r=>{const d=DRUGS[r.id];return'<li><b>'+d.n+'</b> · '+esc(d.d[r.i])+' · '+d.v[r.via||0]+' · '+FREQ[r.freq]+' · '+DUR[r.dur]+' <small>('+fmt(r.t)+')</small></li>'}).join('')+'</ul>':'<p class="hint" style="padding:6px 0;color:var(--ink2)">Nenhuma prescrição.</p>');
    return h;
  }
  const log=P.log.slice().reverse();
  return'<h3>Prontuário <span>hipótese e evolução</span></h3><div class="form"><label>Hipótese principal<select data-s="hyp"><option value="">Ainda sem hipótese</option>'+DXS.slice().sort((a,b)=>a[1].localeCompare(b[1],'pt')).map(([k,n])=>'<option value="'+k+'"'+(P.hyp===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label></div>'
   +'<p class="sub">Nota de evolução</p><textarea id="note" data-s="note" placeholder="Registre sua evolução e raciocínio clínico.">'+esc(P.note)+'</textarea>'
   +'<p class="sub">Linha do tempo</p>'+(log.length?'<ul class="qa">'+log.map(x=>'<li><b>'+fmt(x.t)+' · '+esc(x.q)+'</b><br>'+esc(x.a)+'</li>').join('')+'</ul>':'<p class="hint" style="padding:6px 0;color:var(--ink2)">Sem registros.</p>');
}
function renderDecide(P){
  const d=$('#decide');if(!P){d.hidden=true;return}d.hidden=false;
  const info=k=>k==='UTI'?bedFree('uti')+' livres':k==='ENF'?bedFree('enf')+' livres':k==='OBS'?bedFree('obs')+' livres':k==='ALTA'?'liberar o paciente':k==='EMG'?'manter monitorizado':'regulação ~60-100 min';
  d.innerHTML='<h4>CARIMBO DE DESTINO</h4><div class="dests">'+DESTS.map(([k,n])=>{const dis=(k==='UTI'&&bedFree('uti')<=0)||(k==='ENF'&&bedFree('enf')<=0)||(k==='OBS'&&bedFree('obs')<=0);
    return'<button class="dest" data-a="dest:'+k+'" aria-pressed="'+(UI.destSel===k)+'"'+(dis?' disabled':'')+'>'+n+'<small>'+(dis?'lotado':info(k))+'</small></button>'}).join('')+'</div>'
   +(UI.destSel==='ALTA'?'<div class="orient">'+ORIENT.map(([k,n])=>'<label><input type="checkbox" data-s="or" value="'+k+'"'+(P.orient.has(k)?' checked':'')+'> '+n+'</label>').join('')+'</div>':'')
   +(UI.msg2?'<p class="warn" style="color:#f0a79b;margin:0">'+esc(UI.msg2)+'</p>':'')
   +'<div class="row" style="margin:0"><button class="btn red" data-a="commit"'+(UI.destSel?'':' disabled')+'>Carimbar e despachar</button><button class="btn amber" data-a="wait:5">Aguardar 5 min</button></div>';
}
function renderVeil(){
  const v=$('#veil');
  if(UI.menu){v.hidden=false;v.innerHTML=introHtml();return}
  if(G&&UI.news&&!G.over){v.hidden=false;v.innerHTML='<article class="doc px card"><h3>Recados dos setores <span>'+fmt(G.t)+'</span></h3>'+(G.news.length?'<ul class="qa">'+G.news.map(n=>'<li class="'+(n.hot?'new':'')+'"><b>'+fmt(n.t)+' · '+esc(n.title)+'</b><br>'+esc(n.txt)+'</li>').join('')+'</ul>':'<p>Nenhum recado ainda. Pacientes que recebem alta não geram retorno de informação.</p>')+'<div class="row"><button class="btn red" data-a="closenews">Voltar ao plantão</button></div></article>';return}
  if(G&&G.modal&&G.modal.k==='dil'){
    v.hidden=false;v.innerHTML='<article class="doc px card"><h3>Ofício da direção <span>'+fmt(G.t)+'</span></h3><div class="big">Produtividade</div>'
     +'<p>A direção pede que você libere um leito da observação até as 21:00 para reduzir a fila. Como você responde?</p><div class="row" style="flex-direction:column;align-items:stretch">'
     +'<button class="btn paper" data-a="dil:1">Dar alta ao paciente do leito 4, estável e com alta já planejada para amanhã.</button>'
     +'<button class="btn paper" data-a="dil:2">Liberar o leito 6, com PA ainda 170/100 e sem acompanhamento definido, para atender à direção.</button>'
     +'<button class="btn paper" data-a="dil:3">Recusar e justificar por escrito que não há paciente apto à alta segura.</button></div></article>';return;
  }
  if(G&&G.over&&G.final){
    const F=G.final;
    v.hidden=false;v.innerHTML='<article class="doc px card"><h3>Passagem de plantão <span>relatório</span></h3><div class="big">Nota '+F.score+'/100</div>'
     +'<p>Média dos atendimentos: <b>'+F.avg+'</b>. Óbitos: <b>'+F.dead+'</b>. Altas inseguras: <b>'+F.unsafe+'</b>. Exames desnecessários: <b>'+F.exams+'</b>. Prescrições inadequadas: <b>'+F.rx+'</b>. Diagnósticos perdidos: <b>'+F.missed+'</b>. Decisões corretas: <b>'+F.right+'</b>.</p>'
     +'<p>Reputação '+Math.round(G.rep)+' · Confiança da equipe '+Math.round(G.eq)+' · Insumos restantes '+G.ins+'. A nota prioriza segurança e raciocínio clínico, não a rapidez.</p>'
     +(G.news.length?'<p class="sub">Recados dos setores</p><ul class="qa">'+G.news.slice().reverse().map(n=>'<li><b>'+fmt(n.t)+' · '+esc(n.title)+'</b><br>'+esc(n.txt)+'</li>').join('')+'</ul>':'')
     +'<div class="rep">'+G.pts.map(P=>{const r=P.res;return'<div class="rp"><h4><span>'+esc(P.c.nome)+', '+P.c.idade+'</span><span class="tag t-'+r.cls+'">'+({otimo:'ÓTIMO',bom:'BOM',parcial:'PARCIAL',ruim:'RUIM',obito:'ÓBITO',pend:'PENDENTE'})[r.cls]+' · '+r.score+'</span></h4>'
      +'<div>'+esc(r.txt)+'</div>'+(r.errs.length?'<ul class="warn">'+r.errs.map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul>':'')+(r.goods.length?'<ul class="good">'+r.goods.map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul>':'')
      +'<div style="color:var(--ink2);font-size:18px">'+esc(P.c.ensina)+'</div></div>'}).join('')+'</div>'
     +'<div class="row"><button class="btn red" data-a="start:'+G.mode+'">Novo plantão</button></div></article>';return;
  }
  if(!G){v.hidden=false;v.innerHTML=introHtml();return}
  v.hidden=true;
}
function render(){
  if(!G){$('#top').innerHTML='<div class="brand">PLANTÃO REGIONAL</div>';$('#queue').innerHTML='';$('#work').innerHTML='';$('#decide').hidden=true;renderVeil();return}
  renderTop();renderQueue();renderWork();renderVeil();saveGame();
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
  if(!G||G.over)return;
  const P=cur();
  if(k==='dil'){resolveDil(+v);render();return}
  if(G.modal)return;
  UI.msg='';UI.msg2='';
  if(k==='pick'){pick(v);UI.destSel=null;UI.tab='anam'}
  else if(k==='tab'){UI.tab=v;if(P&&v==='ex')P.newRes=0}
  else if(k==='wait')adv(+v);
  else if(k==='finish')endShift();
  else if(!P)return;
  else if(k==='ask')askQ(P,v);
  else if(k==='mov'){UI.msg2=doMov(P,v)||''}
  else if(k==='sys')exam(P,v);
  else if(k==='vit')vitals(P);
  else if(k==='reav')reassess(P);
  else if(k==='ord'){UI.msg=order(P,v)||'';if(UI.msg){UI.msg2=UI.msg;UI.msg=''}}
  else if(k==='rxgo'){const F=UI.F;UI.msg=rxAdd(P,{drug:F.drug,dose:F.dose,via:F.via,freq:F.freq,dur:F.dur})||'';if(!UI.msg){UI.F={drug:'',dose:0,via:0,freq:'',dur:''}}}
  else if(k==='dest')UI.destSel=v;
  else if(k==='commit'){const r=commit(P,UI.destSel);if(r)UI.msg2=r;else{UI.destSel=null;sfx('stamp')}}
  if(G&&G.over){render();return}
  render();
});
document.addEventListener('change',e=>{
  const s=e.target.closest('[data-s]');if(!s||!G)return;const P=cur(),n=s.dataset.s,F=UI.F;
  if(n==='trk'){musSelect(s.value);renderTop();return}
  if(n==='drug'){F.drug=s.value;F.dose=0;F.via=0;const D=DRUGS[F.drug];if(D){F.freq=D.f.split(' ')[0];F.dur=D.dr.split(' ')[0]}}
  else if(n==='dose')F.dose=+s.value;else if(n==='via')F.via=+s.value;else if(n==='freq')F.freq=s.value;else if(n==='dur')F.dur=s.value;
  else if(n==='hyp'&&P)setHyp(P,s.value);
  else if(n==='or'&&P){s.checked?P.orient.add(s.value):P.orient.delete(s.value);return}
  if(n!=='hyp')renderWork();
});
document.addEventListener('input',e=>{const s=e.target.closest('[data-s=note]');if(s&&G&&cur()){cur().note=s.value;saveGame()}});
/* animação do paciente na mesa: piscar, respirar, desconforto */
setInterval(()=>{
  if(!G||G.over)return;const P=cur(),cv=$('#scene');if(!P||!cv)return;
  const X=cv.getContext('2d');if(X)paint(X,P.look,animState(P,performance.now()));
},90);
render();
