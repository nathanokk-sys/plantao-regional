/* ===== v2: administração (agora, aprazamento, bomba), sinais vitais dinâmicos, acesso, soros e diurese ===== */
const HSTEP={s4:4,s6:6,s8:8,s12:12,s24:24};
const t0of=()=>(G&&G.t0!=null?G.t0:T0);
const isEVid=(id,via)=>{const D=DRUGS[id];return!!D&&/EV/.test(D.v[via||0]||'')};
const accOk=P=>!(P.acc&&P.acc.st==='perdido');
/* quando a enfermagem administra: AGORA em até poucos minutos; horários cheios pelo aprazamento; bomba em 3 a 8 min */
function admAt(P,f,id){
  const D=DRUGS[id];if(!D||['Procedimento','Solicitação'].includes(D.v[0])||id==='o2')return G.t;
  if(isEVid(id,f.via)&&!accOk(P))return null;
  const mx={mf:2,f:4,m:5,d:8,md:10,inf:15}[difOf().id]||5;
  if(f.freq==='u'||f.freq==='sn')return G.t+rnd(1,mx);
  if(f.freq==='ic')return G.t+rnd(3,8);
  const abs=t0of()+G.t,next=Math.ceil(abs/60)*60;return next-t0of();
}
function aprz(r){
  const D=DRUGS[r.id];if(!D||['Procedimento','Solicitação'].includes(D.v[0]))return'';
  if(r.adm==null)return'aguardando acesso venoso';
  if(r.ccih)return'aguardando liberação da CCIH';
  if(r.freq==='u')return r.adm<=G.t?'administrado às '+fmt(r.adm):'AGORA · até '+fmt(r.adm);
  if(r.freq==='sn')return'se necessário'+(r.adm<=G.t?' · 1ª dose às '+fmt(r.adm):'');
  if(r.freq==='ic'){const b=r.bic||{};return(r.adm<=G.t?'em bomba desde '+fmt(r.adm):'bomba instalada até '+fmt(r.adm))+' · '+b.rate+' mL/h'+(b.done?' · terminou':!b.run?' · PARADA':'')}
  const h=HSTEP[r.freq];if(!h)return'';const h0=Math.floor((t0of()+r.adm)/60)%24,L=[];for(let k=0;k<24/h;k++)L.push(pad((h0+k*h)%24)+'h');
  return'aprazado: '+L.join(' · ');
}
/* bomba e frasco: criados na prescrição */
function rxInit(P,rx,f){
  rx.adm=admAt(P,f,rx.id);if(rx.adm==null)rx.waitAcc=1;
  if(f.freq==='ic'&&rx.id!=='o2'){const S=BICSTD[rx.id]||[20,'diluição padrão do serviço'];rx.bic={rate:+f.rate||S[0],hrs:f.hrs!=null?String(f.hrs):'0',run:true,vol:0,sol:S[1]}}
  if(FLUID.includes(rx.id)&&f.freq!=='ic'){const lab=DRUGS[rx.id].d[rx.i]||'',m=lab.match(/([\d.,]+)\s*(mL|L)/),V=m?num(m[1])*(m[2]==='L'?1000:1):500;
    const inf=rx.inf||f.inf||'h1',rate={rap:999,lento:999,m15:V*2.5,h1:V,h2:V/2,cont:125}[inf]||V;rx.flu={vol:V,rate:Math.round(rate),inf:0}}
}
/* prescrever o mesmo remédio de novo: AGORA + manutenção é permitido; dois esquemas iguais são duplicidade */
function dupCheck(P,f){
  const id=f.drug,D=DRUGS[id];if(['Procedimento','Solicitação'].includes(D.v[0])&&P.rx.some(r=>r.id===id))return'Já solicitado para este paciente.';
  if(f.freq!=='u'&&f.freq!=='sn'&&P.rx.some(r=>r.id===id&&r.freq===f.freq))P.pen.push([4,'Duplicidade terapêutica: '+D.n+' prescrito duas vezes no mesmo esquema.']);
  return null;
}
/* ---------- sinais vitais ---------- */
const parseV=v=>{const[s,d]=String(v[0]).split('/').map(Number);return[s,d,+v[1],+v[2],+v[3],+v[4]]};
const fmtVit=a=>[Math.round(a[0])+'/'+Math.round(a[1]),Math.round(a[2]),Math.round(a[3]),Math.round(a[4]),Math.round(a[5]*10)/10];
function keyRxOf(P,k){return P.rx.find(r=>r.keyCred&&k.ids.includes(r.id))}
function vTarget(P){
  const c=P.c,v=x=>parseV(c.vit[x]||c.vit[0]),st=P.stage,bf=difOf().byF;
  const keyLag=c.key.some((k,i)=>P.ks[i]==null&&G.t-c.arr>k.by*bf);
  if(c.visit||(st<0&&keyLag))return v(st);if(st===1)return v(1);
  const n=c.key.length;if(!n)return v(0);
  let fr=0;c.key.forEach((k,i)=>{const t=P.ks[i];if(t==null)return;const r=keyRxOf(P,k),pd=r&&PD[r.id],pk=pd?pd.pk:c.tEff,on=pd?pd.on:0;fr+=clamp((G.t-t-on)/Math.max(1,pk-on),0,1)});
  fr=fr/n*0.85;const a=v(0),b=v(1);return a.map((x,j)=>x+(b[j]-x)*fr);
}
function doseMult(D,i){if(D.tox!=null&&i>=D.tox)return 2.2;if(D.d.length>=3&&i===0)return .6;if(D.tox!=null&&i===D.tox-1&&D.d.length>=4&&i>=2)return 1.4;return 1}
function profile(P,r,pd,t){
  if(r.adm==null||r.ccih||t<r.adm)return 0;const dt=t-r.adm;let f=dt<pd.on?0:Math.min(1,(dt-pd.on)/Math.max(1,pd.pk-pd.on));
  if(r.freq==='ic'){const b=r.bic||{rate:1};const S=(BICSTD[r.id]||[b.rate])[0]||1;f*=clamp(b.rate/S,0,3);if(b.stopAt!=null&&t>=b.stopAt)f*=Math.max(0,1-(t-b.stopAt)/Math.max(5,pd.du))}
  else if(r.freq==='u'||r.freq==='sn'){if(dt>pd.du)f*=Math.max(0,1-(dt-pd.du)/60)}
  if(r.off!=null&&t>=r.off)f*=Math.max(0,1-(t-r.off)/Math.max(30,Math.min(pd.du,240)));
  return f*doseMult(DRUGS[r.id],r.i);
}
function effects(P,t){
  const e=[0,0,0,0,0,0],b=P.c.base||P.c.id,L=[...P.rx,...(P.rxOff||[])];
  L.forEach(r=>{if(r.keyCred||(P.c.visit&&r.carry))return;
    if(r.id==='o2'&&r.off==null){e[4]+=[4,6,10,12][r.i]||0;return}
    const pd=PD[r.id];
    if(pd){const f=profile(P,r,pd,t);if(!f)return;const add=(o)=>{if(!o)return;e[0]+=(o.s||0)*f;e[1]+=(o.d||0)*f;e[2]+=(o.fc||0)*f;e[3]+=(o.fr||0)*f;e[4]+=(o.sat||0)*f;e[5]+=(o.t||0)*f};
      add(pd);if(CONG.includes(b))add(pd.cong);if(RESPC.includes(b))add(pd.resp);if(HYPO.includes(b))add(pd.hypo)}
    if(r.flu||(FLUID.includes(r.id)&&r.bic)){const vin=(r.flu?r.flu.inf:r.bic.vol)||0,k=vin/500;
      if(HYPO.includes(b)){e[0]+=Math.min(20,6*k);e[1]+=Math.min(8,3*k);e[2]-=Math.min(15,4*k)}else if(CONG.includes(b)){e[4]-=Math.min(8,2*k);e[3]+=Math.min(8,2*k)}else e[0]+=Math.min(6,2*k)}});
  return e;
}
function vitNow(P,t){
  t=t==null?G.t:t;if(!P.vb)P.vb=parseV(P.c.vit[P.stage]||P.c.vit[0]);
  const e=effects(P,t),a=P.vb.map((x,i)=>x+e[i]);
  let h=0;for(const ch of P.id)h=(h*31+ch.charCodeAt(0))%9973;const n=k=>Math.round(Math.sin((Math.floor(t/3)+h)*(k+1.7))*([3,2,2,1,1,0][k]||0));
  const o=[clamp(a[0]+n(0),50,260),clamp(a[1]+n(1),25,150),clamp(a[2]+n(2),28,210),clamp(a[3]+n(3),5,50),clamp(a[4]+n(4),45,100),clamp(a[5],33.5,42)];
  if(o[1]>=o[0]-10)o[1]=o[0]-15;return fmtVit(o);
}
/* ---------- a cada minuto ---------- */
function pharmTick(P,t){
  if(!P.vb)P.vb=parseV(P.c.vit[P.stage]||P.c.vit[0]);
  const T=vTarget(P);P.vb=P.vb.map((x,i)=>x+(T[i]-x)*.12);
  /* acesso venoso */
  if(P.mov&&P.mov.ace!=null&&!P.acc)P.acc={tipo:'Periférico',cal:pickOf(['18G','20G','20G','22G']),local:pickOf(['antebraço esquerdo','antebraço direito','dorso da mão esquerda','fossa antecubital direita']),t:P.mov.ace,st:'pérvio'};
  if(P.acc&&P.acc.st!=='perdido'){const pl={mf:0,f:.01,m:.03,d:.05,md:.07,inf:.12}[difOf().id]||.03;
    if(Math.random()<pl/60){P.acc.st='perdido';P.acc.lost=t;lg(P,'m','Enfermagem','Acesso venoso perdido (infiltrou). Bombas e medicações EV paradas até nova punção.');alert_(fmt(t)+' Enfermagem: '+first(P)+' perdeu o acesso venoso; bomba parada.',true)}
    else if(P.acc.st==='pérvio'&&Math.random()<pl/120){P.acc.st='flebite';P.acc.fleb=t;lg(P,'m','Enfermagem','Sinais de flebite no acesso venoso (dor e hiperemia). Programar troca.')}
    else if(P.acc.st==='flebite'&&t-P.acc.fleb>120){P.acc.st='perdido';P.acc.lost=t;alert_(fmt(t)+' Enfermagem: acesso de '+first(P)+' com flebite parou de funcionar.',true)}}
  /* remédios esperando acesso */
  if(accOk(P)){P.rx.forEach(r=>{if(r.waitAcc){r.waitAcc=0;r.adm=t+rnd(2,5)}});(P.ksPend||[]).forEach(x=>{if(x.waitAcc){x.waitAcc=0;x.at=t+rnd(2,5)}})}
  /* bombas e frascos */
  P.rx.forEach(r=>{
    if(r.bic&&r.adm!=null&&t>=r.adm&&!r.bic.done){const run=r.bic.run&&accOk(P)&&!r.ccih;
      if(run){r.bic.vol+=r.bic.rate/60;if(r.bic.stopAt!=null&&r.bic.run)r.bic.stopAt=null}else if(r.bic.stopAt==null)r.bic.stopAt=t;
      if(+r.bic.hrs&&t>=r.adm+r.bic.hrs*60){r.bic.done=1;r.bic.stopAt=t;lg(P,'m','Enfermagem',DRUGS[r.id].n+': infusão concluída.')}
      if(FLUID.includes(r.id)&&run){const n=Math.floor(r.bic.vol/500);if(n>(r.bic.fr||0)){r.bic.fr=n;lg(P,'m','Enfermagem','Trocado o frasco de '+DRUGS[r.id].n+' ('+(n+1)+'º frasco).')}}}
    if(r.flu&&r.adm!=null&&t>=r.adm&&r.flu.inf<r.flu.vol&&accOk(P)){r.flu.inf=Math.min(r.flu.vol,r.flu.inf+r.flu.rate/60);if(r.flu.inf>=r.flu.vol){lg(P,'m','Enfermagem','Terminou o '+DRUGS[r.id].n+' ('+r.flu.vol+' mL).');alert_(fmt(t)+' Enfermagem: terminou o soro de '+first(P)+'.')}}
  });
  /* diurese pela sonda vesical */
  if(P.rx.some(r=>r.id==='svd'||r.id==='sonda')){const base={1:60,0:45,'-1':25,'-2':8}[P.stage]||40,fu=P.rx.concat(P.rxOff||[]).filter(r=>r.id==='furo'&&r.adm!=null&&t>=r.adm&&t-r.adm<180).length?160:0;P.diu=(P.diu||[]).concat([[t,(base+fu)/60]]).slice(-240)}
  /* pressão não invasiva do monitor a cada 15 min */
  const mon=P.mov&&P.mov.mon!=null;if(mon&&(!P.nibp||t-P.nibp.t>=15))P.nibp={t,v:vitNow(P,t)[0]};
  pharmAE(P,t);
}
/* consequências: hipotensão por remédio, queda abrupta na urgência hipertensiva, bradicardia */
function pharmAE(P,t){
  const v=vitNow(P,t),s=+String(v[0]).split('/')[0],fc=v[1],b=P.c.base||P.c.id,names=()=>P.rx.filter(r=>PD[r.id]&&!r.keyCred&&r.adm!=null&&r.adm<=t).map(r=>DRUGS[r.id].n).join(', ');
  if(s<88&&P.vb[0]>=100&&!P.aeHypo){P.aeHypo=1;addAE(P,'Hipotensão após medicação (PA '+v[0]+' mmHg).',8,'Hipotensão causada por medicação: '+names()+'.')}
  if(b==='has'&&!P.aeDrop){const ah=P.rx.filter(r=>PD[r.id]&&PD[r.id].s<0&&r.adm!=null&&r.adm<=t).map(r=>r.adm);if(ah.length){const t1=Math.min(...ah),s0=parseV(P.c.vit[0])[0];
    if(t-t1<=60&&s<.75*s0){P.aeDrop=1;addAE(P,'Queda abrupta da PA, mais de 25% na primeira hora (PA '+v[0]+'): tontura e risco de isquemia.',6,'Redução abrupta da PA em urgência hipertensiva: '+names()+'.')}}}
  if(fc<45&&P.vb[2]>=60&&!P.aeBrady){P.aeBrady=1;addAE(P,'Bradicardia importante após medicação (FC '+fc+' bpm).',8,'Bradicardia causada por medicação: '+names()+'.')}
  if(s>210&&P.vb[0]<150&&!P.aeHyper){P.aeHyper=1;addAE(P,'Hipertensão grave por excesso de vasopressor (PA '+v[0]+').',8,'Excesso de droga vasoativa: '+names()+'.')}
}
/* ---------- ações do monitor ---------- */
function bicAdj(P,i,dir){const r=P.rx[i];if(!r||!r.bic)return'Bomba não encontrada.';const L=BICRATES,j=L.indexOf(r.bic.rate);let k=j<0?L.findIndex(x=>x>=r.bic.rate):j;k=clamp(k+dir,0,L.length-1);r.bic.rate=L[k];adv(.5);lg(P,'m','Enfermagem',DRUGS[r.id].n+': vazão ajustada para '+r.bic.rate+' mL/h.');return null}
function bicToggle(P,i){const r=P.rx[i];if(!r||!r.bic)return'Bomba não encontrada.';r.bic.run=!r.bic.run;adv(.5);lg(P,'m','Enfermagem',DRUGS[r.id].n+': bomba '+(r.bic.run?'retomada':'pausada')+'.');return null}
function newAccess(P){adv(3);P.acc={tipo:'Periférico',cal:pickOf(['18G','20G','22G']),local:pickOf(['antebraço direito','antebraço esquerdo','dorso da mão direita','fossa antecubital esquerda']),t:G.t,st:'pérvio'};P.mov.ace=P.mov.ace==null?G.t:P.mov.ace;lg(P,'m','Enfermagem','Novo acesso venoso periférico '+P.acc.cal+' em '+P.acc.local+'.');return null}
function nibpNow(P){adv(.5);P.nibp={t:G.t,v:vitNow(P)[0]};return null}

/* no desfecho: dose aprazada que ainda não foi dada conta como feita se cair dentro do prazo; se cair depois, é atraso */
function pendFinal(P){
  const c=P.c,bf=difOf().byF;if(!P.ksPend||!P.ksPend.length)return;
  P.ksPend=P.ksPend.filter(x=>{if(x.ccih||x.waitAcc||P.ks[x.ki]!=null)return true;const k=c.key[x.ki];if(!k)return false;
    if(x.at<=c.arr+k.by*bf){P.ks[x.ki]=x.at;return false}
    P.ks[x.ki]=x.at;P.pen.push([8,'Primeira dose aprazada para '+fmt(x.at)+', depois do prazo: '+k.lb+'. Prescreva AGORA além da manutenção.']);return false});
}
