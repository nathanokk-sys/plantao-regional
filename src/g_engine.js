/* ===== MOTOR: tempo, evolução clínica, prescrição, destino, relatório (sem tocar na interface) ===== */
const $=s=>document.querySelector(s),pad=n=>String(n).padStart(2,'0');
const fmt=t=>{const m=Math.floor((G&&G.t0!=null?G.t0:T0)+t)%1440;return pad(Math.floor(m/60))+':'+pad(m%60)};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
let G=null;
const ACTIVE=['queue','care','emg','reg'];
function mkPt(c){const P={id:c.id,c,look:mkLook(c),st:'wait',stage:0,worst:0,ks:[],adv:[],ord:{},rx:[],log:[],asked:new Set(),examined:new Set(),pen:[],good:[],hyp:'',note:'',orient:new Set(),lv:{t:c.arr,v:c.vit[0]},seen:null,dest:null,res:null,reg:null,newRes:0};P.off=null;P.mov={};return P}
function admit(c,slot){
  c.arr=Math.max(G.slots[slot]!=null?G.slots[slot]:c.arr,G.t);
  const P=mkPt(c);P.no=++G.no;P.off=sprite(P);G.pts.push(P);G.filled++;
  if(c.arr<=G.t){P.st='queue';alert_(fmt(G.t)+' Chegou '+c.nome.split(' ')[0]+' ('+c.tri.toLowerCase()+').',c.tri==='VERMELHO')}
}
const pt=id=>G.pts.find(p=>p.id===id);
const cur=()=>G&&G.act?pt(G.act):null;
const active=()=>G.pts.filter(p=>ACTIVE.includes(p.st));
function alert_(txt,hot){G.al.unshift({t:G.t,txt,hot:!!hot});G.al.length=Math.min(G.al.length,400);if(window.sfx)sfx(hot?'alarm':'blip')}
function bedFree(k){const b=G.beds[k];return b.cap-(k==='emg'?b.bg+active().length:b.used)}
function newShift(n,mode,posto){
  G={n,t:0,end:SHIFT,act:null,ins:100,rep:50,eq:50,al:[],over:false,modal:null,chefia:0,unsafe:0,news:[],sched:[],unread:0,
    pts:[],mode:mode||'local',slots:mode==='local'?CASES.map(c=>c.arr):SLOTS.slice(),filled:0,no:0,stock:{sorobot:6,hemac:8},off:Math.random()<.3?{tc:{until:9999,why:'Tomógrafo em manutenção neste plantão. Só por regulação.'}}:{},
    beds:{emg:{cap:6,bg:2},obs:{cap:10,used:6},ama:{cap:8,used:5},enf:{cap:20,used:14},uti:{cap:5,used:4}},
    evs:mkEvs(mode,posto||'misto'),posto:posto||'misto'};
  if(G.mode==='local')CASES.forEach((c,i)=>admit(JSON.parse(JSON.stringify(c)),i));else procStart();
  tickMin();
}
function setStage(P,ns){
  if(ns<P.stage&&ns<0)alert_(fmt(G.t)+' Enfermagem: '+P.c.nome.split(' ')[0]+' piorou.',true);
  else if(ns===1&&P.stage<1)alert_(fmt(G.t)+' Enfermagem: '+P.c.nome.split(' ')[0]+' está melhor.');
  P.stage=ns;P.worst=Math.min(P.worst,ns);
}
function evolve(P){
  if(P.ksPend&&P.ksPend.length)P.ksPend=P.ksPend.filter(x=>{if(G.t>=x.at){if(P.ks[x.ki]==null)P.ks[x.ki]=x.at;return false}return true});
  if(P.c.visit)return;
  const c=P.c,t=G.t;let lag=0;
  c.key.forEach((k,i)=>{if(P.ks[i]==null&&t-c.arr>k.by)lag++});
  lag+=P.adv.filter(x=>t-x<45).length;
  let ns=lag>=2?-2:lag===1?-1:0;
  const done=c.key.every((k,i)=>P.ks[i]!=null),lastK=Math.max(0,...P.ks.filter(x=>x!=null));
  if(lag===0&&done&&t-lastK>=c.tEff)ns=1;
  if(ns!==P.stage)setStage(P,ns);
  if(P.stage<=-2&&c.fatal&&t-c.arr>c.fatalBy&&!done)die(P);
}
function die(P){
  P.st='dead';P.res={cls:'obito',score:0,txt:P.c.out.obito,errs:['Paciente evoluiu a óbito.'],goods:[]};
  G.rep=clamp(G.rep-10);G.eq=clamp(G.eq-6);alert_(fmt(G.t)+' '+P.c.nome+' evoluiu a óbito.',true);
  if(G.act===P.id)G.act=null;if(window.sfx)sfx('flat');
}
function tickMin(){
  const t=G.t;
  G.pts.forEach(P=>{
    if(P.st==='wait'&&P.c.arr<=t){P.st='queue';alert_(fmt(t)+' Chegou '+P.c.nome.split(' ')[0]+' ('+P.c.tri.toLowerCase()+').',P.c.tri==='VERMELHO')}
    if(!ACTIVE.includes(P.st))return;
    Object.entries(P.ord).forEach(([k,o])=>{if(!o.done&&t>=o.due){o.done=true;P.newRes++;if(o.bad)alert_(fmt(t)+' Problema no exame '+EXAMS[k].n+' de '+P.c.nome.split(' ')[0]+': '+o.bad,true);else alert_(fmt(t)+' Resultado pronto: '+EXAMS[k].n+' de '+P.c.nome.split(' ')[0]+'.')}});
    evolve(P);if(P.st==='emg')emgCheck(P);
    if(P.st==='reg'&&t>=P.reg.at)depart(P);
  });
  G.evs.forEach(e=>{if(!e.done&&t>=e.at){e.done=true;e.run()}});
  G.sched=G.sched.filter(it=>{if(t>=it.at){deliver(it);return false}return true});
}
function adv(m){
  const target=Math.round((G.t+m)*100)/100;
  while(!G.over&&Math.floor(G.t)+1<=target){G.t=Math.floor(G.t)+1;tickMin();if(G.t>=G.end){endShift();return}}
  if(!G.over)G.t=target;
  if(!G.over&&G.filled>=G.slots.length&&!G.sched.some(x=>x.kind==='ret')&&G.pts.every(p=>['done','dead'].includes(p.st)))endShift();
}
/* ===== ações do jogador ===== */
function pick(id){const P=pt(id);if(!P||!ACTIVE.includes(P.st))return;G.act=id;if(P.st==='queue'){P.st='care';P.seen=G.t}}
function askQ(P,key){ /* key: 'g:comorb' | 'p:3' */
  if(P.asked.has(key))return;P.asked.add(key);
  let q,a;
  if(key[0]==='g'){const g=key.slice(2);q=GEN_Q.find(x=>x[0]===g)[1];a=g==='comorb'?P.c.comorb:g==='uso'?P.c.uso:g==='alerg'?P.c.alergiaTxt:genAns(P,g)}
  else{const x=P.c.perg[+key.slice(2)];q=x[0];a=x[1]}
  P.log.push({t:G.t,k:'q',q,a,fresh:1});adv(.25);
}
function exam(P,s){if(P.examined.has(s))return;P.examined.add(s);P.log.push({t:G.t,k:'x',q:SYS.find(x=>x[0]===s)[1],a:P.c.ex[s]||'Sem alterações dignas de nota.',fresh:1});adv(1)}
function vitals(P){adv(1);P.lv={t:G.t,v:P.c.vit[P.stage]}}
function reassess(P){adv(3);P.lv={t:G.t,v:P.c.vit[P.stage]};P.log.push({t:G.t,k:'r',q:'Reavaliação',a:P.c.reav[P.stage]||'Sem mudanças.',fresh:1})}
function order(P,id,free,urg){
  const E=EXAMS[id],U=!!urg&&E.t>=20,tt=U?Math.ceil(E.t/2):E.t,cc=E.c+(U?1:0);if(P.ord[id]&&!P.ord[id].bad)return'Já solicitado.';
  const off=G.off[id];if(off&&G.t<off.until)return off.why;
  if(G.ins<cc){if(P.c.tri==='VERMELHO'||P.c.tri==='LARANJA'){G.overCota=(G.overCota||0)+(cc-G.ins);G.rep=clamp(G.rep-1);alert_(fmt(G.t)+' Direção: exame liberado como urgência acima da cota de insumos.')}else return'Cota de insumos esgotada: agora só há exames de urgência para pacientes vermelhos e laranjas (e os exames sem custo).'}
  G.ins=Math.max(0,G.ins-cc);P.ord[id]={t0:G.t,due:G.t+tt,done:tt<=1,urg:U};
  const er=examErr(id);if(er){if(er.bad)P.ord[id].bad=er.bad;if(er.extra){P.ord[id].due+=er.extra;P.ord[id].done=false;alert_(fmt(G.t)+' '+er.note)}}
  if(!P.c.util.includes(id)&&id!=='glic'&&id!=='ecg'){P.pen.push([2,'Exame sem indicação: '+E.n+'.']);if(window.rqe)rqe('ex',.35)}
  if(tt<=1)P.newRes++;
  adv(free?0:.5);return null;
}
function addAE(P,txt,pen,why){P.adv.push(G.t);P.pen.push([pen,why||txt]);P.log.push({t:G.t,k:'ae',q:'Evento adverso',a:txt,fresh:1});alert_(fmt(G.t)+' Evento adverso em '+P.c.nome.split(' ')[0]+'.',true);if(window.rqe)rqe('ae',.75)}
function rxAdd(P,f,free){
  const id=f.drug,D=DRUGS[id],c=P.c,i=f.dose;
  if(!D)return'Escolha um medicamento.';
  if(id==='o2')P.rx=P.rx.filter(r=>r.id!=='o2');else if(P.rx.some(r=>r.id===id))return'Já prescrito para este paciente.';
  if(c.stock&&c.stock[id]!=null||G.stock[id]!=null){
    const need=id==='sorobot'?[2,4,8,12][i]:id==='hemac'?[1,2,3,4][i]:0;
    if(G.stock[id]!=null&&need>G.stock[id])return'Estoque insuficiente: restam '+G.stock[id]+' unidades. Escolha uma dose menor ou solicite reposição pela regulação.';
    if(G.stock[id]!=null)G.stock[id]-=need;
  }
  const rx={id,i,via:f.via,freq:f.freq,dur:f.dur,t:G.t};
  /* alergia */
  if(D.al&&c.alergia.includes(D.al))addAE(P,c.alergiaMsg||'Reação alérgica grave.',40,(c.alOmit&&!P.asked.has('g:alerg')?'Alergia omitida na triagem e não reconfirmada na anamnese: ':'Medicação da classe a que o paciente tem alergia grave: ')+D.n+'.'),P.adv.push(G.t);
  let handled=false;const ct=c.contra[id];
  if(ct){const from=typeof ct==='string'?0:ct.from,t=typeof ct==='string'?ct:ct.t;if(i>=from){addAE(P,t,20,'Medicação contraindicada ou perigosa neste caso: '+D.n+'.');handled=true}}
  (c.seq||[]).forEach(s=>{if(id===s.then&&!P.rx.some(r=>r.id===s.first)){addAE(P,s.t,20,'Ordem errada de condutas: '+D.n+' antes de '+DRUGS[s.first].n+'.');handled=true}});
  const ev=isEVrx(D,f.via);
  if(ev){const dd=dlDefault(id);rx.dil=f.dil||dd.dil;rx.inf=f.inf||dd.inf;const R=DL[id];
    if(R){if(R.bad&&R.bad[rx.dil]){if(!handled)addAE(P,R.bad[rx.dil],20,'Diluição perigosa: '+D.n+' em '+DIL[rx.dil]+'.');handled=true}
      else if(R.ok&&!R.ok.includes(rx.dil))P.pen.push([3,'Diluição inadequada: '+D.n+' ('+DIL[rx.dil]+').']);
      if(R.ibad&&R.ibad[rx.inf]){if(!handled)addAE(P,R.ibad[rx.inf],20,'Velocidade de infusão perigosa: '+D.n+'.');handled=true}
      else if(R.ineff&&R.ineff.includes(rx.inf)){P.pen.push([6,R.ineffT||'Infusão ineficaz: '+D.n+'.']);handled=true}
      else if(R.iok&&!R.iok.includes(rx.inf))P.pen.push([3,'Tempo de infusão inadequado: '+D.n+' ('+INF[rx.inf]+').'])}
    if(f.freq==='ic'&&rx.inf!=='cont')P.pen.push([3,'Infusão contínua precisa correr em bomba: '+D.n+'.'])}
  let isKey=false;
  c.key.forEach((k,ki)=>{
    if(!k.ids.includes(id))return;isKey=true;
    const ok=okIdx(k,id);
    if(ok.includes(i)){if(P.ks[ki]==null&&!handled){if(RESTR.includes(id)&&!P.rx.some(r=>r.id==='ccih')){P.ksPend=(P.ksPend||[]).concat([{ki,at:1e9,ccih:1}])}else if(isEVrx(D,f.via)&&Math.random()<.01){P.ksPend=(P.ksPend||[]).concat([{ki,at:G.t+30}]);P.log.push({t:G.t,k:'m',q:'Enfermagem',a:'A medicação foi trocada com a do leito vizinho; o erro foi percebido a tempo e a dose certa atrasou 30 min.',fresh:1});alert_(fmt(G.t)+' Enfermagem: troca de medicação com o leito vizinho percebida a tempo; '+D.n+' atrasou 30 min.',true)}else P.ks[ki]=G.t}}
    else if(i>Math.max(...ok)){if(!handled){addAE(P,D.ae||'Dose acima da recomendada.',12,'Dose acima da recomendada: '+D.n+'.');handled=true}}
    else if(id!=='o2')P.pen.push([6,'Dose insuficiente: '+D.n+'.']);
  });
  if(!isKey&&!handled){
    if(c.allowed.includes(id)||id==='o2'||id==='ccih'){if(D.tox!=null&&i>=D.tox)addAE(P,D.ae,12,'Dose acima da recomendada: '+D.n+'.')}
    else if(['iot','cvc','dreno','parac','cardiov','desfib'].includes(id))addAE(P,'Procedimento invasivo sem indicação: '+D.n.toLowerCase()+' com complicação (sangramento, pneumotórax, infecção ou lesão de via aérea).',20,'Procedimento invasivo sem indicação: '+D.n+'.');
    else if(D.v[0]==='Solicitação'){P.pen.push([3,'Solicitação sem indicação: '+D.n+'.']);if(window.rqe)rqe('ex',.5)}
    else{P.pen.push([6,'Prescrição sem indicação: '+D.n+'.']);G.ins=Math.max(0,G.ins-1)}
  }
  if(!D.f.split(' ').includes(f.freq)||!D.dr.split(' ').includes(f.dur))P.pen.push([3,'Frequência ou duração inadequada: '+D.n+'.']);
  P.rx.push(rx);
  if(RESTR.includes(id)&&!P.rx.some(r=>r.id==='ccih')){rx.ccih=1;P.log.push({t:G.t,k:'m',q:'Farmácia',a:D.n+' é antimicrobiano de uso restrito: só é dispensado com a ficha de solicitação à CCIH (aba Procedimentos e pedidos).',fresh:1});alert_(fmt(G.t)+' Farmácia: '+D.n+' aguardando a ficha da CCIH.',true)}
  let aceT=0;if(/EV/.test(D.v[f.via||0])&&P.mov.ace==null){P.mov.ace=G.t;G.ins=Math.max(0,G.ins-1);aceT=2;P.log.push({t:G.t,k:'m',q:'Enfermagem',a:'Acesso venoso puncionado para a medicação EV (2 min, 1 insumo).',fresh:1})}
  adv((free?0:1)+aceT);return null;
}
function setHyp(P,h){P.hyp=h}
/* ===== destino ===== */
function canGo(d){
  if(d==='UTI')return bedFree('uti')>0?null:'Sem leito de UTI. Mantenha na sala de emergência ou solicite transferência regulada.';
  if(d==='ENF')return bedFree('enf')>0?null:'Enfermaria lotada.';
  if(d==='OBS')return bedFree('obs')>0?null:'Observação lotada.';
  if(d==='AMA')return bedFree('ama')>0?null:'Sala amarela lotada.';
  if(G.mode==='visit'&&d==='EMG')return'Na visita o paciente já está internado: mantenha no setor, mude de setor (UTI se instável), transfira ou dê alta.';
  return null;
}
function commit(P,d){
  const e=canGo(d);if(e)return e;
  if(d==='ALTA'&&P.orient.size===0)P.pen.push([6,'Alta sem orientações registradas.']);
  if(d==='EMG'){P.st='emg';P.emgT=G.t;P.emgChk=0;P.log.push({t:G.t,k:'d',q:'Destino',a:'Mantido na sala de emergência, monitorizado.',fresh:1});adv(2);return null}
  if(d==='TRANS'){P.st='reg';P.reg={at:G.t+rnd(60,100)};P.log.push({t:G.t,k:'d',q:'Destino',a:'Regulação acionada. Aguardando vaga e transporte.',fresh:1});adv(2);return null}
  finalize(P,d);if(G.act===P.id)G.act=null;adv(2);return null;
}
function depart(P){P.depT=G.t;finalize(P,'TRANS',true);alert_(fmt(G.t)+' '+P.c.nome.split(' ')[0]+' saiu em transferência regulada.');if(G.act===P.id)G.act=null}
function finalize(P,d,fromReg){
  const c=P.c;
  if(!fromReg){ if(d==='UTI')G.beds.uti.used++;if(d==='ENF')G.beds.enf.used++;if(d==='OBS')G.beds.obs.used++;if(d==='AMA')G.beds.ama.used++ }
  const pen=P.pen.slice(),good=P.good.slice(),goods=[];
  const best=c.dest.best.includes(d),okd=c.dest.ok.includes(d);
  if(best)goods.push('Destino adequado: '+DESTS.find(x=>x[0]===d)[1]+'.');else if(okd)pen.push([8,'Destino aceitável, mas não o melhor: '+DESTS.find(x=>x[0]===d)[1]+'.']);
  else pen.push([35,'Destino inadequado: '+DESTS.find(x=>x[0]===d)[1]+'.']);
  if(d==='ALTA'&&!c.dest.alta){pen.push([60,'Alta insegura de paciente que exigia internação.']);G.unsafe++}
  if(d==='ALTA'&&c.dest.alta&&P.orient.size>=2)goods.push('Alta com orientações registradas.');
  c.key.forEach((k,i)=>{if(P.ks[i]==null)pen.push([15,'Faltou: '+k.lb+'.']);else goods.push('Feito: '+k.lb+'.')});
  if(!P.hyp)pen.push([15,'Hipótese diagnóstica não registrada.']);
  else if(P.hyp!==c.hyp)pen.push([15,'Diagnóstico perdido: a hipótese registrada foi "'+DXS.find(x=>x[0]===P.hyp)[1]+'".']);
  else if(c.evid.length&&!c.evid.some(e=>P.ord[e]&&P.ord[e].done&&!P.ord[e].bad))pen.push([5,'Diagnóstico correto, mas empírico, sem exame que o confirmasse.']);
  else goods.push('Diagnóstico correto: '+DXS.find(x=>x[0]===c.hyp)[1]+'.');
  if(P.asked.size>=4)goods.push('Anamnese dirigida.');
  if(P.seen!=null){const w=Math.round(P.seen-c.arr);if(c.tri==='VERMELHO'&&w>12)pen.push([10,'Atendimento tardio de paciente vermelho (espera de '+w+' min).']);else if(c.tri==='LARANJA'&&w>25)pen.push([5,'Atendimento tardio de paciente laranja (espera de '+w+' min).'])}
  if(c.tri==='VERMELHO'||c.tri==='LARANJA'){if(P.mov.mon==null)pen.push([8,'Paciente grave sem monitorização.']);else goods.push('Paciente grave monitorizado.');if(P.mov.ace==null)pen.push([6,'Paciente grave sem acesso venoso.'])}
  if(c.visit&&window.visitPen)visitPen(P,d,pen,goods);
  if(typeof ISO!=='undefined'){const m=P.mov||{};
    if(c.iso){const need=ISOK[c.iso],nm=ISO.find(x=>x[0]===need)[2].toLowerCase();if(m.iso!==need)pen.push([m.iso?4:8,(m.iso?'Isolamento inadequado; o indicado era ':'Faltou isolamento: ')+nm+'.']);else goods.push('Isolamento correto.')}
    else if(m.iso)pen.push([2,'Isolamento sem indicação (leito de isolamento ocupado).'])}
  if(d==='ALTA'&&c.ret){if(!P.ret)pen.push([3,'Alta sem retorno definido.']);else if(!c.ret.includes(P.ret))pen.push([2,'Retorno inadequado para o quadro.']);else goods.push('Retorno adequado.');
    P.rx.filter(r=>DRUGS[r.id]&&isEVrx(DRUGS[r.id],r.via)&&r.freq!=='u'&&!['u','h24'].includes(r.dur)).forEach(r=>pen.push([3,'Alta com '+DRUGS[r.id].n+' EV em uso contínuo: suspenda e passe para VO na receita.']))}
  if(P.rx.some(r=>r.id==='ccih')&&!P.rx.some(r=>RESTR.includes(r.id)))pen.push([3,'Solicitação à CCIH sem antimicrobiano restrito.']);
  if(P.ksPend&&P.ksPend.some(x=>x.ccih))pen.push([5,'Antimicrobiano restrito prescrito sem a ficha da CCIH: a farmácia não dispensou.']);
  if(P.worst<=-2)pen.push([20,'Deterioração clínica importante durante o atendimento.']);else if(P.worst===-1)pen.push([8,'Piora clínica durante o atendimento.']);
  if(d==='TRANS'&&P.stage<0)pen.push([25,'Transferido ainda instável.']);
  let sc=100;const errs=[];pen.forEach(([p,t])=>{sc-=p;errs.push(t)});sc=clamp(sc);
  const cls=sc>=85?'otimo':sc>=65?'bom':sc>=40?'parcial':'ruim';
  const txt=cls==='otimo'||cls==='bom'?c.out.ok:cls==='parcial'?c.out.part:c.out.bad;
  P.dest=d;P.st='done';P.res={cls,score:sc,txt,errs,goods};scheduleFate(P,d);
  G.rep=clamp(G.rep+(sc-60)/8);G.eq=clamp(G.eq+(sc-60)/12);
  if(window.sfx)sfx(cls==='otimo'||cls==='bom'?'good':cls==='parcial'?'mid':'bad');
}
/* dilema ético da chefia */
function resolveDil(n){
  if(n===1){G.beds.obs.used=Math.max(0,G.beds.obs.used-1);G.eq=clamp(G.eq+4);G.chefia=1;alert_(fmt(G.t)+' Alta planejada no leito 4 liberou uma vaga na observação.')}
  if(n===2){G.beds.obs.used=Math.max(0,G.beds.obs.used-1);G.eq=clamp(G.eq+6);G.rep=clamp(G.rep-6);G.unsafe++;G.chefia=2;alert_(fmt(G.t)+' Leito 6 liberado. Paciente saiu com PA 170/100 e sem seguimento.',true)}
  if(n===3){G.eq=clamp(G.eq-6);G.rep=clamp(G.rep+2);G.chefia=3;alert_(fmt(G.t)+' Justificativa registrada. A direção ficou insatisfeita.')}
  G.modal=null;
}
/* ===== fim do plantão e relatório ===== */
function endShift(){
  if(G.over)return;G.over=true;G.sched.forEach(it=>deliver(it,true));G.sched=[];
  G.pts.forEach(P=>{
    if(ACTIVE.includes(P.st)||P.st==='wait'){
      if(P.st==='wait'){P.st='skip';P.res={cls:'pend',score:0,txt:'Não chegou antes do fim do plantão.',errs:[],goods:[]};return}
      let sc=100;const errs=['Passagem de plantão sem desfecho definido.'];sc-=25;
      P.pen.forEach(([p,t])=>{sc-=p;errs.push(t)});
      P.c.key.forEach((k,i)=>{if(P.ks[i]==null){sc-=15;errs.push('Faltou: '+k.lb+'.')}});
      if(P.stage<0){sc-=15;errs.push('Passou o plantão em piora clínica.')}
      P.res={cls:'pend',score:clamp(sc),txt:'Paciente entregue ao plantão seguinte sem desfecho.',errs,goods:[]};P.st='handoff';
    }
  });
  const list=G.pts.filter(p=>p.st!=='skip'),avg=list.length?Math.round(list.reduce((a,p)=>a+p.res.score,0)/list.length):0;
  const score=clamp(Math.round(avg*.8+G.rep*.1+G.eq*.1-G.unsafe*3));
  G.final={avg,score,dead:G.pts.filter(p=>p.st==='dead').length,unsafe:G.unsafe,exams:G.pts.reduce((a,p)=>a+p.pen.filter(x=>/^Exame sem/.test(x[1])).length,0),
    rx:G.pts.reduce((a,p)=>a+p.pen.filter(x=>/Prescrição sem|Dose|Medicação|Frequência|Ordem errada/.test(x[1])).length,0),
    missed:G.pts.reduce((a,p)=>a+(p.res&&p.res.errs.some(e=>/Diagnóstico perdido|Hipótese diagnóstica não/.test(e))?1:0),0),
    missing:G.slots.length-G.filled,right:G.pts.reduce((a,p)=>a+(p.res?p.res.goods.length:0),0)};
  if(G.mode!=='visit')try{const s=JSON.parse(localStorage.getItem('pr_save')||'{"shifts":[]}');s.shifts.push({n:G.n,score,rep:Math.round(G.rep)});localStorage.setItem('pr_save',JSON.stringify(s));localStorage.removeItem('pr_cur')}catch(e){}
  if(G.mode==='visit')try{localStorage.removeItem('pr_cur')}catch(e){}
  if(window.weekAfter)weekAfter();
  if(window.sfx)sfx('bell');
}
