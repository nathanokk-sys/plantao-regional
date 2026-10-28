/* ===== v2: mecânicas do prontuário eletrônico ===== */
const lg=(P,k,q,a)=>P.log.push({t:G.t,k,q,a,fresh:1});
const first=P=>P.c.nome.split(' ')[0];
/* o residente carimba e assina tudo o que é impresso; às vezes está ocupado */
function carimbo(P,what){const R=difOf().carimbo,m=rnd(R[0],R[1]);if(m)adv(m);if(P)lg(P,'p','Residente',what+': carimbado e assinado ('+m+' min).');return m}

/* ---------- medidas iniciais: agora custam tempo ---------- */
function doMov(P,k){
  P.mov=P.mov||{};const T=MOVT[k]||1;
  if(/^iso[cgap]$/.test(k)){const r=doIso(P,k);adv(T);return r}
  if(k==='pac'){['mon','ace'].forEach(x=>{if(P.mov[x]==null){P.mov[x]=G.t;lg(P,'m','Enfermagem',MOV.find(m=>m[0]===x)[1]+': feito.')}});
    ['glic','ecg'].forEach(x=>{if(!P.ord[x])order(P,x,true)});adv(T);return null}
  if(k==='glic'||k==='ecg'){const r=order(P,k,true);if(!r)adv(T);return r}
  if(k==='o2c'||k==='o2v'||k==='o2m'||k==='vni'){const r=rxAdd(P,{drug:'o2',dose:{o2c:0,o2v:1,o2m:2,vni:3}[k],via:0,freq:'ic',dur:'ct'},true);if(!r)adv(T);return r}
  if(k==='jej'&&P.mov.jej!=null){delete P.mov.jej;lg(P,'m','Prescrição','Dieta liberada.');adv(T);return null}
  if(P.mov[k]!=null)return null;const it=MOV.find(x=>x[0]===k);P.mov[k]=G.t;
  lg(P,'m',k==='jej'?'Prescrição':'Enfermagem',k==='jej'?'Dieta zero prescrita.':it[1]+': feito.');adv(T);return null;
}

