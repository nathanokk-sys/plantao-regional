/* ===== v2: mais medicamentos, efeito nos sinais vitais e bombas de infusão ===== */
Object.assign(DRUGS,{
 tenox:{n:'Tenoxicam',v:['EV','IM'],d:['20 mg','40 mg','160 mg'],tox:2,f:'s24 u',dr:'u d3',al:'aine',ae:'Sangramento digestivo e lesão renal.'},
 nimes:{n:'Nimesulida',v:['VO'],d:['50 mg','100 mg','400 mg'],tox:2,f:'s12',dr:'d3',al:'aine',ae:'Hepatotoxicidade.'},
 morfvo:{n:'Morfina (VO)',v:['VO'],d:['5 mg','10 mg','60 mg'],tox:2,f:'s4 s6 sn',dr:'d3 ct',ae:'Depressão respiratória.'},
 nifed:{n:'Nifedipino retard',v:['VO'],d:['10 mg','20 mg','60 mg de uma vez'],tox:2,f:'s12',dr:'ct',ae:'Hipotensão e taquicardia reflexa.'},
 atenol:{n:'Atenolol',v:['VO'],d:['25 mg','50 mg','200 mg'],tox:2,f:'s24 s12',dr:'ct',ae:'Bradicardia e broncoespasmo.'},
 bisop:{n:'Bisoprolol',v:['VO'],d:['1,25 mg','2,5–10 mg','40 mg'],tox:2,f:'s24',dr:'ct',ae:'Bradicardia.'},
 metovo:{n:'Succinato de metoprolol',v:['VO'],d:['25 mg','50–100 mg','400 mg'],tox:2,f:'s24',dr:'ct',ae:'Bradicardia.'},
 vera:{n:'Verapamil',v:['EV','VO'],d:['2,5 mg EV','5 mg EV em 2 min','20 mg EV em bolus'],tox:2,f:'u s8',dr:'u ct',ae:'Bradicardia e hipotensão.'},
 monoc:{n:'Mononitrato de isossorbida',v:['VO'],d:['20 mg','40 mg','160 mg'],tox:2,f:'s12 s24',dr:'ct',ae:'Cefaleia e hipotensão.'},
 metild:{n:'Metildopa',v:['VO'],d:['250 mg','500 mg','3 g'],tox:2,f:'s8 s12',dr:'ct',ae:'Sonolência e hipotensão.'},
 clortal:{n:'Clortalidona',v:['VO'],d:['12,5 mg','25 mg','100 mg'],tox:2,f:'s24',dr:'ct',ae:'Hipocalemia e hiponatremia.'},
 vaso:{n:'Vasopressina',v:['EV contínua'],d:['0,01 U/min','0,03 U/min','0,1 U/min'],tox:2,f:'ic',dr:'ct',ae:'Isquemia de extremidades.'},
 adrebic:{n:'Adrenalina em infusão',v:['EV contínua'],d:['0,05 mcg/kg/min','0,1–0,3 mcg/kg/min (titular)','2 mcg/kg/min'],tox:2,f:'ic',dr:'ct',ae:'Taquiarritmia e isquemia.'},
 desla:{n:'Deslanosídeo',v:['EV'],d:['0,2 mg','0,4 mg','1,6 mg'],tox:2,f:'u',dr:'u',ae:'Intoxicação digitálica.'},
 rivar:{n:'Rivaroxabana',v:['VO'],d:['10 mg','15–20 mg','60 mg'],tox:2,f:'s24 s12',dr:'ct',ae:'Sangramento.'},
 apixa:{n:'Apixabana',v:['VO'],d:['2,5 mg','5 mg','20 mg'],tox:2,f:'s12',dr:'ct',ae:'Sangramento.'},
 ticag:{n:'Ticagrelor',v:['VO'],d:['90 mg','180 mg (ataque)','360 mg'],tox:2,f:'u s12',dr:'u ct',ae:'Sangramento e dispneia.'},
 dapag:{n:'Dapagliflozina',v:['VO'],d:['5 mg','10 mg','40 mg'],tox:2,f:'s24',dr:'ct',ae:'Cetoacidose euglicêmica.'},
 cefaz:{n:'Cefazolina',v:['EV'],d:['1 g','2 g','6 g'],tox:2,f:'s8',dr:'d7 d10',ae:'Convulsão em dose alta.'},
 cefur:{n:'Cefuroxima',v:['EV','VO'],d:['750 mg','1,5 g EV / 500 mg VO','6 g'],tox:2,f:'s8 s12',dr:'d7 d10',ae:'Diarreia.'},
 ampisul:{n:'Ampicilina + sulbactam',v:['EV'],d:['1,5 g','3 g','12 g'],tox:2,f:'s6',dr:'d7 d10',al:'penic',ae:'Diarreia.'},
 erta:{n:'Ertapeném',v:['EV'],d:['500 mg','1 g','3 g'],tox:2,f:'s24',dr:'d7 d10',ae:'Convulsão.'},
 polim:{n:'Polimixina B',v:['EV'],d:['15.000 UI/kg','25.000 UI/kg/dia (12/12 h)','60.000 UI/kg'],tox:2,f:'s12',dr:'d7 d10',ae:'Nefrotoxicidade e neurotoxicidade.'},
 teico:{n:'Teicoplanina',v:['EV'],d:['200 mg','400 mg 12/12 h (ataque)','1,6 g'],tox:2,f:'s12 s24',dr:'d7 d10',ae:'Nefrotoxicidade.'},
 linez:{n:'Linezolida',v:['EV','VO'],d:['300 mg','600 mg','2,4 g'],tox:2,f:'s12',dr:'d7 d10',ae:'Mielossupressão.'},
 clari:{n:'Claritromicina',v:['VO','EV'],d:['250 mg','500 mg','2 g'],tox:2,f:'s12',dr:'d7 d5',ae:'Prolongamento do QT.'},
 anfod:{n:'Anfotericina B desoxicolato',v:['EV'],d:['0,5 mg/kg','1 mg/kg/dia em 4–6 h','3 mg/kg'],tox:2,f:'s24',dr:'d7 ct',ae:'Nefrotoxicidade e hipocalemia.'},
 glucan:{n:'Antimoniato de meglumina',v:['EV','IM'],d:['10 mg Sb/kg','20 mg Sb/kg/dia','60 mg Sb/kg'],tox:2,f:'s24',dr:'d10 ct',ae:'Arritmia e pancreatite.'},
 fenot:{n:'Fenoterol (nebulização)',v:['Inalatória'],d:['5 gotas','10 gotas em nebulização','40 gotas'],tox:2,f:'u s4 s6',dr:'u h24',ae:'Taquicardia e tremor.'},
 budes:{n:'Budesonida inalatória',v:['Inalatória'],d:['200 mcg','400 mcg 12/12 h','3.200 mcg'],tox:2,f:'s12',dr:'ct',ae:'Candidíase oral.'},
 aminof:{n:'Aminofilina',v:['EV'],d:['240 mg','5 mg/kg em 30 min','20 mg/kg'],tox:2,f:'u s8',dr:'u',ae:'Arritmia e convulsão.'},
 glarg:{n:'Insulina glargina',v:['SC'],d:['0,1 U/kg','0,2–0,3 U/kg','1 U/kg'],tox:2,f:'s24',dr:'ct',ae:'Hipoglicemia.'},
 glib:{n:'Glibenclamida',v:['VO'],d:['2,5 mg','5 mg','20 mg'],tox:2,f:'s12 s24',dr:'ct',ae:'Hipoglicemia prolongada.'},
 glicla:{n:'Gliclazida MR',v:['VO'],d:['30 mg','60 mg','240 mg'],tox:2,f:'s24',dr:'ct',ae:'Hipoglicemia.'},
 metim:{n:'Metimazol',v:['VO'],d:['10 mg','20–40 mg','120 mg'],tox:2,f:'s24 s8',dr:'ct',ae:'Agranulocitose.'},
 fosk:{n:'Fosfato de potássio',v:['EV'],d:['10 mmol','20 mmol em 4 h','60 mmol em bolus'],tox:2,f:'u',dr:'u',ae:'Hipercalemia e hipocalcemia.'},
 nacl20:{n:'Cloreto de sódio 20% (ampola)',v:['EV'],d:['10 mL','20 mL na solução de manutenção','100 mL em bolus'],tox:2,f:'u',dr:'u',ae:'Hipernatremia e mielinólise.'},
 kclvo:{n:'Cloreto de potássio xarope',v:['VO'],d:['6 mEq','12–24 mEq','80 mEq'],tox:2,f:'s8 s12',dr:'d3',ae:'Hipercalemia.'},
 sg5:{n:'Soro glicosado 5%',v:['EV'],d:['250 mL','500 mL','1.000 mL em 1 h'],tox:2,f:'ic u',dr:'ct h24 u',ae:'Hiponatremia por excesso de água livre.'},
 dimen:{n:'Dimenidrinato',v:['EV','VO'],d:['25 mg','50 mg','200 mg'],tox:2,f:'s6 s8 sn u',dr:'u d3',ae:'Sonolência.'},
 loper:{n:'Loperamida',v:['VO'],d:['2 mg','4 mg (depois 2 mg por evacuação)','24 mg'],tox:2,f:'sn',dr:'d3',ae:'Íleo paralítico.'},
 ferro:{n:'Sulfato ferroso',v:['VO'],d:['40 mg de ferro','40 mg de ferro 2 a 3x ao dia','300 mg de ferro'],tox:2,f:'s8 s12 s24',dr:'ct',ae:'Intolerância gástrica.'},
 ferroev:{n:'Sacarato de hidróxido férrico',v:['EV'],d:['100 mg','200 mg em 250 mL de SF em 1 h','1 g em bolus'],tox:2,f:'u',dr:'u',ae:'Hipotensão e reação anafilactoide.'},
 folic:{n:'Ácido fólico',v:['VO'],d:['1 mg','5 mg','50 mg'],tox:2,f:'s24',dr:'ct',ae:'Pode mascarar deficiência de B12.'},
 b12:{n:'Cianocobalamina (B12)',v:['IM'],d:['100 mcg','1.000 mcg','10.000 mcg'],tox:2,f:'s24 u',dr:'d5 u',ae:'Hipocalemia na reposição.'},
 quetia:{n:'Quetiapina',v:['VO'],d:['12,5 mg','25–50 mg','800 mg'],tox:2,f:'s12 s24 sn',dr:'ct',ae:'Sedação e hipotensão.'},
 risper:{n:'Risperidona',v:['VO'],d:['0,5 mg','1–2 mg','16 mg'],tox:2,f:'s12 s24',dr:'ct',ae:'Sintomas extrapiramidais.'},
 olanz:{n:'Olanzapina',v:['IM','VO'],d:['2,5 mg','5–10 mg','40 mg'],tox:2,f:'u s24',dr:'u ct',ae:'Sedação excessiva.'},
 carba:{n:'Carbamazepina',v:['VO'],d:['100 mg','200 mg','1,6 g'],tox:2,f:'s8 s12',dr:'ct',ae:'Ataxia e hiponatremia.'},
 pralid:{n:'Pralidoxima',v:['EV'],d:['500 mg','1–2 g em 30 min','10 g'],tox:2,f:'u s4',dr:'u',ae:'Fraqueza muscular.'},
 glucag:{n:'Glucagon',v:['IM','EV'],d:['0,5 mg','1 mg','10 mg'],tox:2,f:'u',dr:'u',ae:'Vômitos.'},
 soroara:{n:'Soro antiaracnídico',v:['EV'],d:['2 ampolas','5 ampolas','15 ampolas'],tox:2,f:'u',dr:'u',ae:'Reação ao soro heterólogo.'},
 dt:{n:'Vacina dT (difteria e tétano)',v:['IM'],d:['0,5 mL','0,5 mL (reforço)','2,5 mL'],tox:2,f:'u',dr:'u',ae:'Dor local.'},
 dexclor:{n:'Dexclorfeniramina',v:['VO'],d:['1 mg','2 mg','12 mg'],tox:2,f:'s6 s8 sn',dr:'d3',ae:'Sonolência.'},
 colch:{n:'Colchicina',v:['VO'],d:['0,5 mg','0,5 mg 8/8 a 12/12 h','3 mg'],tox:2,f:'s12 s8',dr:'d5 ct',ae:'Diarreia e mielotoxicidade.'},
 alopu:{n:'Alopurinol',v:['VO'],d:['100 mg','300 mg','900 mg'],tox:2,f:'s24',dr:'ct',ae:'Farmacodermia grave.'},
 lactat:{n:'Ácido acetilsalicílico 100 mg (profilaxia)',v:['VO'],d:['50 mg','100 mg','500 mg'],tox:2,f:'s24',dr:'ct',ae:'Sangramento.'}
});
delete DRUGS.lactat;
/* frequências mais usadas */
DRUGS.anlo.f='s24 s12';DRUGS.hidral.f='u s6 ic';DRUGS.hidral.v=['EV','VO','EV contínua'];DRUGS.sf.f='u ic';DRUGS.ringer.f='u ic';DRUGS.capto.f='u s8 s12';DRUGS.losa.f='s12 s24';
(()=>{const add=(cat,ids)=>{const C=CATS.find(c=>c[0]===cat);if(C)ids.forEach(i=>{if(DRUGS[i]&&!C[1].includes(i))C[1].push(i)})};
 add('Dor e febre',['tenox','nimes','morfvo','codeina']);
 add('Cardiovascular',['nifed','atenol','bisop','metovo','vera','monoc','metild','clortal','vaso','adrebic','desla','ticag','dapag','hidral','isso','enal','clon']);
 add('Carrinho de parada',['vaso','adrebic']);
 add('Anticoagulação e sangue',['rivar','apixa','ferroev','ferro','folic','b12']);
 add('Antibióticos',['cefaz','cefur','ampisul','erta','polim','teico','linez','clari','nitrof','fosfo']);
 add('Antivirais, antifúngicos e antiparasitários',['anfod','glucan','anfo']);
 add('Respiratório',['fenot','budes','aminof']);
 add('Endócrino e eletrólitos',['glarg','glib','glicla','metim','fosk','nacl20','kclvo','nph','metf','insu','kcl','cagl','mag','bic','glic50','levot','ptu']);
 add('Soros e soluções',['sg5','sg10']);
 add('Gastrointestinal',['dimen','loper','panto','lactul','lacto','sorcal','terli','octreo']);
 add('Neuro e psiquiatria',['quetia','risper','olanz','carba','clonaz','halo','clorp','prome','fenob','valpro','levet','feni']);
 add('Antídotos e antivenenos',['pralid','glucag','soroara','dt','nalox','flumaz','nac','vitk','protam']);
 CATS.push(['Alergia e outros',['lorat','hidrox','dexclor','prome','colch','alopu','pred','dexa']]);})();
