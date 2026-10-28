/* ===== v2: renderização, janelas e eventos ===== */
function renderScreen(){
  const s=$('#screen');
  s.innerHTML=UI.scr==='enf'?enfHtml():UI.scr==='com'?comHtml():UI.scr==='assist'?assistHtml():pacHtml();
  s.querySelectorAll('canvas.qt').forEach(cv=>{const P=pt(cv.dataset.id),X=cv.getContext('2d');if(X&&P&&P.off){X.imageSmoothingEnabled=false;X.drawImage(P.off,52,18,56,56,0,0,44,44)}});
}
function render(){
  if(!G){$('#top').innerHTML='<div class="brand">PLANTÃO REGIONAL v2<small>Prontuário eletrônico</small></div>';$('#screen').innerHTML='';$('#clockbar').hidden=true;renderVeil();return}
  if(UI.scr==='assist'&&!cur())UI.scr='pac';
  renderClock();renderTop();renderScreen();renderVeil();saveGame();if(window.saveWeek)saveWeek();
}
function renderVeil(){
  const v=$('#veil');
  if(UI.menu){v.hidden=false;v.innerHTML=introHtml();return}
  if(UI.weekRep&&W){v.hidden=false;v.innerHTML=weekReportHtml();return}
  if(G&&UI.pop&&UI.pop.k==='al'){const P=pt(UI.pop.id);if(P){v.hidden=false;v.innerHTML='<article class="win card"><h2 class="wt">Alertas do paciente <span>'+esc(P.c.nome)+'</span></h2><div class="wb"><p class="msg err" style="font-size:22px">'+esc(P.c.alTri)+'</p><p>Confira a identificação: '+esc(P.c.nome)+' · CPS '+cpsOf(P.c)+' · nascimento '+nascOf(P.c)+'.</p><div class="row"><button class="btn red" data-a="ciente">Ciente</button></div></div></article>';return}}
  if(G&&G.modal&&G.modal.k==='dil'&&!G.over){
    v.hidden=false;v.innerHTML='<article class="doc px card"><h3>Ofício da direção <span>'+fmt(G.t)+'</span></h3><div class="big">Produtividade</div><p>A direção pede que você libere um leito da observação até as 21:00 para reduzir a fila. Como você responde?</p><div class="row" style="flex-direction:column;align-items:stretch">'
     +'<button class="btn paper" data-a="dil:1">Dar alta ao paciente do leito 4, estável e com alta já planejada para amanhã.</button><button class="btn paper" data-a="dil:2">Liberar o leito 6, com PA ainda 170/100 e sem acompanhamento definido, para atender à direção.</button><button class="btn paper" data-a="dil:3">Recusar e justificar por escrito que não há paciente apto à alta segura.</button></div></article>';return}
  if(G&&G.over&&G.final){
    const F=G.final;
    v.hidden=false;v.innerHTML='<article class="doc px card"><h3>'+(G.mode==='visit'?'Fim da visita':'Passagem de plantão')+' <span>relatório · '+difOf().n+'</span></h3><div class="big">Nota '+F.score+'/100</div><p><b>Preceptor (RQE):</b> "'+esc(F.rqe||(F.rqe=rqeFinal(F.score)))+'"</p>'
     +'<p>Média dos atendimentos: <b>'+F.avg+'</b>. Óbitos: <b>'+F.dead+'</b>. Altas inseguras: <b>'+F.unsafe+'</b>. Exames desnecessários: <b>'+F.exams+'</b>. Prescrições inadequadas: <b>'+F.rx+'</b>. Diagnósticos perdidos: <b>'+F.missed+'</b>. Decisões corretas: <b>'+F.right+'</b>.</p>'
     +'<p>Reputação '+Math.round(G.rep)+' · Confiança da equipe '+Math.round(G.eq)+' · Insumos restantes '+insTxt()+'.</p>'
     +(G.news.length?'<p class="sub">Recados</p><ul class="qa">'+G.news.slice().reverse().map(n=>'<li><b>'+fmt(n.t)+' · '+esc(n.title)+'</b><br>'+esc(n.txt)+'</li>').join('')+'</ul>':'')
     +(window.shiftOutcomes?shiftOutcomes():'')+'<p class="sub">Atendimentos deste turno</p><div class="rep">'+G.pts.filter(P=>P.res).map(P=>{const r=P.res;return'<div class="rp"><h4><span>'+esc(P.c.nome)+', '+P.c.idade+'</span><span class="tag t-'+r.cls+'">'+({otimo:'ÓTIMO',bom:'BOM',parcial:'PARCIAL',ruim:'RUIM',obito:'ÓBITO',pend:'PENDENTE'})[r.cls]+' · '+r.score+'</span></h4>'
      +'<div>'+esc(r.txt)+'</div>'+(r.errs.length?'<ul class="warn">'+r.errs.map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul>':'')+(r.goods.length?'<ul class="good">'+r.goods.map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul>':'')
      +'<div style="font-size:18px"><b>O que estava indicado:</b> '+esc(idealFor(P.c).join(' · '))+'</div><div style="color:var(--ink2);font-size:18px">'+esc(P.c.ensina)+'</div></div>'}).join('')+'</div>'
     +'<div class="row">'+nextBtns()+'</div></article>';return}
  if(!G){v.hidden=false;v.innerHTML=introHtml();return}
  v.hidden=true;
}
/* menu inicial da v2: posto, duração e dificuldade */
function introHtml(){
  const sv=saveInfo(),mid=G&&!G.over,wk=W&&W.phase!=='end'?W:null;
  let hist='';try{const s=JSON.parse(localStorage.getItem('pr2_save')||'{"shifts":[]}');if(s.shifts.length){const l=s.shifts[s.shifts.length-1];hist='<p>Plantões concluídos: <b>'+s.shifts.length+'</b>. Último: nota <b>'+l.score+'</b>, reputação '+l.rep+'.</p>'}}catch(e){}
  let btns='';
  if(mid)btns+='<button class="btn red" data-a="closemenu">Voltar '+(G.mode==='visit'?'à visita':'ao plantão')+'</button>';
  else if(sv)btns+='<button class="btn red" data-a="cont">Continuar '+(sv.indexOf('Visita')===0?'a visita':'o plantão')+'</button>';
  else if(wk)btns+='<button class="btn red" data-a="wk:resume">Continuar '+(W.len>7?'o mês':'a semana')+' ('+({visit:'visita da manhã',night:'noite '+(G&&G.over?W.day+1:W.day),visiting:'visita'}[W.phase]||'')+')</button>';
  else if(W&&W.phase==='end')btns+='<button class="btn red" data-a="wk:resume">Ver o relatório da semana</button>';
  if(G&&G.over&&!mid)btns+='<button class="btn" data-a="closemenu">Voltar ao relatório</button>';
  const P=UI.wkPosto||'porta',L=UI.wkLen||7,Df=UI.wkDif||'m',on=(a,b)=>a===b?' on':'';
  const pick='<p class="sub">Novo jogo · seu posto</p><div class="row">'
    +'<button class="btn paper'+on(P,'porta')+'" data-a="wk:posto:porta">Porta<br><small>amarelos, verdes e azuis</small></button>'
    +'<button class="btn paper'+on(P,'sala')+'" data-a="wk:posto:sala">Sala vermelha + observação<br><small>vermelhos e laranjas</small></button>'
    +'<button class="btn paper'+on(P,'misto')+'" data-a="wk:posto:misto">Os dois<br><small>todas as cores</small></button></div>'
    +'<p class="sub">Duração</p><div class="row"><button class="btn paper'+on(L,7)+'" data-a="wk:len:7">Semana (7 noites)</button><button class="btn paper'+on(L,30)+'" data-a="wk:len:30">Mês (30 noites)</button><button class="btn paper'+on(L,1)+'" data-a="wk:len:1">Plantão avulso</button></div>'
    +'<p class="sub">Dificuldade</p><div class="diflist">'+DIFS.map(d=>'<button class="btn paper'+on(Df,d.id)+'" data-a="wk:dif:'+d.id+'"><b style="font-weight:400;font-size:21px">'+d.n+'</b><small>'+d.d+'</small></button>').join('')+'</div>'
    +'<div class="row"><button class="btn'+(sv||mid||wk?'':' red')+'" data-a="wk:start">Começar '+(L===1?'o plantão':L===7?'a semana':'o mês')+'</button></div>';
  const conf=UI.confirmReset?'<div class="doc" style="border:3px double #9c2a1a;margin-top:10px"><p class="warn"><b>Começar do zero apaga tudo da v2:</b> plantão e semana em andamento, notas e histórico de pacientes. A v1 não é afetada.</p><div class="row"><button class="btn red" data-a="resetok">Apagar tudo e começar do zero</button><button class="btn paper" data-a="resetno">Cancelar</button></div></div>':'';
  return'<article class="doc px card"><h3>Hospital Regional <span>'+(mid?'Menu':'versão 2')+'</span></h3><div class="big">PLANTÃO<br>REGIONAL 2</div>'
   +(mid?'':'<p>Você é interno de Clínica Médica num hospital regional do SUS no Vale do São Francisco, agora trabalhando dentro do prontuário eletrônico: lista de pacientes por setor, central de assistência com guias, evolução, prescrição, solicitação de exames, laudos, pareceres, transfusão, termos e receitas.</p>'
   +'<ul><li><b>Noite (19:00 às 07:00):</b> você fica num posto; o colega do outro posto manda recados e às vezes pacientes.</li><li><b>Manhã:</b> visita aos seus internados, com checklist de pendências, evolução do dia e fluxo laboratorial.</li><li>Tudo custa tempo, inclusive as medidas iniciais. O residente carimba o que você imprime.</li><li>Regra de ouro: converse com o residente antes de procedimentos e documentos.</li></ul>'
   +'<p>'+CASES.length+' quadros clínicos; as pessoas são sempre novas. O sistema PRONTO é fictício. Tudo roda no seu navegador, sem usar o Claude.</p>')
   +hist+(sv?'<p>Salvo: <b>'+esc(sv)+'</b>. O jogo salva sozinho a cada ação.</p>':'')
   +(btns?'<div class="row">'+btns+'</div>':'')+(mid?'':pick)+'<div class="row"><button class="btn" data-a="reset">Começar do zero</button></div>'+conf+'</article>';
}
/* ---------- abrir paciente ---------- */
function openPt(id){
  const P=pt(id);if(!P||!ACTIVE.includes(P.st))return;pick(id);UI.scr='assist';UI.tab=P.lastTab||'leito';UI.destSel=null;UI.F={drug:'',dose:0,via:0,freq:'',dur:''};UI.dxq='';UI.rxq='';UI.solq='';UI.exInfo=null;
  UI.com.pid=id;
  if(P.c.alergia.length&&!P.c.alOmit&&!P.ciente)UI.pop={k:'al',id};
}
/* ---------- eventos ---------- */
function setMsg(r,ok){UI.msg=r||ok||'';UI.err=r?1:0}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(x){}}
  if(AC&&AC.state==='suspended')AC.resume();
  const a=b.dataset.a,i=a.indexOf(':'),k=i<0?a:a.slice(0,i),v=i<0?'':a.slice(i+1);
  if(k==='snd'){UI.snd=!UI.snd;render();return}
  if(k==='mus'){MUS.on=!MUS.on;render();return}
  if(k==='musopen'){UI.musOpen=!UI.musOpen;render();return}
  sfx('click');
  if(k==='menu'){UI.menu=true;UI.confirmReset=false;render();return}
  if(k==='closemenu'){UI.menu=false;UI.confirmReset=false;render();return}
  if(k==='cont'){if(!loadGame())UI.msg='Não foi possível carregar o plantão salvo.';UI.scr='pac';render();return}
  if(k==='reset'){UI.confirmReset=true;render();return}
  if(k==='resetno'){UI.confirmReset=false;render();return}
  if(k==='resetok'){resetAll();render();return}
  if(k==='wk'){wkAction(v);if(G&&!G.over&&['start','visit','night','again','resume'].includes(v.split(':')[0])){UI.scr='pac';UI.sec='todos'}render();return}
  if(k==='ciente'){const P=pt(UI.pop&&UI.pop.id);if(P){P.ciente=1;P.log.push({t:G.t,k:'m',q:'Alerta',a:'Alergia registrada na triagem: ciente.',fresh:1})}UI.pop=null;render();return}
  if(!G||G.over)return;
  if(k==='dil'){resolveDil(+v);render();return}
  if(G.modal||UI.pop)return;
  const P=cur();UI.msg='';UI.err=0;
  if(k==='scr'){UI.scr=v;if(v==='com')G.unread=0}
  else if(k==='sec')UI.sec=v;
  else if(k==='open')openPt(v);
  else if(k==='guia'){UI.tab=v;if(P){P.lastTab=v;if(v==='lau')P.newRes=0;if(v==='par')P.newPar=0}UI.exInfo=null}
  else if(k==='sub'){const j=v.indexOf(':');UI.sub[v.slice(0,j)]=v.slice(j+1)}
  else if(k==='wait')adv(+v);
  else if(k==='finish')endShift();
  else if(k==='exinfo')UI.exInfo=v||null;
  else if(k==='moreq')UI.moreQ=!UI.moreQ;
  else if(k==='rxcat')UI.rxCat=+v;
  else if(k==='drug'){const F=UI.F;F.drug=v;F.dose=0;F.via=0;const D=DRUGS[v];if(D){F.freq=D.f.split(' ')[0];F.dur=F.freq==='u'?'u':D.dr.split(' ')[0];const dd=dlDefault(v);F.dil=dd.dil;F.inf=F.freq==='ic'?'cont':dd.inf;if(F.freq==='ic')F.dil='bic';F.rate=(BICSTD[v]||[20])[0];F.hrs='0'}}
  else if(k==='comsend'){const C=UI.com,T=pt(C.pid);setMsg(sendGroup(T,C.para,C,!!C.paste),'Mensagem enviada para o grupo.');if(!UI.err){C.paste=0;C.nome=C.cps=C.leito=0}}
  else if(!P)return;
  else if(k==='ask')askQ(P,v);
  else if(k==='sys')exam(P,v);
  else if(k==='vit')vitals(P);
  else if(k==='reav')reassess(P);
  else if(k==='mov')setMsg(doMov(P,v));
  else if(k==='rxgo'){const F=UI.F;setMsg(rxAdd(P,{drug:F.drug,dose:F.dose,via:F.via,freq:F.freq,dur:F.freq==='u'?'u':F.dur,dil:F.dil,inf:F.inf,rate:F.rate,hrs:F.hrs}),'Prescrito.');if(!UI.err)UI.F={drug:'',dose:0,via:0,freq:'',dur:''}}
  else if(k==='susp')setMsg(suspRx(P,+v),'Suspenso.');
  else if(k==='evo'){
    if(v==='new'||v==='dup'){setMsg(evoNew(P,v==='dup'));UI.dxq=''}
    else if(v==='save')setMsg(evoSave(P),'Evolução salva.');
    else if(v==='discard')delete P.evf;
    else if(P.evf&&v==='insO')P.evf.O=(P.evf.O?P.evf.O+' ':'')+autoO(P);
    else if(P.evf&&v==='insC')P.evf.C=(P.evf.C?P.evf.C+' ':'')+autoC(P);
    else if(P.evf&&v==='insP')P.evf.pend=(P.evf.pend?P.evf.pend+'; ':'')+(pendList(P).join('; ')||'Sem pendências no sistema.');
  }
  else if(k==='cadd'){const C=cartOf(P);if(!C.items.includes(v))C.items.push(v)}
  else if(k==='crem'){const C=cartOf(P);C.items=C.items.filter(x=>x!==v)}
  else if(k==='csend')setMsg(sendCart(P),'Pedido enviado.');
  else if(k==='call')setMsg(callLab(P),'Ligação feita: veja o registro abaixo.');
  else if(k==='pri')setMsg(labPriority(P,v),'Prioridade pedida.');
  else if(k==='laudo')setMsg(reqLaudo(P,v),'Laudo solicitado ao residente.');
  else if(k==='parsave'){setMsg(saveParecer(P,UI.par.id,UI.par.txt),'Solicitação salva. Agora envie pela Comunicação interna.');if(!UI.err){UI.com.para=UI.par.id;UI.com.pid=P.id}}
  else if(k==='parcom'){UI.com.para=v;UI.com.pid=P.id;UI.scr='com'}
  else if(k==='atbsend')setMsg(sendATB(P,UI.atb),'Ficha da CCIH enviada.');
  else if(k==='txfill')setMsg(txFill(P,UI.tx),'Solicitação impressa em duas vias.');
  else if(k==='txstep')setMsg(txStep(P,+v));
  else if(k==='tprint')setMsg(termoPrint(P,v));
  else if(k==='tsign'){const [id,who]=v.split(':');setMsg(termoSign(P,id,who))}
  else if(k==='proc')setMsg(doProcV2(P,v),'Procedimento realizado.');
  else if(k==='radd'){const R=UI.ri;if(DRUGS[R.drug]){UI.doc.items.push({drug:R.drug,dose:+R.dose,via:+R.via,freq:R.freq,dur:R.dur});UI.ri={drug:'',dose:0,via:0,freq:'',dur:''}}}
  else if(k==='rrem')UI.doc.items.splice(+v,1);
  else if(k==='docsave'){setMsg(saveDoc(P,UI.doc),'Documento salvo e carimbado.');if(!UI.err)UI.doc={type:UI.doc.type,items:[],dias:'',dest:''}}
  else if(k==='help')setMsg(askHelp(P,v));
  else if(k==='bic'){const [i,d]=v.split(':');setMsg(bicAdj(P,+i,+d))}
  else if(k==='bict')setMsg(bicToggle(P,+v));
  else if(k==='acc')setMsg(newAccess(P),'Novo acesso puncionado.');
  else if(k==='nibp')setMsg(nibpNow(P));
  else if(k==='dest')UI.destSel=v;
  else if(k==='commit'){const r=commit(P,UI.destSel);if(r)setMsg(r);else{UI.destSel=null;sfx('stamp');UI.scr='pac'}}
  render();
});
document.addEventListener('change',e=>{
  const s=e.target.closest('[data-s]');if(!s)return;const n=s.dataset.s,P=G&&cur(),F=UI.F,val=s.type==='checkbox'?(s.checked?1:0):s.value;
  if(n==='trk'){musSelect(s.value);renderTop();return}
  if(!G)return;
  const [g,f]=n.split(':');
  if(['dose','via','freq','dur','dil','inf','rate','hrs'].includes(n)){F[n]=['dose','via','rate'].includes(n)?+val:val;if(n==='freq'){if(val==='u')F.dur='u';else if(F.dur==='u'&&DRUGS[F.drug])F.dur=DRUGS[F.drug].dr.split(' ').find(x=>x!=='u')||'ct';if(val==='ic'){F.inf='cont';F.dil='bic';F.rate=F.rate||(BICSTD[F.drug]||[20])[0]}}}
  else if(g==='com'){UI.com[f]=val;if(f==='pid'){UI.com.nome=UI.com.cps=UI.com.leito=0}}
  else if(g==='par'){UI.par[f]=val;return}
  else if(g==='atb')UI.atb[f]=val;
  else if(g==='tx'){UI.tx[f]=f==='urg'?val:val;if(f==='id')UI.tx.dose=0}
  else if(g==='doc'){UI.doc[f]=val}
  else if(g==='ri'){UI.ri[f]=val;if(f==='drug'){const D=DRUGS[val];UI.ri.dose=0;UI.ri.via=D?Math.max(0,D.v.indexOf('VO')):0;UI.ri.freq=D?D.f.split(' ')[0]:'';UI.ri.dur=D?D.dr.split(' ')[0]:''}}
  else if(!P)return;
  else if(g==='evf'&&P.evf){P.evf[f]=val;if(f!=='hyp'&&f!=='type')return}
  else if(g==='cart'){const C=cartOf(P);if(f==='urg')C.urg=val==='1';else{C[f]=val;return}}
  else if(g==='tc'){cartOf(P).tc[f]=val}
  else if(n==='or'){s.checked?P.orient.add(s.value):P.orient.delete(s.value);return}
  else if(n==='ret'){P.ret=val;return}
  else if(['q','rxq','dxq','solq'].includes(n))return;
  render();
});
document.addEventListener('input',e=>{
  const s=e.target.closest('[data-s]');if(!s||!G)return;const n=s.dataset.s,P=cur();
  if(n==='q'){UI.q=s.value;const L=$('#plist');if(L){L.innerHTML=plistHtml();L.querySelectorAll('canvas.qt').forEach(cv=>{const Q=pt(cv.dataset.id),X=cv.getContext('2d');if(X&&Q&&Q.off){X.imageSmoothingEnabled=false;X.drawImage(Q.off,52,18,56,56,0,0,44,44)}})}return}
  if(n==='dxq'&&P&&P.evf){UI.dxq=s.value;const sel=document.querySelector('[data-s="evf:hyp"]');if(sel){const o=dxOpts(P,UI.dxq,P.evf.hyp);sel.innerHTML='<option value="">'+(o?'Escolha na lista':'Nada encontrado')+'</option>'+o}return}
  if(n==='rxq'||n==='solq'){UI[n]=s.value;clearTimeout(UI._t);UI._t=setTimeout(()=>{const pos=s.selectionStart;render();const el=document.querySelector('[data-s="'+n+'"]');if(el){el.focus();try{el.setSelectionRange(pos,pos)}catch(x){}}},250);return}
  if(n.startsWith('evf:')&&P&&P.evf&&s.tagName==='TEXTAREA'){P.evf[n.slice(4)]=s.value;return}
  if(n==='par:txt'){UI.par.txt=s.value;return}
  if(n==='cart:just'&&P){cartOf(P).just=s.value;return}
});
setInterval(()=>{
  if(!G||G.over)return;const P=cur(),cv=$('#scene');if(!P||!cv)return;
  const X=cv.getContext('2d');if(X)paint(X,P.look,animState(P,performance.now()));
},90);
render();
