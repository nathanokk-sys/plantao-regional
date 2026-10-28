/* ===== Parte 8: pedidos a outros serviços, erros do sistema e "o que estava indicado" ===== */
const REQS=[['eda','Solicitar endoscopia digestiva alta (EDA)'],['eco','Solicitar ecocardiograma'],['hd','Solicitar hemodiálise (nefrologia)'],['pcir','Parecer da cirurgia geral'],['pcard','Parecer da cardiologia'],['pneuro','Parecer da neurologia'],['pgastro','Parecer da gastroenterologia'],['pinfec','Parecer da infectologia'],['fisio','Fisioterapia respiratória'],['nutri','Avaliação da nutrição'],['social','Serviço social']];
REQS.forEach(([id,n])=>{DRUGS[id]={n,v:['Solicitação'],d:['Pedido'],f:'u',dr:'u'}});
const REQIND={hda:['eda','pgastro','pcir'],iam:['pcard','eco'],eap:['eco','pcard','fisio'],hiperk:['hd'],dpoc:['fisio'],estmal:['pneuro'],neutro:['pinfec'],lv:['pinfec'],tep:['eco'],sepse:['pinfec'],ofid:['pcir'],tireo:['pcard'],cad:['nutri','social'],eh:['pgastro','nutri'],absti:['social'],hiposu:['nutri','social'],organo:['social'],has:['social']};
CASES.forEach(c=>{(REQIND[c.id]||[]).forEach(r=>c.allowed.push(r));c.allowed.push('jej')});
const REQOK={eda:'EDA realizada: ',eco:'Ecocardiograma realizado sem intercorrências.',hd:'Hemodiálise de urgência realizada; potássio normalizado.',pcir:'A cirurgia geral avaliou e acompanha o caso.',pcard:'A cardiologia avaliou e concordou com a conduta.',pneuro:'A neurologia avaliou e ajustou os anticonvulsivantes.',pgastro:'A gastroenterologia avaliou e acompanha o caso.',pinfec:'A infectologia avaliou e ajustou o esquema.',fisio:'A fisioterapia acompanhou a ventilação.',nutri:'A nutrição ajustou a dieta.',social:'O serviço social organizou o acesso aos remédios e o retorno.'};
function reqNews(P){
  const c=P.c,b=c.base||c.id,ind=REQIND[b]||[],out=[],S=P.reqSt=P.reqSt||{};
  P.rx.filter(r=>DRUGS[r.id]&&DRUGS[r.id].v[0]==='Solicitação'&&r.id!=='ccih').forEach(r=>{
    const n=DRUGS[r.id].n;
    if(!ind.includes(r.id)){S[r.id]='noind';out.push(n+': "Sem indicação de avaliação neste caso."');return}
    if(r.id==='eda'){
      if(P.mov.jej==null){S.eda='fail';out.push('EDA suspensa: o paciente não estava em dieta zero e tomou café da manhã.')}
      else if(Math.random()<.05){S.eda='pend';out.push('A requisição da EDA não chegou ao serviço de endoscopia; remarcada para amanhã.')}
      else if(Math.random()<.08){S.eda='fail';out.push('EDA perdida: o paciente ficou com fome e comeu escondido o lanche do acompanhante.')}
      else{S.eda='ok';out.push(REQOK.eda+(b==='hda'?'varizes de esôfago de grosso calibre com sinal de sangramento recente; feita ligadura elástica.':'sem alterações significativas.'))}
      return}
    const lost=Math.random()<.03;S[r.id]=lost?'pend':'ok';out.push(lost?n+': o pedido ficou esquecido no posto e só foi visto pelo plantão seguinte.':REQOK[r.id]||n+': realizado.');
  });
  return out.length?' Pedidos: '+out.join(' '):'';
}
function doReq(P,id){
  const r=rxAdd(P,{drug:id,dose:0,via:0,freq:'u',dur:'u'},true);if(r)return r;
  P.log.push({t:G.t,k:'p',q:'Solicitação',a:DRUGS[id].n+': pedido feito.',fresh:1});
  if(id==='ccih'){let n=0;(P.ksPend||[]).forEach(x=>{if(x.ccih){x.ccih=0;x.at=G.t+15;n++}});P.rx.forEach(r=>{if(r.ccih){r.ccih=0;n++}});
    P.log.push({t:G.t,k:'p',q:'CCIH',a:n?'Ficha recebida. A farmácia libera o antimicrobiano em cerca de 15 minutos.':'Ficha registrada. Quando houver antimicrobiano restrito, a farmácia libera direto.',fresh:1})}
  adv(1);return null;
}
/* erros de interno (baixa, mas presente: 10%), de aparelho (5%) e de laboratório/técnicos (3%) */
const LABERR=['Amostra hemolisada. Peça de novo.','A requisição não desceu para o laboratório (ficou esquecida no posto). Peça de novo.','Amostra coagulada no tubo. Peça de novo.'];
const LABSET=['hemo','eletr','cr','calc','coag','hepat','amil','pcr','dimero','trop','ck','tsh','tipag','lact'];
function examErr(id){
  const r=Math.random();
  if(id==='gaso'&&r<.10)return{bad:'O interno colheu sangue venoso: pO2 e saturação sem valor. Peça de novo.'};
  if(id==='ecg'){if(r<.10)return{bad:'O interno posicionou mal os eletrodos (braços trocados): traçado não confiável. Peça de novo.'};if(r<.15)return{extra:20,note:'Eletrocardiógrafo com defeito; buscaram outro aparelho na enfermaria (+20 min).'}}
  if(LABSET.includes(id)&&r<.03)return{bad:LABERR[Math.floor(Math.random()*LABERR.length)]};
  return null;
}
/* o que estava indicado, para o relatório */
function idealFor(c){
  const b=c.base||c.id;
  return[...c.key.map(k=>k.lb),'Destino: '+c.dest.best.map(d=>(DESTS.find(x=>x[0]===d)||[0,d])[1]).join(' ou '),
    ...(c.evid.length?['Confirmar com: '+c.evid.map(e=>EXAMS[e]?EXAMS[e].n:e).join(' ou ')]:[]),
    ...(REQIND[b]||[]).slice(0,2).map(r=>DRUGS[r].n)];
}