RESTR.push('polim','teico','linez','anfod');
CASES.forEach(c=>{if(c.id==='lv'||c.base==='lv')c.allowed.push('glucan','anfod')});
/* explicações específicas quando o remédio não está indicado */
(CASES.find(c=>c.id==='has')||{}).soft={hidral:'Hidralazina EV em urgência hipertensiva sem lesão de órgão-alvo: o indicado é anti-hipertensivo oral e redução gradual da PA.',nitrop:'Nitroprussiato em urgência hipertensiva: reservado para emergência hipertensiva, em UTI.',clon:null};
/* ---------- farmacodinâmica: efeito no sinal vital (dose habitual) ----------
   on = começa (min), pk = efeito pleno (min), du = duração de uma dose (min); s/d = PA sistólica/diastólica, fc, fr, sat, t (°C) */
const PD={
 hidral:{on:5,pk:20,du:240,s:-35,d:-18,fc:8},capto:{on:15,pk:60,du:360,s:-25,d:-12},anlo:{on:60,pk:240,du:1440,s:-20,d:-10},losa:{on:60,pk:240,du:1440,s:-18,d:-10},enal:{on:60,pk:240,du:720,s:-20,d:-10},
 clon:{on:30,pk:90,du:480,s:-25,d:-12,fc:-8},nifed:{on:30,pk:90,du:720,s:-22,d:-12,fc:6},metild:{on:120,pk:300,du:720,s:-15,d:-8},isso:{on:3,pk:10,du:60,s:-15,d:-6,fc:4},monoc:{on:30,pk:60,du:720,s:-10,d:-4},
 nitro:{on:2,pk:5,du:10,s:-25,d:-12,fc:5},nitrop:{on:1,pk:3,du:5,s:-40,d:-20,fc:6},
 meto:{on:5,pk:20,du:360,fc:-20,s:-10,d:-4},metovo:{on:60,pk:120,du:1440,fc:-15,s:-8},propra:{on:30,pk:90,du:360,fc:-18,s:-8},carved:{on:60,pk:120,du:720,fc:-12,s:-12,d:-6},atenol:{on:60,pk:120,du:1440,fc:-15,s:-10},bisop:{on:60,pk:180,du:1440,fc:-12,s:-8},
 diltia:{on:3,pk:15,du:240,fc:-25,s:-8},vera:{on:2,pk:10,du:180,fc:-25,s:-12},amio:{on:10,pk:60,du:720,fc:-15,s:-5},digo:{on:60,pk:240,du:1440,fc:-12},desla:{on:15,pk:60,du:720,fc:-15},
 atrop:{on:1,pk:3,du:60,fc:25},adre:{on:1,pk:3,du:15,s:30,d:10,fc:25},norad:{on:1,pk:5,du:5,s:35,d:18,fc:4},adrebic:{on:1,pk:5,du:5,s:30,d:10,fc:20},vaso:{on:2,pk:10,du:10,s:25,d:12},dobu:{on:2,pk:10,du:10,s:8,fc:12},dopa:{on:2,pk:10,du:10,s:15,fc:15},
 furo:{on:5,pk:30,du:360,s:-6,cong:{sat:4,fr:-4}},
 morf:{on:5,pk:15,du:240,fr:-4,fc:-6,s:-8},fenta:{on:1,pk:5,du:60,fr:-4,fc:-6,s:-5},tram:{on:15,pk:60,du:360,fc:-4},codeina:{on:30,pk:60,du:360,fc:-3},morfvo:{on:30,pk:60,du:240,fr:-3,fc:-4},
 dipi:{on:20,pk:60,du:360,t:-1.2,s:-6,fc:-4},para:{on:30,pk:60,du:360,t:-1,fc:-3},ibu:{on:30,pk:90,du:480,t:-1,fc:-3},ceto:{on:15,pk:45,du:480,t:-.8,fc:-4},tenox:{on:30,pk:120,du:1440,t:-.6,fc:-3},hioscomp:{on:15,pk:45,du:360,t:-1,fc:-4},nimes:{on:30,pk:90,du:720,t:-.8},diclo:{on:15,pk:60,du:480,t:-.6,fc:-3},
 salb:{on:5,pk:15,du:240,fc:12,resp:{sat:3,fr:-4}},fenot:{on:5,pk:15,du:240,fc:14,resp:{sat:3,fr:-4}},ipra:{on:10,pk:30,du:360,resp:{sat:1,fr:-2}},aminof:{on:10,pk:30,du:360,fc:10,resp:{sat:1,fr:-2}},
 diaz:{on:2,pk:5,du:240,fr:-3,fc:-5,s:-8},mida:{on:2,pk:5,du:60,fr:-4,fc:-5,s:-10},propo:{on:1,pk:2,du:10,s:-20,d:-10,fr:-4},halo:{on:15,pk:45,du:480,fc:-3},olanz:{on:15,pk:60,du:720,s:-8,fc:-4},clorp:{on:15,pk:45,du:480,s:-15,d:-8,fc:6},prome:{on:20,pk:60,du:360,s:-4},
 nalox:{on:1,pk:3,du:45,fr:6},mag:{on:5,pk:20,du:240,s:-6,resp:{sat:1,fr:-2}},
 hemac:{on:30,pk:120,du:9999,hypo:{s:8,fc:-8}}
};
const FLUID=['sf','ringer','sg10','sg5','salhip','albu'];
const CONG=['eap','chagas'],HYPO=['sepse','hda','cad','geaa','dengue','neutro','ofid','dengsa','gea'],RESPC=['asmamod','dpoc','pneuleve','tep','organo'];
/* bombas de infusão: solução padrão e vazão que a enfermagem programa ao instalar */
const BICSTD={norad:[25,'4 mg em SG 5% 250 mL (16 mcg/mL)'],adrebic:[25,'4 mg em SG 5% 250 mL (16 mcg/mL)'],vaso:[9,'20 U em SF 100 mL (0,2 U/mL)'],dobu:[20,'250 mg em SG 5% 250 mL (1 mg/mL)'],dopa:[20,'250 mg em SG 5% 250 mL (1 mg/mL)'],
 nitro:[6,'50 mg em SG 5% 250 mL (200 mcg/mL)'],nitrop:[10,'50 mg em SG 5% 250 mL (200 mcg/mL), frasco protegido da luz'],hidral:[10,'100 mg em SF 100 mL (1 mg/mL)'],insu:[7,'100 U em SF 100 mL (1 U/mL)'],hepa:[13,'25.000 UI em SF 250 mL (100 UI/mL)'],
 amio:[33,'900 mg em SG 5% 500 mL (1,8 mg/mL)'],octreo:[25,'500 mcg em SF 250 mL (2 mcg/mL)'],nac:[125,'esquema de 21 h em SG 5%'],kcl:[125,'40 mEq em SF 500 mL'],propo:[10,'propofol 1% puro (10 mg/mL)'],atrop:[10,'atropina em SF (titular)'],
 sf:[125,'SF 0,9% em frasco de 500 mL'],ringer:[125,'Ringer lactato em frasco de 500 mL'],sg10:[42,'SG 10% em frasco de 500 mL'],sg5:[63,'SG 5% em frasco de 500 mL'],o2:[0,'']};
const BICRATES=[1,2,3,5,7,10,13,15,20,25,30,33,42,50,63,80,100,125,150,200,250,500,999];
const BICHRS=[['1','1 h'],['2','2 h'],['6','6 h'],['12','12 h'],['24','24 h'],['0','Contínuo (até reavaliação)']];
