/* ===== Parte 6: oxigênio específico, diluições, mais medicamentos, procedimentos, exames agrupados ===== */
/* oxigênio: dispositivos em ordem crescente de suporte */
DRUGS.o2={n:'Oxigênio',v:['Inalatória'],d:['Cateter nasal 1–5 L/min (FiO2 ~24–40%)','Máscara de Venturi 24–50% (FiO2 fixa)','Máscara não reinalante com reservatório 10–15 L/min','VNI / CPAP 8–10 cmH2O'],f:'ic',dr:'ct',ae:'Excesso de oxigênio: hiperóxia e, no retentor de CO2, piora da hipercapnia.'};
CASES.forEach(c=>c.key.forEach(k=>{
  if(!k.ids.includes('o2'))return;const m=x=>[0,2,3][x];
  const fill=a=>{const b=a.map(m);const lo=Math.min(...b),hi=Math.max(...b),r=[];for(let i=lo;i<=hi;i++)r.push(i);return r};
  if(Array.isArray(k.ok))k.ok=fill(k.ok);else if(k.ok.o2)k.ok.o2=fill(k.ok.o2);
  if(c.id==='dpoc'){k.ok=[0,1,3];k.lb='O2 controlado (cateter ou Venturi, alvo 88–92%) ou VNI'}
}));
/* tomografia útil em alguns quadros */
(()=>{const f=id=>CASES.find(c=>c.id===id);
  const tep=f('tep');tep.res.tc='Angiotomografia: falhas de enchimento em artérias pulmonares lobares inferiores bilaterais, sem sinais de sobrecarga grave de VD.';tep.util.push('tc','dimero');tep.evid=['tc','us'];tep.res.dimero='Elevado (2.800 ng/mL).';
  tep.out.ok='Anticoagulado em tempo, com o diagnóstico confirmado pela imagem. {N} estabiliza na enfermaria.';
  tep.ensina='TEP estável: com alta probabilidade clínica, anticoagular enquanto confirma (angiotomografia, ou ultrassom com TVP se a TC não estiver disponível). Trombólise só se houver instabilidade.';
  f('estmal').res.tc='TC de crânio sem lesões agudas.';f('estmal').util.push('tc');
  f('hiposu').res.tc='TC de crânio sem lesões agudas.';f('hiposu').util.push('tc');
  f('absti').res.tc='TC de crânio sem sangramento; atrofia cortical leve.';f('absti').util.push('tc');
  f('eh').res.tc='TC de crânio sem lesões agudas.';f('eh').util.push('tc');
  f('hda').util.push('tipag');f('hda').res.tipag='O positivo. Prova cruzada liberada para 2 concentrados.';
  ['estmal','eap','organo','dpoc','hda'].forEach(id=>f(id).allowed.push('iot'));
  ['eap','sepse','dpoc','hiperk','tireo','estmal','organo','hda','cad','iam'].forEach(id=>f(id).allowed.push('cvc','svd'));
  f('hda').allowed.push('sne','octreo','tranex');f('cad').allowed.push('svd');f('sepse').allowed.push('hemoc');
  f('iam').allowed.push('tnk','atorva','meto');f('eap').allowed.push('isso','morf');
})();
/* novos medicamentos */
Object.assign(DRUGS,{
 isso:{n:'Dinitrato de isossorbida SL',v:['SL'],d:['2,5 mg','5 mg','20 mg'],tox:2,ae:'Hipotensão e cefaleia intensa.',f:'u sn',dr:'u'},
 tnk:{n:'Tenecteplase',v:['EV'],d:['Metade da dose por peso','Dose por peso em bolus único (30–50 mg)','Dose dobrada'],tox:2,ae:'Hemorragia intracraniana.',f:'u',dr:'u'},
 lido:{n:'Lidocaína',v:['EV'],d:['0,5 mg/kg','1–1,5 mg/kg','5 mg/kg'],tox:2,ae:'Convulsão e bradicardia.',f:'u',dr:'u'},
 propo:{n:'Propofol',v:['EV'],d:['0,5 mg/kg','1–2 mg/kg (indução)','5 mg/kg'],tox:2,ae:'Hipotensão grave e apneia.',f:'u ic',dr:'u ct'},
 metilp:{n:'Metilprednisolona',v:['EV'],d:['40 mg','125 mg','1 g'],tox:2,ae:'Hiperglicemia e agitação.',f:'u s6 s12',dr:'u d3 d5'},
 codeina:{n:'Codeína + paracetamol',v:['VO'],d:['30/500 mg','60/1000 mg','120/2000 mg'],tox:2,ae:'Sonolência, constipação e hepatotoxicidade.',f:'s6 s8 sn',dr:'d3'},
 simet:{n:'Simeticona',v:['VO'],d:['40 mg','80–120 mg','500 mg'],f:'s8 sn',dr:'d3'},
 hioscomp:{n:'Escopolamina + dipirona',v:['EV'],d:['Meia ampola','1 ampola (20 mg + 2,5 g)','3 ampolas'],tox:2,al:'dipi',ae:'Hipotensão e taquicardia.',f:'u s8 sn',dr:'u d3'},
 panto:{n:'Pantoprazol',v:['EV','VO'],d:['20 mg','40 mg','80 mg em bolus'],f:'s24 s12 u',dr:'d3 d5 ct'},
 clorp:{n:'Clorpromazina',v:['IM','EV'],d:['12,5 mg','25 mg','100 mg'],tox:2,ae:'Hipotensão e sedação intensa.',f:'u sn',dr:'u'},
 levet:{n:'Levetiracetam',v:['EV','VO'],d:['10 mg/kg','40–60 mg/kg (ataque)','120 mg/kg'],tox:2,ae:'Sonolência e agitação.',f:'u s12',dr:'u ct'},
 sorcal:{n:'Poliestirenossulfonato de cálcio',v:['VO'],d:['15 g','30 g','90 g'],tox:2,ae:'Constipação grave e necrose intestinal.',f:'u s8',dr:'u d3'},
 pfc:{n:'Plasma fresco congelado',v:['EV'],d:['1 unidade','10–15 mL/kg','40 mL/kg'],tox:2,ae:'Sobrecarga volêmica.',f:'u',dr:'u',fluid:1},
 plaq:{n:'Concentrado de plaquetas',v:['EV'],d:['1 unidade','1 unidade a cada 10 kg (ou aférese)','4 aféreses'],tox:2,ae:'Sobrecarga e reação transfusional.',f:'u',dr:'u',fluid:1},
 crio:{n:'Crioprecipitado',v:['EV'],d:['2 unidades','1 unidade a cada 10 kg','30 unidades'],tox:2,ae:'Trombose.',f:'u',dr:'u',fluid:1},
 ccp:{n:'Complexo protrombínico',v:['EV'],d:['10 UI/kg','25–50 UI/kg (conforme INR)','100 UI/kg'],tox:2,ae:'Trombose.',f:'u',dr:'u'},
 soroc:{n:'Soro anticrotálico',v:['EV'],d:['5 ampolas','10 ampolas','20 ampolas','40 ampolas'],tox:3,ae:'Reação ao soro heterólogo.',f:'u',dr:'u'},
 amox:{n:'Amoxicilina',v:['VO'],d:['250 mg','500 mg','3 g'],tox:2,al:'penic',ae:'Diarreia e farmacodermia.',f:'s8',dr:'d7 d5 d10'},
 cefal:{n:'Cefalexina',v:['VO'],d:['250 mg','500 mg','4 g'],tox:2,ae:'Diarreia.',f:'s6',dr:'d7 d10'},
 levo:{n:'Levofloxacino',v:['VO','EV'],d:['250 mg','500–750 mg','2 g'],tox:2,ae:'QT longo e tendinite.',f:'s24',dr:'d5 d7'},
 ceftaz:{n:'Ceftazidima',v:['EV'],d:['1 g','2 g','8 g'],tox:2,ae:'Neurotoxicidade.',f:'s8',dr:'d7 d10'},
 amica:{n:'Amicacina',v:['EV'],d:['5 mg/kg','15 mg/kg 1x ao dia','40 mg/kg'],tox:2,ae:'Lesão renal e ototoxicidade.',f:'s24',dr:'d5 d7'},
 nist:{n:'Nistatina suspensão oral',v:['VO'],d:['100 mil UI','500 mil UI (bochecho)','5 milhões UI'],f:'s6',dr:'d7'},
 carved:{n:'Carvedilol',v:['VO'],d:['3,125 mg','6,25–25 mg','100 mg'],tox:2,ae:'Bradicardia e hipotensão.',f:'s12',dr:'ct'},
 hctz:{n:'Hidroclorotiazida',v:['VO'],d:['12,5 mg','25 mg','200 mg'],tox:2,ae:'Hiponatremia e hipocalemia.',f:'s24',dr:'ct'},
 /* procedimentos */
 cardiov:{n:'Cardioversão elétrica sincronizada',v:['Procedimento'],d:['Cardioversão sincronizada sob sedação'],f:'u',dr:'u'},
 desfib:{n:'Desfibrilação',v:['Procedimento'],d:['Choque não sincronizado'],f:'u',dr:'u'},
 cvc:{n:'Acesso venoso central',v:['Procedimento'],d:['Cateter venoso central guiado por ultrassom'],f:'u',dr:'u'},
 parac:{n:'Paracentese diagnóstica',v:['Procedimento'],d:['Paracentese com análise do líquido ascítico'],f:'u',dr:'u'},
 dreno:{n:'Drenagem torácica',v:['Procedimento'],d:['Drenagem em selo d\'água'],f:'u',dr:'u'}
});
/* classes para organizar a lista de medicamentos */
const CATS=[
 ['Analgesia, sedação e intubação',['dipi','para','tram','morf','fenta','codeina','ceto','ibu','diclo','hioscomp','hiosc','mida','diaz','ceta','etomi','propo','succi','rocu','lido']],
 ['Antimicrobianos',['ceftri','cefep','ceftaz','mero','pip','amoxclav','amox','cefal','ampi','peni','benza','oxa','vanco','clinda','genta','amica','azitro','doxi','cipro','levo','metro','smx','fluco','nist','aciclo','osel','ripe','anfo','cloroq','artem','ivermec','albend','prazi','benzni']],
 ['Cardiovascular e vasoativos',['aas','clop','strep','tnk','alte','nitro','isso','nitrop','hidral','capto','enal','losa','anlo','clon','meto','propra','carved','amio','aden','diltia','digo','furo','hctz','espiro','norad','dobu','dopa','adre','atrop','sinva','atorva']],
 ['Anticoagulação e hemostasia',['enox','hepa','varf','vitk','protam','tranex','ccp']],
 ['Soluções e hemoderivados',['sf','ringer','sg10','salhip','albu','hemac','pfc','plaq','crio']],
 ['Respiratório',['o2','salb','ipra','hidroc','metilp','pred','dexa','mag']],
 ['Endócrino e eletrólitos',['insu','nph','metf','glic50','kcl','cagl','bic','sorcal','levot','ptu','zole']],
 ['Gastrointestinal',['omep','panto','ondan','bromo','metoc','terli','octreo','lactul','lacto','simet']],
 ['Neurologia e psiquiatria',['feni','fenob','valpro','levet','clonaz','halo','clorp','prome','hidrox','lorat','tiam','manit']],
 ['Antídotos e soros',['nalox','flumaz','nac','carv','sorobot','soroesc','soroc']]
];
const PROCS=[['iot','Intubação orotraqueal (sequência rápida)',10],['cardiov','Cardioversão elétrica sincronizada',5],['desfib','Desfibrilação',1],['cvc','Acesso venoso central',15],['sne','Sonda nasogástrica',3],['svd','Sonda vesical de demora',3],['sonda','Trocar sonda vesical',4],['torn','Retirar torniquete e elevar o membro',1],['parac','Paracentese diagnóstica',15],['dreno','Drenagem torácica',20]];
DRUGS.iot.n='Intubação orotraqueal';DRUGS.sne.n='Sonda nasogástrica';DRUGS.svd.n='Sonda vesical de demora';
/* diluição e tempo de infusão (vias endovenosas) */
const DIL={dir:'Sem diluição (EV direto)',ad10:'Água destilada 10 mL',sf100:'SF 0,9% 100 mL',sf250:'SF 0,9% 250 mL',sf500:'SF 0,9% 500 mL',sg100:'SG 5% 100 mL',sg250:'SG 5% 250 mL',sg500:'SG 5% 500 mL',pronta:'Solução pronta (frasco ou bolsa)',bic:'Solução padrão em bomba de infusão'};
const INF={rap:'Bolus rápido (< 1 min)',lento:'Bolus lento (2 a 5 min)',m15:'Em 15 a 30 min',h1:'Em 1 hora',h2:'Em 2 horas ou mais',cont:'Infusão contínua em bomba'};
const SG=['sg100','sg250','sg500'],SFs=['sf100','sf250','sf500'];
const bad=(L,t)=>Object.fromEntries(L.map(k=>[k,t]));
const DL={
 kcl:{ok:SFs,bad:{dir:'KCl sem diluição: hipercalemia aguda e parada cardíaca.',ad10:'KCl sem diluição adequada: hipercalemia aguda e parada cardíaca.'},iok:['h1','h2','cont'],ibad:bad(['rap','lento'],'KCl em bolus: fibrilação ventricular.')},
 vanco:{ok:['sf250','sg250','sf500'],iok:['h1','h2'],ibad:bad(['rap','lento','m15'],'Vancomicina rápida: síndrome do homem vermelho e hipotensão.')},
 feni:{ok:['sf100','sf250','dir'],bad:bad(SG,'Fenitoína em soro glicosado: precipita no equipo e a dose não chega.'),iok:['m15'],ibad:bad(['rap'],'Fenitoína rápida: hipotensão e arritmia.')},
 anfo:{ok:['sg250','sg500'],bad:bad(SFs,'Anfotericina em soro fisiológico: precipita.'),iok:['h2']},
 amio:{ok:['sg100','sg250'],iok:['m15','h1','cont'],ibad:bad(['rap'],'Amiodarona em bolus rápido fora da parada: hipotensão grave.')},
 nitro:{ok:['sg250','sf250','bic'],iok:['cont'],ibad:bad(['rap','lento'],'Nitroglicerina em bolus: hipotensão grave.')},
 nitrop:{ok:['sg250','bic'],iok:['cont'],ibad:bad(['rap','lento'],'Nitroprussiato em bolus: hipotensão grave.')},
 norad:{ok:['sg250','sf250','bic'],iok:['cont'],ibad:bad(['rap','lento'],'Noradrenalina em bolus: crise hipertensiva e arritmia.')},
 dobu:{ok:['sg250','sf250','bic'],iok:['cont'],ibad:bad(['rap','lento'],'Dobutamina em bolus: taquiarritmia.')},
 dopa:{ok:['sg250','sf250','bic'],iok:['cont'],ibad:bad(['rap','lento'],'Dopamina em bolus: taquiarritmia.')},
 aden:{ok:['dir'],iok:['rap'],ineff:['lento','m15','h1','h2','cont'],ineffT:'Adenosina lenta não faz efeito (meia-vida de segundos).'},
 strep:{ok:['sf100','sf250'],iok:['h1'],ibad:bad(['rap','lento'],'Estreptoquinase rápida: hipotensão grave.')},
 clinda:{ok:['sf100','sg100'],iok:['m15','h1'],ibad:bad(['rap','lento'],'Clindamicina em bolus: arritmia e parada.')},
 mag:{ok:['sf100','sg100'],iok:['m15','h1'],ibad:bad(['rap'],'Magnésio rápido: hipotensão e bradicardia.')},
 cagl:{ok:['sf100','sg100','dir'],iok:['lento','m15'],ibad:bad(['rap'],'Cálcio rápido: bradicardia e arritmia.')},
 dipi:{ok:['ad10','sf100'],iok:['lento','m15'],ibad:bad(['rap'],'Dipirona EV rápida: hipotensão.')},
 tram:{ok:['sf100'],iok:['m15'],ibad:bad(['rap'],'Tramadol rápido: náuseas e vômitos intensos.')},
 morf:{ok:['ad10'],iok:['lento']},furo:{ok:['dir','ad10'],iok:['lento','m15']},
 ceftri:{ok:['sf100','ad10'],iok:['lento','m15','h1']},cefep:{ok:['sf100','sf250'],iok:['m15','h1','h2']},ceftaz:{ok:['sf100','sf250'],iok:['m15','h1']},
 mero:{ok:['sf100','sf250'],iok:['m15','h1','h2']},pip:{ok:['sf100','sf250'],iok:['m15','h1','h2']},
 metro:{ok:['pronta'],iok:['m15','h1']},cipro:{ok:['pronta'],iok:['h1']},levo:{ok:['pronta'],iok:['h1']},
 genta:{ok:['sf100'],iok:['m15','h1']},amica:{ok:['sf100','sf250'],iok:['m15','h1']},aciclo:{ok:['sf100','sf250'],iok:['h1']},
 oxa:{ok:['sf100'],iok:['m15']},ampi:{ok:['sf100'],iok:['m15']},peni:{ok:['sf100'],iok:['m15']},
 omep:{ok:['sf100','ad10'],iok:['lento','m15']},panto:{ok:['sf100','ad10'],iok:['lento','m15']},
 ondan:{ok:['sf100','ad10'],iok:['lento','m15']},bromo:{ok:['ad10','sf100'],iok:['lento','m15']},metoc:{ok:['ad10','sf100'],iok:['lento','m15']},
 hidroc:{ok:['ad10','sf100'],iok:['lento','m15']},metilp:{ok:['sf100'],iok:['m15','h1']},dexa:{ok:['dir','ad10'],iok:['lento']},
 glic50:{ok:['dir'],iok:['lento']},tiam:{ok:['sf100'],iok:['m15']},nac:{ok:['sg250'],iok:['h1']},
 terli:{ok:['dir','ad10'],iok:['lento']},octreo:{ok:['bic'],iok:['cont']},insu:{ok:['sf100','sf250','bic'],iok:['cont','rap','lento']},
 hepa:{ok:['bic','dir'],iok:['cont','lento']},tranex:{ok:['sf100'],iok:['m15']},ccp:{ok:['dir'],iok:['lento','m15']},
 hioscomp:{ok:['sf100'],iok:['m15'],ibad:bad(['rap'],'Escopolamina com dipirona rápida: hipotensão.')},
 halo:{ok:['dir'],iok:['lento']},diaz:{ok:['dir'],iok:['lento']},mida:{ok:['dir'],iok:['lento']},fenta:{ok:['dir'],iok:['lento']},
 ceta:{ok:['dir'],iok:['lento']},etomi:{ok:['dir'],iok:['lento']},propo:{ok:['dir','bic'],iok:['lento','cont']},succi:{ok:['dir'],iok:['rap']},rocu:{ok:['dir'],iok:['rap']},
 lido:{ok:['dir'],iok:['lento']},meto:{ok:['dir'],iok:['lento']},diltia:{ok:['dir'],iok:['lento']},hidral:{ok:['dir','ad10'],iok:['lento']},
 adre:{ok:['dir'],iok:['rap','lento']},atrop:{ok:['dir'],iok:['rap']},nalox:{ok:['dir','ad10'],iok:['lento']},flumaz:{ok:['dir'],iok:['lento']},
 sorobot:{ok:['sf250','sf500'],iok:['m15','h1']},soroesc:{ok:['sf250'],iok:['m15','h1']},soroc:{ok:['sf250','sf500'],iok:['m15','h1']},
 tnk:{ok:['dir'],iok:['rap','lento']},alte:{ok:['dir'],iok:['h1']},levet:{ok:['sf100'],iok:['m15']},valpro:{ok:['sf100'],iok:['m15']},fenob:{ok:['sf100'],iok:['m15']},
 anfo2:null
};
const dlDefault=id=>{const R=DL[id];return{dil:R&&R.ok?R.ok[0]:'ad10',inf:R&&R.iok?R.iok[0]:'lento'}};
const isEVrx=(D,via)=>D&&D.v[0]!=='Procedimento'&&!D.fluid&&!['sf','ringer','sg10','salhip','albu','hemac'].includes(Object.keys(DRUGS).find(k=>DRUGS[k]===D))&&/EV/.test(D.v[via||0]);
EXAMS.glic.g='Beira-leito';EXAMS.ecg.g='Beira-leito';EXAMS.cet.g='Beira-leito';EXAMS.gaso.g='Beira-leito';EXAMS.lact.g='Beira-leito';
const EXGROUPS=[['Beira-leito',['glic','ecg','cet','gaso','lact']],['Laboratório',['hemo','eletr','cr','calc','coag','hepat','amil','pcr','dimero','trop','ck','tsh','tipag']],['Urina e culturas',['urina','hemoc','escarro']],['Infecção e toxicologia',['sorol','gota','bacil','tox','lcr']],['Imagem',['rx','us','tc']]];
/* sala amarela: destino entre observação e sala vermelha */
DESTS.splice(2,0,['AMA','Sala amarela']);
CASES.forEach(c=>{const d=c.dest;if(d.best.includes('OBS'))d.best.push('AMA');else if(d.ok.includes('OBS'))d.ok.push('AMA');if(d.best.includes('ENF')&&!d.best.includes('AMA')&&!d.ok.includes('AMA'))d.ok.push('AMA')});
