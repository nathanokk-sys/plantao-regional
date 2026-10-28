/* ===== v2: dificuldade, ajuda (R2, enfermagem, técnicas) e telefone do laboratório ===== */
const DIFS=[
 {id:'mf',n:'Muito fácil',d:'Insumos ilimitados, exames saem rápido e sobem na hora para o sistema. O R2 responde no WhatsApp na hora (70% de acerto); a enfermagem opina (70%) e as técnicas ajudam com feridas (80%).',
  ins:99999,exf:.3,lagP:0,lag:[0,0],errF:0,alF:0,byF:1.6,pts:8,beds:-2,r1:{d:[0,0],acc:.7},enf:{mode:'sempre',d:[0,0],acc:.7},tec:{d:[0,0],acc:.8},labNo:0,labPri:1,carimbo:[0,1],bronca:0,repF:0,rqeF:.4},
 {id:'f',n:'Fácil',d:'Insumos folgados e exames um pouco mais lentos. O R2 responde em 10 a 20 min (65%); enfermagem (60%) e técnicas (70%) ajudam quando dá.',
  ins:200,exf:.6,lagP:.1,lag:[5,15],errF:.5,alF:.5,byF:1.3,pts:9,beds:-1,r1:{d:[10,20],acc:.65},enf:{mode:'sempre',d:[5,10],acc:.6},tec:{d:[5,15],acc:.7},labNo:.1,labPri:.9,carimbo:[1,2],bronca:0,repF:0,rqeF:.7},
 {id:'m',n:'Médio',d:'Sem colega disponível na hora: só mensagem, com resposta em cerca de 1 h (65%). A enfermagem está ocupada e só ajuda em intercorrência séria. Às vezes o exame sai e não sobe para o sistema.',
  ins:100,exf:1,lagP:.25,lag:[10,40],errF:1,alF:1,byF:1,pts:10,beds:0,r1:{d:[55,70],acc:.65},enf:{mode:'grave',d:[0,5],acc:.6},tec:{d:[20,40],acc:.6},labNo:.2,labPri:.7,carimbo:[1,4],bronca:0,repF:0,rqeF:1},
 {id:'d',n:'Difícil',d:'Pouco insumo, laboratório lento e telefone que toca sem ninguém atender. O R2 demora 1h30 a 2h30 (55%). A enfermagem só aparece se o paciente estiver parando.',
  ins:80,exf:1.25,lagP:.35,lag:[20,60],errF:1.5,alF:1.5,byF:.85,pts:11,beds:1,r1:{d:[90,150],acc:.55},enf:{mode:'critico',d:[0,5],acc:.55},tec:null,labNo:.35,labPri:.5,carimbo:[2,6],bronca:0,repF:.5,rqeF:1.3},
 {id:'md',n:'Muito difícil',d:'Hospital lotado, ninguém vai te ajudar e qualquer erro vira bronca do preceptor na hora.',
  ins:60,exf:1.45,lagP:.45,lag:[30,90],errF:2,alF:2,byF:.75,pts:12,beds:2,r1:null,enf:null,tec:null,labNo:.5,labPri:.35,carimbo:[3,8],bronca:1,repF:1,rqeF:2},
 {id:'inf',n:'Inferno',d:'O nome diz tudo: tomógrafo quebrado, troponina em falta, estoque de sangue e soro contado, mais pacientes, piora mais rápida, alergias escondidas e um preceptor que não perdoa nada.',
  ins:40,exf:1.75,lagP:.6,lag:[45,120],errF:3,alF:4,byF:.65,pts:13,beds:3,r1:null,enf:null,tec:null,labNo:.7,labPri:.2,carimbo:[5,12],bronca:1,repF:2,rqeF:3}];
