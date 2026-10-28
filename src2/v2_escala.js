/* ===== v2: escala do R1 — um setor por turno (turno avulso, semana ou mês fixos, ou rodízio) ===== */
const SETORES={porta:{n:'Porta do PS',p:'noite',h:'19:00 às 07:00',d:'amarelos, verdes e azuis'},sala:{n:'Sala vermelha',p:'noite',h:'19:00 às 07:00',d:'vermelhos e laranjas'},
  enf:{n:'Enfermaria de Clínica Médica',p:'dia',h:'07:00 às 19:00',d:'visita diária, evoluções, intercorrências e admissões'},uti:{n:'UTI',p:'dia',h:'07:00 às 19:00',d:'pacientes graves, drogas vasoativas e intercorrências'}};
const MODOS={turno:['Um turno',1],semana:['Semana fixa no setor',7],mes:['Mês fixo no setor',30],rodizio:['Semana em rodízio',7]};
const RODIZIO=['enf','porta','enf','sala','uti','enf','porta'];
POSTOS.porta=['Porta do PS','amarelos, verdes e azuis'];POSTOS.sala=['Sala vermelha','vermelhos e laranjas'];POSTOS.enf=['Enfermaria','visita e intercorrências'];POSTOS.uti=['UTI','pacientes graves'];
const isPS=s=>s==='porta'||s==='sala';
const turnOf=()=>(G&&G.turn)||(W&&W.posto)||'porta';
const dLbl=n=>{const d=new Date(((W&&W.d0)||Date.now())+n*864e5);return pad(d.getDate())+'/'+pad(d.getMonth()+1)};
/* ---------- início do jogo e passagem entre turnos ---------- */
function startWeek(setor,modo,dif){
  const len=MODOS[modo]?MODOS[modo][1]:7;
  W={v:2,dif:dif||'m',d0:Date.now(),modo,setor,len,day:1,esc:Array.from({length:len},(_,i)=>modo==='rodizio'?RODIZIO[i%7]:setor),phase:'turno',inp:[],done:[],days:[],pendRet:[],rep:50,eq:50,news:[]};
  startTurn();
}
function startTurn(){
  const sec=W.esc[W.day-1];W.posto=sec;W.mark=W.done.length;try{localStorage.removeItem('pr_cur')}catch(e){}
  if(isPS(sec)){newShift(nextN(),'proc',sec,W.dif);G.rep=W.rep;G.eq=W.eq;G.week=1;G.turn=sec}
  else newWard(sec);
  (W.news||[]).forEach(x=>addNews(x[0],x[1],x[2]));W.news=[];W.phase='turno';saveWeek();
}
function nextTurn(){W.day++;if(UI.nextSec&&W.modo==='rodizio'){W.esc[W.day-1]=UI.nextSec;UI.nextSec=null}dailyEvolve(W.esc[W.day-1]);startTurn()}
/* o dia que passou: os internados evoluem; quem não está com você fica com a equipe do setor */
function dailyEvolve(today){
  const news=W.news=W.news||[];
  (W.pendRet||[]).forEach(x=>{const R=x.rec,N=firstN(R);
    if(x.unsafe&&Math.random()<.6){R.trend=-2;R.hd=1;R.adm={day:W.day,cls:'ruim',score:0,stage:-1};R.destOk=true;R.ksMiss=[];R.path.push('Voltou em piora e foi internado pelo plantão');R.could.push('Não dar alta antes da estabilização.');R.night=['Voltou ao pronto-socorro em piora, depois da alta.'];R.returned=1;R.mine=1;W.inp.push(R);
      W.done=W.done.filter(d=>!(d.nome===R.nome&&/^Alta/.test(d.out)));news.push(['Voltou · '+N,'Plantão do PS: "'+N+' voltou pior do que saiu e foi internado na '+SECN[R.sector].toLowerCase()+'."',true])}
    else if(!x.unsafe&&Math.random()<.35)news.push(['Retorno · '+N,'Porta: "'+N+' voltou com a mesma queixa, sem melhora com o que foi prescrito. O colega ajustou e deu alta de novo."',false]);
    else if(x.unsafe)news.push(['Sem notícias · '+N,'Ninguém sabe como '+N+' passou em casa depois da alta.',false]);
  });W.pendRet=[];
  W.inp.slice().forEach(R=>{if(R.returned){R.returned=0;R.hd=1;return}
    const ward=['ENF','AMA','OBS'].includes(R.sector);
    if((R.sector==='UTI'&&today!=='uti')||(ward&&today!=='enf')||R.colega)R.adjust=true;R.colega=0;
    if(nightEvolve(R)){W.inp=W.inp.filter(x=>x!==R);
      if(R.mine){const h=pad(rnd(1,6))+':'+pad(rnd(0,59));W.done.push({nome:R.nome,idade:R.idade,dx:dxLabel(R.c.hyp),out:'Óbito no D'+(R.hd-1),path:R.path.concat('Óbito às '+h),could:R.could.concat(idealFor(R.c).filter(x=>!R.could.join(' ').includes(x)).map(x=>'Indicado: '+x))});
        news.push(['Óbito · '+firstN(R),SECDOC[R.sector==='UTI'?'UTI':'ENF']+': "'+firstN(R)+' parou às '+h+'. Reanimação por 30 minutos, sem retorno. '+(R.night||[]).join(' ')+'"',true])}return}
    if(R.sector==='UTI'&&today!=='uti'&&R.trend>=1&&R.hd>=3){R.sector='ENF';R.leito=freeBed('ENF');R.path.push('D'+R.hd+': alta da UTI para a enfermaria');if(R.mine)news.push(['UTI · '+firstN(R),SECDOC.UTI+': "'+firstN(R)+' melhorou e desceu para a enfermaria."',false])}
    else if(ward&&today!=='enf'&&R.trend>=1&&R.hd>=R.need){W.inp=W.inp.filter(x=>x!==R);if(R.mine){W.done.push({nome:R.nome,idade:R.idade,dx:dxLabel(R.c.hyp),out:'Alta no D'+R.hd,path:R.path.concat('D'+R.hd+': alta pela equipe da enfermaria'),could:R.could});news.push(['Enfermaria · '+firstN(R),SECDOC.ENF.split(',')[0]+': "Dei alta para '+firstN(R)+' hoje, estável."',false])}}
    else if(R.mine&&R.sector==='UTI'&&today!=='uti')news.push(['Boletim da UTI · '+firstN(R),SECDOC.UTI+': "'+firstN(R)+', D'+R.hd+' de UTI, '+(R.trend>=1?'melhorando':R.trend>=0?'estável':'grave, em piora')+'."',R.trend<0]);
  });
  /* pacientes gerados que ninguém do jogo acompanha saem com o tempo */
  W.inp=W.inp.filter(R=>!(R.gen&&!R.mine&&R.hd>6));
}
/* ---------- turno na enfermaria ou na UTI ---------- */
const HSEC=s=>s==='uti'?'UTI':'ENF';
function wardPool(sec){const L=CASES.filter(c=>sec==='uti'?c.dest.best.includes('UTI'):(c.dest.best.includes('ENF')||c.dest.ok.includes('ENF'))&&!c.dest.alta);return L.length?L:CASES.slice()}
function labFlow(c,id,day,hh){const fp={id:c.id,c,stage:-1};return{id,dt:dLbl(day)+' '+hh,dd:dLbl(day)+' '+hh,vals:labVals(fp,id)}}
function genRec(sector){
  const sec=sector==='UTI'?'uti':'enf',H=loadH(),tpl=pickOf(wardPool(sec)),c=vary(tpl,rnd(100,999),H,new Set(W.inp.map(firstN)));H.n.push(c.nome);H.t.push(tpl.id);saveH(H);
  const hd=sector==='UTI'?rnd(1,3):rnd(2,4),R={uid:c.id,nome:c.nome,idade:c.idade,sexo:c.sexo,look:c.look,c,sector,hd,trend:rnd(-1,1),need:(sector==='UTI'?4:3)+rnd(0,1),
    hyp:Math.random()<.12?distractor(c.hyp):c.hyp,ksMiss:[],jej:false,iso:c.iso?ISOK[c.iso]:undefined,rx:[],reqs:{},adm:{day:W.day-hd,cls:'bom',score:80,stage:0},destOk:true,
    evos:[],flow:[],vs:[],par:{},leito:freeBed(sector),path:['Internado pela equipe ('+SECN[sector]+')'],could:[],gen:1};
  let miss=Math.random()<.15?rnd(0,c.key.length-1):-1;
  c.key.forEach((k,i)=>{const id=k.ids[0],D=DRUGS[id];if(!D||['Solicitação','Procedimento'].includes(D.v[0])||HEMO.includes(id))return;if(i===miss){R.trend=Math.min(R.trend,-1);R.prevMiss=k.lb;return}
    const fq=D.f.split(' ').find(x=>x!=='u')||'u';R.rx.push({id,i:okIdx(k,id)[0],via:0,freq:fq,dur:fq==='u'?'u':D.dr.split(' ')[0],t:-600,adm:-600,day:dayIdx()-hd+1,carry:1,bic:fq==='ic'?{rate:(BICSTD[id]||[20])[0],rate0:(BICSTD[id]||[20])[0],hrs:'0',run:true,vol:0,sol:(BICSTD[id]||[0,''])[1]}:undefined})});
  R.evos.push({t:-600,dt:dLbl(W.day-hd)+' 21:40',type:'adm',hyp:R.hyp,S:c.queixa,O:'',C:'Conduta da admissão: '+(R.rx.map(r=>DRUGS[r.id].n).join(', ')||'suporte clínico')+'.',pend:'',dup:0,by:'Plantonista do PS'});
  if(hd>1)R.evos.push({t:-600,dt:dLbl(W.day-2)+' 10:20',type:'dia',hyp:R.hyp,S:'Evolução da equipe.',O:'',C:'Mantida a conduta.',pend:'',dup:0,by:'Equipe da enfermaria'});
  c.util.filter(id=>LP[id]&&!['glic','hbrap'].includes(id)).slice(0,5).forEach(id=>R.flow.push(labFlow(c,id,W.day-hd,'20:30')));
  return R;
}
function makeWardP(R,isU){
  const c=visitCase(R),P=mkPt(c);P.no=++G.no;P.off=sprite(P);P.st='queue';P.hyp=R.hyp;P.mov={ace:0};if(isU||R.sector==='UTI')P.mov.mon=0;if(R.jej)P.mov.jej=0;
  P.stage=wkStage(R.trend);P.worst=0;P.rx=(R.rx||[]).map(r=>Object.assign({},r,{t:0,carry:1,bic:r.bic?Object.assign({},r.bic,{rate0:r.bic.rate0!=null?r.bic.rate0:r.bic.rate}):undefined}));if(R.iso)P.mov.iso=R.iso;
  P.leito=R.leito;P.prevEvos=R.evos||[];P.flow=R.flow||[];P.vs=(R.vs||[]).slice(-8);P.par=JSON.parse(JSON.stringify(R.par||{}));
  Object.entries(P.par).forEach(([k,p])=>{if(p.st==='agendado'){p.st='respondido';p.resp=parResp(P,k);p.respAt=-30;P.newPar=(P.newPar||0)+1}});
  if(isU||R.sector==='UTI')P.acc={tipo:'Central',cal:'triplo lúmen',local:'veia jugular interna direita',t:-1440,st:'pérvio'};
  (R.pendLabs||[]).forEach(id=>{if(EXAMS[id])P.ord[id]={t0:-60,due:rnd(90,180),done:false,urg:false,dt:dLbl(W.day-1)+' 06:00',rot:1}});R.pendLabs=[];
  if(R.prevMiss&&!R.missNoted){R.missNoted=1;c.queixa+=' (Na prescrição da equipe anterior não consta: '+R.prevMiss.toLowerCase()+'.)'}
  if(window.vrec)vrec(P,'Enfermagem',-60);P.lv={t:0,v:vitNow(P)};R.cared=1;R.mine=1;return P;
}
function newWard(sec){
  const isU=sec==='uti',D=difOf(),cap=isU?{mf:4,f:4,m:5,d:6,md:6,inf:7}[D.id]:{mf:6,f:7,m:8,d:9,md:10,inf:12}[D.id];
  const inSec=R=>isU?R.sector==='UTI':['ENF','AMA','OBS'].includes(R.sector);
  const L=W.inp.filter(inSec).sort((a,b)=>(b.mine?1:0)-(a.mine?1:0)||a.trend-b.trend);
  while(L.length<cap){const R=genRec(HSEC(sec));W.inp.push(R);L.push(R)}
  const census=L.slice(0,cap);L.slice(cap).forEach(R=>{R.colega=1});
  G={n:W.day,t0:7*60,t:0,end:720,act:null,ins:100,rep:W.rep,eq:W.eq,al:[],over:false,modal:null,chefia:0,unsafe:0,news:[],sched:[],unread:0,
    pts:[],mode:'visit',turn:sec,posto:sec,dif:W.dif||'m',week:1,slots:[],filled:0,no:0,stock:{sorobot:6,hemac:8},off:{},
    beds:{emg:{cap:6,bg:2},obs:{cap:10,used:5},ama:{cap:8,used:5},enf:{cap:20,used:14},uti:{cap:isU?cap+1:5,used:isU?cap:4}},evs:[]};
  if(window.difApply)difApply();
  if(isU){G.beds.uti.cap=cap+1;G.beds.uti.used=cap}
  census.forEach(R=>{const P=makeWardP(R,isU);G.pts.push(P);G.slots.push(0);G.filled++});
  /* intercorrências durante o dia */
  const nI=Math.min(census.length,(isU?2:1)+(['d','md','inf'].includes(D.id)?1:0)+(D.id==='inf'?1:0));
  shuffle(G.pts.slice()).slice(0,nI).forEach(P=>{P.interc={at:rnd(25,240),kind:null}});
  /* admissões que sobem do PS ao longo do dia */
  const nA=isU?rnd(0,1)+(D.id==='inf'?1:0):rnd(1,2)+(['md','inf'].includes(D.id)?1:0),H=loadH(),taken=new Set(G.pts.map(p=>p.c.nome.split(' ')[0]));
  for(let i=0;i<nA;i++){const tpl=pickOf(wardPool(sec)),c=vary(tpl,200+i,H,taken);H.n.push(c.nome);H.t.push(tpl.id);const at=rnd(60,540);c.fromPS=1;c.queixa='Admissão vinda do PS ('+fmt(at)+'): '+c.queixa;
    G.slots.push(at);admit(c,G.slots.length-1);G.filled=G.slots.length}
  saveH(H);
  alert_(fmt(0)+' Início do turno na '+(isU?'UTI':'enfermaria')+': '+census.length+' leitos sob sua responsabilidade.');
}
/* admissão vinda do PS chega com parte da prescrição feita pelo plantonista */
function onArrive(P){
  const c=P.c;if(!c.fromPS||P.psDone)return;P.psDone=1;P.mov.ace=c.arr;if(turnOf()==='uti')P.mov.mon=c.arr;const names=[];
  c.key.forEach((k,i)=>{if(i%2)return;const id=k.ids[0],D=DRUGS[id];if(!D)return;P.ks[i]=c.arr;
    if(!['Solicitação','Procedimento'].includes(D.v[0])&&!HEMO.includes(id)){const fq=D.f.split(' ').find(x=>x!=='u')||'u';P.rx.push({id,i:okIdx(k,id)[0],via:0,freq:fq,dur:fq==='u'?'u':D.dr.split(' ')[0],t:c.arr,adm:c.arr,carry:1,keyCred:1,day:dayIdx()});names.push(D.n)}});
  P.log.push({t:c.arr,k:'m',q:'Admissão',a:'Prescrição do plantonista do PS: '+(names.join(', ')||'sem prescrição')+'. Reavalie e complete.',fresh:1});
}
/* ---------- intercorrências na enfermaria e na UTI ---------- */
const ICK={dessat:['dessaturou para 86% em ar ambiente e está taquipneico',{sat:-9,fr:7,fc:12},{ids:['o2'],ok:[0,1,2,3],lb:'Oxigênio na dessaturação'},2],
  febre:['teve febre de 38,9 °C com calafrios',{t:2,fc:16},{ids:['dipi','para'],ok:{dipi:[1],para:[1,2]},lb:'Antitérmico na febre'},1],
  hipot:['está hipotenso, PA caiu e está sudoreico',{s:-38,d:-20,fc:22},{ids:['sf','ringer'],ok:{sf:[0,1,2],ringer:[0,1,2]},lb:'Volume na hipotensão'},2],
  hipogli:['está sudoreico e confuso; glicemia capilar de 46 mg/dL',{fc:16},{ids:['glic50'],ok:[1],lb:'Glicose 50% na hipoglicemia'},1],
  dor:['está com dor intensa (8 de 10) e agitado',{s:18,d:8,fc:18},{ids:['dipi','tram','morf'],ok:{dipi:[1],tram:[0,1],morf:[0,1]},lb:'Analgesia'},1]};
