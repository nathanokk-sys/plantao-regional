/* ===== Parte 9: semana (ou mês) com plantão noturno + visita da manhã, e escolha do posto ===== */
let W=null;
function loadWeek(){try{W=JSON.parse(localStorage.getItem('pr_week')||'null')}catch(e){W=null}}
function saveWeek(){try{if(W)localStorage.setItem('pr_week',JSON.stringify(W));else localStorage.removeItem('pr_week')}catch(e){}}
loadWeek();
const POSTOS={porta:['Porta','amarelos, verdes e azuis'],sala:['Sala vermelha + observação','vermelhos e laranjas'],misto:['Os dois postos','todas as cores']};
const PORTA_TRI=['AMARELO','VERDE','AZUL'],SALA_TRI=['VERMELHO','LARANJA'];
const COLEGA={porta:SECDOC.EMG,sala:'Dra. Mariana Teles, plantonista da porta'};
const WARD=['ENF','AMA','OBS','UTI'];
const CRIT={hda:'eda',hiperk:'hd'};
const firstN=r=>r.nome.split(' ')[0];
function poolFor(posto){
  if(posto==='porta')return CASES.filter(c=>PORTA_TRI.includes(c.tri));
  if(posto==='sala')return CASES.filter(c=>SALA_TRI.includes(c.tri));
  return CASES.slice();
}
/* sorteio dos pacientes do plantão, respeitando o posto (substitui a versão de k_proc.js) */
function procStart(){
  const H=loadH(),last={};H.t.forEach((t,i)=>{last[t]=i});
  const pool=poolFor(G.posto);
  let order=shuffle(pool.slice()).sort((a,b)=>(last[a.id]==null?-1:last[a.id])-(last[b.id]==null?-1:last[b.id]));
  while(order.length<G.slots.length)order=order.concat(shuffle(pool.slice()));
  const pick=shuffle(order.slice(0,G.slots.length));
  const g=pick.findIndex(c=>c.tri==='VERMELHO'||c.tri==='LARANJA');if(g>0)[pick[0],pick[g]]=[pick[g],pick[0]];
  const taken=new Set((W&&G.week?W.inp:[]).map(firstN));
  pick.forEach((tpl,i)=>{const c=vary(tpl,i,H,taken);H.n.push(c.nome);H.t.push(tpl.id);admit(c,i)});
  saveH(H);
}
/* recados do colega do outro posto (três por plantão, em horários fixos) */
const COLMSG={
  porta:[
    ['Chegou um politrauma da BR-407 direto para mim. Estou com a sala vermelha quase cheia: só me mande quem precisa de monitorização.',g=>{g.beds.emg.bg=Math.min(g.beds.emg.cap-1,g.beds.emg.bg+2)}],
    ['Estabilizei o paciente da maca 3 e ele subiu para a sala amarela. Liberei uma maca aqui.',g=>{g.beds.emg.bg=Math.max(0,g.beds.emg.bg-1);g.beds.ama.used=Math.min(g.beds.ama.cap,g.beds.ama.used+1)}],
    ['Chegou um vermelho de ambulância (AVC em janela) e ficou comigo. Segura a porta que eu seguro a sala.',null],
    ['A gasometria da sala vermelha travou. Se precisar, peça como urgência que o laboratório central roda.',null],
    ['Tem um senhor de 70 anos classificado como verde com dor no peito na cadeira 12. Dá uma olhada quando chamar; se for o caso, me manda.',null]],
  sala:[
    ['A porta está com 40 fichas. Vou te mandar os laranjas assim que a classificação liberar.',null],
    ['Segurei na porta uma moça com crise de ansiedade que a triagem tinha mandado como laranja. Não precisa ir para a sala.',null],
    ['A observação tem dois pacientes de ontem esperando reavaliação; a enfermagem pediu prescrição. Fiz por você.',g=>{g.beds.obs.used=Math.max(0,g.beds.obs.used-1)}],
    ['Precisei de uma maca da sala vermelha para uma crise convulsiva da porta. Já resolvi e devolvi.',null],
    ['Liguei para a regulação: a UTI do hospital de referência abriu um leito. Se tiver alguém aí, peça logo.',null]]};
