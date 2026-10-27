/* ===== TRILHA SONORA ADAPTATIVA (chiptune em Web Audio, sem arquivos) =====
 idle: ninguém em atendimento, ambiente quase parado (pad longo, zumbido de ar-condicionado, sino esparso)
 calm: neutra, com qualquer paciente na mesa · tense: paciente na sala vermelha · end: passagem de plantão */
const MUS={on:true,step:0,next:0,mood:'idle',bus:null,noise:null,tr:{},bars:0};
function trk(){const m=MOODS[MUS.mood];return Array.isArray(m)?m[(MUS.tr[MUS.mood]||0)%m.length]:m}
const hz=n=>440*Math.pow(2,(n-69)/12);
/* acordes em semitons a partir de Lá (A) */
const CH={Am:[0,3,7],F:[-4,0,3],C:[3,7,10],G:[-2,2,5],E:[-5,-1,2],Dm:[5,8,12],Bb:[1,5,8],Eb:[6,10,13],Fm7:[-4,-1,3],Em:[-5,-2,2]};
const _=null;
const MOODS={
 idle:{bpm:58,prog:['Am','Fm7','Am','F'],pad:.022,padType:'sine',bass:[0,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],bl:16,bassVol:.05,bassType:'sine',
   arp:[],bell:.18,hum:.018},
 calm:[
  {bpm:76,prog:['Am','Am','F','F'],pad:.014,padType:'sine',bass:[0,_,_,_,_,_,_,_,0,_,_,_,_,_,_,_],bl:6,bassVol:.05,bassType:'sine',arp:[0,_,_,_,2,_,_,_,1,_,_,_,2,_,_,_],arpOct:24,arpType:'triangle',arpVol:.018},
  {bpm:70,prog:['Dm','C','Bb','Am'],pad:.01,padType:'triangle',bass:[0,_,_,_,_,_,_,_,0,_,_,_,12,_,_,_],bl:4,bassVol:.04,bassType:'square',arp:[0,_,1,_,2,_,1,_,0,_,1,_,2,_,1,_],arpOct:24,arpType:'sine',arpVol:.02,hat:[4,12]},
  {bpm:88,prog:['G','F','G','C'],bass:[0,_,_,_,_,_,0,_,_,_,0,_,_,_,_,_],bl:2,bassVol:.05,bassType:'triangle',arp:[0,_,_,1,_,_,2,_,0,_,_,1,_,2,_,_],arpOct:24,arpType:'triangle',arpVol:.02,hat:[2,6,10,14],kick:[0,10],kickVol:.1},
  {bpm:64,prog:['C','Em','Am','F'],pad:.016,padType:'sine',bass:[0,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],bl:12,bassVol:.05,bassType:'sine',arp:[2,_,_,_,_,_,1,_,_,_,_,_,0,_,_,_],arpOct:36,arpType:'sine',arpVol:.016,bell:.12}],
 tense:{bpm:112,prog:['Am','Am','F','E'],bass:[0,_,0,_,0,_,12,_,0,_,0,_,0,_,12,_],bl:1.5,bassVol:.07,bassType:'square',
   arp:[0,1,2,1,0,1,2,1,0,1,2,1,0,1,2,1],arpOct:24,arpType:'square',arpVol:.014,hat:[2,6,10,14],kick:[0,8],kickVol:.25},
 crit:{bpm:138,prog:['Am','Bb','Am','Eb'],bass:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],bl:.8,bassVol:.06,bassType:'sawtooth',
   arp:[2,_,1,_,0,_,1,_,2,_,1,_,0,_,1,_],arpOct:36,arpType:'square',arpVol:.016,hat:[1,3,5,7,9,11,13,15],kick:[0,2,8,10],kickVol:.3,alarm:1},
 end:{bpm:68,prog:['C','G','Am','F'],pad:.02,padType:'sine',bass:[0,_,_,_,_,_,_,_,0,_,_,_,_,_,_,_],bl:7,bassVol:.06,bassType:'sine',
   arp:[0,_,_,1,_,_,2,_,_,1,_,_,0,_,_,_],arpOct:24,arpType:'triangle',arpVol:.025,bell:.1}
};
/* a trilha não revela a gravidade escondida: neutra com qualquer paciente na mesa;
   tensa só quando o médico coloca o paciente na sala vermelha (decisão já visível para o jogador) */
function moodNow(){
  if(!G)return'idle';if(G.over)return'end';
  const P=cur();if(!P)return'idle';
  return P.st==='emg'?'tense':'calm';
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
function playStep(step,t){
  const s=step%16;
  /* troca de clima no início do compasso; piora grave entra já na próxima batida */
  const want=moodNow();
  if(s===0){MUS.bars++;if(want!==MUS.mood){MUS.mood=want;MUS.bars=0;MUS.tr[want]=(MUS.tr[want]||0)+1}else if(Array.isArray(MOODS[want])&&MUS.bars>=16){MUS.bars=0;MUS.tr[want]=(MUS.tr[want]||0)+1}}
  const M=trk(),sp=60/M.bpm/4,bar=Math.floor(step/16),ch=CH[M.prog[bar%M.prog.length]],root=45;
  if(s===0&&M.pad)ch.forEach(n=>mv(hz(root+12+n),t,sp*16*1.05,M.padType,M.pad,sp*4));
  if(s===0&&M.hum)mnoise(t,sp*16,M.hum,320,'lowpass');
  const b=M.bass[s];if(b!=null)mv(hz(root+ch[0]+b),t,sp*M.bl,M.bassType,M.bassVol);
  const a=M.arp[s];if(a!=null&&a!==undefined)mv(hz(root+M.arpOct+ch[a]),t,sp*1.6,M.arpType,M.arpVol);
  if(M.hat&&M.hat.includes(s))mnoise(t,.04,.035,7000);
  if(M.kick&&M.kick.includes(s)){try{const o=AC.createOscillator(),g=AC.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(M.kickVol,t);g.gain.exponentialRampToValueAtTime(.0001,t+.16);o.connect(g);g.connect(MUS.bus);o.start(t);o.stop(t+.2)}catch(e){}}
  if(M.bell&&s===8&&Math.random()<M.bell*4)mv(hz(root+36+ch[Math.floor(Math.random()*3)]),t,2.4,'sine',.03,.005);
  if(M.alarm&&s===0&&bar%2===0)mv(hz(root+48+6),t,sp*2,'square',.012);
}
function musTick(){
  if(!AC||!UI.snd||!MUS.on||AC.state!=='running')return;
  if(!MUS.bus){MUS.bus=AC.createGain();MUS.bus.gain.value=.55;MUS.bus.connect(AC.destination)}
  const now=AC.currentTime;if(MUS.next<now-.25)MUS.next=now+.05;
  while(MUS.next<now+.15){playStep(MUS.step,MUS.next);MUS.next+=60/trk().bpm/4;MUS.step++}
}
setInterval(musTick,30);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&MUS.bus){MUS.next=0}});
