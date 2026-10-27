/* ===== PIXEL ART: cada paciente é desenhado em 160x120 e ampliado sem suavização ===== */
const SKIN=['#f1cfa8','#e2b085','#cb915f','#a9693f','#85502f','#5f3a22'];
const sh=(h,k)=>{const n=parseInt(h.slice(1),16),f=x=>Math.max(0,Math.min(255,Math.round(x*k)));return'#'+[n>>16,(n>>8)&255,n&255].map(x=>f(x).toString(16).padStart(2,'0')).join('')};
const mixc=(a,b,t)=>{const x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16),m=(s)=>Math.round(((x>>s)&255)*(1-t)+((y>>s)&255)*t);return'#'+[16,8,0].map(s=>m(s).toString(16).padStart(2,'0')).join('')};
function hashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulb(a){return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296}}
/* aparência fixa por paciente: o que o caso define vale; o resto sai do id (permite gerar pacientes novos depois) */
function mkLook(c){
  const r=mulb(hashS(c.id)),L=c.look||{},fem=c.sexo==='F',old=c.idade>=62;
  const hairs=['#1a1410','#2b2018','#47301f','#6a4a2a','#8b6a38'];
  return{skin:L.skin!=null?L.skin:Math.floor(r()*6),hair:L.hair||(old?'#d8d6d0':hairs[Math.floor(r()*5)]),hs:L.hs||(fem?'long':'short'),
    beard:L.beard||'none',glasses:!!L.glasses,cloth:L.cloth||'#4a6a8a',age:c.idade,fem};
}
function paint(X,L,s){
  const R=(x,y,w,h,c)=>{X.fillStyle=c;X.fillRect(x,y,w,h)};
  X.imageSmoothingEnabled=false;
  /* parede, rodapé azulejado, janela com persiana, luminária e suporte de soro */
  R(0,0,160,120,'#7f9886');R(0,72,160,48,'#5e776a');R(0,70,160,3,'#a8bcae');
  for(let x=0;x<160;x+=16)R(x,73,1,47,'#4d6559');for(let y=84;y<120;y+=12)R(0,y,160,1,'#4d6559');
  R(8,10,42,38,'#2b3a36');R(10,12,38,34,'#a8cfe4');for(let y=14;y<46;y+=4)R(10,y,38,1,'#86b2c8');R(28,12,2,34,'#2b3a36');R(8,48,42,3,'#a8bcae');
  R(66,0,28,3,'#e8e4c0');R(72,3,16,1,'#c9c59a');
  R(131,26,2,78,'#b9c2c6');R(124,24,16,2,'#b9c2c6');R(125,27,12,16,'#cfe6f0');R(127,30,8,9,'#8fbfd6');R(131,43,1,24,'#d8e8ee');
  const dy=s.br?1:0,jit=s.sh&&Math.random()<.5?1:0,ox=jit,hy=s.ex==='d'?dy:0;
  const sk0=SKIN[L.skin],sk=s.pale?mixc(sk0,'#d3cab8',.5):sk0,sd=sh(sk,.78),sl=sh(sk,1.08);
  const cl=L.cloth,cd=sh(cl,.72),cc=sh(cl,1.3),hc=L.hair,hd=sh(hc,.72),brow=sh(hc,.62);
  const lip=s.cy?'#5f4a7a':sh(sk0,.62);
  /* cabelo de trás */
  if(L.hs==='long')R(62+ox,28+hy,36,48,hc);
  if(L.hs==='bun'){R(73+ox,17+hy,14,10,hc);R(75+ox,16+hy,10,2,hd)}
  /* tronco */
  for(let y=66;y<110;y++){const w=Math.min(64,30+(y-66)*3);R(80-w/2+ox,y+dy,w,1,cl)}
  R(100+ox,76+dy,14,34,cd);R(46+ox,76+dy,6,34,cd);
  R(74+ox,58+hy,12,10,sh(sk,.9));
  for(let i=0;i<8;i++)R(74+i+ox,66+i+dy,12-2*i,1,sk);
  R(68+ox,66+dy,6,3,cc);R(86+ox,66+dy,6,3,cc);
  /* mão sobre o peito ou abdome quando há dor */
  if(s.hand==='chest'){R(76+ox,82+dy,18,8,sk);R(76+ox,82+dy,18,1,sl);for(let i=0;i<4;i++)R(77+i*4+ox,90+dy,1,3,sd)}
  if(s.hand==='abd'){R(72+ox,98+dy,18,8,sk);R(72+ox,98+dy,18,1,sl)}
  /* cabeça */
  R(65+ox,42+hy,2,8,sk);R(93+ox,42+hy,2,8,sk);R(65+ox,45+hy,1,3,sd);R(94+ox,45+hy,1,3,sd);
  R(68+ox,30+hy,24,30,sk);R(67+ox,33+hy,26,24,sk);R(70+ox,60+hy,20,2,sk);R(73+ox,62+hy,14,1,sd);R(86+ox,36+hy,6,22,sh(sk,.93));
  /* cabelo da frente */
  const hs=L.hs;
  if(hs==='short'||hs==='bun'){R(67+ox,27+hy,26,8,hc);R(66+ox,31+hy,3,10,hc);R(91+ox,31+hy,3,10,hc);R(69+ox,34+hy,22,2,hc);R(68+ox,27+hy,24,1,hd)}
  if(hs==='long'){R(67+ox,27+hy,26,8,hc);R(66+ox,31+hy,3,18,hc);R(91+ox,31+hy,3,18,hc);R(69+ox,34+hy,10,3,hc);R(79+ox,34+hy,12,2,hc)}
  if(hs==='buzz'){R(67+ox,28+hy,26,5,hd);R(66+ox,31+hy,2,6,hd);R(92+ox,31+hy,2,6,hd)}
  if(hs==='curly'){for(let x=64;x<96;x+=4){R(x+ox,24+hy+((x/4)%2)*2,4,6,hc)}R(65+ox,30+hy,30,5,hc);R(65+ox,34+hy,3,8,hc);R(92+ox,34+hy,3,8,hc)}
  if(hs==='bald'){R(72+ox,31+hy,16,2,sl);R(66+ox,37+hy,2,8,hc);R(92+ox,37+hy,2,8,hc)}
  if(hs==='hat'){R(66+ox,31+hy,3,10,hd);R(91+ox,31+hy,3,10,hd);R(56+ox,29+hy,48,4,'#b99a5a');R(56+ox,32+hy,48,1,'#7a5f32');R(64+ox,17+hy,32,13,'#cdb070');R(64+ox,26+hy,32,3,'#6b4a2c');for(let x=66;x<94;x+=4)R(x+ox,19+hy,1,6,'#b99a5a')}
  /* rugas */
  if(L.age>=45){R(72+ox,37+hy,16,1,sd);R(73+ox,39+hy,14,1,sh(sk,.86))}
  if(L.age>=60){R(72+ox,50+hy,1,6,sd);R(87+ox,50+hy,1,6,sd);R(70+ox,44+hy,2,1,sd);R(88+ox,44+hy,2,1,sd)}
  /* olhos */
  const closed=s.bl,half=s.ex==='s';
  R(72+ox,44+hy,6,3,'#f3f0e6');R(82+ox,44+hy,6,3,'#f3f0e6');R(74+ox,44+hy,2,3,'#241a14');R(84+ox,44+hy,2,3,'#241a14');
  if(closed){R(72+ox,43+hy,6,4,sk);R(82+ox,43+hy,6,4,sk);R(72+ox,46+hy,6,1,sd);R(82+ox,46+hy,6,1,sd)}
  else if(half){R(72+ox,43+hy,6,2,sk);R(82+ox,43+hy,6,2,sk);R(72+ox,45+hy,6,1,sd);R(82+ox,45+hy,6,1,sd)}
  R(72+ox,47+hy,6,1,sh(sk,.88));R(82+ox,47+hy,6,1,sh(sk,.88));
  /* sobrancelhas por expressão */
  if(s.ex==='p'||s.ex==='d'){R(72+ox,40+hy,2,1,brow);R(74+ox,41+hy,2,1,brow);R(76+ox,42+hy,2,1,brow);R(86+ox,40+hy,2,1,brow);R(84+ox,41+hy,2,1,brow);R(82+ox,42+hy,2,1,brow)}
  else if(s.ex==='a'){R(72+ox,42+hy,2,1,brow);R(74+ox,41+hy,2,1,brow);R(76+ox,40+hy,2,1,brow);R(86+ox,42+hy,2,1,brow);R(84+ox,41+hy,2,1,brow);R(82+ox,40+hy,2,1,brow)}
  else{R(72+ox,41+hy,6,1,brow);R(82+ox,41+hy,6,1,brow)}
  /* óculos */
  if(L.glasses){const g='#20242a';R(70+ox,42+hy,10,1,g);R(70+ox,49+hy,10,1,g);R(70+ox,42+hy,1,8,g);R(79+ox,42+hy,1,8,g);R(80+ox,45+hy,2,1,g);R(82+ox,42+hy,10,1,g);R(82+ox,49+hy,10,1,g);R(82+ox,42+hy,1,8,g);R(91+ox,42+hy,1,8,g);R(71+ox,43+hy,2,1,'rgba(255,255,255,.35)');R(83+ox,43+hy,2,1,'rgba(255,255,255,.35)')}
  /* nariz */
  R(79+ox,46+hy,2,6,sd);R(77+ox,52+hy,6,1,sd);if(s.ex==='d'){R(76+ox,51+hy,1,1,sd);R(83+ox,51+hy,1,1,sd)}
  /* barba, bigode, boca */
  if(L.beard==='full'){R(68+ox,50+hy,24,10,hc);R(70+ox,60+hy,20,2,hc);R(68+ox,50+hy,24,1,hd)}
  if(L.beard==='stubble'){R(69+ox,51+hy,22,9,'rgba(20,12,8,.22)')}
  if(L.beard==='mustache')R(73+ox,53+hy,14,2,hc);
  const my=L.beard==='full'?56:55;
  if(s.ex==='p'){R(75+ox,my-1+hy,10,3,'#4a1c1c');R(76+ox,my-1+hy,8,1,'#eee')}
  else if(s.ex==='d'){R(76+ox,my-1+hy,8,5,'#3c1616');R(77+ox,my-1+hy,6,1,'#eee')}
  else if(s.ex==='s'){R(76+ox,my+1+hy,8,1,lip)}
  else if(s.ex==='a'){R(75+ox,my+hy,10,1,lip);R(76+ox,my+1+hy,8,1,sh(lip,1.2))}
  else{R(75+ox,my+hy,10,1,lip)}
  if(s.cy&&L.beard!=='full'){R(75+ox,my+hy,10,1,'#5f4a7a')}
  /* brinco */
  if(L.fem&&L.age<70)R(65+ox,50+hy,2,2,'#e6c75a');
  /* suor */
  if(s.sweat){const t=(s.t||0)/300|0;R(70+ox,34+hy+(t%3),1,2,'#d6ecf4');R(89+ox,33+hy+((t+1)%3),1,2,'#d6ecf4');R(77+ox,29+hy+((t+2)%3),1,2,'#d6ecf4');R(90+ox,46+hy,1,2,'#d6ecf4')}
  /* mesa do médico em primeiro plano */
  R(0,108,160,12,'#5a4430');R(0,108,160,2,'#7a6040');R(0,118,160,2,'#3a2c1e');
  R(12,98,26,18,'#8a6b45');R(14,100,22,14,'#ddd5b6');R(20,97,10,4,'#9a9a98');for(let y=103;y<113;y+=3)R(16,y,18,1,'#a29a7a');
  /* linhas de varredura */
  for(let y=0;y<120;y+=2)R(0,y,160,1,'rgba(0,0,0,.07)');
}
/* estado visual do paciente (vem da condição real, não só dos sinais vitais já medidos) */
function animState(P,ts){
  const c=P.c,stg=P.stage,fr=(c.vit[stg]||c.vit[0])[2],per=60000/Math.max(8,fr);
  const worse=stg<0;
  return{br:Math.sin(ts/per*2*Math.PI)>0,bl:(ts%3600)<140,
    ex:stg>0?'n':worse?(c.ex0==='d'?'d':c.ex0==='n'?'s':(stg<=-2?'s':c.ex0)):c.ex0,
    pale:worse||(c.pale0&&stg<1),sweat:(c.sw&&stg<1)||stg<=-1,cy:c.cy&&stg<=-1,sh:stg<=-1&&(c.ex0==='d'||c.ex0==='p'),
    hand:stg<1?c.hand:null,t:ts};
}
function sprite(P){
  const off=document.createElement('canvas');off.width=160;off.height=120;
  const X=off.getContext('2d');if(X)paint(X,P.look,animState(P,0));
  return off;
}
