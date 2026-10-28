/* ===== Parte 10: laudos completos (hemograma, gasometria com íons, bioquímica), com data, hora e referência ===== */
const num=s=>s==null?null:parseFloat(String(s).replace(/\./g,'').replace(',','.'));
const numD=s=>s==null?null:parseFloat(String(s).replace(',','.'));
const grab=(t,re,f)=>{const m=(t||'').match(re);return m?(f||numD)(m[1]):null};
const fmtN=(v,d)=>{if(typeof v==='string')return v;if(v==null||isNaN(v))return'—';
  if(d<0){const p=Math.pow(10,-d);v=Math.round(v/p)*p;return Math.round(v).toLocaleString('pt-BR')}
  return v.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d})};
/* [chave, rótulo, unidade, [ref baixa, ref alta], casas decimais] */
const LP={
 hemo:{n:'Hemograma completo',rows:[['hem','Hemácias','milhões/mm³',[4.2,5.9],2],['hb','Hemoglobina','g/dL',[12,16],1],['ht','Hematócrito','%',[36,48],0],['vcm','VCM','fL',[80,100],0],['hcm','HCM','pg',[27,33],0],['rdw','RDW','%',[11.5,14.5],1],
   ['leu','Leucócitos','/mm³',[4000,11000],-2],['seg','Segmentados','%',[40,75],0],['bas','Bastões','%',[0,5],0],['lin','Linfócitos','%',[20,45],0],['mon','Monócitos','%',[2,10],0],['eos','Eosinófilos','%',[1,5],0],['plq','Plaquetas','/mm³',[150000,450000],-3]],sec:['Série vermelha',0,6,'Série branca',6,12,'Plaquetas',12,13]},
 gaso:{n:'Gasometria arterial com eletrólitos',rows:[['ph','pH','',[7.35,7.45],2],['pco2','pCO2','mmHg',[35,45],0],['po2','pO2','mmHg',[80,100],0],['hco3','HCO3','mEq/L',[22,26],1],['be','Excesso de base','mEq/L',[-2,2],1],['sat','SatO2','%',[95,100],0],['lac','Lactato','mmol/L',[0.5,2.0],1],
   ['na','Sódio','mEq/L',[135,145],0],['k','Potássio','mEq/L',[3.5,5.0],1],['cl','Cloro','mEq/L',[98,107],0],['cai','Cálcio iônico','mmol/L',[1.12,1.32],2],['gli','Glicose','mg/dL',[70,99],0],['ag','Ânion gap','mEq/L',[8,12],0]]},
 eletr:{n:'Eletrólitos',rows:[['na','Sódio','mEq/L',[135,145],0],['k','Potássio','mEq/L',[3.5,5.0],1],['cl','Cloro','mEq/L',[98,107],0]]},
 cr:{n:'Função renal',rows:[['ur','Ureia','mg/dL',[15,45],0],['cr','Creatinina','mg/dL',[0.6,1.2],1]]},
 calc:{n:'Cálcio, magnésio e fósforo',rows:[['ca','Cálcio total','mg/dL',[8.5,10.5],1],['mg','Magnésio','mg/dL',[1.7,2.4],1],['p','Fósforo','mg/dL',[2.5,4.5],1]]},
 coag:{n:'Coagulograma',rows:[['tp','Tempo de protrombina','s',[11,13.5],1],['inr','INR','',[0.8,1.2],1],['ttpa','TTPa','s',[25,35],0],['fib','Fibrinogênio','mg/dL',[200,400],0]]},
 hepat:{n:'Função hepática',rows:[['tgo','TGO (AST)','U/L',[5,40],0],['tgp','TGP (ALT)','U/L',[7,56],0],['fa','Fosfatase alcalina','U/L',[40,129],0],['ggt','GGT','U/L',[8,61],0],['bt','Bilirrubina total','mg/dL',[0.2,1.2],1],['bd','Bilirrubina direta','mg/dL',[0,0.3],1],['alb','Albumina','g/dL',[3.5,5.2],1],['glo','Globulinas','g/dL',[2.0,3.5],1]]},
 glic:{n:'Glicemia capilar',rows:[['g','Glicemia capilar','mg/dL',[70,140],0]]},
 lact:{n:'Lactato',rows:[['lac','Lactato arterial','mmol/L',[0.5,2.0],1]]},
 pcr:{n:'Provas inflamatórias',rows:[['pcr','Proteína C reativa','mg/L',[0,5],0],['vhs','VHS','mm/h',[0,20],0]]},
 trop:{n:'Troponina',rows:[['tro','Troponina I ultrassensível','ng/L',[0,26],0]]},
 ck:{n:'CPK',rows:[['ck','CPK total','U/L',[26,192],0]]},
 amil:{n:'Enzimas pancreáticas',rows:[['ami','Amilase','U/L',[28,100],0],['lip','Lipase','U/L',[13,60],0]]},
 tsh:{n:'Função tireoidiana',rows:[['tsh','TSH','µUI/mL',[0.4,4.5],2],['t4','T4 livre','ng/dL',[0.9,1.7],1]]},
 dimero:{n:'D-dímero',rows:[['dd','D-dímero','ng/mL FEU',[0,500],0]]},
 cet:{n:'Cetonemia',rows:[['bhb','Beta-hidroxibutirato','mmol/L',[0,0.6],1]]},
 hbrap:{n:'Hb rápida (hemoglobinômetro)',rows:[['hb','Hemoglobina capilar','g/dL',[12,17],1]]},
 urina:{n:'Urina tipo I (EAS)',rows:[['dens','Densidade','',[1.005,1.030],3],['uph','pH','',[5,7],1],['prot','Proteínas','',null,0],['ugli','Glicose','',null,0],['ucet','Corpos cetônicos','',null,0],['nit','Nitrito','',null,0],['uleu','Leucócitos','/campo',[0,5],0],['uhem','Hemácias','/campo',[0,3],0],['bact','Bactérias','',null,0]]}
};
const GASO_IONS=['gaso','eletr','calc','lact','glic','cet'];
function rnd01(seed){let x=Math.sin(seed*9301+49297)*233280;return x-Math.floor(x)}
function seedOf(P,k){let h=0;const s=P.id+k;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)%100000}
function normV(P,k,ref,d){const r=rnd01(seedOf(P,k));const v=ref[0]+(ref[1]-ref[0])*(.3+.4*r);return d<0?v:Math.round(v*Math.pow(10,d))/Math.pow(10,d)}
/* lê os números que o caso já traz e completa o resto com valores normais coerentes */
function labVals(P,id){
  const c=P.c,R=c.res,t=R[id]||'',F=c.sexo==='F',out={},b=c.base||c.id;
  const def=(k,ref,d)=>{if(out[k]==null)out[k]=normV(P,id+k,ref,d)};
  const ok=/sem altera|normal/i.test(t);
  if(id==='hemo'||id==='hbrap'){
    const h=R.hemo||'';out.hb=grab(h,/\bHb\s*([\d,]+)/);out.ht=grab(h,/(?:\bHt|hemat[óo]crito)\s*([\d,]+)/i);out.vcm=grab(h,/VCM\s*([\d,]+)/);
    out.leu=grab(h,/leuc[óo]citos\s*([\d.]+)/i,num);out.plq=grab(h,/plaquetas\s*([\d.]+)/i,num);out.bas=grab(h,/([\d,]+)\s*%\s*de\s*bast/i);
    const neu=grab(h,/neutr[óo]filos\s*([\d.]+)/i,num);
    if(/pancitopenia/i.test(h)){out.hb=out.hb||8.1;out.leu=out.leu||2300;out.plq=out.plq||72000}
    if(id==='hbrap')return{hb:out.hb!=null?out.hb:normV(P,'hemohb',F?[12.5,14.5]:[13.8,16],1)};
    if(out.hb==null&&out.ht!=null)out.hb=Math.round(out.ht/3*10)/10;
    def('hb',F?[12.5,14.5]:[13.8,16],1);if(out.ht==null)out.ht=Math.round(out.hb*3);
    out.hem=Math.round(out.hb/(out.vcm&&out.vcm>100?3.4:2.95)*100)/100;def('vcm',[84,94],0);out.hcm=Math.round(out.hb/out.hem*10);def('rdw',[12,13.8],1);if(out.vcm>100)out.rdw=15.6;
    def('leu',[5200,8800],-2);
    if(neu!=null&&neu<1500)out.seg=Math.max(1,Math.round(neu/out.leu*100));
    else if(out.leu>12000)out.seg=out.bas>8?70:82;
    def('seg',[52,66],0);if(out.bas==null)out.bas=out.leu>15000?6:out.seg<20?0:2;
    out.mon=out.seg<20?4:6;out.eos=out.seg<20?0:2;out.lin=Math.max(3,100-out.seg-out.bas-out.mon-out.eos);
    def('plq',[190000,320000],-3);
  }
  if(id==='gaso'){
    const ga=R.gaso||'',el=R.eletr||'';
    out.ph=grab(ga,/pH\s*([\d,]+)/);out.pco2=grab(ga,/pCO2\s*([\d,]+)/);out.po2=grab(ga,/pO2\s*([\d,]+)/);out.hco3=grab(ga,/HCO3\s*([\d,]+)/);
    out.lac=grab(ga,/lactato\s*([\d,]+)/i);if(out.lac==null)out.lac=grab(R.lact||'',/^([\d,]+)/);
    out.na=grab(el,/\bNa\s*([\d,]+)/);out.k=grab(el,/\bK\s*([\d,]+)/);
    const gl=R.glic||'';out.gli=/HI/.test(gl)?'> 500':grab(gl,/^([\d,]+)/);
    const a=x=>Math.pow(10,x-6.1);
    if(out.ph!=null&&out.pco2!=null&&out.hco3==null)out.hco3=Math.round(.03*out.pco2*a(out.ph)*10)/10;
    else if(out.ph!=null&&out.hco3!=null&&out.pco2==null)out.pco2=Math.round(out.hco3/(.03*a(out.ph)));
    else if(out.ph==null&&out.pco2!=null&&out.hco3!=null)out.ph=Math.round((6.1+Math.log10(out.hco3/(.03*out.pco2)))*100)/100;
    else if(out.ph!=null&&out.pco2==null&&out.hco3==null){const A=a(out.ph);if(out.ph<7.37){out.hco3=Math.round(.24*A/(1-.045*A)*10)/10;out.pco2=Math.round(1.5*out.hco3+8)}else{out.pco2=40;out.hco3=Math.round(.03*40*A*10)/10}}
    else if(out.ph==null){out.ph=normV(P,'gph',[7.38,7.42],2);out.pco2=normV(P,'gpc',[37,43],0);out.hco3=Math.round(.03*out.pco2*a(out.ph)*10)/10}
    if(out.po2==null){const s=+(P.c.vit[P.stage]||[0,0,0,97])[3]||97;out.po2=s>=97?normV(P,'gpo',[88,98],0):s>=94?72:s>=90?62:s>=85?52:44}
    out.sat=Math.min(100,Math.round(100/(1+23400/(Math.pow(out.po2,3)+150*out.po2))));
    out.be=Math.round(.93*(out.hco3-24.4+14.8*(out.ph-7.4))*10)/10;
    def('lac',[0.8,1.6],1);def('na',[137,142],0);def('k',[3.8,4.6],1);def('cai',[1.16,1.28],2);if(out.gli==null)def('gli',[82,98],0);
    const cr=grab(R.cr||'',/Cr\s*([\d,]+)/)||1;
    out.ag=Math.round(12+Math.max(0,out.lac-1.5)*1.2+(cr>4?6:0)+(b==='cad'?14:0));
    out.cl=Math.round(out.na-out.hco3-out.ag);
  }
  if(id==='eletr'){out.na=grab(t,/\bNa\s*([\d,]+)/);out.k=grab(t,/\bK\s*([\d,]+)/);def('na',[137,142],0);def('k',[3.8,4.6],1);
    const hc=grab(R.gaso||'',/HCO3\s*([\d,]+)/)||24;out.cl=Math.round(out.na-hc-12)}
  if(id==='cr'){out.ur=grab(t,/Ureia\s*([\d,]+)/i);out.cr=grab(t,/Cr\s*([\d,]+)/);def('ur',[20,38],0);def('cr',F?[0.6,0.9]:[0.8,1.1],1)}
  if(id==='calc'){out.ca=grab(t,/C[áa]lcio\s*([\d,]+)/i);out.mg=grab(t,/Mg\s*([\d,]+)/);def('ca',[8.8,9.8],1);def('mg',[1.9,2.2],1);def('p',[3,4],1)}
  if(id==='coag'){out.inr=grab(t,/INR\s*([\d,]+)/);if(/incoagul/i.test(t)){out.tp='> 120 (incoagulável)';out.ttpa='> 180 (incoagulável)';out.fib=/fibrinog[êe]nio baixo/i.test(t)?60:null}
    def('inr',[0.95,1.1],1);if(out.tp==null)out.tp=Math.round(12.2*out.inr*10)/10;if(out.ttpa==null)out.ttpa=out.inr>1.5?Math.round(30+(out.inr-1)*12):normV(P,'ttpa',[27,33],0);def('fib',[240,360],0)}
  if(id==='hepat'){out.tgo=grab(t,/TGO\s*([\d,]+)/);out.tgp=grab(t,/TGP\s*([\d,]+)/);out.ggt=grab(t,/GGT\s*([\d,]+)/);out.bt=grab(t,/bilirrubina(?: total)?\s*([\d,]+)/i);out.alb=grab(t,/albumina\s*([\d,]+)/i);out.glo=grab(t,/globulinas\s*([\d,]+)/i);
    def('tgo',[18,32],0);def('tgp',[15,38],0);def('fa',[60,110],0);def('ggt',[15,45],0);def('bt',[0.4,0.9],1);out.bd=Math.round(out.bt*(out.bt>2?.6:.25)*10)/10;def('alb',[3.8,4.6],1);def('glo',[2.4,3.1],1)}
  if(id==='glic')out.g=/HI/.test(t)?'HI (> 500)':grab(t,/^([\d,]+)/);
  if(id==='lact')out.lac=grab(t,/^([\d,]+)/);
  if(id==='pcr'){const hi=/elevad/i.test(t);out.pcr=hi?normV(P,'pcrh',[60,140],0):ok?3:grab(t,/([\d,]+)/);out.vhs=hi?normV(P,'vhs',[40,70],0):null;def('pcr',[1,4],0);def('vhs',[5,15],0)}
  if(id==='trop'){const m=grab(t,/\((\d+)\s*vezes/);out.tro=m?m*26:/discretamente/i.test(t)?48:/elevad/i.test(t)?320:null;def('tro',[2,10],0)}
  if(id==='ck'){out.ck=/discretamente/i.test(t)?420:/elevad/i.test(t)?2600:null;def('ck',[60,150],0)}
  if(id==='amil'){out.ami=grab(t,/amilase\s*([\d.]+)/i,num);out.lip=grab(t,/lipase\s*([\d.]+)/i,num);def('ami',[40,80],0);def('lip',[20,45],0)}
  if(id==='tsh'){out.tsh=/indetect/i.test(t)?'< 0,01':grab(t,/TSH\s*([\d,]+)/);out.t4=grab(t,/T4 livre\s*([\d,]+)/i);def('tsh',[0.9,2.8],2);def('t4',[1.0,1.4],1)}
  if(id==='dimero'){out.dd=grab(t,/\(([\d.]+)\s*ng/,num)||(/elevad/i.test(t)?1800:null);def('dd',[150,380],0)}
  if(id==='cet'){out.bhb=grab(R.cet||'',/hidroxibutirato\s*([\d,]+)/i);def('bhb',[0.1,0.3],1)}
  if(id==='glic'||id==='lact'){const k=id==='glic'?'g':'lac';if(out[k]==null)out[k]=normV(P,id,id==='glic'?[82,110]:[0.8,1.6],id==='glic'?0:1)}
  if(id==='urina'){const pi=/piúria|leucocitúria/i.test(t),ni=/nitrito positivo/i.test(t),he=/hematúria|hemácias/i.test(t);
    Object.assign(out,{dens:1.018+(pi?0.004:0),uph:6,prot:/proteinúria/i.test(t)&&!/sem proteinúria/i.test(t)?'++':'Negativo',ugli:/glicosúria/i.test(t)?'+++':'Negativo',ucet:/cetonúria\s*3\+/i.test(R.cet||'')?'+++':'Negativo',
      nit:ni?'Positivo':'Negativo',uleu:pi?(/maciça|intensa/i.test(t)?'> 50':'25'):2,uhem:/sem hematúria/i.test(t)?1:/discretas/i.test(t)?8:he?'> 30':1,bact:/bacteri/i.test(t)||ni?'Numerosas':'Raras'})}
  /* na visita, os valores andam em direção ao normal ou se afastam, conforme a evolução */
  if(c.visit){const f={1:.6,0:.15,'-1':-.2,'-2':-.35}[P.stage]||0;const L=LP[id];if(L)L.rows.forEach(([k,,,ref,d])=>{const v=out[k];if(typeof v!=='number'||!ref)return;const mid=(ref[0]+ref[1])/2;if(v>=ref[0]&&v<=ref[1])return;
    let nv=v+(mid-v)*f;out[k]=d<0?nv:Math.round(nv*Math.pow(10,d))/Math.pow(10,d)})}
  return out;
}
function refTxt(ref,d,k,F){if(!ref)return k==='bact'?'Raras':'Negativo';if(F&&k==='hb')ref=[12,16];if(!F&&k==='hb')ref=[13.5,17.5];if(F&&k==='ht')ref=[36,46];if(!F&&k==='ht')ref=[40,52];return fmtN(ref[0],d)+'–'+fmtN(ref[1],d)}
function flag(v,ref,k,F){if(typeof v==='string')return /> |HI|incoag|Positivo|\+|Numerosas/.test(v)&&!/^Negativo/.test(v)?(v.startsWith('<')?'L':'H'):v.startsWith('<')?'L':'';if(v==null||!ref)return'';
  let r=ref;if(k==='hb')r=F?[12,16]:[13.5,17.5];if(k==='ht')r=F?[36,46]:[40,52];return v<r[0]?'L':v>r[1]?'H':''}
/* data do jogo: a semana começa na data real em que foi iniciada */
function gameDate(t){
  const base=(W&&W.d0)||(G&&G.d0)||Date.now(),day0=(G&&G.mode==='visit'?1:0)+((W&&G&&G.week?W.day:1)-1);
  const m=(G&&G.t0!=null?G.t0:T0)+t,d=new Date(base+(day0+Math.floor(m/1440))*864e5);
  return pad(d.getDate())+'/'+pad(d.getMonth()+1)}
function stamp(o){return'Coleta '+gameDate(o.t0)+' '+fmt(o.t0)+' · liberado '+gameDate(o.due)+' '+fmt(o.due)+(o.urg?' · URGÊNCIA':'')}
function labTable(P,id){
  const L=LP[id],F=P.c.sexo==='F';if(!L)return'';
  if(!P.labs)P.labs={};const key=id+'@'+P.stage;if(!P.labs[id])P.labs[id]=labVals(P,id);const V=P.labs[id];
  const row=([k,n,u,ref,d])=>{const v=V[k];const f=flag(v,ref,k,F);return'<tr class="'+(f?'abn':'')+'"><td>'+n+'</td><td><b>'+fmtN(v,d)+(f?' '+(f==='H'?'↑':'↓'):'')+'</b> '+u+'</td><td>'+refTxt(ref,d,k,F)+'</td></tr>'};
  const hd='<tr><th>Exame</th><th>Resultado</th><th>Ref.</th></tr>';
  if(L.sec){const s=L.sec;let h='';for(let i=0;i<s.length;i+=3)h+='<tr><th colspan="3" class="grp">'+s[i]+'</th></tr>'+L.rows.slice(s[i+1],s[i+2]).map(row).join('');return'<table class="lab">'+hd+h+'</table>'}
  return'<table class="lab">'+hd+L.rows.filter(r=>V[r[0]]!=null).map(row).join('')+'</table>';
}
const NOTE=t=>{const m=(t||'').match(/\(([^)]+)\)/g);return m?'<p class="labn">Observação: '+esc(m.join(' ').replace(/[()]/g,''))+'</p>':''};
function resultBlock(P,k){
  const o=P.ord[k],E=EXAMS[k];
  let h='<div class="labw"><div class="labh"><b>'+(LP[k]?LP[k].n:E.n)+'</b><button class="ibtn" data-a="exinfo:'+k+'" aria-label="Referência e informações de '+esc(E.n)+'">i</button><small>'+stamp(o)+'</small></div>';
  if(UI.exInfo===k&&EXINFO[k])h+='<div class="infobox">'+EXINFO[k]+' <button class="btn paper" data-a="exinfo:">Fechar</button></div>';
  if(o.bad)return h+'<p class="warn">PROBLEMA: '+esc(o.bad)+'</p></div>';
  if(LP[k])return h+labTable(P,k)+(k==='hbrap'?'':NOTE(P.c.res[k]))+'</div>';
  return h+'<p class="laudo">'+esc(P.c.res[k]||(k==='ecg'?'Ritmo sinusal, sem alterações agudas.':k==='rx'?'Sem alterações.':k==='us'?'Sem alterações ao exame à beira-leito.':k==='tc'?'Sem alterações agudas.':'Sem alterações relevantes.'))+'</p></div>';
}
function resultsHtml(P){
  const done=Object.keys(EXAMS).filter(k=>P.ord[k]&&P.ord[k].done),pend=Object.keys(EXAMS).filter(k=>P.ord[k]&&!P.ord[k].done);
  const sub=UI.resTab||0,gaso=done.filter(k=>GASO_IONS.includes(k)),rest=done.filter(k=>!GASO_IONS.includes(k)||k==='glic'||k==='lact'||k==='cet');
  const L=sub===1?gaso:rest.sort((a,b)=>P.ord[b].due-P.ord[a].due);
  return'<h3>Resultados <span>'+done.length+' pronto'+(done.length===1?'':'s')+(pend.length?' · '+pend.length+' aguardando':'')+'</span></h3>'
   +'<div class="tabs subt"><button class="tab" data-a="restab:0" aria-selected="'+(sub===0)+'">Exames feitos</button><button class="tab" data-a="restab:1" aria-selected="'+(sub===1)+'">Gasometria e íons</button></div>'
   +(pend.length?'<p style="color:var(--ink2);font-size:17px;margin:6px 0">Aguardando: '+pend.map(k=>EXAMS[k].n+' (às '+fmt(P.ord[k].due)+')').join(' · ')+'</p>':'')
   +(L.length?L.map(k=>resultBlock(P,k)).join(''):'<p class="hint" style="padding:6px 0;color:var(--ink2)">'+(sub===1?'Nenhuma gasometria ou dosagem de íons pronta.':'Nenhum resultado disponível.')+'</p>');
}
/* referência no "i" da lista de pedidos */
(()=>{Object.keys(LP).forEach(k=>{const L=LP[k];const r=L.rows.filter(x=>x[3]).map(x=>x[1]+' '+refTxt(x[3],x[4],x[0],true)+(x[2]?' '+x[2]:'')).join('; ');
  if(r&&EXINFO[k]!=null&&!/Referência:/.test(EXINFO[k]))EXINFO[k]+=' <br><b>Referência:</b> '+r+(L.rows.some(x=>x[0]==='hb'||x[0]==='ht')?' (Hb e Ht: valores femininos; masculino Hb 13,5 a 17,5 e Ht 40 a 52)':'')+'.';
  else if(r&&EXINFO[k]==null)EXINFO[k]='<b>Referência:</b> '+r+'.'})})();