function difOf(id){return DIFS.find(d=>d.id===(id||(G&&G.dif)||'m'))||DIFS[2]}
SLOTS.splice(0,SLOTS.length,0,12,35,70,115,170,235,310,395,490,560,620,670);
/* aplica a dificuldade logo depois de criar o plantão (antes de sortear os pacientes) */
function difApply(){
  const D=difOf();G.ins=D.ins;G.insMax=D.ins;const b=G.beds;
  b.obs.used=clamp(b.obs.used+D.beds,0,b.obs.cap);b.ama.used=clamp(b.ama.used+D.beds,0,b.ama.cap);b.enf.used=clamp(b.enf.used+2*D.beds,0,b.enf.cap);b.uti.used=clamp(b.uti.used+(D.beds>0?1:D.beds<0?-1:0),0,b.uti.cap);
  if(D.id==='inf'){G.off.tc={until:99999,why:'Tomógrafo quebrado desde ontem. Só por regulação.'};G.stock={sorobot:3,hemac:3}}
  if(D.id==='md')G.stock={sorobot:4,hemac:5};
}
const insTxt=()=>G.ins>9999?'∞':G.ins;
/* ---------- ajuda: R1 no WhatsApp, enfermagem e técnicas ---------- */
const WOUND={ofid:['Lavar só com água e sabão ou soro, manter o membro elevado e estendido, NÃO garrotear, não cortar nem espremer, e marcar com caneta até onde vai o edema para ver se progride.',['Fazer um torniquete acima da picada para o veneno não subir e passar gelo direto.','Abrir a pele no local da picada para drenar o veneno e enfaixar apertado.']],
  erisip:['Manter a perna elevada, marcar as bordas da vermelhidão com caneta para acompanhar, cuidar da frieira entre os dedos e curativo limpo se surgir bolha (sem furar).',['Furar as bolhas e passar pomada de corticoide com enfaixamento apertado.','Fazer compressa bem quente e massagear a perna para melhorar a circulação.']],
  cel:['Manter o membro elevado, marcar as bordas da vermelhidão com caneta e cuidar da porta de entrada.',['Fazer compressa quente e massagear o local.']]};