/* ---------- exames: nova coleta permitida, histórico, laudo de imagem ---------- */
function order(P,id,free,urg){
  const E=EXAMS[id];if(!E)return'Exame não encontrado.';
  const U=!!urg&&E.t>=20,tt=Math.max(1,Math.round((U?Math.ceil(E.t/2):E.t)*(E.t>1?difOf().exf:1))),cc=E.c+(U?1:0),o0=P.ord[id];
  if(o0&&!o0.done)return E.n+': já solicitado, resultado previsto para '+fmt(o0.due)+'.';
  const off=G.off[id];if(off&&G.t<off.until)return off.why;
  if(G.ins<cc){if(P.c.tri==='VERMELHO'||P.c.tri==='LARANJA'){G.overCota=(G.overCota||0)+(cc-G.ins);G.rep=clamp(G.rep-1);alert_(fmt(G.t)+' Direção: exame liberado como urgência acima da cota de insumos.')}else return'Cota de insumos esgotada: agora só há exames de urgência para pacientes vermelhos e laranjas.'}
  if(o0&&o0.done)(P.hist=P.hist||[]).push(Object.assign({id},o0));
  G.ins=Math.max(0,G.ins-cc);
  const o=P.ord[id]={t0:G.t,due:G.t+tt,done:tt<=1,urg:U,dt:gameDate(G.t)+' '+fmt(G.t)};
  if(NOLAUDO.includes(id))o.nol=1;
  const er=examErr(id);if(er){if(er.bad)o.bad=er.bad;if(er.extra){o.due+=er.extra;o.done=false;alert_(fmt(G.t)+' '+er.note)}}
  if(!o0&&!P.c.util.includes(id)&&id!=='glic'&&id!=='ecg'){P.pen.push([2,'Exame sem indicação: '+E.n+'.']);if(window.rqe)rqe('ex',.35)}
  if(o.done)ordDone(P,id,o);
  adv(free?0:.5);return null;
}
function ordDone(P,k,o){
  o.dd=gameDate(o.due)+' '+fmt(o.due);
  if(!o.bad&&LP[k])o.vals=labVals(P,k);
  const D=difOf();if(!o.phone&&!o.bad&&D.lagP&&!['glic','ecg','us'].includes(k)&&Math.random()<D.lagP){o.sys=false;o.sysAt=G.t+rnd(D.lag[0],D.lag[1])}
  if(k==='glic'&&!o.bad){const v=labVals(P,'glic').g;(P.vs=P.vs||[]).push({t:o.due,dt:o.dd,g:v,by:'Glicemia capilar'})}
  if(o.sys!==false)P.newRes++;
}
function reqLaudo(P,id){
  const o=P.ord[id];if(!o||!o.done)return'O exame ainda não foi realizado.';if(o.laudo||o.laudoAt)return'Laudo já solicitado.';
  adv(1);o.laudoAt=G.t+rnd(20,40);lg(P,'p','Telerradiologia',EXAMS[id].n+': laudo solicitado pelo residente; previsão '+fmt(o.laudoAt)+'.');return null;
}
/* carrinho de solicitação (laboratório, imagem, outros) */
function cartOf(P){return P.cart=P.cart||{items:[],just:'',tc:{tipo:'',ctr:'',cons:''},urg:false}}
function sendCart(P){
  const C=cartOf(P);if(!C.items.length)return'Nenhum exame selecionado.';
  if(C.items.some(i=>NEEDJUST.includes(i))&&C.just.trim().length<8)return'Exames de imagem, EDA e ecocardiograma precisam de justificativa.';
  if(C.items.includes('tc')&&(!C.tc.tipo||!C.tc.ctr||!C.tc.cons))return'Preencha a entrevista da tomografia (tipo, contraste e nível de consciência).';
  adv(1);carimbo(P,'Solicitação de exames');const msgs=[],ok=[];
  C.items.forEach(id=>{
    if(SOLX[id]){const r=rxAdd(P,{drug:id,dose:0,via:0,freq:'u',dur:'u'},true);if(r)msgs.push(SOLX[id][0]+': '+r);else{ok.push(SOLX[id][0]);lg(P,'p','Solicitação',SOLX[id][0]+': pedido entregue ('+SOLX[id][1]+')')}return}
    const r=order(P,id,true,C.urg);if(r){msgs.push(r);return}ok.push(EXAMS[id].n);
    if(id==='tc')tcCheck(P,C.tc);
  });
  if(ok.length)lg(P,'p','Exames solicitados ('+(C.urg?'imediato':'rotina')+')',ok.join(', ')+(C.just.trim()?'. Justificativa: '+C.just.trim():'')+'.');
  P.cart={items:[],just:'',tc:{tipo:'',ctr:'',cons:''},urg:false};
  return msgs.length?msgs.join(' '):null;
}
/* entrevista da tomografia: protocolo errado não responde à pergunta; contraste com rim ruim faz mal */
const TCREQ={tep:'angio',lombal:'coluna'};
function tcCheck(P,f){
  const o=P.ord.tc,b=P.c.base||P.c.id,need=TCREQ[b]||'cranio',cr=grab(P.c.res.cr||'',/Cr\s*([\d,]+)/)||1;
  o.tcf=Object.assign({},f);
  if(f.tipo!==need||(need==='angio'&&f.ctr!=='sim')){o.noev=1;o.alt=need==='angio'?'Protocolo sem contraste em artérias pulmonares: o exame não responde à pergunta clínica. Sem outros achados agudos.':'Tomografia de '+({cranio:'crânio',torax:'tórax',abdome:'abdome',coluna:'coluna lombar',angio:'angiotomografia de tórax'}[f.tipo])+' sem achados que expliquem o quadro.'}
  if(f.ctr==='sim')o.nol=0;
  if(f.ctr==='sim'&&cr>=2)addAE(P,'Contraste iodado com creatinina elevada: piora da função renal.',6,'Contraste iodado sem considerar a função renal.');
}