function fireInterc(P,t){
  const b=P.c.base||P.c.id,ks=Object.keys(ICK).filter(k=>!(k==='hipot'&&CONG.includes(b))),k=P.interc.kind||pickOf(ks),I=ICK[k];
  P.interc.kind=k;P.interc.fired=t;P.icAdd=I[1];const c=P.c;c.key.push(Object.assign({by:t+60},JSON.parse(JSON.stringify(I[2]))));P.ks.push(null);
  I[2].ids.forEach(id=>{if(!c.allowed.includes(id))c.allowed.push(id)});if(k==='febre'&&!c.util.includes('hemoc'))c.util.push('hemoc');
  if(I[3]>=2&&!c.dest.best.includes('UTI')&&turnOf()!=='uti')c.dest.ok.push('UTI');
  P.stage=Math.min(P.stage,0)-(I[3]>=2?1:0);if(P.stage<-2)P.stage=-2;c.tri=P.stage<=-1?'LARANJA':'AMARELO';
  const txt='Enfermagem: '+first(P)+' ('+leitoOf(P)+') '+I[0]+'. Pode avaliar?';P.interc.txt=I[0];
  P.log.push({t,k:'m',q:'Intercorrência',a:txt,fresh:1});alert_(fmt(t)+' '+txt,true);if(window.sfx)sfx('alarm');
}
function intercSeen(P){if(P.interc&&P.interc.fired!=null&&P.interc.seen==null)P.interc.seen=G.t}
/* desfecho da visita: inclui a intercorrência */
function visitPen(P,d,pen,goods){
  const c=P.c,R=W&&W.inp.find(x=>x.uid===c.uid);
  if(P.mov.jej!=null&&!P.rx.some(x=>x.id==='eda')&&!(R||{reqs:{}}).reqs.eda)pen.push([4,'Dieta zero mantida sem procedimento programado.']);
  if(R&&d===R.sector&&c.dest.best.includes(d))goods.push('Manteve internado no setor certo.');
  const I=P.interc;if(I&&I.fired!=null){if(I.seen==null)pen.push([8,'Intercorrência não reavaliada: '+I.txt+'.']);else if(I.seen-I.fired>45)pen.push([4,'Intercorrência reavaliada com atraso ('+Math.round(I.seen-I.fired)+' min).']);else goods.push('Intercorrência reavaliada a tempo.')}
  if(R&&R.hyp!==c.hyp&&P.hyp===c.hyp)goods.push('Corrigiu o diagnóstico da equipe anterior.');
}
/* ---------- fim de cada turno ---------- */
function weekAfter(){
  if(!W||W.phase==='end')return;
  W.rep=G.rep;W.eq=G.eq;const sec=turnOf(),lbl='Dia '+W.day+': '+SETORES[sec].n.toLowerCase();
  W.days.push({k:'Dia '+W.day+' · '+SETORES[sec].n,score:G.final.score,sec});
  const admitFrom=(P,s,note)=>{const R=wkRec(P,s);R.mine=1;R.path[0]=lbl+' → '+(note||SECN[s]);W.inp.push(R)};
  G.pts.forEach(P=>{
    const c=P.c,r=P.res;if(P.st==='skip')return;
    if(c.visit){
      const R=W.inp.find(x=>x.uid===c.uid);if(!R)return;const c0=R.c;
      R.hyp=P.hyp||R.hyp;R.jej=P.mov.jej!=null;
      P.rx.forEach(x=>{const D=DRUGS[x.id];if(D&&D.v[0]==='Solicitação'&&x.id!=='ccih'&&R.reqs[x.id]!=='ok')R.reqs[x.id]='pend'});
      R.rx=P.rx.filter(r=>r.freq!=='u'&&DRUGS[r.id]&&DRUGS[r.id].v[0]!=='Solicitação').map(r=>Object.assign({},r));R.iso=P.mov.iso;
      R.evos=(R.evos||[]).concat(P.evos||[]);R.flow=(R.flow||[]).concat(flowOf(P));R.vs=(P.vs||[]).slice(-12);R.par=JSON.parse(JSON.stringify(P.par||{}));
      R.pendLabs=Object.entries(P.ord).filter(([k,o])=>o.rot&&!o.done).map(([k])=>k);
      R.adjust=P.rx.some(x=>!x.carry&&c0.key.some(k=>k.ids.includes(x.id)&&okIdx(k,x.id).includes(x.i)));
      if(R.prevMiss&&P.rx.some(x=>!x.carry&&c0.key.some(k=>k.lb===R.prevMiss&&k.ids.includes(x.id)))){R.prevMiss=null;R.trend=Math.max(R.trend,0)}
      if(P.interc&&P.interc.fired!=null&&(P.interc.seen==null||P.ks[P.ks.length-1]==null)){R.trend=Math.max(-2,R.trend-1);R.could.push('Reavaliar e tratar a intercorrência ('+P.interc.txt+').')}
      if(R.ksMiss.length&&R.adjust)R.ksMiss=[];
      R.missedVisit=P.st==='handoff';
      const d=P.dest,lb='Dia '+W.day+' (D'+R.hd+'): ';
      if(P.reg||d==='TRANS'){W.inp=W.inp.filter(x=>x!==R);W.done.push({nome:R.nome,idade:R.idade,dx:dxLabel(c0.hyp),out:'Transferido no D'+R.hd,path:R.path.concat(lb+'transferido'),could:R.could});return}
      if(P.st==='handoff'){R.path.push(lb+'não foi visto no turno');return}
      if(d==='ALTA'){W.inp=W.inp.filter(x=>x!==R);const safe=P.c.dest.alta;
        W.done.push({nome:R.nome,idade:R.idade,dx:dxLabel(c0.hyp),out:safe?'Alta no D'+R.hd:'Alta precoce no D'+R.hd,path:R.path.concat(lb+'alta'),could:safe?R.could:R.could.concat(couldFor(c0,P.res.errs))});
        if(!safe)W.pendRet.push({rec:Object.assign(R,{trend:-1,hd:1,path:R.path.concat(lb+'alta precoce')}),unsafe:true});return}
      if(d&&d!==R.sector){R.path.push(lb+SECN[R.sector]+' → '+SECN[d]);R.sector=d;R.leito=freeBed(d)}else R.path.push(lb+'segue em '+SECN[R.sector]);
      if(P.res&&['ruim','parcial'].includes(P.res.cls))R.could=R.could.concat(P.res.errs.slice(0,2));
      return;
    }
    if(P.st==='dead'||(r&&r.cls==='obito')){doneRec(P,'Óbito',P.st==='dead'?'óbito no atendimento':'óbito no transporte');return}
    if(P.reg&&P.st==='handoff'){doneRec(P,'Transferido','transferência regulada');return}
    if(P.st==='handoff'){const s=c.dest.best.find(x=>WARD.includes(x))||(c.dest.best.includes('EMG')?'UTI':null);
      if(s){const R=wkRec(P,s);R.mine=1;R.adm.cls='parcial';R.path[0]=lbl+': passado sem desfecho; o colega internou em '+SECN[s];W.inp.push(R)}else doneRec(P,'Alta pelo colega','passado sem desfecho; o colega deu alta');return}
    if(P.dest==='TRANS'){doneRec(P,'Transferido','transferência regulada');return}
    if(P.dest==='ALTA'){doneRec(P,c.dest.alta?'Alta':'Alta insegura','alta pelo '+SETORES[sec].n.toLowerCase());
      if(!c.dest.alta||r.cls==='ruim')W.pendRet.push({rec:Object.assign(wkRec(P,c.dest.best.find(x=>WARD.includes(x))||'ENF'),{mine:1}),unsafe:!c.dest.alta});return}
    if(P.dest==='EMG'){const s=c.dest.best.includes('UTI')||c.dest.ok.includes('UTI')?'UTI':'ENF';admitFrom(P,s,'sala vermelha (colega) → '+SECN[s]);return}
    if(WARD.includes(P.dest))admitFrom(P,P.dest);
  });
  W.phase=W.day>=W.len?'end':'next';saveWeek();
}
function doneRec(P,out,note){
  const c=P.c,r=P.res||{};const bad=['obito','ruim','parcial'].includes(r.cls)||/óbito|insegura/i.test(out);
  W.done.push({nome:c.nome,idade:c.idade,dx:dxLabel(c.hyp),out,path:['Dia '+W.day+': '+note],could:bad?couldFor(c,r.errs):[]});
}
/* ---------- ações, rótulos e botões ---------- */
function wkAction(v){
  const [a,b]=v.split(':');
  if(a==='setor'){UI.wkSetor=b;return}if(a==='modo'){UI.wkModo=b;return}if(a==='dif'){UI.wkDif=b;return}
  UI.menu=false;UI.confirmReset=false;UI.tab='leito';UI.destSel=null;UI.msg='';UI.weekRep=false;
  if(a==='start'||a==='again'){const s=a==='again'&&W?W.setor:UI.wkSetor||'porta',m=a==='again'&&W?W.modo:UI.wkModo||'turno',d=a==='again'&&W?W.dif:UI.wkDif||'m';startWeek(s,m,d);return}
  if(a==='next'){nextTurn();return}
  if(a==='resume'){if(W.phase==='next')nextTurn();else if(W.phase==='turno'&&(!G||G.over))startTurn();else if(W.phase==='end')UI.weekRep=true;return}
  if(a==='rep'){W.phase='end';saveWeek();UI.weekRep=true;return}
  if(a==='new'){W=null;saveWeek();G=null;UI.weekRep=false;UI.menu=true;return}
}
function shiftLbl(){
  if(!G)return'';const s=SETORES[turnOf()]||SETORES.porta;
  return(W&&W.len>1?'Dia '+W.day+' de '+W.len+' · ':'')+s.n+' ('+s.h.replace(' às ','–')+')';
}
function nextBtns(){
  if(!W)return'<button class="btn" data-a="menu">Menu</button>';
  if(W.len===1)return'<button class="btn red" data-a="wk:again">Novo turno no mesmo setor</button><button class="btn" data-a="menu">Menu</button>';
  if(W.phase==='end')return'<button class="btn red" data-a="wk:rep">Ver o relatório '+(W.len>7?'do mês':'da semana')+'</button>';
  const ns=UI.nextSec||W.esc[W.day],S=SETORES[ns];
  return(W.modo==='rodizio'?'<label class="f" style="color:var(--ink2)">Próximo turno (pode trocar com um colega)<select data-s="nextsec">'+Object.entries(SETORES).map(([k,x])=>'<option value="'+k+'"'+(k===ns?' selected':'')+'>'+x.n+' ('+x.h+')</option>').join('')+'</select></label>':'')
   +'<button class="btn red" data-a="wk:next">Próximo turno: dia '+(W.day+1)+' · '+S.n+' ('+S.h+')</button>';
}
function visitHint(P){
  if(!P||!P.c.visit)return'';const R=W&&W.inp.find(x=>x.uid===P.c.uid);if(!R)return'';
  return'<p style="margin:0 0 6px;color:#3b5a73;font-size:17px">Internado em <b>'+SECN[R.sector]+'</b>, D'+R.hd+'. Para seguir internado, carimbe "Manter"; para mudar de setor, escolha outro; ou dê alta.</p>';
}
function destList(P){
  const t=turnOf(),L=k=>(DESTS.find(x=>x[0]===k)||[k,k])[1];
  if(t==='porta')return[['ALTA',L('ALTA')],['OBS',L('OBS')],['AMA',L('AMA')],['ENF','Internar na enfermaria'],['EMG','Sala vermelha (passa ao colega)'],['TRANS',L('TRANS')]];
  if(t==='sala')return[['ALTA',L('ALTA')],['OBS',L('OBS')],['AMA',L('AMA')],['ENF','Internar na enfermaria'],['UTI','UTI'],['EMG','Manter na sala vermelha'],['TRANS',L('TRANS')]];
  if(t==='uti')return[['UTI',P.c.visit?'Manter na UTI':'Internar na UTI'],['ENF','Alta da UTI para a enfermaria'],['TRANS',L('TRANS')]];
  return[['ENF',P.c.visit?'Manter na enfermaria':'Internar na enfermaria'],['ALTA','Alta hospitalar'],['UTI','Pedir vaga de UTI'],['TRANS',L('TRANS')]];
}
function weekReportHtml(){
  const all=[...W.done,...W.inp.filter(R=>R.mine).map(R=>({nome:R.nome,idade:R.idade,dx:dxLabel(R.c.hyp),out:'Ainda internado (D'+R.hd+', '+SECN[R.sector]+')',path:R.path,could:R.could}))];
  const ob=all.filter(x=>/^Óbito/.test(x.out)).length,al=all.filter(x=>/^Alta/.test(x.out)).length,tr=all.filter(x=>/^Transf/.test(x.out)).length;
  const avg=a=>a.length?Math.round(a.reduce((s,d)=>s+d.score,0)/a.length):0,sc=Math.round(avg(W.days)-ob*14/W.len);
  const by=Object.keys(SETORES).map(k=>{const L=W.days.filter(d=>d.sec===k);return L.length?SETORES[k].n+': '+L.length+' turno'+(L.length>1?'s':'')+' (média '+avg(L)+')':''}).filter(Boolean).join(' · ');
  const rk=x=>/^Óbito/.test(x.out)?0:x.could.length?1:2,sorted=all.slice().sort((a,b)=>rk(a)-rk(b));
  return'<article class="doc px card"><h3>Relatório '+(W.len>7?'do mês':W.len>1?'da semana':'do turno')+' <span>'+(W.modo==='rodizio'?'rodízio':SETORES[W.setor].n)+' · '+difOf(W.dif).n+'</span></h3><div class="big">Nota '+Math.max(0,sc)+'/100</div>'
   +'<p><b>Preceptor (RQE):</b> "'+esc(rqeFinal(sc))+'"</p><p>'+by+'.</p>'
   +'<p>Pacientes seus: <b>'+all.length+'</b>. Altas: <b>'+al+'</b>. Transferências: <b>'+tr+'</b>. Óbitos: <b>'+ob+'</b>. Reputação final '+Math.round(W.rep)+'.</p>'
   +'<p class="sub">Notas por turno</p><p>'+W.days.map(d=>esc(d.k)+': <b>'+d.score+'</b>').join(' · ')+'</p>'
   +'<p class="sub">Cada paciente, do começo ao fim</p><div class="rep">'+sorted.map(x=>'<div class="rp"><h4><span>'+esc(x.nome)+', '+x.idade+'</span><span class="tag t-'+(/^Óbito/.test(x.out)?'obito':/insegura|precoce/.test(x.out)?'ruim':/^Alta/.test(x.out)?'otimo':'pend')+'">'+esc(x.out.toUpperCase())+'</span></h4>'
     +'<div style="font-size:18px">'+esc(x.dx)+'</div><div style="color:var(--ink2);font-size:18px">'+x.path.map(esc).join(' → ')+'</div>'
     +(x.could.length?'<div style="font-size:18px"><b>Nesse caso, poderia ter feito:</b></div><ul class="warn">'+[...new Set(x.could)].slice(0,7).map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul>':'')+'</div>').join('')+'</div>'
   +'<div class="row"><button class="btn red" data-a="wk:new">Novo jogo</button></div></article>';
}