function distractor(id){
  const g=DXGRP.find(x=>x[1].includes(id)),pool=(g?g[1]:DXS.map(d=>d[0])).filter(x=>x!==id);
  return pool[Math.floor(Math.random()*pool.length)]||'pneu';
}
function guessTxt(P,acc){
  const c=P.c,ok=Math.random()<acc,dx=ok?c.hyp:distractor(c.hyp);
  const ex=ok&&c.evid.length?EXAMS[c.evid[0]].n:null;
  return{ok,dx,txt:dxLabel(dx)+(ex?'. Confirma com '+ex.toLowerCase():'')};
}
function helpState(P,who){
  const D=difOf(),H=(P.help=P.help||{});
  if(H[who])return{used:1};
  if(who==='r1'){if(!D.r1)return{no:'Nenhum veterano disponível: o R2 está com uma parada na UTI e o staff não atende o celular.'};return{ok:1,d:D.r1}}
  if(who==='enf'){if(!D.enf)return{no:'A enfermagem está com 18 pacientes por técnica e não consegue ajudar.'};
    if(D.enf.mode==='grave'&&P.stage>-1)return{no:'A enfermagem está ocupada: só ajuda em intercorrência séria.'};
    if(D.enf.mode==='critico'&&P.stage>-2)return{no:'A enfermagem só consegue vir se o paciente estiver muito grave.'};return{ok:1,d:D.enf}}
  if(who==='tec'){const b=P.c.base||P.c.id;if(!WOUND[b])return{no:'Não há ferida ou lesão de pele para as técnicas avaliarem.'};if(!D.tec)return{no:'As técnicas estão sobrecarregadas e não conseguem ajudar agora.'};return{ok:1,d:D.tec}}
  return{no:'Indisponível.'};
}
function askHelp(P,who){
  const S=helpState(P,who);if(S.used)return'Você já perguntou.';if(S.no)return S.no;
  if(who!=='tec'&&P.asked.size+P.examined.size<2){adv(1);return(who==='r1'?'R2: "Me passa mais coisa: anamnese e exame físico, senão não dá pra pensar."':'Enfermeira: "Doutor, examina primeiro que eu te digo o que acho."')}
  adv(who==='r1'?1:.5);const at=G.t+rnd(S.d.d[0],S.d.d[1]),H=P.help;
  if(who==='tec'){const W=WOUND[P.c.base||P.c.id],ok=Math.random()<S.d.acc;H.tec={at,ok,txt:ok?W[0]:W[1][Math.floor(Math.random()*W[1].length)]}}
  else{const g=guessTxt(P,S.d.acc);H[who]=Object.assign({at},g)}
  if(at<=G.t)deliverHelp(P,who);else lg(P,'h',who==='r1'?'WhatsApp':who==='enf'?'Enfermagem':'Técnicas','Mensagem enviada. Resposta prevista por volta de '+fmt(at)+'.');
  return null;
}
function deliverHelp(P,who){
  const H=P.help[who];if(!H||H.done)return;H.done=1;
  const txt=who==='r1'?'R2 (WhatsApp): "Pelo que você contou, pensa em '+H.txt+'."':who==='enf'?'Enfermeira: "Doutor, pra mim isso é '+H.txt+'."':'Técnica de enfermagem: "'+H.txt+'"';
  lg(P,'h',who==='r1'?'WhatsApp':who==='enf'?'Enfermagem':'Técnicas',txt);alert_(fmt(G.t)+' '+(who==='r1'?'WhatsApp do R2':who==='enf'?'Enfermagem':'Técnicas')+' sobre '+first(P)+'.');
}
/* ---------- telefone do laboratório ---------- */
function callLab(P){
  const D=difOf();adv(2);
  if(Math.random()<D.labNo){lg(P,'l','Telefone','Laboratório: chamou até cair. Ninguém atendeu.');return'Ninguém atendeu no laboratório. Tente de novo em alguns minutos.'}
  const lines=[];P.call={until:G.t+5,pri:0};
  Object.entries(P.ord).forEach(([k,o])=>{const n=EXAMS[k].n;
    if(o.done&&o.sys===false){o.sys=true;o.phone=1;P.newRes++;lines.push(n+': já saiu, só não subiu para o sistema. Passaram por telefone.')}
    else if(!o.done&&!['ecg','glic','rx','us','tc'].includes(k))lines.push(n+': em processamento, previsão '+fmt(o.due)+'.')});
  if(P.rx.some(r=>r.id==='eda'))lines.push(P.c.visit?((W&&(W.inp.find(x=>x.uid===P.c.uid)||{reqs:{}}).reqs.eda==='ok')?'Endoscopia: a EDA já foi feita; o laudo ainda não foi digitado, mas confirmaram o procedimento.':'Endoscopia: ainda não consta a realização.'):'Endoscopia: está na agenda da manhã; pedem dieta zero desde a meia-noite'+(P.mov.jej!=null?' (já consta na prescrição).':'. Na prescrição ainda não consta dieta zero.'));
  if(!lines.length)lines.push('Nada pendente para este paciente.');
  lg(P,'l','Telefone','Laboratório: '+lines.join(' '));return null;
}
function labPriority(P,k){
  const o=P.ord[k];if(!o||o.done)return'Este exame não está pendente.';if(!P.call||G.t>P.call.until)return'Ligue para o laboratório primeiro.';if(P.call.pri)return'Você já pediu prioridade nesta ligação.';
  P.call.pri=1;adv(.5);
  if(Math.random()<difOf().labPri){const nd=Math.min(o.due,G.t+rnd(10,20));o.due=nd;o.urg=true;lg(P,'l','Telefone','Laboratório: "Vou passar na frente. Sai por volta de '+fmt(nd)+'."');return null}
  lg(P,'l','Telefone','Laboratório: "Tá tudo urgente aqui, doutor. Vai sair na ordem."');return'O laboratório não conseguiu priorizar.';
}
/* ---------- bronca do preceptor a cada erro (muito difícil e inferno) ---------- */
const BRONCA=['Isso aqui é hospital, não é laboratório de teste.','Volta pro livro.','Quem te ensinou isso?','Na prova você perdia ponto. Aqui o paciente perde.','Anota esse erro e me apresenta amanhã cedo.','Eu vi. Todo mundo viu.','Mais um desse e você passa o plantão comigo do lado.'];
function broncaTick(P){
  const D=difOf();if(!D.bronca&&!D.repF)return;const n=P.pen.length,s=P.penSeen||0;if(n<=s)return;
  P.pen.slice(s).forEach(([p,t])=>{if(D.repF)G.rep=clamp(G.rep-D.repF);if(D.bronca)alert_(fmt(G.t)+' Preceptor (RQE): "'+t.replace(/\.$/,'')+'? '+BRONCA[Math.floor(Math.random()*BRONCA.length)]+'"',true)});
  P.penSeen=n;
}
function finBronca(P){const D=difOf();if(!D.bronca)return;const seen=new Set(P.pen.map(x=>x[1]));
  P.res.errs.filter(e=>!seen.has(e)).slice(0,2).forEach(e=>{if(D.repF)G.rep=clamp(G.rep-D.repF);alert_(fmt(G.t)+' Preceptor (RQE): "'+e.replace(/\.$/,'')+'? '+BRONCA[Math.floor(Math.random()*BRONCA.length)]+'"',true)})}