/* ---------- sinais vitais registrados ao longo da noite ---------- */
function vrec(P,by,t){(P.vs=P.vs||[]).push({t:t!=null?t:G.t,dt:gameDate(t!=null?t:G.t)+' '+fmt(t!=null?t:G.t),v:(P.c.vit[P.stage]||P.c.vit[0]).slice(),by})}
function vitals(P){adv(1);P.lv={t:G.t,v:P.c.vit[P.stage]};vrec(P,'Médico')}
function reassess(P){adv(3);P.lv={t:G.t,v:P.c.vit[P.stage]};vrec(P,'Médico (reavaliação)');lg(P,'r','Reavaliação',P.c.reav[P.stage]||'Sem mudanças.')}

/* ---------- pareceres e comunicação interna ---------- */
function saveParecer(P,id,txt){
  if(!id)return'Escolha a especialidade.';P.par=P.par||{};const p=P.par[id];
  if(p&&['enviado','respondido','agendado'].includes(p.st))return'Já existe parecer desta especialidade em andamento.';
  P.par[id]={st:'salvo',txt:txt||'',savedAt:G.t};adv(2);lg(P,'p','Solicitação de parecer',parN(id)+': solicitação salva. Falta a comunicação interna.');return null;
}
const parN=id=>(PAR.find(x=>x[0]===id)||[0,id])[1];
function sendGroup(P,para,chk,paste){
  if(!P)return'Escolha o paciente.';if(!para)return'Escolha o destinatário (grupo).';
  P.par=P.par||{};const p=P.par[para];
  if(!p)return'Não há solicitação de parecer salva para '+parN(para)+'. Salve na guia Pareceres primeiro.';
  if(['enviado','respondido','agendado'].includes(p.st))return'Esta solicitação já foi enviada para '+parN(para)+'.';
  if(!paste)return'Cole a solicitação salva na mensagem.';
  adv(1);
  if(!(chk.nome&&chk.cps&&chk.leito)){p.st='perdido';p.sentAt=G.t;lg(P,'p','Comunicação interna','Mensagem para '+parN(para)+' enviada sem identificação completa no assunto.');return'Mensagem enviada, mas o assunto não tinha nome completo, CPS e leito: a equipe não localizou o paciente. Reenvie.'}
  if((p.txt||'').trim().length<25){p.st='devolvido';p.sentAt=G.t;p.resp='Parecer sem informação suficiente. Reenvie explicando a situação encontrada e o que se espera da especialidade.';P.newPar=(P.newPar||0)+1;lg(P,'p','Resposta de interconsulta',parN(para)+': '+p.resp);return null}
  p.sentAt=G.t;const r=rxAdd(P,{drug:para,dose:0,via:0,freq:'u',dur:'u'},true);
  if(ONCALL.includes(para)){p.st='enviado';p.due=G.t+rnd(30,90)}else{p.st='agendado';p.resp='Recebido. A equipe de '+parN(para).toLowerCase()+' avalia pela manhã.'}
  lg(P,'p','Comunicação interna','Mensagem para o grupo '+parN(para)+' enviada.'+(r?' ('+r+')':''));return null;
}
function parResp(P,id){
  const ind=(REQIND[P.c.base||P.c.id]||[]).includes(id);
  return ind?(REQOK[id]||'Avaliado; condutas registradas.')+(id==='hd'?' Hemodiálise de urgência programada.':''):'Avaliado: sem indicação de seguimento pela especialidade neste momento. Orientações gerais registradas.';
}

/* ---------- solicitação de antimicrobiano restrito (CCIH) ---------- */
function sendATB(P,f){
  if(!f.drug)return'Escolha o antimicrobiano.';if(!P.rx.some(r=>r.id===f.drug))return'Prescreva o antimicrobiano antes de enviar a solicitação.';
  if(!f.ind||!f.sit)return'Preencha a indicação e o sítio da infecção.';
  adv(2);carimbo(P,'Solicitação de antimicrobiano');(P.atb=P.atb||[]).push(Object.assign({t:G.t},f));
  if(!P.rx.some(r=>r.id==='ccih'))doReq(P,'ccih');else{let n=0;(P.ksPend||[]).forEach(x=>{if(x.ccih){x.ccih=0;x.at=G.t+15;n++}});P.rx.forEach(r=>{if(r.ccih)r.ccih=0})}
  return null;
}

