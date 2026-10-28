/* ===== DADOS: catálogos clínicos (separados da lógica e da interface) ===== */
const T0=19*60,SHIFT=720;
const FREQ={u:'AGORA (dose única)',s4:'4/4 h',s6:'6/6 h',s8:'8/8 h',s12:'12/12 h',s24:'1x ao dia',ic:'Bomba de infusão contínua (BIC)',sn:'Se necessário'};
const DUR={u:'Dose única',h24:'24 h',d3:'3 dias',d5:'5 dias',d7:'7 dias',d10:'10 a 14 dias',ct:'Até a reavaliação'};
/* d: doses em ordem crescente; tox: primeiro índice com dose insegura; f/dr: frequências e durações aceitas (a primeira é o padrão); al: classe de alergia */
const DRUGS={
 o2:{n:'Oxigênio',v:['Inalatória'],d:['Cateter nasal 2 L/min','Máscara com reservatório 10–15 L/min','VNI/CPAP 8–10 cmH2O'],f:'ic',dr:'ct'},
 furo:{n:'Furosemida',v:['EV'],d:['20 mg','40 mg','80 mg','160 mg em bolus'],tox:3,ae:'Hipovolemia e hipocalemia: PA 80/50 e extrassístoles ventriculares.',f:'u s8 s12',dr:'u h24 ct'},
 nitro:{n:'Nitroglicerina',v:['EV contínua'],d:['5–10 mcg/min (titular)','20–50 mcg/min (titular)','200 mcg/min em bolus'],tox:2,ae:'Hipotensão grave com síncope.',f:'ic',dr:'ct h24'},
 morf:{n:'Morfina',v:['EV'],d:['2 mg','4 mg','10 mg'],tox:2,ae:'Depressão respiratória: FR 8 irpm e SatO2 82%.',f:'u s6 sn',dr:'u h24'},
 aas:{n:'AAS',v:['VO'],d:['100 mg','200–300 mg mastigado','1 g'],tox:2,ae:'Hemorragia digestiva alta.',f:'u s24',dr:'u ct'},
 clop:{n:'Clopidogrel',v:['VO'],d:['75 mg','300 mg (ataque)','600 mg'],tox:2,ae:'Sangramento de mucosas e hematomas.',f:'u s24',dr:'u ct'},
 strep:{n:'Estreptoquinase',v:['EV'],d:['750.000 UI em 60 min','1.500.000 UI em 60 min','3.000.000 UI em bolus'],tox:2,ae:'Hipotensão e hemorragia grave.',f:'u',dr:'u'},
 enox:{n:'Enoxaparina',v:['SC/EV'],d:['20 mg SC','30 mg EV + 1 mg/kg SC','2 mg/kg SC'],tox:2,ae:'Hemorragia: hematoma volumoso e queda da Hb.',f:'s12 s24 u',dr:'ct d3 d5'},
 sf:{n:'Soro fisiológico 0,9%',v:['EV'],d:['250 mL','500 mL','1.000 mL','2.000 mL (30 mL/kg)'],f:'u',dr:'u ct'},
 insu:{n:'Insulina regular',v:['EV/SC'],d:['0,1 U/kg/h em infusão contínua','10 U EV em bolus','20 U subcutânea'],tox:1,ae:'Hipoglicemia grave e hipocalemia: glicemia 38 e arritmia.',f:'ic u',dr:'ct h24'},
 kcl:{n:'Cloreto de potássio',v:['EV'],d:['10 mEq em 1 h','20 mEq em 1 h','40 mEq em bolus'],tox:2,ae:'Hipercalemia aguda: bradicardia e risco de parada.',f:'u ic',dr:'u ct h24'},
 bic:{n:'Bicarbonato de sódio',v:['EV'],d:['50 mEq','100 mEq','200 mEq'],f:'u',dr:'u'},
 ceftri:{n:'Ceftriaxona',v:['EV'],d:['500 mg','1 g','2 g','4 g'],tox:3,ae:'Reação alérgica e diarreia por excesso de dose.',f:'s24 s12',dr:'d5 d7 d10'},
 mero:{n:'Meropeném',v:['EV'],d:['500 mg','1 g','2 g'],tox:2,ae:'Convulsão por excesso de dose em lesão renal.',f:'s8',dr:'d7 d10'},
 pip:{n:'Piperacilina + tazobactam',v:['EV'],d:['2,25 g','4,5 g'],al:'penic',f:'s6 s8',dr:'d7 d10'},
 omep:{n:'Omeprazol',v:['EV','VO'],d:['20 mg','40 mg','80 mg em bolus'],f:'s12 s24 u',dr:'d3 d5 ct'},
 terli:{n:'Terlipressina',v:['EV'],d:['0,5 mg','2 mg (ataque)','4 mg em bolus'],tox:2,ae:'Isquemia periférica e arritmia.',f:'s4 s6',dr:'d3 d5 ct'},
 hemac:{n:'Concentrado de hemácias',v:['EV'],d:['1 concentrado','2 concentrados','4 concentrados'],tox:2,ae:'Sobrecarga volêmica e piora da pressão portal.',f:'u',dr:'u'},
 sorobot:{n:'Soro antibotrópico',v:['EV'],d:['2 ampolas','4 ampolas','8 ampolas','12 ampolas'],tox:3,ae:'Reação alérgica ao soro heterólogo e consumo desnecessário do estoque.',f:'u',dr:'u'},
 dipi:{n:'Dipirona',v:['EV'],d:['500 mg','1 g','2 g'],f:'s6 sn u',dr:'d3 ct u'},
 para:{n:'Paracetamol',v:['VO'],d:['500 mg','750 mg','1 g'],f:'s6 s8 sn',dr:'d3 ct'},
 diclo:{n:'Diclofenaco',v:['IM'],d:['75 mg'],f:'s12 u',dr:'d3 u'},
 capto:{n:'Captopril',v:['VO'],d:['12,5 mg','25 mg','50 mg'],f:'u s8 s12',dr:'u d3 ct'},
 losa:{n:'Losartana',v:['VO'],d:['50 mg','100 mg'],f:'s12 s24',dr:'ct'},
 anlo:{n:'Anlodipino',v:['VO'],d:['5 mg','10 mg'],f:'s24',dr:'ct'},
 norad:{n:'Noradrenalina',v:['EV contínua'],d:['0,05 mcg/kg/min','0,1–0,5 mcg/kg/min (titular)','3 mcg/kg/min'],tox:2,ae:'Isquemia de extremidades e hipertensão grave.',f:'ic',dr:'ct'},
 torn:{n:'Retirar torniquete',v:['Procedimento'],d:['Retirar torniquete e elevar o membro'],f:'u',dr:'u'},
 sonda:{n:'Trocar sonda vesical',v:['Procedimento'],d:['Trocar a sonda e coletar urocultura'],f:'u',dr:'u'}
};
/* c: custo em insumos · t: minutos até o resultado */
const EXAMS={
 glic:{n:'Glicemia capilar',t:1,c:1},ecg:{n:'ECG de 12 derivações',t:8,c:1},cet:{n:'Cetonemia / cetonúria',t:10,c:1},
 lact:{n:'Lactato',t:15,c:2},gaso:{n:'Gasometria arterial',t:20,c:3},hemo:{n:'Hemograma',t:45,c:2},
 trop:{n:'Troponina',t:60,c:4},eletr:{n:'Sódio e potássio',t:40,c:2},cr:{n:'Ureia e creatinina',t:40,c:2},
 coag:{n:'Coagulograma (TC/INR)',t:50,c:3},urina:{n:'Urina tipo I',t:35,c:2},hemoc:{n:'Hemoculturas',t:30,c:3},
 rx:{n:'Raio-X de tórax',t:25,c:3},us:{n:'Ultrassom à beira-leito',t:20,c:3},tc:{n:'Tomografia',t:70,c:8}
};
const SYS=[['geral','Aspecto geral'],['cab','Cabeça e pescoço'],['cardio','Cardiovascular'],['resp','Respiratório'],['abd','Abdome'],['neuro','Neurológico'],['ext','Extremidades e pele']];
const DXS=[['ans','Crise de ansiedade'],['avc','AVC isquêmico'],['cad','Cetoacidose diabética'],['cel','Celulite / erisipela'],['dengue','Dengue com sinais de alarme'],['dis','Dissecção de aorta'],['dpoc','Exacerbação de DPOC'],['eap','Edema agudo de pulmão (ICC descompensada)'],['eh','Encefalopatia hepática'],['gea','Gastroenterite aguda'],['hda','Hemorragia digestiva alta varicosa'],['hipo','Hipoglicemia'],['iam','IAM com supra de ST'],['sca','Angina instável / IAM sem supra'],['ofid','Acidente botrópico'],['pan','Pancreatite aguda'],['pneu','Pneumonia comunitária'],['sepse','Sepse de foco urinário'],['tb','Tuberculose pulmonar'],['tep','Tromboembolismo pulmonar'],['ulc','Úlcera péptica complicada'],['has','Urgência hipertensiva']];
const DESTS=[['ALTA','Alta hospitalar'],['OBS','Observação'],['ENF','Enfermaria'],['EMG','Sala de emergência'],['UTI','UTI'],['TRANS','Transferência regulada']];
const ORIENT=[['sinais','Sinais de alarme e quando retornar'],['med','Medicações em uso explicadas'],['ubs','Retorno à UBS em 7 dias'],['enc','Encaminhamentos e atestado']];
const GEN_Q=[['comorb','Tem alguma doença ou já se internou antes?'],['uso','Que medicamentos usa?'],['alerg','Tem alergia a algum medicamento?'],['drogas','Usa álcool, cigarro ou outras drogas?'],['dor','De 0 a 10, quanto está a dor?'],['cirurgias','Já fez cirurgia ou internação recente?'],['familia','Tem doença na família?'],['vacinas','As vacinas estão em dia, incluindo a antitetânica?'],['ultima','Quando e o que comeu por último?'],['viagem','Viajou ou teve contato com alguém doente?'],['trabalho','Teve alguma exposição no trabalho (veneno, poeira, animais)?']];
const okIdx=(k,id)=>Array.isArray(k.ok)?k.ok:(k.ok[id]||[]);
