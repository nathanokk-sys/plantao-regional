/* ===== TRILHA SONORA (chiptune em Web Audio, sem arquivos) =====
 Cada faixa é uma música com seções (introdução, tema, variação com melodia, ponte, retorno e final) e dura de 3:30 a 4:00.
 No modo automático: "Corredor Vazio" sem paciente na mesa; faixas neutras se revezam com paciente na mesa;
 "Sala Vermelha" só quando o paciente está na sala vermelha; "Passagem de Plantão" no relatório. A trilha nunca revela gravidade escondida. */
const MUS={on:true,next:0,bus:null,noise:null,sel:'auto',cur:null,pos:{},calmIdx:0};
try{MUS.sel=localStorage.getItem('pr_trk')||'auto'}catch(e){}
const hz=n=>440*Math.pow(2,(n-69)/12);
const CH={Am:[0,3,7],A:[0,4,7],F:[-4,0,3],C:[3,7,10],G:[-2,2,5],E:[-5,-1,2],Em:[-5,-2,2],Dm:[5,8,12],D:[5,9,12],Bb:[1,5,8],Eb:[6,10,13],Fm7:[-4,-1,3],Gm:[-2,1,5],Bm:[2,5,9]};
const _=null;
const pat=m=>{const a=Array(16).fill(_);Object.keys(m).forEach(k=>a[+k]=m[k]);return a};
const MINOR=[0,2,3,5,7,8,10],MAJOR=[0,2,4,5,7,9,11],MIXO=[0,2,4,5,7,9,10];
const TRACKS=[
 {id:'corredor',name:'Corredor Vazio',mood:'idle',bpm:58,scale:MINOR,
  base:{pad:.02,padType:'sine',bass:pat({0:0}),bl:16,bassVol:.045,bassType:'sine',hum:.016,bell:.2},
  sec:{I:{p:['Am','Fm7','Am','Fm7'],bass:_,bell:0},A:{p:['Am','Fm7','Am','F']},B:{p:['Dm','Am','Bb','Am'],bell:.3},K:{p:['F','Fm7','C','Am'],bass:_,pad:.026},O:{p:['Am','Am','Fm7','Am'],bass:_,bell:0,pad:.014}},
  form:['A','B','A','K','B','A']},
 {id:'madrugada',name:'Plantão de Madrugada',mood:'calm',bpm:76,scale:MINOR,motif:[[0,3],[4,2],[6,2],[8,6],[14,2]],
  base:{pad:.012,padType:'sine',bass:pat({0:0,8:0}),bl:6,bassVol:.045,bassType:'sine',arp:pat({0:0,4:2,8:1,12:2}),arpOct:24,arpType:'triangle',arpVol:.016,leadType:'triangle',leadVol:.02,leadOct:36},
  sec:{I:{p:['Am','Am','F','F'],arp:_},A:{p:['Am','Am','F','F']},A2:{p:['Am','Am','F','F'],lead:1},B:{p:['C','G','Am','Am'],lead:1,hat:[4,12]},K:{p:['F','G','Em','Am'],arp:_,lead:1,leadType:'sine'},O:{p:['Am','F','Am','Am'],arp:pat({0:0,8:2})}},
  form:['A','A2','B','K','A2','B']},
 {id:'vale',name:'Vale do São Francisco',mood:'calm',bpm:70,scale:MINOR,motif:[[0,2],[2,2],[4,4],[10,2],[12,4]],
  base:{pad:.01,padType:'triangle',bass:pat({0:0,8:0,12:12}),bl:4,bassVol:.04,bassType:'square',arp:pat({0:0,2:1,4:2,6:1,8:0,10:1,12:2,14:1}),arpOct:24,arpType:'sine',arpVol:.018,hat:[4,12],leadType:'sine',leadVol:.022,leadOct:36},
  sec:{I:{p:['Dm','C','Bb','Am'],arp:_,hat:_},A:{p:['Dm','C','Bb','Am']},A2:{p:['Dm','C','Bb','Am'],lead:1},B:{p:['F','C','Gm','Am'],lead:1},K:{p:['Bb','Bb','Am','Am'],arp:_,hat:_,lead:1,pad:.016},O:{p:['Dm','C','Bb','Am'],hat:_}},
  form:['A','A2','B','A2','K','B']},
 {id:'baiao',name:'Baião da Triagem',mood:'calm',bpm:88,scale:MIXO,motif:[[0,2],[3,2],[6,2],[8,1],[10,2],[13,3]],
  base:{bass:pat({0:0,6:0,10:0}),bl:2,bassVol:.05,bassType:'triangle',arp:pat({0:0,3:1,6:2,8:0,11:1,13:2}),arpOct:24,arpType:'triangle',arpVol:.017,hat:[2,6,10,14],kick:[0,10],kickVol:.1,leadType:'square',leadVol:.012,leadOct:36},
  sec:{I:{p:['G','G','C','G'],arp:_,kick:_},A:{p:['G','F','G','C']},A2:{p:['G','F','G','C'],lead:1},B:{p:['C','Bb','F','G'],lead:1},K:{p:['F','F','G','G'],arp:_,hat:[4,12],lead:1,leadType:'triangle',leadVol:.02},O:{p:['G','F','G','G'],kick:[0]}},
  form:['A','A2','B','A2','K','B']},
 {id:'prontuario',name:'Prontuário em Branco',mood:'calm',bpm:64,scale:MAJOR,motif:[[0,4],[4,4],[8,6],[14,2]],
  base:{pad:.016,padType:'sine',bass:pat({0:0}),bl:12,bassVol:.045,bassType:'sine',arp:pat({0:2,6:1,12:0}),arpOct:36,arpType:'sine',arpVol:.014,bell:.12,leadType:'triangle',leadVol:.018,leadOct:24},
  sec:{I:{p:['C','Em','Am','F'],arp:_},A:{p:['C','Em','Am','F']},A2:{p:['C','Em','Am','F'],lead:1},B:{p:['Dm','G','C','Am'],lead:1},K:{p:['F','G','Am','Am'],arp:_,lead:1,pad:.02},O:{p:['C','Em','F','C']}},
  form:['A','A2','B','K','A2','B']},
 {id:'vermelha',name:'Sala Vermelha',mood:'tense',bpm:112,scale:MINOR,motif:[[0,2],[2,2],[4,4],[8,2],[10,2],[12,4]],
  base:{bass:pat({0:0,2:0,4:0,6:12,8:0,10:0,12:0,14:12}),bl:1.5,bassVol:.06,bassType:'square',arp:[0,1,2,1,0,1,2,1,0,1,2,1,0,1,2,1],arpOct:24,arpType:'square',arpVol:.012,hat:[2,6,10,14],kick:[0,8],kickVol:.22,leadType:'sawtooth',leadVol:.01,leadOct:36},
  sec:{I:{p:['Am','Am','Am','Am'],arp:_},A:{p:['Am','Am','F','E']},A2:{p:['Am','Am','F','E'],lead:1},B:{p:['Dm','Dm','E','E'],lead:1},K:{p:['F','F','E','E'],arp:_,kick:[0,4,8,12]},O:{p:['Am','F','E','Am']}},
  form:['A','A2','B','K','A2','B']},
 {id:'passagem',name:'Passagem de Plantão',mood:'end',bpm:68,scale:MAJOR,motif:[[0,4],[4,2],[6,2],[8,8]],
  base:{pad:.02,padType:'sine',bass:pat({0:0,8:0}),bl:7,bassVol:.05,bassType:'sine',arp:pat({0:0,3:1,6:2,9:1,12:0}),arpOct:24,arpType:'triangle',arpVol:.02,bell:.1,leadType:'triangle',leadVol:.02,leadOct:36},
  sec:{I:{p:['C','G','Am','F'],arp:_},A:{p:['C','G','Am','F']},A2:{p:['C','G','Am','F'],lead:1},B:{p:['F','G','C','C'],lead:1},K:{p:['Am','F','G','G'],arp:_,lead:1},O:{p:['F','G','C','C']}},
  form:['A','A2','B','K','A2','B']},
 {id:'codigo',name:'Código Azul',mood:'manual',bpm:138,scale:MINOR,motif:[[0,2],[4,2],[8,2],[12,4]],
  base:{bass:Array(16).fill(0),bl:.8,bassVol:.05,bassType:'sawtooth',arp:pat({0:2,2:1,4:0,6:1,8:2,10:1,12:0,14:1}),arpOct:36,arpType:'square',arpVol:.014,hat:[1,3,5,7,9,11,13,15],kick:[0,2,8,10],kickVol:.26,alarm:1,leadType:'square',leadVol:.01,leadOct:36},
  sec:{I:{p:['Am','Am','Bb','Bb'],arp:_},A:{p:['Am','Bb','Am','Eb']},A2:{p:['Am','Bb','Am','Eb'],lead:1},B:{p:['Dm','Eb','E','E'],lead:1},K:{p:['Am','Am','Bb','Bb'],arp:_,hat:[2,6,10,14]},O:{p:['Am','Bb','E','Am']}},
  form:['A','A2','B','K','A2','B']}
];
const MOODLBL={idle:'sem paciente',calm:'neutra',tense:'sala vermelha',end:'relatório',manual:'só manual'};
/* monta a música: introdução + seções em ciclo até 3:30, sem passar de 4:00, + final */
function buildTrack(T){
  const barS=240/T.bpm,arr=[];
  const push=(k,reps,v)=>{const S=Object.assign({},T.base,T.sec[k]);for(let r=0;r<reps;r++)S.p.forEach((ch,bi)=>arr.push({ch,S,k,v,bi:bi+r*S.p.length}))};
  push('I',1,0);let i=0;
  while((arr.length+4)*barS<210&&i<80){const k=T.form[i%T.form.length],n=T.sec[k].p.length,reps=(arr.length+2*n+4)*barS<=240?2:1;push(k,reps,Math.floor(i/T.form.length));i++}
  push('O',1,0);return arr;
}
TRACKS.forEach(T=>{T._arr=buildTrack(T);T._dur=T._arr.length*240/T.bpm});
/* melodia: frases de 4 compassos que se repetem quando a seção volta, com variação no retorno e cadência no fim da frase */
function leadNotes(T,d){
  const ch=CH[d.ch],sc=T.scale,r=mulb(hashS(T.id+d.k+(d.bi%4)+(d.v%2?'b':'a')));
  const out=(T.motif||[[0,4],[8,4]]).map(([p,l],j,M)=>{let n;
    if(j===0||r()<.55)n=ch[Math.floor(r()*ch.length)];else{n=ch[0]+sc[Math.floor(r()*sc.length)];if(n>ch[0]+12)n-=12}
    if(d.bi%4===3&&j===M.length-1){n=ch[0];l+=2}return[p,l,n,r()]});
  return out.filter(x=>x[3]>.15);
}
function moodNow(){
  if(!G)return'idle';if(G.over)return'end';
  const P=cur();if(!P)return'idle';
  return P.st==='emg'?'tense':'calm';
}
function wantTrack(){
  if(MUS.sel!=='auto'&&TRACKS.some(t=>t.id===MUS.sel))return MUS.sel;
  const m=moodNow();
  if(m==='calm'){const L=TRACKS.filter(t=>t.mood==='calm');return L[MUS.calmIdx%L.length].id}
  return TRACKS.find(t=>t.mood===m).id;
}
function startTrack(id){
  if(MUS.cur)MUS.pos[MUS.cur.T.id]=MUS.cur.bar;
  const T=TRACKS.find(t=>t.id===id);
  MUS.cur={T,arr:T._arr,bar:MUS.pos[id]||0,s:0,lead:[]};
}
function musSelect(v){
  MUS.sel=v;try{localStorage.setItem('pr_trk',v)}catch(e){}
  if(v!=='auto')delete MUS.pos[v];
  if(MUS.cur)startTrack(wantTrack());
}
function mv(f,t,d,type,vol,att){
  try{const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+(att||.008));g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(MUS.bus);o.start(t);o.stop(t+d+.05)}catch(e){}
}
function mnoise(t,d,vol,freq,type){
  try{if(!MUS.noise){const n=AC.sampleRate,b=AC.createBuffer(1,n,n),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=Math.random()*2-1;MUS.noise=b}
    const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=MUS.noise;s.loop=d>1;f.type=type||'highpass';f.frequency.value=freq;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(MUS.bus);s.start(t);s.stop(t+d+.05)}catch(e){}
}
function playStep(t){
  const C=MUS.cur,T=C.T,d=C.arr[C.bar],S=d.S,s=C.s,sp=60/T.bpm/4,ch=CH[d.ch],root=45;
  if(s===0&&S.pad)ch.forEach(n=>mv(hz(root+12+n),t,sp*16*1.05,S.padType||'sine',S.pad,sp*4));
  if(s===0&&S.hum)mnoise(t,sp*16,S.hum,320,'lowpass');
  if(S.bass&&S.bass[s]!=null)mv(hz(root+ch[0]+S.bass[s]),t,sp*(S.bl||2),S.bassType||'sine',S.bassVol||.05);
  if(S.arp&&S.arp[s]!=null)mv(hz(root+(S.arpOct||24)+ch[S.arp[s]%ch.length]),t,sp*1.6,S.arpType||'triangle',S.arpVol||.02);
  if(S.lead){if(s===0)C.lead=leadNotes(T,d);C.lead.forEach(([p,l,n])=>{if(p===s)mv(hz(root+(S.leadOct||36)+n),t,sp*l*.95,S.leadType||'triangle',S.leadVol||.02,.01)})}
  if(S.hat&&S.hat.includes(s))mnoise(t,.04,.03,7000);
  if(S.kick&&S.kick.includes(s)){try{const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(S.kickVol||.15,t);g.gain.exponentialRampToValueAtTime(.0001,t+.16);o.connect(g);g.connect(MUS.bus);o.start(t);o.stop(t+.2)}catch(e){}}
  if(S.bell&&s===8&&Math.random()<S.bell*4)mv(hz(root+36+ch[Math.floor(Math.random()*ch.length)]),t,2.4,'sine',.03,.005);
  if(S.alarm&&s===0&&C.bar%2===0)mv(hz(root+54),t,sp*2,'square',.012);
}
function musTick(){
  if(!AC||!UI.snd||!MUS.on||AC.state!=='running')return;
  if(!MUS.bus){MUS.bus=AC.createGain();MUS.bus.gain.value=.55;MUS.bus.connect(AC.destination)}
  if(!MUS.cur)startTrack(wantTrack());
  const now=AC.currentTime;if(MUS.next<now-.25)MUS.next=now+.05;
  while(MUS.next<now+.15){
    if(MUS.cur.s===0){const w=wantTrack();if(w!==MUS.cur.T.id)startTrack(w)}
    playStep(MUS.next);
    const C=MUS.cur;MUS.next+=60/C.T.bpm/4;C.s++;
    if(C.s>=16){C.s=0;C.bar++;if(C.bar>=C.arr.length){C.bar=0;
      if(MUS.sel==='auto'&&C.T.mood==='calm'){MUS.calmIdx++;delete MUS.pos[C.T.id];MUS.pos[C.T.id]=0}}}
  }
}
const mmss=x=>Math.floor(x/60)+':'+String(Math.floor(x%60)).padStart(2,'0');
function npText(){
  if(!MUS.on||!UI.snd)return'Música pausada';
  const C=MUS.cur;if(!C)return'Clique em qualquer lugar para tocar';
  const el=(C.bar+C.s/16)*240/C.T.bpm;return C.T.name+' · '+mmss(el)+' / '+mmss(C.T._dur);
}
function trackSelectHtml(){
  return'<option value="auto"'+(MUS.sel==='auto'?' selected':'')+'>Automática (conforme o plantão)</option>'
    +TRACKS.map(t=>'<option value="'+t.id+'"'+(MUS.sel===t.id?' selected':'')+'>'+t.name+' ('+MOODLBL[t.mood]+', '+mmss(t._dur)+')</option>').join('');
}
setInterval(musTick,30);
setInterval(()=>{const e=document.getElementById('np');if(e)e.textContent=npText()},1000);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&MUS.bus){MUS.next=0}});