/* ---------- transfusão (formulário, 2 vias, carimbo, enfermagem, banco de sangue) ---------- */
function txFill(P,f){
  if(!f.id)return'Escolha o hemocomponente.';if(f.dose==null||f.dose==='')return'Escolha a quantidade.';if(!f.ind)return'Informe a indicação.';
  adv(2);(P.tx=P.tx||[]).push({id:f.id,dose:+f.dose,ind:f.ind,urg:!!f.urg,st:'impresso',t:G.t});lg(P,'p','Transfusão','Solicitação preenchida e impressa em duas vias.');return null;
}
function txStep(P,i){
  const x=(P.tx||[])[i];if(!x)return null;
  if(x.st==='impresso'){carimbo(P,'Solicitação de transfusão');x.st='carimbado';return null}
  if(x.st==='carimbado'){adv(.5);const tip=P.ord.tipag&&P.ord.tipag.done&&!P.ord.tipag.bad;
    if(!tip&&!x.urg){x.st='recusado';x.why='Banco de sangue: sem amostra de tipagem e prova cruzada. Solicite a tipagem (ou marque urgência extrema, com sangue O sem prova cruzada).';lg(P,'p','Banco de sangue',x.why);return x.why}
    x.st='entregue';x.at=G.t+(x.urg?15:rnd(30,45));lg(P,'p','Transfusão','Entregue à enfermeira; previsão de instalação '+fmt(x.at)+'.');return null}
  return null;
}

/* ---------- termos de consentimento e procedimentos ---------- */
function termoPrint(P,id){P.termo=P.termo||{};adv(1);P.termo[id]={st:'impresso'};lg(P,'p','Termo',PROCS.find(x=>x[0]===id)[1]+': termo impresso.');return null}
function termoSign(P,id,who){
  const T=(P.termo||{})[id];if(!T)return'Imprima o termo primeiro.';
  if(who==='pac'&&noSign(P.c))return'O paciente não tem condições de assinar (rebaixado ou confuso): colete a assinatura do acompanhante responsável ou a impressão digital.';
  adv(1);T.st='assinado';T.by=who;lg(P,'p','Termo','Assinado pelo '+(who==='pac'?'paciente':who==='dig'?'paciente (impressão digital)':'acompanhante responsável')+'.');return null;
}
function doProcV2(P,id){
  const emerg=P.stage<=-2||(P.c.tri==='VERMELHO'&&['iot','desfib','cardiov','dreno'].includes(id))||id==='iot'||id==='desfib';
  if(TERMO.includes(id)&&!emerg&&!((P.termo||{})[id]&&P.termo[id].st==='assinado'))P.pen.push([3,'Procedimento eletivo sem termo de consentimento assinado: '+PROCS.find(x=>x[0]===id)[1]+'.']);
  return doProc(P,id);
}

/* ---------- receitas, atestados e encaminhamentos ---------- */
function saveDoc(P,d){
  P.docs=P.docs||[];
  if(d.type==='rec'){if(!d.items||!d.items.length)return'Adicione ao menos um medicamento à receita.';
    for(const it of d.items){const D=DRUGS[it.drug];if(!P.rx.some(r=>r.id===it.drug)){const r=rxAdd(P,{drug:it.drug,dose:it.dose,via:it.via,freq:it.freq,dur:it.dur},true);if(r)return D.n+': '+r;P.rx[P.rx.length-1].home=1}else P.rx.find(r=>r.id===it.drug).home=1}}
  if(d.type==='enc'&&!d.dest)return'Escolha para onde encaminhar.';
  if(d.type==='enc')P.ret=d.dest;
  adv(1);carimbo(P,DOCS.find(x=>x[0]===d.type)[1]);
  P.docs.push(Object.assign({t:G.t,title:DOCS.find(x=>x[0]===d.type)[1]},JSON.parse(JSON.stringify(d))));return null;
}

