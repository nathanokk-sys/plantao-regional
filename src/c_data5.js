/* ===== Parte 7: hemoderivados em bolsas, Hb rápida, sondas, lista ampla de hipóteses ===== */
DRUGS.hemac.d=['1 CH (≈300 mL)','2 CH','3 CH','4 CH'];DRUGS.hemac.tox=3;DRUGS.hemac.n='Concentrado de hemácias (CH)';
DRUGS.plaq.d=['1 CP','3 CP','6 CP (1 a cada 10 kg)','1 aférese (≈6–8 CP)','2 aféreses','4 aféreses'];DRUGS.plaq.tox=5;DRUGS.plaq.n='Concentrado de plaquetas (CP)';
DRUGS.pfc.d=['1 bolsa','2 bolsas','3 bolsas','4 bolsas (≈10–15 mL/kg)','8 bolsas'];DRUGS.pfc.tox=4;
DRUGS.crio.d=['5 unidades','10 unidades (1 a cada 10 kg)','20 unidades','30 unidades'];DRUGS.crio.tox=3;
const HEMOREF='Referência: 1 CH eleva a Hb em cerca de 1 g/dL. Plaquetas: 1 CP a cada 10 kg ou 1 aférese. Plasma: 10–15 mL/kg. Crioprecipitado: 1 unidade a cada 10 kg.';
/* sondas e procedimentos com nomes claros */
DRUGS.svd.n='Inserir sonda vesical de demora (SVD)';DRUGS.sne.n='Inserir sonda nasogástrica (SNG)';DRUGS.sonda.n='Trocar sonda vesical de demora (SVD)';
DRUGS.alivio={n:'Sondagem vesical de alívio',v:['Procedimento'],d:['Cateterismo vesical intermitente'],f:'u',dr:'u'};
DRUGS.sne2={n:'Inserir sonda nasoenteral (SNE)',v:['Procedimento'],d:['Sonda nasoenteral para dieta'],f:'u',dr:'u'};
(()=>{const P=PROCS;const ix=P.findIndex(x=>x[0]==='sne');P.splice(ix,3,['svd','Inserir sonda vesical de demora (SVD)',3],['alivio','Sondagem vesical de alívio',2],['sonda','Trocar sonda vesical de demora (SVD)',4],['sne','Inserir sonda nasogástrica (SNG)',3],['sne2','Inserir sonda nasoenteral (SNE)',4])})();
/* Hb rápida à beira-leito */
EXAMS.hbrap={n:'Hb rápida (hemoglobinômetro)',t:3,c:1};
EXGROUPS[0][1].unshift('hbrap');
CASES.forEach(c=>{const m=(c.res.hemo||'').match(/Hb\s*([\d,]+)/);c.res.hbrap=(m?'Hb '+m[1]:'Hb 13,1')+' g/dL (capilar, valor aproximado).';if(c.util.includes('hemo'))c.util.push('hbrap')});
/* lista ampla de hipóteses, por sistema (inclui os diagnósticos dos casos no meio de muitos outros) */
const DXG=[
 ['Cardiovascular',['IAM com supra de ST','Angina instável / IAM sem supra','Edema agudo de pulmão (ICC descompensada)','Insuficiência cardíaca descompensada perfil frio e úmido','Cardiopatia chagásica descompensada','Urgência hipertensiva','Emergência hipertensiva com encefalopatia','Dissecção de aorta','Fibrilação atrial de alta resposta','Taquicardia supraventricular','Bloqueio atrioventricular total','Pericardite aguda','Tamponamento cardíaco','Endocardite infecciosa','Síncope vasovagal','Trombose venosa profunda','Isquemia arterial aguda de membro','Miocardite aguda']],
 ['Respiratório',['Pneumonia comunitária','Pneumonia aspirativa','Exacerbação de DPOC','Crise de asma grave','Tromboembolismo pulmonar','Pneumotórax espontâneo','Derrame pleural','Tuberculose pulmonar','Insuficiência respiratória hipercápnica','Síndrome do desconforto respiratório agudo','Influenza grave','Bronquiectasia infectada','Hemoptise maciça','Crise de asma moderada']],
 ['Infecções e doenças regionais',['Sepse de foco urinário','Sepse de foco pulmonar','Sepse de foco abdominal','Pielonefrite aguda','Celulite / erisipela','Meningite bacteriana','Neutropenia febril','Dengue com sinais de alarme','Dengue grave','Chikungunya','Leptospirose','Leishmaniose visceral','Malária','Esquistossomose hepatoesplênica','Doença de Chagas aguda','Febre tifoide','Infecção de pele e partes moles necrotizante','HIV com infecção oportunista','Tétano','Cistite não complicada','Faringoamigdalite bacteriana','Dengue sem sinais de alarme']],
 ['Endócrino e metabólico',['Cetoacidose diabética','Estado hiperosmolar hiperglicêmico','Hipoglicemia','Crise tireotóxica','Coma mixedematoso','Insuficiência adrenal aguda','Hipercalcemia','Hiponatremia grave','Hipernatremia','Acidose lática']],
 ['Renal e eletrólitos',['Lesão renal aguda','Doença renal crônica agudizada','Hipercalemia grave','Hipocalemia grave','Síndrome urêmica','Rabdomiólise','Nefrolitíase obstrutiva com infecção','Retenção urinária aguda','Cólica renal (nefrolitíase)']],
 ['Digestivo e fígado',['Hemorragia digestiva alta varicosa','Úlcera péptica complicada','Hemorragia digestiva baixa','Encefalopatia hepática','Peritonite bacteriana espontânea','Hepatite alcoólica','Hepatite viral aguda','Insuficiência hepática aguda','Pancreatite aguda','Colecistite aguda','Colangite aguda','Gastroenterite aguda','Obstrução intestinal','Apendicite aguda','Isquemia mesentérica','Diverticulite aguda','Síndrome hepatorrenal']],
 ['Neurológico',['AVC isquêmico','AVC hemorrágico','Hemorragia subaracnóidea','Ataque isquêmico transitório','Estado de mal epiléptico','Crise convulsiva isolada','Delirium','Encefalopatia de Wernicke','Hematoma subdural crônico','Síndrome de Guillain-Barré','Miastenia gravis em crise','Cefaleia primária (enxaqueca)']],
 ['Hematologia e oncologia',['Anemia ferropriva grave','Anemia megaloblástica','Crise falcêmica','Púrpura trombocitopênica imune','Coagulação intravascular disseminada','Leucemia aguda','Síndrome de lise tumoral','Compressão medular neoplásica','Síndrome da veia cava superior','Intoxicação por varfarina']],
 ['Toxicologia e ambiente',['Intoxicação por organofosforado','Intoxicação por paracetamol','Intoxicação por benzodiazepínico','Intoxicação por opioide','Intoxicação alcoólica aguda','Síndrome de abstinência alcoólica','Acidente botrópico','Acidente crotálico','Escorpionismo','Acidente por abelhas','Intoxicação por carbamato (chumbinho)','Intermação (insolação)','Intoxicação digitálica']],
 ['Psiquiatria e outros',['Crise de ansiedade','Transtorno conversivo','Agitação psicomotora por psicose','Anafilaxia','Angioedema','Gota aguda','Artrite séptica','Lúpus em atividade','Lombalgia mecânica','Fratura de fêmur por queda','Urticária aguda']]
];
const DXGRP=(()=>{const byL=Object.fromEntries(DXS.map(([i,l])=>[l,i]));let n=0;
  const out=DXG.map(([g,L])=>[g,L.map(l=>{if(!byL[l]){const id='z'+(n++);DXS.push([id,l]);byL[l]=id}return byL[l]})]);
  const used=new Set(out.flatMap(x=>x[1]));const rest=DXS.filter(d=>!used.has(d[0])).map(d=>d[0]);if(rest.length)out.push(['Outros',rest]);return out})();
