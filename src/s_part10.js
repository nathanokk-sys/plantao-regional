/* ===== Parte 10: ajustes de dados (abas, CCIH, isolamento, retorno, sintomáticos) ===== */
/* remédios que estavam fora das abas */
(()=>{const add=(cat,ids)=>{const C=CATS.find(c=>c[0]===cat);ids.forEach(i=>{if(!C[1].includes(i))C[1].push(i)})};
  add('Antibióticos',['nitrof','fosfo']);add('Soros e soluções',['sro']);add('Gastrointestinal',['sro','simet']);add('Dor e febre',['para','ibu'])})();
/* dipirona também por via oral (receita de alta) */
if(!DRUGS.dipi.v.includes('VO'))DRUGS.dipi.v.push('VO');
DRUGS.dipi.dr='d3 ct u d5';
/* sintomáticos não contam como "prescrição sem indicação" (a contraindicação continua valendo) */
const SYMPT=['dipi','para','ondan','bromo','metoc','simet','hiosc','hioscomp','omep'];
CASES.forEach(c=>SYMPT.forEach(s=>{if(!c.allowed.includes(s))c.allowed.push(s)}));
/* antimicrobianos de uso restrito: a farmácia só dispensa com a ficha da CCIH */
const RESTR=['anfo','mero','vanco','pip','cefep','ceftaz','amica'];
REQS.push(['ccih','Solicitação à CCIH (antimicrobiano restrito)']);
DRUGS.ccih={n:'Solicitação à CCIH (antimicrobiano restrito)',v:['Solicitação'],d:['Pedido'],f:'u',dr:'u'};
/* isolamento */
const ISO=[['isoc','contato','Isolamento de contato'],['isog','gotículas','Isolamento para gotículas'],['isoa','aerossóis','Isolamento para aerossóis'],['isop','protetor','Isolamento protetor (reverso)']];
const ISOK={aer:'isoa',got:'isog',con:'isoc',prot:'isop'};
(CASES.find(c=>c.id==='neutro')||{}).iso='prot';
/* retorno da alta */
const RET=[['r24','Reavaliação diária (até 48 h após a febre ceder)'],['r48','Reavaliação em 48 a 72 h'],['ubs7','UBS em 7 dias'],['amb','Ambulatório de especialidade'],['sn','Só se piorar (sinais de alarme)']];
const RETC={pneuleve:['r48'],dengsa:['r24'],cist:['sn','ubs7'],asmamod:['ubs7','amb'],colren:['ubs7','amb','sn'],geaa:['sn','ubs7'],urtic:['sn','ubs7'],enxaq:['ubs7','amb'],faring:['sn','ubs7'],has:['ubs7']};
CASES.forEach(c=>{if(!c.ret)c.ret=RETC[c.id]||['ubs7','amb','r48']});
ORIENT.splice(0,ORIENT.length,...ORIENT.filter(o=>o[0]!=='ubs'));
/* hemoculturas ficam prontas no 3º dia de internação */
const HEMOC={sepse:'Escherichia coli em 2 de 2 amostras, sensível a ceftriaxona, resistente a ampicilina.',neutro:'Sem crescimento bacteriano em 48 h.'};
/* novos casos recebem a Hb rápida, como os outros */
CASES.forEach(c=>{if(!c.res.hbrap){const m=(c.res.hemo||'').match(/Hb\s*([\d,]+)/);c.res.hbrap=(m?'Hb '+m[1]:'Hb 13,1')+' g/dL (capilar, valor aproximado).'}});