function mkEvs(mode,posto){
  if(mode==='visit')return[];
  const L=[
  {at:18,run:()=>{G.off.trop={until:G.t+120,why:'Reagente de troponina em falta. Previsão em 2 h.'};alert_(fmt(G.t)+' Laboratório: troponina indisponível por 2 horas.',true)}},
  {at:75,run:()=>{G.modal={k:'dil'};if(window.sfx)sfx('alarm')}},
  {at:130,run:()=>{if(G.beds.uti.used>0)G.beds.uti.used--;alert_(fmt(G.t)+' UTI: um leito foi liberado.')}},
  {at:150,run:()=>{G.beds.enf.used=Math.max(0,G.beds.enf.used-2);alert_(fmt(G.t)+' Enfermaria: duas altas, dois leitos liberados.')}},
  {at:250,run:()=>{G.beds.enf.used=Math.max(0,G.beds.enf.used-2);if(G.beds.ama)G.beds.ama.used=Math.max(0,G.beds.ama.used-1);alert_(fmt(G.t)+' Enfermaria e sala amarela liberaram leitos.')}}];
  if(posto==='porta'||posto==='sala')[45,170,290].forEach(at=>L.push({at,run:()=>{
    const from=posto==='porta'?'Sala vermelha':'Porta';
    if(Math.random()<.4&&window.extraPt){const N=extraPt(posto);if(N){addNews('Colega · '+from,COLEGA[posto]+': "'+(posto==='porta'?'A recepção mandou '+N+' para a sala vermelha, mas é caso seu. Devolvi para a sua fila.':N+' estava na cadeira da porta e piorou. Te mandei; já está na sua fila.')+'"',true);return}}
    const m=pickOf(COLMSG[posto]);if(m[1])m[1](G);addNews('Colega · '+from,COLEGA[posto]+': "'+m[0]+'"',false)}}));
  return L;
}
/* ===== desfechos de cada plantão para a semana ===== */
function wkRec(P,sector,extra){
  const c=P.c,r=P.res||{};
  return Object.assign({uid:c.id,nome:c.nome,idade:c.idade,sexo:c.sexo,look:c.look||P.look,c:JSON.parse(JSON.stringify(c)),sector,hd:1,trend:0,
    need:(c.dest.best.includes('UTI')||c.dest.best.includes('EMG')?4:c.dest.best.includes('ENF')?3:2)+rnd(0,1),
    hyp:P.hyp,ksMiss:c.key.filter((k,i)=>P.ks[i]==null).map(k=>k.lb),jej:P.mov&&P.mov.jej!=null,iso:P.mov&&P.mov.iso,rx:P.rx.filter(r=>r.freq!=='u'&&DRUGS[r.id]&&DRUGS[r.id].v[0]!=='Solicitação').map(r=>Object.assign({},r)),reqs:Object.assign({},P.reqSt||{}),
    adm:{day:W.day,cls:r.cls||'pend',score:r.score||0,stage:P.stage},destOk:c.dest.best.includes(sector)||c.dest.ok.includes(sector),
    path:['Noite '+W.day+': '+POSTOS[W.posto][0].toLowerCase()+' → '+SECN[sector]],could:[]},extra||{});
}
function couldFor(c,errs){const e=(errs||[]).filter(e=>!/^Destino adequado|^Feito/.test(e)).slice(0,4),j=e.join(' ');return[...e,...idealFor(c).filter(x=>!j.includes(x)).map(x=>'Indicado: '+x)]}
function doneRec(P,out,note){
  const c=P.c,r=P.res||{};const bad=['obito','ruim','parcial'].includes(r.cls)||/óbito|insegura/i.test(out);
  W.done.push({nome:c.nome,idade:c.idade,dx:(DXS.find(x=>x[0]===c.hyp)||[0,''])[1],out,path:['Noite '+W.day+': '+note],could:bad?couldFor(c,r.errs):[]});
}
function weekAfter(){
  if(!W||W.phase==='end')return;
  W.rep=G.rep;W.eq=G.eq;
  if(G.mode!=='visit'){
    W.days.push({k:'Noite '+W.day,score:G.final.score});
    G.pts.forEach(P=>{
      const c=P.c,r=P.res;if(P.st==='skip')return;
      if(P.st==='dead'||(r&&r.cls==='obito')){doneRec(P,'Óbito',P.st==='dead'?'óbito na emergência':'óbito no transporte');return}
      if(P.reg&&P.st==='handoff'){doneRec(P,'Transferido','transferência regulada');return}
      if(P.st==='handoff'){const s=c.dest.best.find(d=>WARD.includes(d))||(c.dest.best.includes('EMG')?'UTI':null);
        if(s){const R=wkRec(P,s);R.adm.cls='parcial';R.path[0]='Noite '+W.day+': passado sem desfecho; o colega internou em '+SECN[s];W.inp.push(R)}
        else doneRec(P,'Alta pelo colega','passado sem desfecho; o colega deu alta');return}
      if(P.dest==='TRANS'){doneRec(P,'Transferido','transferência regulada');return}
      if(P.dest==='ALTA'){doneRec(P,c.dest.alta?'Alta':'Alta insegura','alta da emergência');
        if(!c.dest.alta||r.cls==='ruim')W.pendRet.push({rec:wkRec(P,c.dest.best.find(d=>WARD.includes(d))||'ENF'),unsafe:!c.dest.alta});return}
      if(WARD.includes(P.dest))W.inp.push(wkRec(P,P.dest));
    });
    W.phase='visit';
  }else{
    W.days.push({k:'Visita · dia '+(W.day+1),score:G.final.score});
    G.pts.forEach(P=>{
      const R=W.inp.find(x=>x.uid===P.c.uid);if(!R)return;const c0=R.c;
      R.hyp=P.hyp||R.hyp;R.jej=P.mov.jej!=null;
      P.rx.forEach(x=>{const D=DRUGS[x.id];if(D&&D.v[0]==='Solicitação'&&x.id!=='ccih'&&R.reqs[x.id]!=='ok')R.reqs[x.id]='pend'});
      R.rx=P.rx.filter(r=>r.freq!=='u'&&DRUGS[r.id]&&DRUGS[r.id].v[0]!=='Solicitação').map(r=>Object.assign({},r));R.iso=P.mov.iso;
      /* ajuste de prescrição: retomou uma conduta do caso com dose correta */
      R.adjust=P.rx.some(x=>!x.carry&&c0.key.some(k=>k.ids.includes(x.id)&&okIdx(k,x.id).includes(x.i)));
      if(R.ksMiss.length&&R.adjust)R.ksMiss=[];
      R.missedVisit=P.st==='handoff';
      const d=P.dest,lb='Visita D'+R.hd+': ';
      if(P.reg){W.inp=W.inp.filter(x=>x!==R);W.done.push({nome:R.nome,idade:R.idade,dx:(DXS.find(x=>x[0]===c0.hyp)||[0,''])[1],out:'Transferido no D'+R.hd,path:R.path.concat(lb+'transferido'),could:R.could});return}
      if(P.st==='handoff'){R.path.push(lb+'não foi visto na visita');return}
      if(d==='ALTA'){W.inp=W.inp.filter(x=>x!==R);const safe=P.c.dest.alta;
        W.done.push({nome:R.nome,idade:R.idade,dx:(DXS.find(x=>x[0]===c0.hyp)||[0,''])[1],out:safe?'Alta no D'+R.hd:'Alta precoce no D'+R.hd,path:R.path.concat(lb+'alta'),could:safe?R.could:R.could.concat(couldFor(c0,P.res.errs))});
        if(!safe)W.pendRet.push({rec:Object.assign(R,{trend:-1,hd:1,path:R.path.concat(lb+'alta precoce')}),unsafe:true});return}
      if(d==='TRANS'||P.st==='reg'){W.inp=W.inp.filter(x=>x!==R);W.done.push({nome:R.nome,idade:R.idade,dx:(DXS.find(x=>x[0]===c0.hyp)||[0,''])[1],out:'Transferido no D'+R.hd,path:R.path.concat(lb+'transferido'),could:R.could});return}
      if(d&&d!==R.sector){R.path.push(lb+SECN[R.sector]+' → '+SECN[d]);R.sector=d}else R.path.push(lb+'mantido em '+SECN[R.sector]);
      if(P.res&&['ruim','parcial'].includes(P.res.cls))R.could=R.could.concat(P.res.errs.slice(0,2));
    });
    if(W.day>=W.len)W.phase='end';else W.phase='night';
  }
  saveWeek();
}
/* ===== a noite que passou: evolução dos internados ===== */
const INTERC=[['Febre às 03:00; colhidas hemoculturas pelo plantonista.',0],['Perdeu o acesso venoso; foi puncionado outro com dificuldade.',0],['Levantou sozinho para o banheiro e caiu; sem fratura.',0],['Delirium de madrugada, arrancou o acesso; precisou de contenção leve.',65]];
function reqResolve(R,id){
  const n=DRUGS[id].n,ind=(REQIND[R.c.base||R.c.id]||[]).includes(id);
  if(!ind){R.reqs[id]='noind';return n+': "Sem indicação de avaliação neste caso."'}
  if(id==='eda'){
    if(!R.jej){R.reqs[id]='fail';return'EDA suspensa: o paciente não estava em dieta zero e tomou café da manhã.'}
    const x=Math.random();
    if(x<.05){R.reqs[id]='pend';return'A requisição da EDA não chegou à endoscopia; fica para amanhã (mantenha a dieta zero).'}
    if(x<.13){R.reqs[id]='fail';return'EDA perdida: com fome, comeu escondido o lanche do acompanhante.'}
    R.reqs[id]='ok';return REQOK.eda+((R.c.base||R.c.id)==='hda'?'varizes de esôfago com sinal de sangramento recente; feita ligadura elástica.':'sem alterações significativas.')}
  if(Math.random()<.03){R.reqs[id]='pend';return n+': o pedido ficou esquecido no posto; sai hoje.'}
  R.reqs[id]='ok';return REQOK[id]||n+': realizado.';
}
function nightEvolve(R){
  const c=R.c,b=c.base||c.id,notes=[];let d=0;
  if(R.hd===1){
    d+=['otimo','bom'].includes(R.adm.cls)?1:R.adm.cls==='parcial'?0:-1;
    if(R.adm.stage<0)d-=1;
    if(R.ksMiss.length){d-=1;notes.push('O plantonista do setor completou de madrugada: '+R.ksMiss.join('; ')+'.');R.could.push('Chegou ao setor sem: '+R.ksMiss.join('; ')+'.');R.ksMiss=[]}
    if(!R.destOk){d-=1;notes.push('Setor inadequado para o quadro.')}
  }else{
    if(R.trend>=0)d+=1;
    if(R.adjust)d+=1;
    if(R.missedVisit&&R.trend<0){d-=1;notes.push('Não foi reavaliado na visita de ontem.');R.could.push('Ver primeiro, na visita, quem está piorando.')}
  }
  if(R.sector==='UTI'&&R.trend<=-1)d+=1;
  if(['ENF','AMA','OBS'].includes(R.sector)&&R.trend<=-2){d-=1;notes.push('Instável fora da UTI.');R.could.push('Escalonar para UTI quando instável.')}
  Object.keys(R.reqs).forEach(id=>{if(R.reqs[id]==='pend'){notes.push(reqResolve(R,id));if(R.reqs[id]==='ok'&&CRIT[b]===id)d+=1}});
  if(CRIT[b]&&R.reqs[CRIT[b]]!=='ok'){d-=1;const n=DRUGS[CRIT[b]].n;notes.push('Ainda sem '+n.replace(/^Solicitar /,'').toLowerCase()+'.');if(!R.could.some(x=>x.includes(n)))R.could.push('Pedir cedo: '+n+(CRIT[b]==='eda'?', com dieta zero na véspera':'')+'.')}
  if(R.jej&&!Object.keys(R.reqs).some(id=>id==='eda'&&R.reqs[id]==='pend')&&R.hd>1)notes.push('Reclamou de fome: em dieta zero sem procedimento marcado.');
  const ic=INTERC.filter(x=>R.idade>=x[1]);if(Math.random()<.12){d-=1;notes.push(pickOf(ic)[0])}
  R.trend=Math.max(-3,Math.min(3,R.trend+d));if(!c.fatal&&R.trend<-2)R.trend=-2;
  R.hd++;R.adjust=false;R.missedVisit=false;
  R.night=notes;
  return c.fatal&&R.trend<=-3;
}
function wkStage(tr){return tr>=1?1:tr<=-2?-2:tr<=-1?-1:0}
function visitCase(R){
  const c0=R.c,st=wkStage(R.trend),N=firstN(R),sec=R.sector;
  const c=JSON.parse(JSON.stringify(c0));c.id=R.uid+'_v'+W.day;c.uid=R.uid;c.visit=1;c.arr=0;c.fatal=0;c.fatalBy=9999;
  c.tri=st<=-2?'LARANJA':st===-1?'AMARELO':'VERDE';
  const ready=R.trend>=1&&R.hd>=R.need,nearly=R.trend>=1&&R.hd>=R.need-1;
  const ev={1:'estável, sem queixas novas',0:'sem mudança importante',  '-1':'piorou de madrugada','-2':'piora importante; plantonista chamado duas vezes'}[st];
  c.queixa=SECN[sec]+' · D'+R.hd+' de internação. Enfermagem: "'+N+': '+ev+'."'+(R.night&&R.night.length?' Da noite: '+R.night.join(' '):'');
  const fala=st===-2?'Acompanhante: "'+N+' está pior, doutor, quase não responde."':{1:'Bem melhor, doutor. Dormi a noite toda.',0:'Mais ou menos. Sinto quase a mesma coisa.','-1':'Piorei de madrugada, tive que chamar a enfermagem.'}[st];
  c.perg=[['Como passou a noite?',fala||'Acompanhante: "Está pior, doutor."',1],
    ['Está se alimentando?',R.jej?'Estou em dieta zero, com fome.':st>=0?'Comendo a comida daqui, pouco mas comendo.':'Quase não comi nada.',1],
    ['Quer ir para casa?',ready?'Quero sim, me sinto bem para ir.':st<0?'Agora não tenho condição, doutor.':'Queria, mas ainda não me sinto bem.']];
  const ex={};SYS.forEach(([k])=>{const a=c0.ex[k];ex[k]=k==='geral'?(c0.reav[st]||c0.ex.geral):st>=1?'Sem alterações novas; melhor que na admissão.':a?(st<0?a+' Pior que na admissão.':a):'Sem alterações dignas de nota.'});c.ex=ex;
  const suf={1:' Controle de hoje: em melhora.',0:' Controle de hoje: sem mudança.','-1':' Controle de hoje: pior.','-2':' Controle de hoje: pior.'}[st];
  Object.keys(c.res).forEach(k=>{if(k!=='hemoc')c.res[k]=c.res[k]+suf});
  if(c.res.hemoc&&R.hd>=3)c.res.hemoc=HEMOC[c0.base||c0.id]||'Sem crescimento bacteriano em 48 h.';
  c.secLbl=SECN[sec]+' · D'+R.hd;
  const b=c0.base||c0.id,crit=CRIT[b];
  c.key=crit&&R.reqs[crit]!=='ok'&&R.reqs[crit]!=='pend'?[{ids:[crit],ok:[0],by:9999,lb:'Pedir: '+DRUGS[crit].n.replace(/^Solicitar /,'')}]:[];
  c.allowed=[...new Set([...c0.allowed,...c0.key.flatMap(k=>k.ids),...(REQIND[b]||[]),'jej'])];
  c.evid=[];c.seq=[];
  let best,ok,alta=0;
  if(st<=-2){best=['UTI'];ok=['TRANS']}
  else if(st===-1){best=[sec==='UTI'?'UTI':'ENF'];ok=sec==='UTI'?[]:['UTI',sec]}
  else if(sec==='UTI'){if(R.trend>=1&&R.hd>=2){best=['ENF'];ok=['UTI','AMA']}else{best=['UTI'];ok=['ENF']}}
  else if(ready){best=['ALTA'];ok=[sec];alta=1}
  else if(nearly){best=['ENF'];ok=['ALTA',sec];alta=1}
  else{best=['ENF'];ok=sec==='ENF'?[]:[sec]}
  c.dest={best,ok,alta};
  c.out={ok:'Visita bem conduzida: '+N+' segue no rumo certo.',part:'Visita com ajustes incompletos.',bad:'Conduta da visita inadequada para o momento de '+N+'.',obito:c0.out.obito};
  c.ensina=c0.ensina+' Na visita: reavaliar quem piorou primeiro, rever exames, manter dieta zero só na véspera de procedimento e dar alta quando estável e com o tratamento encaminhado.';
  return c;
}
function visitPen(P,d,pen,goods){
  const c=P.c;
  if(P.mov.jej!=null&&!P.rx.some(x=>x.id==='eda')&&!(W.inp.find(x=>x.uid===c.uid)||{reqs:{}}).reqs.eda)pen.push([4,'Dieta zero mantida sem procedimento programado.']);
  if(d===(W.inp.find(x=>x.uid===c.uid)||{}).sector&&c.dest.best.includes(d))goods.push('Manteve internado no setor certo.');
}
/* ===== fluxo ===== */
function startNight(){
  W.mark=W.done.length;
  newShift(nextN(),'proc',W.posto);G.rep=W.rep;G.eq=W.eq;G.week=1;W.phase='night';saveWeek();
}
function startWeek(posto,len){
  W={v:1,d0:Date.now(),posto,len,day:1,phase:'night',inp:[],done:[],days:[],pendRet:[],rep:50,eq:50,morning:[]};
  startNight();
}
function goVisit(){
  const news=[];W.mark=W.done.length;
  /* altas que voltaram */
  (W.pendRet||[]).forEach(x=>{const R=x.rec,N=firstN(R);
    if(x.unsafe&&Math.random()<.6){R.trend=-2;R.hd=1;R.adm={day:W.day,cls:'ruim',score:0,stage:-1};R.destOk=true;R.ksMiss=[];R.path.push('Madrugada: voltou em piora e foi internado pelo colega');R.could.push('Não dar alta antes da estabilização.');R.night=['Voltou ao pronto-socorro às '+pad(rnd(1,5))+':'+pad(rnd(0,59))+' em piora, depois da alta.'];R.returned=1;W.inp.push(R);
      W.done=W.done.filter(d=>!(d.nome===R.nome&&/^Alta/.test(d.out)));news.push(['Voltou · '+N,COLEGA.porta.split(',')[0]+': "'+N+' voltou de madrugada pior do que saiu e está internado na '+SECN[R.sector].toLowerCase()+'. Está na sua visita."',true])}
    else if(!x.unsafe&&Math.random()<.35)news.push(['Retorno · '+N,'Porta: "'+N+' voltou com a mesma queixa, sem melhora com o que foi prescrito. O colega ajustou e deu alta de novo."',false]);
    else if(x.unsafe)news.push(['Sem notícias · '+N,'Ninguém sabe como '+N+' passou a noite em casa depois da alta.',false]);
  });W.pendRet=[];
  /* a noite dos internados */
  W.inp.slice().forEach(R=>{if(R.returned){R.returned=0;R.hd=1;return}
    if(R.sector==='UTI'&&R.hd>1)R.adjust=true;
    if(nightEvolve(R)){W.inp=W.inp.filter(x=>x!==R);const h=pad(rnd(1,6))+':'+pad(rnd(0,59));
      W.done.push({nome:R.nome,idade:R.idade,dx:(DXS.find(x=>x[0]===R.c.hyp)||[0,''])[1],out:'Óbito no D'+(R.hd-1),path:R.path.concat('Madrugada: óbito às '+h),could:R.could.concat(idealFor(R.c).filter(x=>!R.could.join(' ').includes(x)).map(x=>'Indicado: '+x))});
      news.push(['Óbito · '+firstN(R),SECDOC[R.sector==='UTI'?'UTI':'ENF']+': "'+firstN(R)+' parou às '+h+'. Fizemos reanimação por 30 minutos, sem retorno. '+(R.night||[]).join(' ')+'" Constatar o óbito e conversar com a família.',true])}});
  /* a UTI tem equipe própria: você recebe o boletim e o paciente volta para a sua lista quando tiver alta da UTI */
  W.inp.filter(R=>R.sector==='UTI').forEach(R=>{const N=firstN(R);
    if(R.trend>=1&&R.hd>=3){R.sector='ENF';R.path.push('D'+R.hd+': alta da UTI para a enfermaria');news.push(['UTI · '+N,SECDOC.UTI+': "'+N+' melhorou e desceu para a enfermaria hoje. Passa a ser seu na visita."',false])}
    else news.push(['Boletim da UTI · '+N,SECDOC.UTI+': "'+N+', D'+R.hd+' de UTI, '+(R.trend>=1?'melhorando; deve descer amanhã':R.trend>=0?'estável, sem mudança':'grave, em piora')+'.'+(R.night&&R.night.length?' '+R.night.join(' '):'')+'"',R.trend<0])});
  /* você visita até 8 (os mais graves primeiro); o diarista da enfermaria segue os demais */
  const ward=W.inp.filter(R=>R.sector!=='UTI').sort((a,b)=>a.trend-b.trend||a.hd-b.hd),mine=ward.slice(0,8);
  ward.slice(8).forEach(R=>{R.diar=1;const N=firstN(R);
    if(R.trend>=1&&R.hd>=R.need){W.inp=W.inp.filter(x=>x!==R);W.done.push({nome:R.nome,idade:R.idade,dx:(DXS.find(x=>x[0]===R.c.hyp)||[0,''])[1],out:'Alta no D'+R.hd,path:R.path.concat('D'+R.hd+': alta pelo diarista'),could:R.could});news.push(['Diarista · '+N,SECDOC.ENF.split(',')[0]+': "Dei alta para '+N+' hoje, estável."',false])}
    else{R.adjust=true;R.path.push('D'+R.hd+': visitado pelo diarista')}});
  const n=mine.length;
  G={n:W.day,t0:7*60,t:0,end:n?Math.min(240,40+18*n):1,act:null,ins:100,rep:W.rep,eq:W.eq,al:[],over:false,modal:null,chefia:0,unsafe:0,news:[],sched:[],unread:0,
    pts:[],mode:'visit',posto:W.posto,week:1,slots:[],filled:0,no:0,stock:{sorobot:6,hemac:8},off:{},
    beds:{emg:{cap:6,bg:2},obs:{cap:10,used:4},ama:{cap:8,used:4},enf:{cap:20,used:10},uti:{cap:5,used:3}},evs:[]};
  mine.forEach(R=>{const c=visitCase(R),P=mkPt(c);P.no=++G.no;P.off=sprite(P);P.st='queue';P.hyp=R.hyp;P.mov={ace:0};if(R.sector==='UTI')P.mov.mon=0;if(R.jej)P.mov.jej=0;
    P.stage=wkStage(R.trend);P.worst=0;P.rx=(R.rx||[]).map(r=>Object.assign({},r,{t:0,carry:1}));if(R.iso)P.mov.iso=R.iso;P.lv={t:0,v:c.vit[P.stage]};G.pts.push(P);G.slots.push(0);G.filled++});
  news.forEach(x=>addNews(x[0],x[1],x[2]));
  if(!n)addNews('Visita da manhã','Nenhum paciente seu na enfermaria esta manhã.',false);
  alert_(fmt(0)+' Visita da manhã: '+n+' paciente'+(n===1?'':'s')+' internado'+(n===1?'':'s')+'.');
  W.phase='visiting';saveWeek();
  if(!n)endShift();
}
function wkAction(v){
  const [a,b]=v.split(':');
  if(a==='posto'){UI.wkPosto=b;return}
  if(a==='len'){UI.wkLen=+b;return}
  UI.news=false;UI.menu=false;UI.confirmReset=false;UI.tab='anam';UI.destSel=null;UI.msg='';UI.msg2='';UI.weekRep=false;
  if(a==='start'){const p=UI.wkPosto||'porta',L=UI.wkLen||7;try{localStorage.removeItem('pr_cur')}catch(e){}
    if(L===1){W=null;saveWeek();newShift(nextN(),'proc',p==='misto'?'misto':p)}else startWeek(p,L);return}
  if(a==='again'){newShift(nextN(),'proc',G?G.posto:'misto');return}
  if(a==='visit'){goVisit();return}
  if(a==='night'){W.day++;startNight();return}
  if(a==='resume'){if(W.phase==='visit')goVisit();else if(W.phase==='night'&&(!G||G.over))startNight();else if(W.phase==='end')UI.weekRep=true;return}
  if(a==='rep'){W.phase='end';saveWeek();UI.weekRep=true;return}
  if(a==='new'){W=null;saveWeek();G=null;UI.weekRep=false;UI.menu=true;return}
}
function shiftLbl(){
  if(!G)return'';
  if(G.mode==='visit')return'Visita da manhã · dia '+(W?W.day+1:'');
  if(W&&G.week)return'Noite '+W.day+' de '+W.len+' · '+POSTOS[W.posto][0];
  return'Plantão '+G.n+(G.posto&&G.posto!=='misto'?' · '+POSTOS[G.posto][0]:'');
}
function nextBtns(){
  if(!W||!G.week)return'<button class="btn red" data-a="wk:again">Novo plantão</button><button class="btn" data-a="menu">Menu</button>';
  if(G.mode!=='visit')return'<button class="btn red" data-a="wk:visit">Ir para a visita da manhã (07:00)</button>';
  return W.phase==='end'?'<button class="btn red" data-a="wk:rep">Ver o relatório '+(W.len>7?'do mês':'da semana')+'</button>':'<button class="btn red" data-a="wk:night">Próxima noite ('+(W.day+1)+' de '+W.len+')</button>';
}
function visitHint(P){
  if(!P||!P.c.visit)return'';const R=W&&W.inp.find(x=>x.uid===P.c.uid);if(!R)return'';
  return'<p style="margin:0 0 6px;color:var(--ink2);font-size:17px">Internado em <b>'+SECN[R.sector]+'</b>, D'+R.hd+'. Para manter, carimbe o mesmo setor; para mudar, escolha outro; ou dê alta.</p>';
}
function weekReportHtml(){
  const all=[...W.done,...W.inp.map(R=>({nome:R.nome,idade:R.idade,dx:(DXS.find(x=>x[0]===R.c.hyp)||[0,''])[1],out:'Ainda internado (D'+R.hd+', '+SECN[R.sector]+')',path:R.path,could:R.could}))];
  const ob=all.filter(x=>/^Óbito/.test(x.out)).length,al=all.filter(x=>/^Alta/.test(x.out)).length,tr=all.filter(x=>/^Transf/.test(x.out)).length,ni=W.days.filter(d=>/^Noite/.test(d.k)),vi=W.days.filter(d=>/^Visita/.test(d.k));
  const avg=a=>a.length?Math.round(a.reduce((s,d)=>s+d.score,0)/a.length):0;
  const sc=Math.round(avg(ni)*.6+avg(vi)*.4-ob*14/W.len);
  const rk=x=>/^Óbito/.test(x.out)?0:x.could.length?1:2,sorted=all.slice().sort((a,b)=>rk(a)-rk(b));
  return'<article class="doc px card"><h3>Relatório '+(W.len>7?'do mês':'da semana')+' <span>'+POSTOS[W.posto][0]+'</span></h3><div class="big">Nota '+Math.max(0,sc)+'/100</div>'
   +'<p><b>Preceptor (RQE):</b> "'+esc(rqeFinal(sc))+'"</p>'
   +'<p>Noites: <b>'+ni.length+'</b> (média '+avg(ni)+'). Visitas: <b>'+vi.length+'</b> (média '+avg(vi)+'). Pacientes acompanhados: <b>'+all.length+'</b>. Altas: <b>'+al+'</b>. Transferências: <b>'+tr+'</b>. Óbitos: <b>'+ob+'</b>. Reputação final '+Math.round(W.rep)+'.</p>'
   +'<p class="sub">Notas por dia</p><p>'+W.days.map(d=>esc(d.k)+': <b>'+d.score+'</b>').join(' · ')+'</p>'
   +'<p class="sub">Cada paciente, do começo ao fim</p><div class="rep">'+sorted.map(x=>'<div class="rp"><h4><span>'+esc(x.nome)+', '+x.idade+'</span><span class="tag t-'+(/^Óbito/.test(x.out)?'obito':/insegura|precoce/.test(x.out)?'ruim':/^Alta/.test(x.out)?'otimo':'pend')+'">'+esc(x.out.toUpperCase())+'</span></h4>'
     +'<div style="font-size:18px">'+esc(x.dx)+'</div><div style="color:var(--ink2);font-size:18px">'+x.path.map(esc).join(' → ')+'</div>'
     +(x.could.length?'<div style="font-size:18px"><b>Nesse caso, poderia ter feito:</b></div><ul class="warn">'+[...new Set(x.could)].slice(0,7).map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul>':'')+'</div>').join('')+'</div>'
   +'<div class="row"><button class="btn red" data-a="wk:new">Nova semana</button></div></article>';
}
function introHtml(){
  const sv=saveInfo(),mid=G&&!G.over,wk=W&&W.phase!=='end'?W:null;
  let hist='';try{const s=JSON.parse(localStorage.getItem('pr_save')||'{"shifts":[]}');if(s.shifts.length){const l=s.shifts[s.shifts.length-1];hist='<p>Plantões concluídos: <b>'+s.shifts.length+'</b>. Último: nota <b>'+l.score+'</b>, reputação '+l.rep+'.</p>'}}catch(e){}
  let btns='';
  if(mid)btns+='<button class="btn red" data-a="closemenu">Voltar '+(G.mode==='visit'?'à visita':'ao plantão')+'</button>';
  else if(sv)btns+='<button class="btn red" data-a="cont">Continuar '+(sv.indexOf('Visita')===0?'a visita':'o plantão')+'</button>';
  else if(wk)btns+='<button class="btn red" data-a="wk:resume">Continuar '+(W.len>7?'o mês':'a semana')+' ('+({visit:'visita da manhã',night:'noite '+(G&&G.over?W.day+1:W.day),visiting:'visita'}[W.phase]||'')+')</button>';
  else if(W&&W.phase==='end')btns+='<button class="btn red" data-a="wk:resume">Ver o relatório da semana</button>';
  if(G&&G.over&&!mid)btns+='<button class="btn" data-a="closemenu">Voltar ao relatório</button>';
  const P=UI.wkPosto||'porta',L=UI.wkLen||7,on=(a,b)=>a===b?' on':'';
  const pick='<p class="sub">Novo jogo · escolha o seu posto</p><div class="row">'
    +'<button class="btn paper'+on(P,'porta')+'" data-a="wk:posto:porta">Porta<br><small>amarelos, verdes e azuis</small></button>'
    +'<button class="btn paper'+on(P,'sala')+'" data-a="wk:posto:sala">Sala vermelha + observação<br><small>vermelhos e laranjas</small></button>'
    +'<button class="btn paper'+on(P,'misto')+'" data-a="wk:posto:misto">Os dois<br><small>todas as cores</small></button></div>'
    +'<div class="row"><button class="btn paper'+on(L,7)+'" data-a="wk:len:7">Semana (7 noites)</button><button class="btn paper'+on(L,30)+'" data-a="wk:len:30">Mês (30 noites)</button><button class="btn paper'+on(L,1)+'" data-a="wk:len:1">Plantão avulso</button></div>'
    +'<div class="row"><button class="btn'+(sv||mid||wk?'':' red')+'" data-a="wk:start">Começar '+(L===1?'o plantão':L===7?'a semana':'o mês')+'</button></div>';
  const conf=UI.confirmReset?'<div class="doc" style="border:3px double #9c2a1a;margin-top:10px"><p class="warn"><b>Começar do zero apaga tudo:</b> o plantão e a semana em andamento, as notas e o histórico de pacientes e quadros já vistos. A trilha sonora escolhida continua.</p><div class="row"><button class="btn red" data-a="resetok">Apagar tudo e começar do zero</button><button class="btn paper" data-a="resetno">Cancelar</button></div></div>':'';
  return'<article class="doc px card"><h3>Hospital Regional <span>'+(mid?'Menu':'Parte 10 do protótipo')+'</span></h3><div class="big">PLANTÃO<br>REGIONAL</div>'
   +(mid?'':'<p>Você é o médico de Clínica Médica de um hospital regional do SUS no Vale do São Francisco. A noite é de superlotação, poucos leitos e decisões rápidas. Todos os pacientes têm 16 anos ou mais.</p>'
   +'<ul><li><b>Noite (19:00 à 01:00):</b> você fica num posto. O colega do outro posto manda recados.</li><li><b>Manhã (07:00):</b> visita aos seus internados. Revise exames, ajuste a prescrição, programe procedimentos (dieta zero na véspera!), dê alta ou mude de setor.</li><li>Quem você interna continua no jogo nos dias seguintes: melhora, piora, volta ou morre conforme o que foi feito.</li><li>O básico (monitor, acesso, O2) é feito pela enfermagem, sem custo. O diagnóstico nunca é revelado.</li></ul>'
   +'<p>'+CASES.length+' quadros clínicos; as pessoas são sempre novas. Tudo roda no seu navegador, sem usar o Claude.</p>')
   +hist+(sv?'<p>Salvo: <b>'+esc(sv)+'</b>. O jogo salva sozinho a cada ação.</p>':'')
   +(btns?'<div class="row">'+btns+'</div>':'')+(mid?'':pick)+'<div class="row"><button class="btn" data-a="reset">Começar do zero</button></div>'+conf+'</article>';
}