function dxOpts(P){
  const lab=Object.fromEntries(DXS.map(d=>[d[0],d[1]]));
  return DXGRP.map(([g,L])=>'<optgroup label="'+g+'">'+L.slice().sort((a,b)=>lab[a].localeCompare(lab[b],'pt')).map(k=>'<option value="'+k+'"'+(P.hyp===k?' selected':'')+'>'+lab[k]+'</option>').join('')+'</optgroup>').join('');
}
/* prescrição por abas (um medicamento pode estar em mais de uma) */
CATS.length=0;CATS.push(
 ['Dor e febre',['dipi','para','tram','morf','fenta','codeina','ceto','ibu','diclo','hioscomp','hiosc']],
 ['Carrinho de parada',['adre','amio','atrop','lido','bic','cagl','mag','aden','glic50','nalox','sf','ringer']],
 ['Sedação e intubação',['mida','diaz','fenta','ceta','etomi','propo','succi','rocu']],
 ['Antibióticos',['ceftri','cefep','ceftaz','mero','pip','amoxclav','amox','cefal','ampi','peni','benza','oxa','vanco','clinda','genta','amica','azitro','doxi','cipro','levo','metro','smx']],
 ['Antivirais, antifúngicos e antiparasitários',['fluco','nist','aciclo','osel','anfo','ripe','cloroq','artem','ivermec','albend','prazi','benzni']],
 ['Cardiovascular',['aas','clop','strep','tnk','alte','nitro','isso','nitrop','hidral','capto','enal','losa','anlo','clon','meto','propra','carved','diltia','digo','furo','hctz','espiro','norad','dobu','dopa','adre','sinva','atorva']],
 ['Anticoagulação e sangue',['enox','hepa','varf','vitk','protam','tranex','ccp','hemac','plaq','pfc','crio']],
 ['Soros e soluções',['sf','ringer','sg10','salhip','albu']],
 ['Respiratório',['o2','salb','ipra','hidroc','metilp','pred','dexa','mag']],
 ['Endócrino e eletrólitos',['insu','nph','metf','glic50','kcl','cagl','bic','mag','sorcal','levot','ptu','zole']],
 ['Gastrointestinal',['omep','panto','ondan','bromo','metoc','terli','octreo','lactul','lacto','simet']],
 ['Neuro e psiquiatria',['feni','fenob','valpro','levet','clonaz','halo','clorp','prome','hidrox','lorat','tiam','manit']],
 ['Antídotos e antivenenos',['nalox','flumaz','nac','carv','atrop','sorobot','soroesc','soroc']]);