/* ---------- evolução médica ---------- */
const EVF=['type','hyp','S','O','C','pend'];
function evoNew(P,dup){
  const prev=(P.evos&&P.evos.length?P.evos[P.evos.length-1]:null)||(P.prevEvos&&P.prevEvos.length?P.prevEvos[P.prevEvos.length-1]:null);
  if(dup&&!prev)return'Não há evolução anterior para duplicar.';
  const def=P.c.visit?'dia':(P.evos||[]).some(e=>e.type==='adm')?'int':'adm';
  P.evf=dup?Object.assign({},...EVF.map(k=>({[k]:prev[k]||''})),{dup:1}):{type:def,hyp:P.hyp||'',S:'',O:'',C:'',pend:'',dup:0};
  if(dup){P.evf.type=P.c.visit?'dia':P.evf.type;P.evf.orig=JSON.stringify(EVF.map(k=>P.evf[k]))}
  return null;
}
function evoSave(P){
  const f=P.evf;if(!f)return'Clique em Novo ou Duplicar documento.';
  if(['adm','dia','alta'].includes(f.type)&&!f.hyp)return'Registre a hipótese diagnóstica (CID) antes de salvar.';
  adv(2);const same=f.dup&&f.orig===JSON.stringify(EVF.map(k=>f[k]));
  (P.evos=P.evos||[]).push(Object.assign({t:G.t,dt:gameDate(G.t)+' '+fmt(G.t),same},...EVF.map(k=>({[k]:f[k]})),{dup:f.dup}));
  if(f.hyp)setHyp(P,f.hyp);delete P.evf;lg(P,'e','Evolução médica',EVT.find(x=>x[0]===f.type)[1]+' salva.');return null;
}
function autoO(P){
  const v=(P.vs&&P.vs.length?P.vs[P.vs.length-1].v:null)||P.lv.v;
  const ex=[...P.examined].map(s=>SYS.find(x=>x[0]===s)[1]+': '+(P.c.ex[s]||'sem alterações')).join(' ');
  return'PA '+v[0]+' mmHg, FC '+v[1]+' bpm, FR '+v[2]+' irpm, SatO2 '+v[3]+'%, Tax '+v[4]+' °C. '+(ex||'Exame físico ainda não registrado.');
}
function autoC(P){return P.rx.filter(r=>DRUGS[r.id]&&DRUGS[r.id].v[0]!=='Solicitação').map(r=>DRUGS[r.id].n+' '+DRUGS[r.id].d[r.i]+' '+DRUGS[r.id].v[r.via||0]+' '+FREQ[r.freq].toLowerCase()).join('; ')||'Sem prescrição ainda.'}

/* ---------- pendências do paciente ---------- */
function pendList(P){
  const L=[],ords=Object.entries(P.ord);
  ords.filter(([k,o])=>o.done&&o.sys===false).forEach(([k])=>L.push(EXAMS[k].n+': coletado há tempo e ainda não consta no sistema (ligar para o laboratório?)'));
  ords.filter(([k,o])=>!o.done).forEach(([k,o])=>L.push('Aguardando '+EXAMS[k].n+' (previsto '+fmt(o.due)+')'));
  ords.filter(([k,o])=>o.done&&o.bad).forEach(([k])=>L.push(EXAMS[k].n+': problema na amostra, pedir de novo'));
  ords.filter(([k,o])=>o.done&&o.nol&&!o.laudoAt).forEach(([k])=>L.push(EXAMS[k].n+': sem laudo (pedir ao residente)'));
  ords.filter(([k,o])=>o.laudoAt&&!o.laudo).forEach(([k,o])=>L.push(EXAMS[k].n+': laudo previsto '+fmt(o.laudoAt)));
  Object.entries(P.par||{}).forEach(([k,p])=>{if(p.st==='salvo')L.push('Parecer '+parN(k)+': falta a comunicação interna');if(p.st==='perdido')L.push('Parecer '+parN(k)+': reenviar com identificação');if(p.st==='enviado')L.push('Parecer '+parN(k)+': aguardando resposta');if(p.st==='devolvido')L.push('Parecer '+parN(k)+': devolvido, reenviar')});
  (P.tx||[]).forEach(x=>{if(x.st==='impresso')L.push('Transfusão: falta carimbo do residente');if(x.st==='carimbado')L.push('Transfusão: entregar à enfermeira');if(x.st==='entregue')L.push('Transfusão: instalação prevista '+fmt(x.at))});
  if(P.rx.some(r=>r.ccih))L.push('Antimicrobiano restrito aguardando a solicitação à CCIH');
  if(P.c.visit&&!(P.evos||[]).some(e=>e.type==='dia'||e.type==='alta'))L.push('Evolução do dia não registrada');
  if(P.evf)L.push('Evolução em rascunho, não salva');
  return L;
}

