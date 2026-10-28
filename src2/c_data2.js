/* ===== catálogo ampliado (Parte 2): cobre as especialidades de Clínica Médica para os casos inéditos ===== */
DRUGS.dipi.al='dipi';DRUGS.diclo.al='aine';
Object.assign(DRUGS,{
 atrop:{n:'Atropina',v:['EV'],d:['0,5 mg','1 mg','2–5 mg, dobrando a cada 5 min até atropinização','10 mg em bolus'],tox:3,ae:'Taquicardia extrema, delirium e hipertermia anticolinérgica.',f:'u ic',dr:'u ct'},
 cagl:{n:'Gluconato de cálcio 10%',v:['EV'],d:['10 mL em 10 min','30 mL em 10 min','100 mL em bolus'],tox:2,ae:'Bradicardia e arritmia por infusão rápida.',f:'u',dr:'u'},
 mag:{n:'Sulfato de magnésio',v:['EV'],d:['1 g','2 g em 20 min','10 g em bolus'],tox:2,ae:'Depressão respiratória e arreflexia.',f:'u',dr:'u'},
 diaz:{n:'Diazepam',v:['EV'],d:['5 mg','10 mg','30 mg em bolus'],tox:2,ae:'Depressão respiratória e rebaixamento.',f:'u sn',dr:'u'},
 feni:{n:'Fenitoína',v:['EV'],d:['10 mg/kg em 30 min','20 mg/kg (até 50 mg/min)','20 mg/kg em bolus'],tox:2,ae:'Hipotensão e arritmia pela infusão rápida.',f:'u',dr:'u'},
 halo:{n:'Haloperidol',v:['IM','EV'],d:['0,5–1 mg','2,5–5 mg','20 mg'],tox:2,ae:'Distonia aguda, QT longo e sedação excessiva.',f:'u sn',dr:'u'},
 nalox:{n:'Naloxona',v:['EV'],d:['0,04 mg (titular)','0,4 mg','4 mg em bolus'],tox:2,ae:'Abstinência aguda: agitação, vômitos e hipertensão.',f:'u sn',dr:'u'},
 tiam:{n:'Tiamina',v:['EV'],d:['100 mg','300 mg','5 g'],tox:2,ae:'Reação alérgica.',f:'u s8 s24',dr:'u d3 d5'},
 glic50:{n:'Glicose 50%',v:['EV'],d:['10 mL','40 mL (20 g)','200 mL'],tox:2,ae:'Hiperglicemia de rebote e flebite química.',f:'u',dr:'u'},
 alte:{n:'Alteplase',v:['EV'],d:['0,6 mg/kg','0,9 mg/kg (10% em bolus, resto em 1 h)','1,5 mg/kg'],tox:2,ae:'Hemorragia intracraniana.',f:'u',dr:'u'},
 hepa:{n:'Heparina não fracionada',v:['EV/SC'],d:['5.000 UI SC (profilaxia)','80 UI/kg em bolus + 18 UI/kg/h','40.000 UI em bolus'],tox:2,ae:'Hemorragia com queda da Hb.',f:'ic s8',dr:'ct'},
 amio:{n:'Amiodarona',v:['EV'],d:['150 mg em 10 min','300 mg em 30–60 min','1.200 mg em bolus'],tox:2,ae:'Hipotensão e bradicardia graves.',f:'u ic',dr:'u h24'},
 aden:{n:'Adenosina',v:['EV'],d:['3 mg','6 mg em bolus rápido (repetir 12 mg)','30 mg'],tox:2,ae:'Assistolia prolongada.',f:'u',dr:'u'},
 meto:{n:'Metoprolol',v:['EV'],d:['2,5 mg','5 mg (até 3 doses)','20 mg em bolus'],tox:2,ae:'Bradicardia e hipotensão.',f:'u s6',dr:'u'},
 propra:{n:'Propranolol',v:['VO'],d:['10 mg','40–80 mg','320 mg'],tox:2,ae:'Bradicardia e broncoespasmo.',f:'s6 s8',dr:'ct'},
 cefep:{n:'Cefepima',v:['EV'],d:['1 g','2 g','6 g'],tox:2,ae:'Encefalopatia por excesso de dose.',f:'s8 s12',dr:'d7 d10'},
 vanco:{n:'Vancomicina',v:['EV'],d:['500 mg','15–20 mg/kg','4 g'],tox:2,ae:'Lesão renal aguda e síndrome do homem vermelho.',f:'s12 s8',dr:'d7 d10'},
 azitro:{n:'Azitromicina',v:['VO','EV'],d:['250 mg','500 mg','1,5 g'],tox:2,ae:'Náuseas intensas e QT prolongado.',f:'s24',dr:'d3 d5'},
 amoxclav:{n:'Amoxicilina + clavulanato',v:['VO','EV'],d:['500 mg','875 mg VO / 1 g EV','3 g'],tox:2,al:'penic',ae:'Diarreia intensa.',f:'s8 s12',dr:'d7 d5 d10'},
 metro:{n:'Metronidazol',v:['EV','VO'],d:['250 mg','500 mg','2 g'],tox:2,ae:'Náuseas e neurotoxicidade.',f:'s8',dr:'d7 d10'},
 cipro:{n:'Ciprofloxacino',v:['VO','EV'],d:['250 mg','400–500 mg','1,5 g'],tox:2,ae:'QT longo e convulsão.',f:'s12',dr:'d7 d10'},
 smx:{n:'Sulfametoxazol + trimetoprima',v:['VO'],d:['400/80 mg','800/160 mg','4 comprimidos de 800/160 mg'],tox:2,al:'sulfa',ae:'Hipercalemia e farmacodermia.',f:'s12',dr:'d3 d7 d10'},
 ripe:{n:'RIPE (esquema básico da tuberculose)',v:['VO'],d:['2 comprimidos','dose por peso (3 a 5 comprimidos)','8 comprimidos'],tox:2,ae:'Hepatotoxicidade com icterícia.',f:'s24',dr:'ct'},
 anfo:{n:'Anfotericina B lipossomal',v:['EV'],d:['1 mg/kg/dia','3 mg/kg/dia','10 mg/kg/dia'],tox:2,ae:'Nefrotoxicidade e hipocalemia.',f:'s24',dr:'d7 ct'},
 salb:{n:'Salbutamol',v:['Inalatória'],d:['2 jatos','4 a 8 jatos com espaçador (ou nebulização 5 mg)','20 jatos seguidos'],tox:2,ae:'Taquicardia de 150 bpm, tremor e hipocalemia.',f:'u s4 sn',dr:'u h24 ct'},
 ipra:{n:'Ipratrópio',v:['Inalatória'],d:['0,25 mg','0,5 mg','2 mg'],tox:2,ae:'Boca seca e retenção urinária.',f:'u s4 s6',dr:'u h24'},
 hidroc:{n:'Hidrocortisona',v:['EV'],d:['50 mg','100 mg','1 g'],tox:2,ae:'Hiperglicemia importante e agitação.',f:'u s6 s8',dr:'u d3 d5'},
 pred:{n:'Prednisona',v:['VO'],d:['10 mg','40 mg','200 mg'],tox:2,ae:'Hiperglicemia importante e agitação.',f:'s24',dr:'d5 d7'},
 dexa:{n:'Dexametasona',v:['EV'],d:['4 mg','10 mg','40 mg'],f:'u s6 s24',dr:'u d3 d5'},
 lactul:{n:'Lactulose',v:['VO/SNG'],d:['10 mL','20–30 mL (2 a 3 evacuações/dia)','200 mL'],tox:2,ae:'Diarreia, desidratação e hipernatremia.',f:'s8 s6',dr:'ct'},
 carv:{n:'Carvão ativado',v:['VO/SNG'],d:['25 g','1 g/kg (até 50 g)','150 g'],tox:2,ae:'Vômitos com risco de broncoaspiração.',f:'u',dr:'u'},
 soroesc:{n:'Soro antiescorpiônico',v:['EV'],d:['1 ampola','2–3 ampolas','10 ampolas'],tox:2,ae:'Reação ao soro heterólogo.',f:'u',dr:'u'},
 ondan:{n:'Ondansetrona',v:['EV'],d:['4 mg','8 mg','32 mg'],tox:2,ae:'QT longo.',f:'s8 sn u',dr:'u d3'},
 metoc:{n:'Metoclopramida',v:['EV'],d:['5 mg','10 mg','40 mg'],tox:2,ae:'Distonia aguda.',f:'s8 sn u',dr:'u d3'},
 levot:{n:'Levotiroxina',v:['VO','EV'],d:['25 mcg VO','100 mcg VO','300 mcg EV (ataque no mixedema)'],f:'s24 u',dr:'ct u'},
 ptu:{n:'Propiltiouracil',v:['VO'],d:['100 mg','500–1.000 mg de ataque','3 g'],tox:2,ae:'Hepatotoxicidade e agranulocitose.',f:'s4 s6 u',dr:'ct'},
 zole:{n:'Ácido zoledrônico',v:['EV'],d:['2 mg','4 mg em 15 min','12 mg'],tox:2,ae:'Lesão renal e hipocalcemia.',f:'u',dr:'u'}
});
Object.assign(EXAMS,{
 tsh:{n:'TSH e T4 livre',t:60,c:3},calc:{n:'Cálcio, magnésio e fósforo',t:40,c:2},hepat:{n:'Função hepática',t:50,c:3},
 amil:{n:'Amilase e lipase',t:45,c:2},ck:{n:'CK total',t:45,c:2},sorol:{n:'Testes rápidos e sorologias',t:20,c:2},
 bacil:{n:'Baciloscopia / TRM-TB',t:90,c:3},lcr:{n:'Punção lombar (líquor)',t:60,c:4}
});
const ALERG=['penic','dipi','aine','sulfa'];
const SLOTS=[0,10,25,45,70,95,120,150,185];
