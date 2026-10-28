/* ===== ANAMNESE AMPLIADA: respostas às perguntas gerais (15 s cada) ===== */
const SPEAK={sepse:'Filho',estmal:'Acompanhante',eh:'Filha',hiposu:'Neta',organo:'Colega',absti:'Esposa'};
const DROGAS={eap:'Nunca fumei nem bebo.',cad:'Fumo maconha às vezes no fim de semana.',sepse:'Ela nunca bebeu nem fumou.',hda:'Bebo cachaça todo dia faz uns dez anos.',ofid:'Bebo no fim de semana e fumo cigarro de palha.',iam:'Fumo um maço por dia há 30 anos.',has:'Não bebo nem fumo.',organo:'Ele bebe no fim de semana, droga não.',hiperk:'Parei de fumar quando comecei a diálise.',dpoc:'Fumei 50 anos, parei há dois.',tireo:'Não uso nada.',neutro:'Nada. Parei de beber quando descobri o linfoma.',eh:'Bebia muito, parou há um ano.',estmal:'Bebeu no fim de semana. Droga não.',lv:'Bebo pouco, só em festa.',hiposu:'Ela não bebe nem fuma.',absti:'Bebe cachaça todo dia, quase uma garrafa.',tep:'Fumo uns dez cigarros por dia.'};
const GA_CASE={organo:{trabalho:'Aplica veneno na uva toda semana e quase nunca usa máscara.'},tep:{cirurgias:'Operei o joelho faz 12 dias.',viagem:'Fiquei deitado em casa desde a cirurgia.'},
 lv:{trabalho:'Trabalho na roça e tem muito cachorro solto no povoado.',viagem:'Moro na zona rural, perto da mata.'},ofid:{vacinas:'Não lembro de ter tomado antitetânica.',trabalho:'Trabalho na roça de sandália.'},
 hda:{familia:'Meu pai morreu de cirrose.'},iam:{familia:'Meu pai morreu do coração com 52 anos.'},eap:{ultima:'Comi muito salgado na festa de ontem.'},cad:{ultima:'Só refrigerante desde ontem.'},
 neutro:{cirurgias:'Coloquei um cateter no peito para a quimioterapia.'},hiperk:{ultima:'Comi manga e banana ontem.'},sepse:{cirurgias:'Ficou internada no ano passado pelo AVC.'},
 hiposu:{ultima:'Quase não come há dias, por causa do dente.'},eh:{ultima:'Comeu bastante carne de bode no domingo.'},absti:{ultima:'Não come direito há dias.'},
 tireo:{familia:'Minha mãe tem problema de tireoide.'},dpoc:{trabalho:'Trabalhei a vida toda em carvoaria.',vacinas:'Não tomei a vacina da gripe este ano.'}};
const GA1={cirurgias:['Nunca operei.','Tirei a vesícula há uns anos.','Só operei uma hérnia, faz tempo.','Nunca fiquei internado.'],
 familia:['Minha mãe tem pressão alta.','Meu pai era diabético.','Ninguém que eu saiba.','Tem caso de derrame na família.'],
 vacinas:['Acho que estão em dia.','Não lembro da última antitetânica.','Tomei as da campanha.'],
 ultima:['Almocei normal hoje.','Comi um pouco no almoço.','Só tomei café de manhã.'],
 viagem:['Não saí da cidade.','Fui para a roça no fim de semana.','Não tive contato com ninguém doente.'],
 trabalho:['Nada diferente no trabalho.','Pego muito sol no serviço.','Trabalho em casa.']};
const GA3={cirurgias:['Nunca operou.','Já ficou internado uma vez.','Não sei de cirurgia.'],familia:['Não sei dizer.','A mãe tinha pressão alta.'],vacinas:['Não sei se estão em dia.'],
 ultima:['Comeu pouco hoje.','Não comeu desde ontem.'],viagem:['Não saiu da cidade.'],trabalho:['Nada diferente.']};