/* ---------- a cada minuto (chamado pelo motor) ---------- */
function v2Tick(P,t){
  Object.entries(P.ord).forEach(([k,o])=>{if(o.done&&o.sys===false&&t>=o.sysAt){o.sys=true;P.newRes++;alert_(fmt(t)+' Resultado liberado no sistema: '+EXAMS[k].n+' de '+first(P)+'.')}});
  ['r1','enf','tec'].forEach(w=>{const H=(P.help||{})[w];if(H&&!H.done&&t>=H.at)deliverHelp(P,w)});
  broncaTick(P);
  Object.entries(P.ord).forEach(([k,o])=>{if(o.laudoAt&&!o.laudo&&t>=o.laudoAt){o.laudo=1;P.newRes++;alert_(fmt(t)+' Telerradiologia: laudo de '+EXAMS[k].n+' de '+first(P)+' disponível.')}});
  Object.entries(P.par||{}).forEach(([k,p])=>{if(p.st==='enviado'&&t>=p.due){p.st='respondido';p.resp=parResp(P,k);p.respAt=t;P.newPar=(P.newPar||0)+1;lg(P,'p','Resposta de interconsulta',parN(k)+': '+p.resp);alert_(fmt(t)+' Resposta de parecer ('+parN(k)+') para '+first(P)+'.')}});
  (P.tx||[]).forEach(x=>{if(x.st==='entregue'&&t>=x.at){const r=rxAdd(P,{drug:x.id,dose:x.dose,via:0,freq:'u',dur:'u'},true);if(r){x.st='recusado';x.why=r}else{x.st='instalado';P.txAdj=P.txAdj||{hb:0,plq:0};if(x.id==='hemac')P.txAdj.hb+=x.dose+1;if(x.id==='plaq')P.txAdj.plq+=(x.dose+1)*15000;alert_(fmt(t)+' Enfermagem: hemocomponente instalado em '+first(P)+'.')}}});
  const last=(P.vs||[]).filter(x=>x.v).slice(-1)[0],lt=last?last.t:-999,mon=P.mov&&P.mov.mon!=null;
  if(t-lt>=(mon?30:120))vrec(P,mon?'Monitor':'Enfermagem',t);
}
/* penalidades extras do prontuário (chamado no desfecho) */
function v2Pen(P,d,pen,goods){
  const c=P.c,E=P.evos||[];
  if(['ENF','UTI','AMA','OBS'].includes(d)&&!c.visit&&!E.some(e=>e.type==='adm'))pen.push([3,'Internado sem evolução de admissão registrada.']);
  if(d==='ALTA'&&!E.some(e=>e.type==='alta'))pen.push([3,'Alta sem evolução de alta médica.']);
  if(c.visit&&!E.some(e=>e.type==='dia'||e.type==='alta'))pen.push([4,'Visita sem evolução do dia.']);
  if(E.some(e=>e.dup&&e.same))pen.push([3,'Evolução duplicada sem revisão.']);
  if(E.length&&!E.some(e=>e.dup&&e.same))goods.push('Evolução registrada.');
  if(d==='ALTA'&&c.key.some(k=>k.ids.some(i=>DRUGS[i]&&DRUGS[i].v[0]==='VO'&&P.rx.some(r=>r.id===i)))&&!(P.docs||[]).some(x=>x.type==='rec'))pen.push([3,'Alta sem receita para uso domiciliar.']);
  if(Object.values(P.par||{}).some(p=>p.st==='salvo'||p.st==='perdido'))pen.push([2,'Parecer solicitado sem comunicação interna: a especialidade não foi avisada.']);
}