/* o que é cada exame */
const EXINFO={hbrap:'Hemoglobina medida na hora, por aparelho portátil. Serve para decidir transfusão rápido; confirme depois com o hemograma.',
 glic:'Glicose no sangue da ponta do dedo, em 1 minuto. Obrigatória em rebaixamento, convulsão, confusão e em diabéticos.',
 gaso:'Gasometria arterial: pH, pCO2, pO2 e bicarbonato. Avalia acidose, hipoxemia e retenção de CO2.',
 lact:'Marcador de má perfusão dos tecidos. Acima de 2 indica hipoperfusão; acima de 4 é grave. Usado na sepse e no choque.',
 cet:'Dosa os corpos cetônicos (beta-hidroxibutirato) no sangue, ou cetonas na urina. Confirma cetose, como na cetoacidose diabética, no jejum prolongado e no uso de álcool.',
 hemo:'Hemoglobina, leucócitos com diferencial e plaquetas. Anemia, infecção, plaquetopenia e hemoconcentração.',
 eletr:'Sódio e potássio. Essencial antes de insulina, em vômitos e diarreia, na doença renal e no uso de diuréticos.',
 cr:'Ureia e creatinina: função dos rins. Lesão renal aguda, desidratação e ajuste de doses.',
 calc:'Cálcio, magnésio e fósforo. Arritmias, convulsões, alcoolismo, câncer e doença renal.',
 coag:'Tempo de protrombina (INR), TTPa e fibrinogênio. Sangramentos, doença do fígado, anticoagulantes e acidente com cobra.',
 hepat:'TGO, TGP, bilirrubinas e albumina. Hepatites, cirrose, icterícia e intoxicação por paracetamol.',
 amil:'Amilase e lipase, enzimas do pâncreas. Lipase acima de 3 vezes o normal sugere pancreatite aguda.',
 pcr:'Proteína C reativa e VHS: marcadores de inflamação. Pouco específicos; ajudam a acompanhar a evolução.',
 dimero:'Produto da quebra de coágulos. Normal afasta TEP e trombose em quem tem baixa probabilidade; alto não confirma sozinho.',
 trop:'Marcador de lesão do músculo do coração. Infarto, miocardite e TEP grave. Se o ECG já mostra supra de ST, não espere por ela.',
 ck:'Enzima do músculo. Rabdomiólise, convulsões prolongadas, trauma e acidente crotálico.',
 tsh:'Função da tireoide. TSH baixo com T4 livre alto indica hipertireoidismo; o contrário, hipotireoidismo.',
 tipag:'Tipo sanguíneo e prova de compatibilidade antes de transfundir. Sem ela, só sangue O negativo, em urgência.',
 urina:'Exame de urina (EAS) com urocultura: infecção urinária, sangue, proteína, glicose e cetonas na urina.',
 tox:'Dosagem de álcool e de paracetamol no sangue. Intoxicações e rebaixamento sem causa clara.',
 hemoc:'Culturas de sangue (duas amostras) colhidas antes do antibiótico. Identificam a bactéria em 48 a 72 horas; não devem atrasar o tratamento.',
 escarro:'Gram e cultura do escarro: identifica a bactéria da pneumonia. Útil nos casos graves ou que não respondem.',
 bacil:'Pesquisa do bacilo da tuberculose no escarro (baciloscopia) e teste molecular rápido (TRM-TB).',
 gota:'Gota espessa: procura o parasita da malária no sangue. Febre em quem esteve em área com malária.',
 sorol:'Testes rápidos e sorologias: dengue (NS1 e IgM), HIV, sífilis, hepatites e leishmaniose (rK39).',
 lcr:'Punção lombar com análise do líquor: meningite, encefalite e hemorragia subaracnóidea com tomografia normal.',
 ecg:'Eletrocardiograma de 12 derivações, em até 10 minutos na dor no peito. Arritmias, infarto e alterações do potássio.',
 rx:'Raio-X de tórax: pneumonia, congestão, derrame pleural, pneumotórax e tamanho do coração.',
 us:'Ultrassom à beira-leito: líquido livre, função do coração, veia cava, linhas B no pulmão, trombose venosa e bexiga.',
 tc:'Tomografia: crânio no AVC e no trauma; angiotomografia no TEP e na dissecção; abdome na dor abdominal grave.'};
/* observação = sala verde */
DESTS.find(d=>d[0]==='OBS')[1]='Observação (sala verde)';
const ESSQ=['comorb','uso','alerg','drogas','dor'];
/* laboratório lento, com a cara do hospital regional (urgência corta o tempo pela metade) */
Object.entries({hemo:60,eletr:60,cr:60,calc:60,coag:60,hepat:75,amil:60,pcr:60,dimero:60,trop:60,ck:60,tsh:90,tipag:45,urina:60,tox:90,hemoc:30,escarro:90,bacil:120,gota:60,sorol:30,lcr:90,rx:30,us:20,tc:70,gaso:20,lact:20,cet:15}).forEach(([k,t])=>{if(EXAMS[k])EXAMS[k].t=t});