function genAns(P,g){
  const c=P.c,b=c.base||c.id,who=SPEAK[b],pre=who?who+': "':'"',end='"';
  if(g==='drogas')return pre+(DROGAS[b]||'Não uso nada.')+end;
  if(g==='dor'){const t=c.ex0==='p'||c.hand?(rr(7,9)+' de 10. Está forte.'):c.ex0==='d'?'Dor não, o problema é a falta de ar.':'Uns '+rr(2,3)+' de 10, é mais um mal-estar.';return pre+t+end}
  const ov=GA_CASE[b]&&GA_CASE[b][g];if(ov)return pre+ov+end;
  const L=(who?GA3:GA1)[g]||['Nada a acrescentar.'];return pre+L[hashS(c.id+g)%L.length]+end;
}
/* ===== NOTÍCIAS DOS SETORES E DEVOLUÇÕES ===== */
const SECDOC={UTI:'Dra. Helena Marques, plantonista da UTI',ENF:'Dr. Rogério Sampaio, plantonista da enfermaria de Clínica Médica',OBS:'Dra. Patrícia Leal, médica da sala de observação',AMA:'Dra. Lívia Andrade, plantonista da sala amarela',EMG:'Dr. Ícaro Freire, plantonista da sala vermelha',TRANS:'Dr. Fábio Moura, médico do hospital de referência'};
const SECN={UTI:'UTI',ENF:'Enfermaria',OBS:'Observação (sala verde)',AMA:'Sala amarela',EMG:'Sala vermelha',TRANS:'Hospital de referência'};
function addNews(title,txt,hot){G.news.unshift({t:G.t,title,txt,hot:!!hot});G.unread++;alert_(fmt(G.t)+' Recado: '+title+'.',hot)}
function scheduleFate(P,d){
  const c=P.c,first=c.nome.split(' ')[0],inOK=c.dest.best.includes(d)||c.dest.ok.includes(d);
  const miss=c.key.filter((k,i)=>P.ks[i]==null).map(k=>k.lb.toLowerCase());
  P.missAtDest=miss;P.stageAtDest=P.stage;
  if(G.mode==='visit')return;
  if(d==='ALTA')return;
  if(d==='UTI'&&!inOK){G.sched.push({at:G.t+rnd(25,45),P,kind:'ret',sec:'UTI',msg:'Avaliei '+first+': sem critério de UTI no momento. Leito de UTI é escasso e tem paciente esperando. Estou devolvendo para a emergência definir outro destino.'});return}
  if((d==='ENF'||d==='OBS'||d==='AMA')&&(!inOK||(c.fatal&&miss.length&&P.stage<0))){G.sched.push({at:G.t+rnd(20,40),P,kind:'ret',sec:d,msg:first+' piorou aqui'+(miss.length?' e chegou sem '+miss.join(', '):'')+'. Não temos monitorização para esse quadro. Estou devolvendo para a sala vermelha.'});return}
  if(d==='TRANS'&&!inOK){G.sched.push({at:G.t+rnd(80,120),P,kind:'ret',sec:'TRANS',msg:'Recebemos '+first+' e fizemos contrarreferência: o caso não tinha indicação de transferência e poderia ser resolvido no hospital regional. Ele está voltando na ambulância.'});return}
  G.sched.push({at:G.t+(d==='TRANS'?rnd(45,90):rnd(40,100)),P,kind:'news',sec:d});
}
function deliver(it,final){
  const P=it.P,c=P.c,first=c.nome.split(' ')[0],dx=(DXS.find(x=>x[0]===c.hyp)||[0,''])[1];
  if(it.kind==='ret'){
    if(final||!P.res){addNews(SECN[it.sec]+' · '+first,SECDOC[it.sec]+': "'+it.msg+'" (recado recebido na passagem de plantão)',true);if(P.res){P.res.errs.push('Encaminhamento inadequado: seria devolvido pelo setor ('+SECN[it.sec]+').');P.res.score=clamp(P.res.score-15)}return}
    const k={UTI:'uti',ENF:'enf',OBS:'obs',AMA:'ama'}[P.dest];if(k)G.beds[k].used=Math.max(0,G.beds[k].used-1);
    P.returned=(P.returned||0)+1;P.st='queue';P.dest=null;P.res=null;P.pen.push([15,'Devolvido pelo setor ('+SECN[it.sec]+'): encaminhamento inadequado.']);
    if(it.sec!=='UTI'){P.adv.push(G.t);evolve(P)}
    G.rep=clamp(G.rep-3);
    P.log.push({t:G.t,k:'d',q:'Devolução · '+SECN[it.sec],a:SECDOC[it.sec]+': "'+it.msg+'"',fresh:1});
    addNews('Devolução · '+first,SECDOC[it.sec]+': "'+it.msg+'"',true);return;
  }
  const r=P.res;if(!r)return;let txt;
  if(it.sec==='TRANS'){
    const dep=P.depT!=null?P.depT:G.t,arr=dep+rnd(40,80);
    if(P.stageAtDest<=-1&&P.missAtDest.length&&c.fatal){r.cls='obito';r.score=0;r.txt=c.out.obito+' Isso aconteceu durante o transporte.';r.errs.push('Transferido instável e sem as condutas críticas.');
      txt=SECDOC.TRANS+': "'+first+' intercorreu na ambulância e chegou em parada. Não conseguimos reverter. Chegou sem '+P.missAtDest.join(', ')+'."'}
    else txt=SECDOC.TRANS+': "'+first+' chegou às '+fmt(arr)+(P.stageAtDest>=0?', estável':', ainda instável')+'. '+r.txt+(P.missAtDest.length?' Completamos aqui: '+P.missAtDest.join(', ')+'.':' Chegou bem conduzido.')+' Diagnóstico confirmado: '+dx+'."';
  }else{
    const remark=r.cls==='otimo'||r.cls==='bom'?'Chegou bem conduzido da emergência.':r.cls==='parcial'?'Completamos aqui'+(P.missAtDest.length?': '+P.missAtDest.join(', '):' alguns ajustes de prescrição')+'.':'Chegou com condução incompleta e deu trabalho para estabilizar.';
    txt=SECDOC[it.sec]+': "'+r.txt+' '+remark+' Diagnóstico confirmado no setor: '+dx+'."';
  }
  txt+=reqNews(P);
  addNews(SECN[it.sec]+' · '+first,txt,r.cls==='obito');
}
function emgCheck(P){
  const c=P.c;if(P.emgChk||P.emgT==null||G.t-P.emgT<30)return;
  if(c.dest.best.includes('EMG')||c.dest.ok.includes('EMG')||P.stage<0)return;
  P.emgChk=1;P.st='queue';P.pen.push([10,'Maca da sala vermelha ocupada sem indicação.']);
  const msg=c.nome.split(' ')[0]+' está estável e ocupando uma maca da sala vermelha. Liberei a maca; defina outro destino.';
  P.log.push({t:G.t,k:'d',q:'Devolução · Sala vermelha',a:SECDOC.EMG+': "'+msg+'"',fresh:1});addNews('Sala vermelha · '+c.nome.split(' ')[0],SECDOC.EMG+': "'+msg+'"',true);
}
/* ===== MEDIDAS INICIAIS (MOV e cuidados básicos) ===== */
const MOV=[['pac','Pacote MOV',0],['mon','Monitorizar',0],['ace','Acesso venoso',0],['o2c','O2 cateter nasal',0],['o2v','Máscara de Venturi',0],['o2m','Máscara não reinalante',0],['vni','VNI / CPAP',0],['cab','Cabeceira 45°',0],['jej','Dieta zero',0],['glic','Glicemia capilar',0],['ecg','ECG',0]];
/* medidas básicas: custam tempo (prescrever, conferir) e insumos (eletrodos, cateter, máscara, fita); sem penalidade por excesso, o custo é a consequência */
const MOVC={mon:[1,1],ace:[2,1],o2c:[1,1],o2v:[1,1],o2m:[1,2],vni:[5,3],cab:[.5,0],jej:[.5,0],isoc:[1,1],isog:[1,1],isoa:[1,2],isop:[1,1]};
function payMov(P,k){
  const m=MOVC[k];if(!m)return null;const[t,c]=m;
  if(c&&G.ins<c){if(P.c.tri==='VERMELHO'||P.c.tri==='LARANJA'){G.overCota=(G.overCota||0)+(c-G.ins);G.rep=clamp(G.rep-1);alert_(fmt(G.t)+' Direção: insumo liberado acima da cota para paciente grave.')}
    else return'Insumos esgotados: agora só há material para vermelhos e laranjas.'}
  G.ins=Math.max(0,G.ins-c);if(t)adv(t);return null;
}
const movCostTxt=k=>{if(k==='pac')return'4 min · 4 insumos';if(k==='glic')return'30 s · 1 insumo';if(k==='ecg')return'30 s · 1 insumo (laudo em 8 min)';const m=MOVC[k];if(!m)return'';return(m[0]<1?'30 s':m[0]+' min')+(m[1]?' · '+m[1]+' insumo'+(m[1]>1?'s':''):' · sem insumo')};
function doMov(P,k){
  P.mov=P.mov||{};
  if(/^iso[cgap]$/.test(k)){if(P.mov.iso===k)return doIso(P,k);const e=payMov(P,k);return e||doIso(P,k)}
  if(k==='pac'){let e=null;['mon','ace'].forEach(x=>{if(!e)e=doMov(P,x)});['glic','ecg'].forEach(x=>{if(!e&&!P.ord[x])e=order(P,x,false)});return e}
  if(k==='glic'||k==='ecg')return P.ord[k]?null:order(P,k,false);
  if(k==='o2c'||k==='o2v'||k==='o2m'||k==='vni'){const o=P.rx.find(r=>r.id==='o2'),i={o2c:0,o2v:1,o2m:2,vni:3}[k];if(o&&o.i===i)return null;
    if(MOVC[k][1]&&G.ins<MOVC[k][1]&&!(P.c.tri==='VERMELHO'||P.c.tri==='LARANJA'))return'Insumos esgotados: agora só há material para vermelhos e laranjas.';
    const e=rxAdd(P,{drug:'o2',dose:i,via:0,freq:'ic',dur:'ct'},true);return e||payMov(P,k)}
  if(k==='jej'&&P.mov.jej!=null){delete P.mov.jej;P.log.push({t:G.t,k:'m',q:'Enfermagem',a:'Dieta liberada.',fresh:1});adv(.5);return null}
  if(P.mov[k]!=null)return null;const it=MOV.find(x=>x[0]===k);
  const e=payMov(P,k);if(e)return e;P.mov[k]=G.t;
  P.log.push({t:G.t,k:'m',q:'Enfermagem',a:it[1]+': feito.',fresh:1});return null;
}
function movHtml(P){
  const m=P.mov||{},o2r=P.rx.find(r=>r.id==='o2'),o2=o2r?o2r.i:-1;
  const on=k=>k==='pac'?(m.mon!=null&&m.ace!=null&&!!P.ord.glic&&!!P.ord.ecg):k==='glic'||k==='ecg'?!!P.ord[k]:k==='o2c'?o2===0:k==='o2v'?o2===1:k==='o2m'?o2===2:k==='vni'?o2===3:m[k]!=null;
  return'<div class="doc px"><h3>Medidas iniciais <span>gastam tempo e insumos</span></h3><div class="grid mov">'+MOV.map(([k,n,t])=>{const d=on(k);
    return'<button class="btn paper opt'+(d?' on':'')+'" data-a="mov:'+k+'"'+(d&&k!=='jej'?' disabled':'')+'>'+n+'<small>'+(d&&k==='jej'?'ativa · toque para liberar':d?'feito':k==='pac'?'monitor, acesso, glicemia, ECG · '+movCostTxt(k):movCostTxt(k))+'</small></button>'}).join('')+'</div>'+(UI.movMsg?'<p class="warn" style="margin:6px 0 0">'+esc(UI.movMsg)+'</p>':'')+(window.isoHtml?isoHtml(P):'')+'</div>';
}
/* ===== procedimentos e lista de medicamentos por classe ===== */
function doProc(P,id){
  const it=PROCS.find(x=>x[0]===id);if(!it)return null;
  const r=rxAdd(P,{drug:id,dose:0,via:0,freq:'u',dur:'u'},true);if(r)return r;
  P.log.push({t:G.t,k:'p',q:'Procedimento',a:it[1]+': realizado.',fresh:1});adv(it[2]);return null;
}
function drugOpts(P,F){
  const used=new Set(CATS.flatMap(c=>c[1])),rest=Object.keys(DRUGS).filter(k=>!used.has(k)&&DRUGS[k].v[0]!=='Procedimento');
  const opt=k=>'<option value="'+k+'"'+(F.drug===k?' selected':'')+(k!=='o2'&&P.rx.some(r=>r.id===k)?' disabled':'')+'>'+DRUGS[k].n+'</option>';
  return CATS.map(([g,L])=>'<optgroup label="'+g+'">'+L.filter(k=>DRUGS[k]).sort((a,b)=>DRUGS[a].n.localeCompare(DRUGS[b].n,'pt')).map(opt).join('')+'</optgroup>').join('')
   +(rest.length?'<optgroup label="Outros">'+rest.map(opt).join('')+'</optgroup>':'');
}
/* ===== O preceptor (RQE) ===== */
const RQE={
 ae:['Você quer matar o paciente ou a minha paciência?','Quem te ensinou isso? Vou ligar pra sua faculdade.','Eu tenho RQE há 20 anos e nunca vi isso.','Doutor, o paciente não é cobaia.','Respira, lê a bula e depois prescreve.','Isso aí nem o calouro do primeiro período faria.','Vai responder no CRM por mim, é?','Parabéns, criou um caso clínico novo. Pena que é iatrogênico.','Na minha época a gente estudava antes do plantão.','Anota aí no caderninho: isso NÃO se faz.'],
 ex:['Pede logo uma ressonância e um PET-CT, já que é de graça… ah, não é.','Exame não substitui anamnese, doutor.','O laboratório mandou um abraço. E uma reclamação.','Vai pedir o exame por quê? Pra ver se dá alguma coisa?','A clínica é soberana. O resto é enfeite.'],
 bom:['Hoje até eu dormiria tranquilo no plantão. Quase.','Gostei. Não vai acostumar.','Assim que se faz. Pode continuar vindo.'],
 mid:['Dá pra melhorar. E muito.','Sobreviveu. Os pacientes, nem todos.','Plantão razoável. Amanhã eu quero melhor.'],
 ruim:['Vou fingir que não vi esse relatório.','Leva esse relatório pra casa e estuda cada linha.','Hoje o plantão foi de você contra os pacientes. Os pacientes perderam.']
};
function rqe(kind,ch){if(ch!=null&&Math.random()>ch*(window.difOf&&G?difOf().rqeF:1))return;const L=RQE[kind]||RQE.ae;alert_(fmt(G.t)+' Preceptor (RQE): "'+L[Math.floor(Math.random()*L.length)]+'"',true)}
function rqeFinal(score){const L=score>=70?RQE.bom:score>=45?RQE.mid:RQE.ruim;return L[Math.floor(Math.random()*L.length)]}
