/* ===== v2: dados do prontuário eletrônico (guias, pareceres, CID, tempos) ===== */
/* plantão noturno de 12 h (19:00 às 07:00), 10 pacientes espalhados pela noite */
SLOTS.splice(0,SLOTS.length,0,12,35,70,115,170,235,310,395,490);
/* medidas iniciais agora custam tempo (minutos) */
const MOVT={pac:5,mon:2,ace:3,o2c:1,o2v:1,o2m:1,vni:3,cab:.5,jej:.5,glic:1,ecg:2,isoc:1,isog:1,isoa:1,isop:1};
/* CID-10 pelo rótulo do diagnóstico */
const CID={'Crise de ansiedade':'F41.9','AVC isquêmico':'I63.9','Cetoacidose diabética':'E10.1','Celulite / erisipela':'A46','Dengue com sinais de alarme':'A97.1','Dissecção de aorta':'I71.0','Exacerbação de DPOC':'J44.1',
 'Edema agudo de pulmão (ICC descompensada)':'I50.1','Encefalopatia hepática':'K72.9','Gastroenterite aguda':'A09','Hemorragia digestiva alta varicosa':'I85.0','Hipoglicemia':'E16.2','IAM com supra de ST':'I21.9','Angina instável / IAM sem supra':'I20.0',
 'Acidente botrópico':'T63.0','Pancreatite aguda':'K85.9','Pneumonia comunitária':'J18.9','Sepse de foco urinário':'A41.9','Tuberculose pulmonar':'A15.0','Tromboembolismo pulmonar':'I26.9','Úlcera péptica complicada':'K27.4','Urgência hipertensiva':'I10',
 'Intoxicação por organofosforado':'T60.0','Hipercalemia grave':'E87.5','Crise tireotóxica':'E05.5','Neutropenia febril':'D70','Estado de mal epiléptico':'G41.9','Leishmaniose visceral':'B55.0','Síndrome de abstinência alcoólica':'F10.3',
 'Meningite bacteriana':'G00.9','Malária':'B54','Cardiopatia chagásica descompensada':'B57.2','Lesão renal aguda':'N17.9','Cistite não complicada':'N30.0','Crise de asma moderada':'J45.9','Cólica renal (nefrolitíase)':'N23','Urticária aguda':'L50.0',
 'Faringoamigdalite bacteriana':'J03.0','Dengue sem sinais de alarme':'A97.0','Cefaleia primária (enxaqueca)':'G43.9','Lombalgia mecânica':'M54.5','Insuficiência cardíaca descompensada perfil frio e úmido':'I50.9','Emergência hipertensiva com encefalopatia':'I67.4',
 'Fibrilação atrial de alta resposta':'I48.9','Taquicardia supraventricular':'I47.1','Bloqueio atrioventricular total':'I44.2','Pericardite aguda':'I30.9','Tamponamento cardíaco':'I31.9','Endocardite infecciosa':'I33.0','Síncope vasovagal':'R55','Trombose venosa profunda':'I80.2',
 'Isquemia arterial aguda de membro':'I74.3','Miocardite aguda':'I40.9','Pneumonia aspirativa':'J69.0','Crise de asma grave':'J46','Pneumotórax espontâneo':'J93.1','Derrame pleural':'J90','Insuficiência respiratória hipercápnica':'J96.0',
 'Síndrome do desconforto respiratório agudo':'J80','Influenza grave':'J11.1','Bronquiectasia infectada':'J47','Hemoptise maciça':'R04.2','Sepse de foco pulmonar':'A41.9','Sepse de foco abdominal':'A41.9','Pielonefrite aguda':'N10','Dengue grave':'A97.2',
 'Chikungunya':'A92.0','Leptospirose':'A27.9','Esquistossomose hepatoesplênica':'B65.1','Doença de Chagas aguda':'B57.1','Febre tifoide':'A01.0','Infecção de pele e partes moles necrotizante':'M72.6','HIV com infecção oportunista':'B20','Tétano':'A35',
 'Estado hiperosmolar hiperglicêmico':'E11.0','Coma mixedematoso':'E03.5','Insuficiência adrenal aguda':'E27.2','Hipercalcemia':'E83.5','Hiponatremia grave':'E87.1','Hipernatremia':'E87.0','Acidose lática':'E87.2','Doença renal crônica agudizada':'N18.9',
 'Hipocalemia grave':'E87.6','Síndrome urêmica':'N19','Rabdomiólise':'M62.8','Nefrolitíase obstrutiva com infecção':'N13.6','Retenção urinária aguda':'R33','Hemorragia digestiva baixa':'K92.2','Peritonite bacteriana espontânea':'K65.0','Hepatite alcoólica':'K70.1',
 'Hepatite viral aguda':'B17.9','Insuficiência hepática aguda':'K72.0','Colecistite aguda':'K81.0','Colangite aguda':'K83.0','Obstrução intestinal':'K56.6','Apendicite aguda':'K35.8','Isquemia mesentérica':'K55.0','Diverticulite aguda':'K57.3',
 'Síndrome hepatorrenal':'K76.7','AVC hemorrágico':'I61.9','Hemorragia subaracnóidea':'I60.9','Ataque isquêmico transitório':'G45.9','Crise convulsiva isolada':'R56.8','Delirium':'F05.9','Encefalopatia de Wernicke':'E51.2','Hematoma subdural crônico':'I62.0',
 'Síndrome de Guillain-Barré':'G61.0','Miastenia gravis em crise':'G70.0','Anemia ferropriva grave':'D50.9','Anemia megaloblástica':'D51.9','Crise falcêmica':'D57.0','Púrpura trombocitopênica imune':'D69.3','Coagulação intravascular disseminada':'D65',
 'Leucemia aguda':'C95.0','Síndrome de lise tumoral':'E88.3','Compressão medular neoplásica':'G95.2','Síndrome da veia cava superior':'I87.1','Intoxicação por varfarina':'T45.5','Intoxicação por paracetamol':'T39.1','Intoxicação por benzodiazepínico':'T42.4',
 'Intoxicação por opioide':'T40.2','Intoxicação alcoólica aguda':'F10.0','Acidente crotálico':'T63.0','Escorpionismo':'T63.2','Acidente por abelhas':'T63.4','Intoxicação por carbamato (chumbinho)':'T60.0','Intermação (insolação)':'T67.0','Intoxicação digitálica':'T46.0',
 'Transtorno conversivo':'F44.9','Agitação psicomotora por psicose':'F23.9','Anafilaxia':'T78.2','Angioedema':'T78.3','Gota aguda':'M10.9','Artrite séptica':'M00.9','Lúpus em atividade':'M32.9','Fratura de fêmur por queda':'S72.0'};
const dxLabel=id=>(DXS.find(x=>x[0]===id)||[0,''])[1];
const dxCid=id=>{const l=dxLabel(id);return CID[l]?CID[l]+' · '+l:l};
/* opções do select com o CID na frente */
function dxOpts(P,q,sel){
  const lab=Object.fromEntries(DXS.map(d=>[d[0],d[1]])),nz=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(),Q=nz(q||''),cur=sel!=null?sel:P.hyp;
  return DXGRP.map(([g,L0])=>{const L=L0.filter(k=>!Q||nz(lab[k]).includes(Q)||nz(CID[lab[k]]||'').includes(Q));return L.length?[g,L]:null}).filter(Boolean)
    .map(([g,L])=>'<optgroup label="'+g+'">'+L.slice().sort((a,b)=>lab[a].localeCompare(lab[b],'pt')).map(k=>'<option value="'+k+'"'+(cur===k?' selected':'')+'>'+(CID[lab[k]]?CID[lab[k]]+' · ':'')+lab[k]+'</option>').join('')+'</optgroup>').join('');
}
/* pareceres (interconsulta) e quem responde de madrugada */
DRUGS.psico={n:'Parecer da psicologia',v:['Solicitação'],d:['Pedido'],f:'u',dr:'u'};REQOK.psico='A psicologia acolheu e vai seguir acompanhando.';
Object.assign(REQIND,{ans:['psico','social'],absti:['social','psico'],tb:['social','pinfec'],lv:['pinfec'],hiposu:['nutri','social']});
CASES.forEach(c=>(REQIND[c.base||c.id]||[]).forEach(r=>{if(!c.allowed.includes(r))c.allowed.push(r)}));
const PAR=[['pcir','Cirurgia geral'],['pcard','Cardiologia'],['pneuro','Neurologia'],['pgastro','Gastroenterologia'],['pinfec','Infectologia'],['hd','Nefrologia (hemodiálise)'],['fisio','Fisioterapia'],['nutri','Nutrição'],['social','Serviço social'],['psico','Psicologia']];
const ONCALL=['pcir','pcard','pneuro','pgastro','pinfec','hd'];
/* solicitação de exames por categoria (como no sistema: laboratório, imagem, outros) */
CASES.forEach(c=>{c.util=c.util.filter(x=>x!=='hbrap')});
const SOLCAT=[['Laboratório',['hemo','eletr','cr','calc','coag','hepat','amil','pcr','dimero','trop','ck','tsh','lact','gaso','cet','urina','tox','tipag','sorol','gota']],
  ['Imagem',['rx','us','tc']],['Outros',['ecg','hemoc','escarro','bacil','lcr','eda','eco']]];
const SOLX={eda:['Endoscopia digestiva alta (EDA)','Agendada pela endoscopia; exige dieta zero na véspera.'],eco:['Ecocardiograma transtorácico','Realizado pela cardiologia conforme a agenda.']};
const NEEDJUST=['rx','tc','us','eda','eco'];
/* exames de imagem sem laudo automático (só quando o residente pede) */
const NOLAUDO=['rx','tc'];
/* hemocomponentes saem da prescrição e passam pela solicitação de transfusão */
const HEMO=['hemac','plaq','pfc','crio'];
CATS.forEach(c=>{c[1]=c[1].filter(i=>!HEMO.includes(i))});
/* procedimentos que exigem termo assinado (fora da emergência) */
const TERMO=['cvc','parac','dreno','cardiov'];
/* sintomas neurológicos que impedem o paciente de assinar */
const noSign=c=>/sonolent|confus|desorient|torpor|coma|agitad|Glasgow\s*(?:1[0-3]|[3-9])\b|pós-ictal|rebaixad/i.test((c.ex.neuro||'')+' '+(c.ex.geral||''));
/* documentos de receitas e atestados */
const DOCS=[['rec','Receita médica'],['ate','Atestado médico'],['enc','Encaminhamento'],['dec','Declaração de comparecimento']];
/* tipos de evolução */
const EVT=[['adm','Admissão'],['dia','Evolução diária'],['int','Intercorrência'],['alta','Alta médica']];
/* número de prontuário (CPS) e data de nascimento fictícios e estáveis */
function cpsOf(c){let h=7;for(const ch of c.nome)h=(h*131+ch.charCodeAt(0))%900000;return String(100000+h)}
function nascOf(c){let h=3;for(const ch of c.nome)h=(h*31+ch.charCodeAt(0))%365;const d=new Date(Date.now()-((c.idade*365.25+h)*864e5));return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()}
