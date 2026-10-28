/* ===== v2: interface no estilo de prontuário eletrônico (telas, guias e formulários) ===== */
const UI={scr:'pac',tab:'leito',sub:{},F:{drug:'',dose:0,via:0,freq:'',dur:''},destSel:null,msg:'',err:0,snd:true,sec:'todos',q:'',rxq:'',dxq:'',solq:'',
  par:{id:'',txt:''},com:{para:'',pid:'',nome:0,cps:0,leito:0,paste:0},atb:{drug:'',ind:'',sit:''},tx:{id:'hemac',dose:0,ind:'',urg:0},doc:{type:'rec',items:[],dias:'',dest:''},ri:{drug:'',dose:0,via:0,freq:'',dur:''},wkDif:'m',pop:null};
let AC=null;
function tn(f,d,ty,v,w,sl){if(!UI.snd||!AC)return;try{const t=AC.currentTime+(w||0),o=AC.createOscillator(),g=AC.createGain();o.type=ty||'square';o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(sl,t+d);g.gain.setValueAtTime(v||.04,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
window.sfx=k=>{if(!UI.snd||!AC)return;
  if(k==='click')tn(1300,.03,'square',.02);if(k==='blip')tn(700,.07,'square',.03);if(k==='alarm'){[0,.18,.36].forEach(w=>tn(980,.1,'square',.04,w))}
  if(k==='stamp')tn(120,.18,'sine',.25,0,50);if(k==='good'){tn(660,.12,'triangle',.06);tn(990,.2,'triangle',.06,.12)}if(k==='mid')tn(520,.25,'triangle',.06);
  if(k==='bad'){tn(330,.25,'sawtooth',.04,0,200);tn(200,.4,'sawtooth',.04,.2,120)}if(k==='flat')tn(900,1.4,'sine',.05);if(k==='bell'){[0,.5,1].forEach(w=>tn(880,1,'sine',.06,w))}};
const trLbl=t=>({VERMELHO:'Vermelho',LARANJA:'Laranja',AMARELO:'Amarelo',VERDE:'Verde',AZUL:'Azul'})[t];
const vAbn=(i,x)=>i===0?(+String(x).split('/')[0]>=180||+String(x).split('/')[0]<=95):i===1?(x>=110||x<=55):i===2?(x>=24||x<=10):i===3?x<=92:(x>=38||x<=35.5);
function dayIdx(){return W&&G&&G.week?(G.mode==='visit'?W.day+1:W.day):1}
const ABX=new Set([...(CATS.find(c=>c[0]==='Antibióticos')||[0,[]])[1],...(CATS.find(c=>/Antivirais/.test(c[0]))||[0,[]])[1]]);
const msgHtml=()=>UI.msg?'<p class="msg'+(UI.err?' err':'')+'">'+esc(UI.msg)+'</p>':'';
const tm=m=>m>=1?'('+(m%1?String(m).replace('.',','):m)+' min)':'('+Math.round(m*60)+' s)';
/* ---------- setor, leito e estado ---------- */
const SECS_PS=[['todos','Todos'],['fila','Aguardando'],['atend','Em atendimento'],['done','Atendidos']],SECS_W=[['todos','Leitos'],['done','Concluídos']];
const secsNow=()=>G.mode==='visit'?SECS_W:SECS_PS;
function setorOf(P){
  if(['done','dead','handoff','skip'].includes(P.st))return'done';if(P.st==='wait')return'x';
  if(G.mode==='visit')return'leito';return P.st==='queue'?'fila':'atend';
}
function leitoOf(P){if(!P.leito&&P.c.fromPS)P.leito=freeBed(turnOf()==='uti'?'UTI':'ENF');if(!P.leito)P.leito=G.posto==='sala'?'Maca '+(((P.no-1)%6)+1):'Cadeira '+pad(P.no);if(P.st==='emg'&&!/^Maca/.test(P.leito))P.leito='Maca '+(((P.no-1)%6)+1);return P.leito}
function statusOf(P){
  if(P.st==='queue')return P.c.visit?'Visita pendente':P.c.fromPS?'Admissão do PS · aguardando':'Aguardando · '+Math.max(0,Math.floor(G.t-P.c.arr))+' min';
  if(P.st==='care')return P.c.visit?'Em visita':'Em atendimento';if(P.st==='emg')return'Monitorizado na sala vermelha';if(P.st==='reg')return'Aguardando regulação (até '+fmt(P.reg.at)+')';
  if(P.st==='dead')return'Óbito';if(P.st==='done')return'Destino: '+((DESTS.find(x=>x[0]===P.dest)||[0,P.dest])[1]);return'';
}
/* ---------- barra do relógio e barra do sistema ---------- */
function renderClock(){
  const c=$('#clockbar');c.hidden=false;const left=Math.max(0,G.end-Math.floor(G.t)),P=cur();
  c.innerHTML='<span class="lcd">'+fmt(Math.min(G.t,G.end))+'</span><span>'+esc(shiftLbl())+' · '+difOf().n+' · faltam '+Math.floor(left/60)+'h'+pad(left%60)+'</span>'
   +'<span>Leitos livres V/A/E/UTI: <b>'+bedFree('obs')+'/'+bedFree('ama')+'/'+bedFree('enf')+'/'+bedFree('uti')+'</b></span>'
   +'<span>Insumos <b>'+insTxt()+'</b>'+(G.ins>9999?'':'/'+G.insMax)+'</span>'+(P?'<span style="color:var(--amber)">Na tela: '+esc(P.c.nome.split(' ')[0])+'</span>':'');
}
function renderTop(){
  const P=cur(),b=(k,n,x)=>'<button class="btn" data-a="scr:'+k+'" aria-current="'+(UI.scr===k)+'">'+n+(x?'<span class="n">'+x+'</span>':'')+'</button>';
  const m=(n,v)=>'<span class="meter">'+n+'<i><b style="width:'+Math.round(clamp(v))+'%"></b></i></span>';
  $('#top').innerHTML='<div class="brand">PRONTO<small>Prontuário eletrônico · Hospital Regional</small></div>'
   +'<nav class="tb" aria-label="Menu do sistema">'+b('pac','Pacientes')+b('assist','Assistência'+(P?': '+esc(P.c.nome.split(' ')[0]):''))+b('enf','Enfermagem')+b('com','Mensagens',G.unread||0)+'</nav>'
   +'<div class="mini tbx"><button class="btn" data-a="menu">Menu</button><button class="btn" data-a="snd" aria-pressed="'+UI.snd+'">Som: '+(UI.snd?'on':'off')+'</button><button class="btn mtog" data-a="musopen" aria-pressed="'+!!UI.musOpen+'">Música</button></div>'
   +'<div class="mini mtr">'+m('Equipe',G.eq)+m('Reputação',G.rep)+'</div>'
   +'<div class="alerts" data-a="scr:enf" title="Evolução de enfermagem e avisos" style="cursor:pointer">'+G.al.slice(0,3).map(a=>'<div class="'+(a.hot?'hot':'')+'">'+esc(a.txt)+'</div>').join('')+'</div>'
   +'<div class="musbox'+(UI.musOpen?' open':'')+'"><label for="trk">Trilha sonora</label><select id="trk" data-s="trk">'+trackSelectHtml()+'</select><div class="np" id="np">'+esc(npText())+'</div><button class="btn" data-a="mus" aria-pressed="'+MUS.on+'">'+(MUS.on?'Pausar música':'Tocar música')+'</button></div>';
}
/* ---------- tela: pacientes ---------- */
function waitBtns(){const more=G.slots.length-G.filled,coming=G.pts.some(p=>p.st==='wait')||more>0;
  return'<div class="row"><button class="btn amber" data-a="wait:5">Aguardar 5 min</button><button class="btn amber" data-a="wait:15">Aguardar 15 min</button><button class="btn amber" data-a="wait:30">Aguardar 30 min</button>'
   +(!coming&&!active().some(p=>p.st==='queue'||p.st==='care')?'<button class="btn red" data-a="finish">Encerrar '+(G.mode==='visit'?'a visita':'o plantão')+'</button>':'')+'</div>'}
function plistHtml(){
  const nz=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(),q=nz(UI.q||'');
  const L=G.pts.filter(P=>P.st!=='wait'&&P.st!=='skip').filter(P=>UI.sec==='todos'?setorOf(P)!=='done':setorOf(P)===UI.sec)
    .filter(P=>!q||nz(P.c.nome).includes(q)||cpsOf(P.c).includes(q)).sort((a,b)=>(a.st==='queue'?0:1)-(b.st==='queue'?0:1)||a.c.arr-b.c.arr);
  if(!L.length)return'<p class="hint" style="color:#3b5a73;padding:6px 0">'+(q?'Nenhum paciente encontrado.':G.filled<G.slots.length?'Ninguém neste setor agora. A recepção está fichando os próximos.':'Ninguém neste setor.')+'</p>';
  return L.map(P=>{const tags=[],act=ACTIVE.includes(P.st);if(P.returned)tags.push('<span class="tagx hot">VOLTOU</span>');if(P.newRes>0)tags.push('<span class="tagx">LAUDO</span>');if(P.newPar>0)tags.push('<span class="tagx">PARECER</span>');
    const pd=act?pendList(P).length:0;if(pd)tags.push('<span class="tagx">'+pd+' PEND.</span>');
    return'<button class="prow" style="--tc:'+(P.c.visit?'#7d8286':'var(--tc-'+P.c.tri+')')+'" '+(act?'data-a="open:'+P.id+'"':'disabled')+' aria-pressed="'+(G.act===P.id)+'"><canvas class="qt" data-id="'+P.id+'" width="44" height="44"></canvas>'
     +'<span><b>'+esc(P.c.nome)+'</b><span class="m">'+P.c.idade+' anos · CPS '+cpsOf(P.c)+' · '+esc(leitoOf(P))+(P.c.visit?' · '+esc(P.c.secLbl):' · '+trLbl(P.c.tri))+'</span></span>'
     +'<span class="st"><span>'+esc(statusOf(P))+'</span><span>'+tags.join(' ')+'</span></span></button>'}).join('');
}
function pacHtml(){
  const cnt=k=>G.pts.filter(P=>P.st!=='wait'&&P.st!=='skip'&&(k==='todos'?setorOf(P)!=='done':setorOf(P)===k)).length;
  const visit=G.mode==='visit',ck=visit?active().map(P=>{const L=pendList(P);return'<li><b>'+esc(P.c.nome.split(' ')[0])+' ('+esc(P.c.secLbl)+')</b>: '+(L.length?L.map(esc).join('; '):'sem pendências')+'</li>'}).join(''):'';
  return'<section class="win"><h2 class="wt">Pacientes <span>'+esc(shiftLbl())+'</span></h2><div class="wb">'
   +'<div class="secs">'+secsNow().map(([k,n])=>{const c=cnt(k);return c||k==='todos'||UI.sec===k?'<button class="btn'+(UI.sec===k?' on':'')+'" data-a="sec:'+k+'">'+n+' ('+c+')</button>':''}).join('')+'</div>'
   +'<label class="f">Buscar por nome ou CPS<input type="search" data-s="q" value="'+esc(UI.q||'')+'" placeholder="ex.: Maria ou 123456"></label>'
   +'<div class="plist" id="plist">'+plistHtml()+'</div>'+waitBtns()
   +(visit?'<div class="card2"><h4>Antes da visita: checklist</h4><p style="margin:0 0 4px">Veja os leitos, leia a admissão e a última evolução, confira pendências, sinais vitais das últimas 24 h, laudos, pareceres e a prescrição atual. Depois visite cada leito e registre a evolução do dia.</p><ul style="margin:0;padding-left:18px">'+ck+'</ul></div>':'')
   +'</div></section>';
}
/* ---------- tela: enfermagem ---------- */
function enfHtml(){
  const L=active();
  return'<section class="win"><h2 class="wt">Enfermagem <span>evolução de enfermagem e sinais vitais</span></h2><div class="wb">'
   +(L.length?'<div class="tscroll"><table class="tbl"><tr><th>Paciente</th><th>Leito</th><th>Hora</th><th>PA</th><th>FC</th><th>FR</th><th>SatO2</th><th>Tax</th></tr>'+L.map(P=>{const v=(P.vs||[]).filter(x=>x.v).slice(-1)[0];if(!v)return'';
     return'<tr><td>'+esc(P.c.nome.split(' ')[0])+'</td><td>'+esc(leitoOf(P))+'</td><td>'+fmt(v.t)+'</td>'+v.v.map((x,i)=>'<td class="'+(vAbn(i,x)?'abn':'')+'">'+x+'</td>').join('')+'</tr>'}).join('')+'</table></div>':'')
   +'<div class="card2"><h4>Evolução de enfermagem e avisos do plantão (mais recentes primeiro)</h4><ul class="qa">'+G.al.map(a=>'<li class="'+(a.hot?'new':'')+'">'+esc(a.txt)+'</li>').join('')+'</ul></div></div></section>';
}
/* ---------- tela: comunicação interna ---------- */
function comHtml(){
  const C=UI.com,L=active(),P=pt(C.pid)||cur()||L[0];if(P&&!C.pid)C.pid=P.id;
  const saved=P?Object.entries(P.par||{}).filter(([k,p])=>['salvo','perdido'].includes(p.st)):[];
  const subj=P?[C.nome?P.c.nome.toUpperCase():'',C.cps?'CPS '+cpsOf(P.c):'',C.leito?'LEITO '+leitoOf(P).toUpperCase():''].filter(Boolean).join(' · '):'';
  const sp=P&&C.para&&(P.par||{})[C.para];
  return'<section class="win"><h2 class="wt">Comunicação interna <span>mensagens e pareceres</span></h2><div class="wb"><div class="two even">'
   +'<div class="card2"><h4>Mensagem para grupo</h4>'+(L.length?'<div class="fgrid">'
     +'<label class="f">Paciente<select data-s="com:pid">'+L.map(x=>'<option value="'+x.id+'"'+(P&&x.id===P.id?' selected':'')+'>'+esc(x.c.nome)+'</option>').join('')+'</select></label>'
     +'<label class="f">Para (grupo)<select data-s="com:para"><option value="">— escolha —</option>'+PAR.map(([k,n])=>'<option value="'+k+'"'+(C.para===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label></div>'
     +'<p style="margin:8px 0 2px;color:#3b5a73">Assunto (digite cada dado do cabeçalho; copiar do canto da tela apaga o progresso):</p><div class="row" style="margin:0">'
     +[['nome','Nome completo'],['cps','CPS'],['leito','Leito']].map(([k,n])=>'<label class="orient2"><input type="checkbox" data-s="com:'+k+'"'+(C[k]?' checked':'')+'> '+n+'</label>').join('')+'</div>'
     +'<p class="card2" style="margin:6px 0;font-size:17px;min-height:30px">'+(esc(subj)||'<i style="color:#7a8b99">assunto vazio</i>')+'</p>'
     +'<label class="orient2"><input type="checkbox" data-s="com:paste"'+(C.paste?' checked':'')+'> Colar a solicitação de parecer salva (Ctrl+V)</label>'
     +(C.paste&&sp?'<p class="card2" style="margin:6px 0;font-size:17px">'+esc(sp.txt||'(solicitação vazia)')+'</p>':C.paste&&C.para?'<p class="msg err">Não há solicitação salva para '+esc(parN(C.para))+' deste paciente.</p>':'')
     +'<div class="row"><button class="btn" data-a="comsend">Enviar para grupo '+tm(1)+'</button></div>'
     +(saved.length?'<p style="margin:6px 0 0;color:#3b5a73">Solicitações salvas aguardando envio: '+saved.map(([k])=>esc(parN(k))).join(', ')+'.</p>':'')
     :'<p>Nenhum paciente ativo.</p>')+msgHtml()+'</div>'
   +'<div class="card2"><h4>Caixa de entrada</h4>'+(G.news.length?'<ul class="qa">'+G.news.map(n=>'<li class="'+(n.hot?'new':'')+'"><b>'+fmt(n.t)+' · '+esc(n.title)+'</b><br>'+esc(n.txt)+'</li>').join('')+'</ul>':'<p>Nenhuma mensagem ainda.</p>')+'</div>'
   +'</div></div></section>';
}
/* ---------- tela: central de assistência ---------- */
const GUIAS=[['leito','Beira-leito'],['mon','Monitor'],['adm','Admissão'],['evo','Evolução'],['rx','Prescrição'],['sv','Sinais vitais'],['sol','Pedir exames'],['lau','Laudos'],['par','Pareceres'],['atb','ATB (CCIH)'],['tra','Transfusão'],['ter','Termos'],['rec','Receitas'],['aju','Ajuda'],['des','Destino']];
function badge(P,k){
  if(k==='mon'&&P.acc&&P.acc.st!=='pérvio')return'<span class="bd hot">!</span>';if(k==='mon'&&P.mov&&P.mov.mon!=null)return'<span class="bd">♥</span>';
  if(k==='lau'&&P.newRes>0)return'<span class="bd">'+P.newRes+'</span>';if(k==='par'&&P.newPar>0)return'<span class="bd">'+P.newPar+'</span>';
  if(k==='evo'&&!(P.evos||[]).some(e=>!P.c.visit||e.type==='dia'||e.type==='alta'))return'<span class="bd hot">!</span>';
  if(k==='atb'&&P.rx.some(r=>r.ccih))return'<span class="bd hot">!</span>';if(k==='sol'&&(P.cart||{items:[]}).items.length)return'<span class="bd">'+P.cart.items.length+'</span>';return'';
}
function assistHtml(){
  const P=cur();
  if(!P)return'<section class="win"><h2 class="wt">Central de assistência</h2><div class="wb"><p>Nenhum paciente aberto. Vá em <b>Pacientes</b> e selecione um.</p><div class="row"><button class="btn" data-a="scr:pac">Abrir lista de pacientes</button></div>'+waitBtns()+'</div></section>';
  const c=P.c,al=c.alergia.length&&!c.alOmit?'Alergia: '+({penic:'penicilinas',dipi:'dipirona',aine:'anti-inflamatórios',sulfa:'sulfa'})[c.alergia[0]]:'';
  return'<section class="win assist"><div class="phead"><b>'+esc(c.nome)+'</b><span>CPS '+cpsOf(c)+'</span><span>Nasc. '+nascOf(c)+' ('+c.idade+' anos)</span><span>Leito: '+esc(leitoOf(P))+'</span>'
   +'<span>'+(c.visit?esc(c.secLbl):'Classificação: <span class="stampv" style="color:var(--tc-'+c.tri+')">'+c.tri+'</span>')+'</span>'+(al?'<span class="al">'+al+'</span>':'')+'<button class="btn" data-a="scr:pac">Trocar paciente</button></div>'
   +'<nav class="guias" role="tablist">'+GUIAS.map(([k,n])=>'<button class="guia" role="tab" data-a="guia:'+k+'" aria-selected="'+(UI.tab===k)+'">'+n+badge(P,k)+'</button>').join('')+'</nav>'
   +'<div class="gbody" id="gbody">'+guiaHtml(P)+'</div></section>';
}
function guiaHtml(P){
  const f={mon:monHtml,leito:leitoHtml,adm:admHtml,evo:evoHtml,rx:rxHtml,sv:svHtml,sol:solHtml,lau:lauHtml,par:parHtml,atb:atbHtml,tra:traHtml,ter:terHtml,rec:recHtml,aju:ajuHtml,des:desHtml}[UI.tab]||leitoHtml;
  return f(P);
}
const subT=(k,L)=>'<div class="secs">'+L.map(([v,n])=>'<button class="btn'+((UI.sub[k]||L[0][0])===v?' on':'')+'" data-a="sub:'+k+':'+v+'">'+n+'</button>').join('')+'</div>';
const subV=(k,d)=>UI.sub[k]||d;
const logL=(P,kinds,empty)=>{const L=P.log.filter(x=>kinds.includes(x.k));return L.length?'<ul class="qa">'+L.slice().reverse().map(x=>'<li class="'+(x.fresh?'new':'')+'"><b>'+fmt(x.t)+' · '+esc(x.q)+'</b><br>'+esc(x.a)+'</li>').join('')+'</ul>':'<p style="color:#3b5a73;margin:4px 0">'+(empty||'Nada registrado ainda.')+'</p>'};
/* beira-leito */
function vitHtml(P){
  const mon=P.mov&&P.mov.mon!=null,v=mon?vitNow(P).map((x,i)=>i===0&&P.nibp?P.nibp.v:x):P.lv.v,vs=[['PA','mmHg'],['FC','bpm'],['FR','irpm'],['SatO2','%'],['Tax','°C']];
  return'<div class="card2"><h4>Sinais vitais · '+(mon?'monitor contínuo (PA de '+(P.nibp?fmt(P.nibp.t):'agora')+')':'aferidos às '+fmt(P.lv.t))+'</h4><div class="vit2">'+vs.map((x,i)=>'<div class="'+(vAbn(i,v[i])?'abn':'')+'"><label>'+x[0]+'</label><b>'+v[i]+'</b></div>').join('')+'</div>'
   +'<div class="row"><button class="btn" data-a="vit">Aferir de novo '+tm(1)+'</button><button class="btn" data-a="reav">Reavaliar '+tm(3)+'</button></div></div>';
}
function leitoHtml(P){
  const sb=subV('leito','conv');let h='';
  if(sb==='conv'){const extra=GEN_Q.filter(g=>!ESSQ.includes(g[0]));
    const qs=[...GEN_Q.filter(g=>ESSQ.includes(g[0])).map(([k,t])=>['g:'+k,t]),...P.c.perg.map((p,i)=>['p:'+i,p[0]]),...(UI.moreQ?extra.map(([k,t])=>['g:'+k,t]):[])];
    h='<div class="grid">'+qs.map(([k,t])=>'<button class="opt'+(P.asked.has(k)?' on':'')+'" data-a="ask:'+k+'"'+(P.asked.has(k)?' disabled':'')+'>'+esc(t)+'</button>').join('')+'</div><div class="row"><button class="btn" data-a="moreq">'+(UI.moreQ?'Menos perguntas':'Mais perguntas ('+extra.length+')')+'</button><span style="color:#3b5a73">15 s por pergunta</span></div>'+logL(P,['q'])}
  if(sb==='fis')h='<div class="grid">'+SYS.map(([k,t])=>'<button class="opt'+(P.examined.has(k)?' on':'')+'" data-a="sys:'+k+'"'+(P.examined.has(k)?' disabled':'')+'>'+t+'<small>'+(P.examined.has(k)?'feito':'1 min')+'</small></button>').join('')+'</div>'+logL(P,['x','r']);
  if(sb==='mov'){const m=P.mov||{},o2r=P.rx.find(r=>r.id==='o2'),o2=o2r?o2r.i:-1;
    const on=k=>k==='pac'?(m.mon!=null&&m.ace!=null&&!!P.ord.glic&&!!P.ord.ecg):k==='glic'||k==='ecg'?!!(P.ord[k]&&!P.ord[k].done):k==='o2c'?o2===0:k==='o2v'?o2===1:k==='o2m'?o2===2:k==='vni'?o2===3:m[k]!=null;
    const L=[['pac','Pacote MOV','monitor, acesso, glicemia e ECG'],['mon','Monitorizar',''],['ace','Acesso venoso',''],['o2c','O2 cateter nasal',''],['o2v','Máscara de Venturi',''],['o2m','Máscara não reinalante',''],['vni','VNI / CPAP',''],['glic','Glicemia capilar','pode repetir'],['ecg','ECG','pode repetir']];
    h='<p style="margin:0;color:#3b5a73">A enfermagem executa, mas cada medida consome tempo seu (chamar, conferir, registrar). Dieta, cabeceira e isolamento ficam na Prescrição médica.</p><div class="grid">'+L.map(([k,n,d])=>{const o=on(k);return'<button class="opt'+(o?' on':'')+'" data-a="mov:'+k+'"'+(o&&!['glic','ecg'].includes(k)?' disabled':'')+'>'+n+'<small>'+(o?(k==='glic'||k==='ecg'?'em andamento':'feito'):tm(MOVT[k])+(d?' · '+d:''))+'</small></button>'}).join('')+'</div>'+logL(P,['m'],'Nenhuma medida ainda.')}
  return'<div class="two"><div style="display:grid;gap:10px;align-content:start"><div class="scene2"><canvas id="scene" width="160" height="120" aria-label="Retrato em pixel art de '+esc(P.c.nome)+'"></canvas></div>'+vitHtml(P)+'</div>'
   +'<div style="display:grid;gap:8px;align-content:start">'+subT('leito',[['conv','Conversa'],['fis','Exame físico'],['mov','Medidas iniciais']])+msgHtml()+h+'</div></div>';
}
/* admissão / atendimento */
function admHtml(P){
  const c=P.c,g=k=>P.asked.has('g:'+k),row=(k,v,u)=>'<tr><th>'+k+'</th><td>'+(u?'<i style="color:#7a8b99">não investigado</i>':esc(v))+'</td></tr>';
  const adm=(P.prevEvos||[]).find(e=>e.type==='adm');
  return'<div class="card2"><h4>Ficha de atendimento</h4><table class="tbl">'+row('Nome',c.nome)+row('Idade e sexo',c.idade+' anos · '+(c.sexo==='F'?'feminino':'masculino'))+row('Origem',c.mun)+row('Ocupação',c.ocup)
   +row(c.visit?'Situação':'Queixa principal',c.queixa)+row('Chegada',c.visit?'internado':fmt(c.arr)+(c.visit?'':' · triagem '+trLbl(c.tri).toLowerCase()))+row('Doenças',c.comorb,!g('comorb'))+row('Em uso',c.uso,!g('uso'))
   +row('Alergias',g('alerg')?c.alergiaTxt:(c.alTri||'Triagem: não informado (reconfirmar)'))+'</table></div>'
   +(adm?'<div class="card2"><h4>Evolução de admissão ('+esc(adm.dt)+')</h4><p style="margin:0"><b>HD:</b> '+esc(dxCid(adm.hyp))+'</p>'+(adm.S?'<p style="margin:4px 0 0"><b>S:</b> '+esc(adm.S)+'</p>':'')+(adm.C?'<p style="margin:4px 0 0"><b>Conduta:</b> '+esc(adm.C)+'</p>':'')+'</div>':'')
   +'<div class="card2"><h4>O que revisar</h4><p style="margin:0">História e motivo da admissão, hipóteses registradas, exames iniciais, conduta inicial e o que importa para a continuidade do cuidado.</p></div>';
}
/* evolução médica */
function evoHtml(P){
  const all=[...(P.prevEvos||[]),...(P.evos||[])],f=P.evf;
  let h='<div class="row" style="margin:0"><button class="btn" data-a="evo:new">Novo</button><button class="btn" data-a="evo:dup"'+(all.length?'':' disabled')+'>Duplicar documento</button><span style="color:#3b5a73">Salvar: 2 min. Não dá para editar registro de outro dia.</span></div>'+msgHtml();
  if(f){h+='<div class="card2"><h4>'+(f.dup?'Evolução duplicada: revise tudo antes de salvar':'Nova evolução')+'</h4><div class="fgrid">'
    +'<label class="f">Tipo<select data-s="evf:type">'+EVT.map(([k,n])=>'<option value="'+k+'"'+(f.type===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
    +'<label class="f">Buscar CID ou diagnóstico<input type="search" data-s="dxq" value="'+esc(UI.dxq||'')+'" placeholder="ex.: leish, J18, sepse"></label></div>'
    +'<label class="f" style="margin-top:6px">Hipótese diagnóstica (CID)<select data-s="evf:hyp"><option value="">'+(f.hyp?'':'Escolha na lista')+'</option>'+dxOpts(P,UI.dxq,f.hyp)+'</select></label>'
    +(f.hyp?'<p style="margin:4px 0">Selecionada: <b>'+esc(dxCid(f.hyp))+'</b></p>':'')
    +'<label class="f">Subjetivo (S)<textarea data-s="evf:S" placeholder="Queixas, como passou as últimas horas, alimentação, sono, diurese e evacuações.">'+esc(f.S)+'</textarea></label>'
    +'<label class="f">Objetivo (O)<textarea data-s="evf:O" placeholder="Sinais vitais e exame físico.">'+esc(f.O)+'</textarea></label><div class="row" style="margin:0"><button class="btn" data-a="evo:insO">Inserir sinais vitais e exame físico</button></div>'
    +'<label class="f">Conduta<textarea data-s="evf:C" placeholder="O que foi feito e por quê.">'+esc(f.C)+'</textarea></label><div class="row" style="margin:0"><button class="btn" data-a="evo:insC">Inserir prescrição atual</button></div>'
    +'<label class="f">Pendências<textarea data-s="evf:pend">'+esc(f.pend)+'</textarea></label><div class="row" style="margin:0"><button class="btn" data-a="evo:insP">Inserir pendências do sistema</button></div>'
    +'<div class="row"><button class="btn red" data-a="evo:save">Salvar evolução '+tm(2)+'</button><button class="btn" data-a="evo:discard">Descartar rascunho</button></div></div>'}
  h+='<div class="card2"><h4>Evoluções desta internação</h4>'+(all.length?'<ul class="qa">'+all.slice().reverse().map(e=>'<li><b>'+esc(e.dt)+' · '+EVT.find(x=>x[0]===e.type)[1]+(e.dup?' (duplicada'+(e.same?', sem revisão':'')+')':'')+'</b><br>HD: '+esc(e.hyp?dxCid(e.hyp):'—')+(e.S?'<br>S: '+esc(e.S):'')+(e.O?'<br>O: '+esc(e.O):'')+(e.C?'<br>Conduta: '+esc(e.C):'')+(e.pend?'<br>Pendências: '+esc(e.pend):'')+'</li>').join('')+'</ul>':'<p style="margin:0">Nenhuma evolução registrada.</p>')+'</div>';
  return h;
}
/* prescrição médica */
function rxLine(P,r){const d=DRUGS[r.id];if(d.v[0]==='Solicitação')return'<b>'+d.n+'</b> · pedido feito';
  const D=ABX.has(r.id)?' · <b>ATB D'+(dayIdx()-(r.day||dayIdx())+1)+'</b>':'';
  const ap=window.aprz?aprz(r):'';
  return'<b>'+d.n+'</b> · '+esc(d.d[r.i])+' · '+d.v[r.via||0]+' · '+FREQ[r.freq]+(r.freq==='u'?'':' · '+DUR[r.dur])+(ap?' · <i>'+esc(ap)+'</i>':'')+(r.dil?' · '+DIL[r.dil]+' · '+INF[r.inf]:'')+D+(r.home?' · receita domiciliar':'')+(r.ccih?' · <span class="warn">aguardando CCIH</span>':'')+' <small>('+(r.carry?'prescrição anterior':gameDate(r.t)+' '+fmt(r.t))+')</small>'}
function rxHtml(P){
  const F=UI.F,D=DRUGS[F.drug],nz=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(),q=nz(UI.rxq||'');
  const ci=Math.min(UI.rxCat||0,CATS.length-1);
  const lst=q?[...new Set(CATS.flatMap(c=>c[1]))].filter(k=>DRUGS[k]&&nz(DRUGS[k].n).includes(q)):CATS[ci][1].filter(k=>DRUGS[k]);
  lst.sort((a,b)=>DRUGS[a].n.localeCompare(DRUGS[b].n,'pt'));
  let h='<div class="card2"><h4>Nova prescrição · '+gameDate(G.t)+'</h4><label class="f">Buscar medicamento<input type="search" data-s="rxq" value="'+esc(UI.rxq||'')+'" placeholder="ex.: ceftriaxona, dipirona"></label>'
   +(q?'':'<div class="secs" style="margin-top:6px">'+CATS.map((c,i)=>'<button class="btn'+(ci===i?' on':'')+'" data-a="rxcat:'+i+'">'+c[0]+'</button>').join('')+'</div>')
   +'<div class="grid" style="margin-top:6px">'+lst.map(k=>{const n=P.rx.filter(r=>r.id===k).length;return'<button class="opt'+(F.drug===k?' on':'')+'" data-a="drug:'+k+'">'+DRUGS[k].n+(n?'<small>já prescrito'+(n>1?' ('+n+'x)':'')+'</small>':'')+'</button>'}).join('')+(lst.length?'':'<p>Nenhum medicamento encontrado.</p>')+'</div>'
   +(HEMO.some(x=>q&&nz(DRUGS[x].n).includes(q))?'<p class="msg">Hemocomponentes são pedidos na guia Transfusão.</p>':'');
  if(D){const fs=Object.keys(FREQ),dr=Object.keys(DUR);
    h+='<p style="margin:8px 0 2px;font-size:21px">'+D.n+'</p><div class="fgrid"><label class="f">Dose<select data-s="dose">'+D.d.map((d,i)=>'<option value="'+i+'"'+(F.dose===i?' selected':'')+'>'+esc(d)+'</option>').join('')+'</select></label>'
     +'<label class="f">Via<select data-s="via">'+D.v.map((d,i)=>'<option value="'+i+'"'+(F.via===i?' selected':'')+'>'+d+'</option>').join('')+'</select></label>'
     +'<label class="f">Frequência<select data-s="freq">'+fs.map(k=>'<option value="'+k+'"'+(F.freq===k?' selected':'')+'>'+FREQ[k]+'</option>').join('')+'</select></label>'
     +(F.freq==='u'?'':'<label class="f">Duração<select data-s="dur">'+dr.map(k=>'<option value="'+k+'"'+(F.dur===k?' selected':'')+'>'+DUR[k]+'</option>').join('')+'</select></label>')
     +(F.freq==='ic'?'<label class="f">Vazão inicial (mL/h)<select data-s="rate">'+BICRATES.map(x=>'<option value="'+x+'"'+(+F.rate===x?' selected':'')+'>'+x+' mL/h</option>').join('')+'</select></label><label class="f">Correr por<select data-s="hrs">'+BICHRS.map(([k,n])=>'<option value="'+k+'"'+(String(F.hrs)===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label>':'')
     +(isEVrx(D,F.via)&&F.freq!=='ic'?'<label class="f">Diluição<select data-s="dil">'+Object.keys(DIL).map(k=>'<option value="'+k+'"'+(F.dil===k?' selected':'')+'>'+DIL[k]+'</option>').join('')+'</select></label><label class="f">Tempo de infusão<select data-s="inf">'+Object.keys(INF).map(k=>'<option value="'+k+'"'+(F.inf===k?' selected':'')+'>'+INF[k]+'</option>').join('')+'</select></label>':'')+'</div>'}
  if(D){const at=F.freq==='u'||F.freq==='sn'?'a enfermagem administra em até '+({mf:2,f:4,m:5,d:8,md:10,inf:15}[difOf().id]||5)+' min':F.freq==='ic'?'a enfermagem instala a bomba em até 8 min, já programada'+(BICSTD[F.drug]?' ('+BICSTD[F.drug][1]+')':''):HSTEP[F.freq]?'aprazado em horário cheio: '+aprz({id:F.drug,freq:F.freq,adm:admAt(P,F,F.drug)||G.t}).replace('aprazado: ',''):'';
    if(at)h+='<p style="margin:6px 0 0;color:#3b5a73">Administração: '+esc(at)+'.</p>'}
  h+=msgHtml()+'<div class="row"><button class="btn red" data-a="rxgo"'+(D?'':' disabled')+'>Prescrever '+tm(1)+'</button><span style="color:#3b5a73">Dá para prescrever o mesmo remédio de novo: AGORA mais a manutenção.</span></div></div>';
  const m=P.mov||{};
  h+='<div class="card2"><h4>Dieta e cuidados</h4><div class="grid"><button class="opt'+(m.jej!=null?' on':'')+'" data-a="mov:jej">'+(m.jej!=null?'Dieta zero (ativa)':'Dieta liberada')+'<small>toque para '+(m.jej!=null?'liberar':'prescrever dieta zero')+' '+tm(.5)+'</small></button>'
   +'<button class="opt'+(m.cab!=null?' on':'')+'" data-a="mov:cab"'+(m.cab!=null?' disabled':'')+'>Cabeceira elevada 45°<small>'+(m.cab!=null?'prescrito':tm(.5))+'</small></button>'
   +ISO.map(([k,n])=>'<button class="opt'+(m.iso===k?' on':'')+'" data-a="mov:'+k+'">Isolamento: '+n+'<small>'+(m.iso===k?'ativo · toque para suspender':tm(1))+'</small></button>').join('')+'</div></div>';
  h+='<div class="card2"><h4>Prescrição atual</h4>'+(P.rx.length?'<ul class="rxl">'+P.rx.map((r,i)=>'<li>'+rxLine(P,r)+' <button class="btn sm" data-a="susp:'+i+'">Suspender</button></li>').join('')+'</ul>':'<p style="margin:0">Nenhum item prescrito.</p>')
   +(P.rxOff&&P.rxOff.length?'<p style="margin:8px 0 2px;color:#3b5a73">Suspensos</p><ul class="rxl off">'+P.rxOff.map(r=>'<li>'+rxLine(P,r)+' <small>suspenso às '+fmt(r.off)+'</small></li>').join('')+'</ul>':'')+'</div>';
  return h;
}
/* sinais vitais */
function svHtml(P){
  const L=(P.vs||[]).slice().sort((a,b)=>a.t-b.t),days=[...new Set(L.map(x=>x.dt.slice(0,5)))],d=UI.sub.svd&&days.includes(UI.sub.svd)?UI.sub.svd:days[days.length-1];
  const R=L.filter(x=>x.dt.slice(0,5)===d);
  return(days.length>1?'<div class="secs">'+days.map(x=>'<button class="btn'+(x===d?' on':'')+'" data-a="sub:svd:'+x+'">'+x+'</button>').join('')+'</div>':'')
   +'<div class="card2"><h4>Sinais vitais'+(d?' de '+d:'')+' · observe a tendência, não só o último valor</h4><div class="tscroll"><table class="tbl"><tr><th>Hora</th><th>PA</th><th>FC</th><th>FR</th><th>SatO2</th><th>Tax</th><th>Glicemia</th><th>Fonte</th></tr>'
   +R.map(x=>'<tr><td>'+x.dt.slice(6)+'</td>'+(x.v?x.v.map((y,i)=>'<td class="'+(vAbn(i,y)?'abn':'')+'">'+y+'</td>').join(''):'<td colspan="5"></td>')+'<td class="'+(typeof x.g==='number'&&(x.g<70||x.g>180)||typeof x.g==='string'?'abn':'')+'">'+(x.g!=null?x.g:'')+'</td><td>'+esc(x.by)+'</td></tr>').join('')+'</table></div></div>'
   +'<div class="card2"><h4>Evolução de enfermagem</h4>'+logL(P,['m'],'Sem registros da enfermagem.')+'</div>';
}
/* solicitação de exames */
function solHtml(P){
  const C=cartOf(P),ci=+(UI.sub.solc||0),nz=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(),q=nz(UI.solq||'');
  const L=(q?SOLCAT.flatMap(x=>x[1]):SOLCAT[ci][1]).filter(k=>!q||nz(SOLX[k]?SOLX[k][0]:EXAMS[k].n).includes(q));
  const name=k=>SOLX[k]?SOLX[k][0]:EXAMS[k].n;
  const stOf=k=>{if(SOLX[k])return P.rx.some(r=>r.id===k)?'já solicitado':'agenda do serviço';const o=P.ord[k],E=EXAMS[k],off=G.off[k]&&G.t<G.off[k].until;
    if(o&&!o.done)return'pendente · previsto '+fmt(o.due);if(off)return'indisponível';const t=Math.max(1,Math.round(E.t*(E.t>1?difOf().exf:1)));return(o?'já feito · nova coleta · ':'')+t+' min · custo '+E.c};
  const dis=k=>SOLX[k]?P.rx.some(r=>r.id===k):(P.ord[k]&&!P.ord[k].done)||(G.off[k]&&G.t<G.off[k].until);
  let h='<div class="two even"><div class="card2"><h4>Novo pedido</h4>'+(q?'':subT('solc',SOLCAT.map((x,i)=>[String(i),x[0]])))
   +'<label class="f" style="margin-top:6px">Pesquisar exame<input type="search" data-s="solq" value="'+esc(UI.solq||'')+'" placeholder="ex.: hemograma, tomografia"></label>'
   +(UI.exInfo&&EXINFO[UI.exInfo]?'<div class="infobox"><b>'+esc(EXAMS[UI.exInfo].n)+':</b> '+EXINFO[UI.exInfo]+' <button class="btn sm" data-a="exinfo:">Fechar</button></div>':'')
   +'<div class="grid" style="margin-top:6px">'+L.map(k=>{const inC=C.items.includes(k),d=dis(k);return'<div class="exw"><button class="opt'+(inC?' on':'')+'" data-a="'+(inC?'crem:':'cadd:')+k+'"'+(d?' disabled':'')+'>'+name(k)+'<small>'+(inC?'selecionado':stOf(k))+'</small></button>'+(EXINFO[k]?'<button class="ibtn" data-a="exinfo:'+k+'" aria-label="Informações e referência">i</button>':'')+'</div>'}).join('')+'</div></div>';
  h+='<div class="card2"><h4>Exames solicitados ('+C.items.length+')</h4>'+(C.items.length?'<ul class="cart">'+C.items.map(k=>'<li><span>'+name(k)+'</span><button class="btn sm" data-a="crem:'+k+'" aria-label="Excluir">🗑 excluir</button></li>').join('')+'</ul>':'<p style="margin:0">Clique nos exames para adicionar.</p>')
   +'<label class="f" style="margin-top:6px">Justificativa'+(C.items.some(i=>NEEDJUST.includes(i))?' (obrigatória para imagem, EDA e eco)':'')+'<textarea data-s="cart:just" placeholder="Hipótese e pergunta clínica.">'+esc(C.just)+'</textarea></label>'
   +(C.items.includes('tc')?'<div class="card2" style="margin-top:6px"><h4>Entrevista de tomografia</h4><div class="fgrid">'
     +'<label class="f">Tipo<select data-s="tc:tipo"><option value="">—</option>'+[['cranio','Crânio'],['torax','Tórax'],['angio','Angiotomografia de tórax (TEP)'],['abdome','Abdome'],['coluna','Coluna lombar']].map(([k,n])=>'<option value="'+k+'"'+(C.tc.tipo===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
     +'<label class="f">Contraste<select data-s="tc:ctr"><option value="">—</option><option value="sim"'+(C.tc.ctr==='sim'?' selected':'')+'>Com contraste iodado</option><option value="nao"'+(C.tc.ctr==='nao'?' selected':'')+'>Sem contraste</option></select></label>'
     +'<label class="f">Nível de consciência<select data-s="tc:cons"><option value="">—</option>'+['Lúcido e orientado','Confuso','Rebaixado (Glasgow ≤ 12)'].map(x=>'<option'+(C.tc.cons===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label></div></div>':'')
   +'<div class="row"><label class="orient2"><input type="radio" name="urg" data-s="cart:urg" value="0"'+(C.urg?'':' checked')+'> Rotina'+(G.mode==='visit'?' (coleta amanhã 06:00)':'')+'</label><label class="orient2"><input type="radio" name="urg" data-s="cart:urg" value="1"'+(C.urg?' checked':'')+'> Imediato (metade do tempo, +1 insumo)</label></div>'
   +msgHtml()+'<div class="row"><button class="btn red" data-a="csend"'+(C.items.length?'':' disabled')+'>Imprimir, carimbar e enviar '+tm(1)+'</button></div>'
   +'<p style="margin:4px 0 0;color:#3b5a73">Laboratório: caixa de coleta. Imagem: entregue à enfermeira do setor. Você carimba e assina.'+(G.mode==='visit'?' Na enfermaria e na UTI, a rotina é colhida amanhã às 06:00; imediato sai hoje.':'')+'</p></div></div>';
  const done=Object.entries(P.ord);
  h+='<div class="card2"><h4>Busca: exames já solicitados</h4>'+(done.length?'<div class="tscroll"><table class="tbl"><tr><th>Exame</th><th>Coleta</th><th>Situação</th></tr>'+done.map(([k,o])=>'<tr><td>'+EXAMS[k].n+(o.urg?' (imediato)':'')+'</td><td>'+esc(o.dt||fmt(o.t0))+'</td><td>'+(o.done?(o.sys===false?'realizado, ainda não consta no sistema':o.bad?'problema na amostra':'resultado na guia Laudos'):'em andamento · previsto '+fmt(o.due))+'</td></tr>').join('')+'</table></div>':'<p style="margin:0">Nenhum exame solicitado.</p>')+'</div>';
  return h;
}
/* laudos */
function collOf(P){
  const cur=Object.entries(P.ord).map(([id,o])=>Object.assign({id,cur:1},o)).filter(o=>o.done&&o.sys!==false);
  return[...(P.flow||[]).map(o=>Object.assign({old:1},o)),...(P.hist||[]).filter(o=>o.done&&o.sys!==false),...cur];
}
function lauBlock(P,o){
  const k=o.id,E=EXAMS[k];
  let h='<div class="labw"><div class="labh"><b>'+(LP[k]?LP[k].n:E.n)+'</b>'+(EXINFO[k]?'<button class="ibtn" data-a="exinfo:'+k+'" aria-label="Referência e informações">i</button>':'')+'<small>Coleta '+esc(o.dt||'')+' · liberado '+esc(o.dd||'')+(o.urg?' · IMEDIATO':'')+(o.phone?' · informado por telefone':'')+(o.old?' · dia anterior':'')+'</small></div>';
  if(UI.exInfo===k&&EXINFO[k])h+='<div class="infobox">'+EXINFO[k]+' <button class="btn sm" data-a="exinfo:">Fechar</button></div>';
  if(o.bad)return h+'<p class="warn">PROBLEMA: '+esc(o.bad)+'</p></div>';
  if(LP[k])return h+labTable(P,k,o.vals||labVals(P,k))+NOTE(P.c.res[k])+'</div>';
  if(o.nol&&!o.laudo)return h+'<p class="laudo">Exame realizado e disponível na telerradiologia, sem laudo: radiografias e tomografias sem contraste só são laudadas quando você pede à radiologia.</p>'+(o.cur?'<div class="row" style="margin:4px 0 0">'+(o.laudoAt?'<span>Laudo solicitado; previsão '+fmt(o.laudoAt)+'.</span>':'<button class="btn sm" data-a="laudo:'+k+'">Pedir laudo à radiologia '+tm(1)+'</button>')+'</div>':'')+'</div>';
  return h+'<p class="laudo">'+esc(o.alt||P.c.res[k]||(k==='ecg'?'Ritmo sinusal, sem alterações agudas.':k==='rx'?'Sem alterações.':k==='us'?'Sem alterações ao exame à beira-leito.':k==='tc'?'Sem alterações agudas.':'Sem alterações relevantes.'))+'</p></div>';
}
function fluxoHtml(P){
  const C=collOf(P).filter(o=>LP[o.id]&&o.vals&&!['glic','hbrap','urina'].includes(o.id));if(!C.length)return'<p style="margin:0">Ainda não há exames laboratoriais para montar o fluxo.</p>';
  const cols=[...new Set(C.map(o=>o.dt))],ids=[...new Set(C.map(o=>o.id))],F=P.c.sexo==='F';
  let h='<div class="tscroll"><table class="tbl"><tr><th>Exame</th>'+cols.map(c=>'<th>'+esc(c)+'</th>').join('')+'<th>Ref.</th></tr>';
  ids.forEach(id=>{LP[id].rows.forEach(([k,n,u,ref,d])=>{const vals=cols.map(c=>{const o=C.find(x=>x.id===id&&x.dt===c);return o?o.vals[k]:null});if(vals.every(v=>v==null))return;
    h+='<tr><td>'+n+'</td>'+vals.map(v=>'<td class="'+(v!=null&&flag(v,ref,k,F)?'abn':'')+'">'+(v==null?'':fmtN(v,d))+'</td>').join('')+'<td>'+refTxt(ref,d,k,F)+'</td></tr>'})});
  return h+'</table></div><p style="margin:4px 0 0;color:#3b5a73">Confira sempre o laudo: a tabela automática pode ter erro de transcrição.</p>';
}
function lauHtml(P){
  const sb=subV('lau','lab'),C=collOf(P).sort((a,b)=>(b.due||0)-(a.due||0)+(a.old?1e6:0)-(b.old?1e6:0));
  const IMG=['rx','tc','us','ecg'];let L=[];
  if(sb==='lab')L=C.filter(o=>!IMG.includes(o.id)&&!GASO_IONS.includes(o.id)||o.id==='glic');
  if(sb==='gaso')L=C.filter(o=>GASO_IONS.includes(o.id)&&o.id!=='glic');
  if(sb==='img')L=C.filter(o=>IMG.includes(o.id));
  const call=P.call&&G.t<=P.call.until,pend=Object.entries(P.ord).filter(([k,o])=>!o.done);
  let h=subT('lau',[['lab','Laboratório'],['gaso','Gasometria e íons'],['fluxo','Fluxo laboratorial'],['img','Imagem e ECG']])
   +'<div class="card2"><h4>Telefone do laboratório</h4><p style="margin:0">Ligue para saber se já saiu algo que ainda não subiu para o sistema, pedir prioridade em um exame pendente ou saber da endoscopia.</p><div class="row"><button class="btn" data-a="call">Ligar para o laboratório '+tm(2)+'</button></div>'
   +(call&&pend.length?'<p style="margin:6px 0 2px">Na linha (até '+fmt(P.call.until)+'): pedir prioridade para</p><div class="row" style="margin:0">'+pend.map(([k])=>'<button class="btn sm" data-a="pri:'+k+'"'+(P.call.pri?' disabled':'')+'>'+EXAMS[k].n+'</button>').join('')+'</div>':'')
   +logL(P,['l'],'Nenhuma ligação ainda.').replace('<ul class="qa">','<ul class="qa" style="margin-top:6px">')+'</div>'+msgHtml();
  if(sb==='fluxo')return h+'<div class="card2"><h4>Fluxo laboratorial (exames ao longo do tempo)</h4>'+fluxoHtml(P)+'</div>';
  return h+(L.length?L.map(o=>lauBlock(P,o)).join(''):'<p style="margin:0;color:#3b5a73">Nenhum laudo disponível nesta guia.</p>');
}
/* pareceres */
function parHtml(P){
  const E=Object.entries(P.par||{}),stt={salvo:'salvo · falta comunicação interna',perdido:'enviado sem identificação · reenviar',enviado:'enviado · aguardando resposta',agendado:'recebido · avaliação pela manhã',respondido:'respondido',devolvido:'devolvido · reescrever'};
  return'<div class="card2"><h4>Solicitação de parecer (Novo)</h4><div class="fgrid"><label class="f">Especialidade<select data-s="par:id"><option value="">— escolha —</option>'+PAR.map(([k,n])=>'<option value="'+k+'"'+(UI.par.id===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label></div>'
   +'<label class="f" style="margin-top:6px">Solicitação (situação encontrada e o que se espera da especialidade)<textarea data-s="par:txt" placeholder="Ex.: paciente de 60 anos com ... Solicito avaliação para ...">'+esc(UI.par.txt)+'</textarea></label>'
   +msgHtml()+'<div class="row"><button class="btn" data-a="parsave">Salvar solicitação '+tm(2)+'</button><span style="color:#3b5a73">Depois, avise a especialidade pela Comunicação interna: sem ela ninguém é notificado.</span></div></div>'
   +'<div class="card2"><h4>Pareceres deste paciente</h4>'+(E.length?'<ul class="qa">'+E.map(([k,p])=>'<li class="'+(p.st==='respondido'||p.st==='devolvido'?'new':'')+'"><b>'+esc(parN(k))+' · '+stt[p.st]+'</b>'+(p.resp?'<br>Resposta: '+esc(p.resp):'')+(['salvo','perdido'].includes(p.st)?'<br><button class="btn sm" data-a="parcom:'+k+'">Abrir comunicação interna</button>':'')+'</li>').join('')+'</ul>':'<p style="margin:0">Nenhum parecer solicitado.</p>')+'</div>';
}
/* solicitação de antimicrobiano (CCIH) */
function atbHtml(P){
  const A=UI.atb,rs=P.rx.filter(r=>RESTR.includes(r.id));
  return'<div class="card2"><h4>Solicitação de antimicrobiano de uso restrito (CCIH)</h4><p style="margin:0 0 6px">Anfotericina B, meropeném, vancomicina, piperacilina-tazobactam, cefepima, ceftazidima e amicacina só são dispensados pela farmácia com esta ficha carimbada.</p><div class="fgrid">'
   +'<label class="f">Antimicrobiano<select data-s="atb:drug"><option value="">— escolha —</option>'+RESTR.map(k=>'<option value="'+k+'"'+(A.drug===k?' selected':'')+'>'+DRUGS[k].n+(P.rx.some(r=>r.id===k)?' (prescrito)':'')+'</option>').join('')+'</select></label>'
   +'<label class="f">Indicação<select data-s="atb:ind"><option value="">—</option>'+['Terapia empírica','Guiada por cultura','Profilaxia'].map(x=>'<option'+(A.ind===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label>'
   +'<label class="f">Sítio da infecção<select data-s="atb:sit"><option value="">—</option>'+['Pulmonar','Urinário','Abdominal','Corrente sanguínea','Sistema nervoso central','Pele e partes moles','Visceral (leishmaniose)','Neutropenia febril','Outro'].map(x=>'<option'+(A.sit===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label></div>'
   +msgHtml()+'<div class="row"><button class="btn red" data-a="atbsend">Preencher, carimbar e enviar '+tm(2)+'</button></div></div>'
   +'<div class="card2"><h4>Situação na farmácia</h4>'+(rs.length?'<ul class="cart">'+rs.map(r=>'<li><span>'+DRUGS[r.id].n+'</span><span>'+(r.ccih?'<b class="warn">aguardando ficha da CCIH</b>':'liberado')+'</span></li>').join('')+'</ul>':'<p style="margin:0">Nenhum antimicrobiano restrito prescrito.</p>')
   +((P.atb||[]).length?'<p style="margin:6px 0 0">Fichas enviadas: '+P.atb.map(a=>esc(DRUGS[a.drug].n+' · '+a.ind+' · '+a.sit+' ('+fmt(a.t)+')')).join('; ')+'</p>':'')+'</div>';
}
/* transfusão */
function traHtml(P){
  const T=UI.tx,D=DRUGS[T.id],tip=P.ord.tipag&&P.ord.tipag.done&&!P.ord.tipag.bad;
  return'<div class="card2"><h4>Solicitação de transfusão (modelo Rev. 5)</h4><p style="margin:0 0 6px">Confira transfusões anteriores e preencha com os dados da AIH. Imprima em duas vias, carimbe, assine e entregue à enfermeira.</p><div class="fgrid">'
   +'<label class="f">Hemocomponente<select data-s="tx:id">'+HEMO.map(k=>'<option value="'+k+'"'+(T.id===k?' selected':'')+'>'+DRUGS[k].n+'</option>').join('')+'</select></label>'
   +'<label class="f">Quantidade<select data-s="tx:dose">'+D.d.map((d,i)=>'<option value="'+i+'"'+(+T.dose===i?' selected':'')+'>'+esc(d)+'</option>').join('')+'</select></label>'
   +'<label class="f">Indicação<select data-s="tx:ind"><option value="">—</option>'+['Anemia sintomática ou Hb abaixo de 7','Sangramento ativo com instabilidade','Plaquetopenia com sangramento','Coagulopatia com sangramento','Reposição em procedimento'].map(x=>'<option'+(T.ind===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label></div>'
   +'<p style="margin:6px 0">Tipagem e prova cruzada: <b>'+(tip?'disponível':'não consta')+'</b>'+(tip?'':' (peça em Solicitar exames)')+'</p>'
   +'<label class="orient2"><input type="checkbox" data-s="tx:urg"'+(T.urg?' checked':'')+'> Urgência extrema: sangue O sem prova cruzada</label>'
   +'<p class="infobox">'+HEMOREF+'</p>'+msgHtml()+'<div class="row"><button class="btn" data-a="txfill">Preencher e imprimir 2 vias '+tm(2)+'</button></div></div>'
   +'<div class="card2"><h4>Solicitações</h4>'+((P.tx||[]).length?'<ul class="qa">'+P.tx.map((x,i)=>'<li><b>'+DRUGS[x.id].n+' · '+esc(DRUGS[x.id].d[x.dose])+(x.urg?' · urgência extrema':'')+'</b><br>'
     +({impresso:'Impresso. <button class="btn sm" data-a="txstep:'+i+'">Carimbar e assinar</button>',carimbado:'Carimbado. <button class="btn sm" data-a="txstep:'+i+'">Entregar à enfermeira</button>',entregue:'Com a enfermagem; instalação prevista '+fmt(x.at||0)+'.',instalado:'Instalado.',recusado:'<span class="warn">'+esc(x.why||'Recusado.')+'</span>'})[x.st]+'</li>').join('')+'</ul>':'<p style="margin:0">Nenhuma solicitação.</p>')+'</div>';
}
/* termos e procedimentos */
function terHtml(P){
  const T=P.termo||{},ns=noSign(P.c);
  return'<div class="card2"><h4>Procedimentos e termos de consentimento</h4><p style="margin:0 0 6px">Procedimento eletivo precisa de termo impresso e assinado pelo paciente (ou acompanhante, se ele não puder). Na emergência, faça primeiro e registre depois.</p><div class="tscroll"><table class="tbl"><tr><th>Procedimento</th><th>Termo</th><th>Ações</th></tr>'
   +PROCS.map(([id,n,t])=>{const done=P.rx.some(r=>r.id===id),need=TERMO.includes(id),st=T[id];
     return'<tr><td>'+n+'<br><small>'+t+' min</small></td><td>'+(need?(st?(st.st==='assinado'?'assinado':'impresso, falta assinar'):'necessário'):'não exige')+'</td><td><div class="steps">'
      +(need&&!st?'<button class="btn sm" data-a="tprint:'+id+'">Imprimir termo '+tm(1)+'</button>':'')
      +(need&&st&&st.st!=='assinado'?'<button class="btn sm" data-a="tsign:'+id+':pac">Paciente assina</button><button class="btn sm" data-a="tsign:'+id+':aco">Acompanhante assina</button><button class="btn sm" data-a="tsign:'+id+':dig">Impressão digital</button>':'')
      +(done?'<span class="done">realizado</span>':'<button class="btn sm red" data-a="proc:'+id+'">Realizar</button>')+'</div></td></tr>'}).join('')+'</table></div>'
   +(ns?'<p class="msg">Paciente com alteração do nível de consciência: provavelmente não poderá assinar.</p>':'')+msgHtml()+'</div>'+'<div class="card2"><h4>Registro</h4>'+logL(P,['p'])+'</div>';
}
/* receitas e atestados */
function recHtml(P){
  const Dc=UI.doc,RI=UI.ri,home=Object.keys(DRUGS).filter(k=>{const v=DRUGS[k].v;return(v.includes('VO')||v.includes('Inalatória')||k==='benza')&&!HEMO.includes(k)&&v[0]!=='Solicitação'&&v[0]!=='Procedimento'&&k!=='o2'}).sort((a,b)=>DRUGS[a].n.localeCompare(DRUGS[b].n,'pt'));
  const D=DRUGS[RI.drug];
  let h='<div class="card2"><h4>Novo documento</h4><div class="fgrid"><label class="f">Tipo de documento<select data-s="doc:type">'+DOCS.map(([k,n])=>'<option value="'+k+'"'+(Dc.type===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label></div>';
  if(Dc.type==='rec'){h+='<div class="fgrid" style="margin-top:6px"><label class="f">Medicamento<select data-s="ri:drug"><option value="">— escolha —</option>'+home.map(k=>'<option value="'+k+'"'+(RI.drug===k?' selected':'')+'>'+DRUGS[k].n+'</option>').join('')+'</select></label>'
    +(D?'<label class="f">Dose<select data-s="ri:dose">'+D.d.map((d,i)=>'<option value="'+i+'"'+(+RI.dose===i?' selected':'')+'>'+esc(d)+'</option>').join('')+'</select></label><label class="f">Via<select data-s="ri:via">'+D.v.map((d,i)=>'<option value="'+i+'"'+(+RI.via===i?' selected':'')+'>'+d+'</option>').join('')+'</select></label>'
     +'<label class="f">Frequência<select data-s="ri:freq">'+Object.keys(FREQ).map(k=>'<option value="'+k+'"'+(RI.freq===k?' selected':'')+'>'+FREQ[k]+'</option>').join('')+'</select></label><label class="f">Duração<select data-s="ri:dur">'+Object.keys(DUR).map(k=>'<option value="'+k+'"'+(RI.dur===k?' selected':'')+'>'+DUR[k]+'</option>').join('')+'</select></label>':'')+'</div>'
    +'<div class="row"><button class="btn" data-a="radd"'+(D?'':' disabled')+'>Adicionar à receita</button></div>'
    +(Dc.items.length?'<ul class="cart">'+Dc.items.map((it,i)=>'<li><span>'+esc(DRUGS[it.drug].n+' '+DRUGS[it.drug].d[it.dose]+' '+DRUGS[it.drug].v[it.via]+' '+FREQ[it.freq].toLowerCase()+' por '+DUR[it.dur].toLowerCase())+'</span><button class="btn sm" data-a="rrem:'+i+'">🗑 excluir</button></li>').join('')+'</ul>':'')}
  if(Dc.type==='ate')h+='<label class="f" style="margin-top:6px">Dias de afastamento<select data-s="doc:dias"><option value="">—</option>'+['1','2','3','5','7','10','14'].map(x=>'<option'+(Dc.dias===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label>';
  if(Dc.type==='enc')h+='<label class="f" style="margin-top:6px">Encaminhar para<select data-s="doc:dest"><option value="">—</option>'+RET.map(([k,n])=>'<option value="'+k+'"'+(Dc.dest===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label>';
  h+=msgHtml()+'<div class="row"><button class="btn red" data-a="docsave">Salvar e imprimir para carimbo '+tm(1)+'</button></div></div>';
  h+='<div class="card2"><h4>Documentos emitidos</h4>'+((P.docs||[]).length?'<ul class="qa">'+P.docs.map(d=>'<li><b>'+fmt(d.t)+' · '+esc(d.title)+'</b><br>'+(d.type==='rec'?d.items.map(it=>esc(DRUGS[it.drug].n+' '+DRUGS[it.drug].d[it.dose])).join('; '):d.type==='ate'?d.dias+' dia(s)':d.type==='enc'?esc((RET.find(x=>x[0]===d.dest)||[0,''])[1]):'')+'</li>').join('')+'</ul>':'<p style="margin:0">Nenhum documento.</p>')+'</div>';
  return h;
}
/* pedir ajuda */
function ajuHtml(P){
  const card=(w,t,d)=>{const S=helpState(P,w),H=(P.help||{})[w];return'<div class="card2"><h4>'+t+'</h4><p style="margin:0 0 6px">'+d+'</p>'
    +(H?(H.done?'<p class="msg">Respondido. Veja abaixo.</p>':'<p class="msg">Aguardando resposta (por volta de '+fmt(H.at)+').</p>'):S.no?'<p class="msg err">'+esc(S.no)+'</p>':'<button class="btn" data-a="help:'+w+'">'+(w==='r1'?'Mandar mensagem':'Perguntar')+'</button>')+'</div>'};
  return'<div class="two even">'+card('r1','R2 / R3 (WhatsApp)','Conte o caso para um residente mais velho e pergunte o que pode ser. Ele erra às vezes.')+card('enf','Enfermagem','Pergunte o que a enfermeira acha do quadro.')+'</div>'+card('tec','Técnicas de enfermagem (feridas e lesões)','Para cuidado de feridas, picadas e lesões de pele.')
   +msgHtml()+'<div class="card2"><h4>Respostas</h4>'+logL(P,['h'],'Nenhuma resposta ainda.')+'</div>'
   +'<p style="margin:0;color:#3b5a73">Dificuldade: '+difOf().n+'. A ajuda depende de quem está disponível; nenhuma resposta substitui o seu raciocínio.</p>';
}
/* destino e alta */
function desHtml(P){
  const info=k=>P.c.visit&&((k==='ENF'&&turnOf()==='enf')||(k==='UTI'&&turnOf()==='uti'))?'segue no leito '+esc(leitoOf(P)):k==='UTI'?bedFree('uti')+' livres':k==='ENF'?bedFree('enf')+' livres':k==='OBS'?bedFree('obs')+' livres':k==='AMA'?bedFree('ama')+' livres':k==='ALTA'?'liberar o paciente':k==='EMG'?(turnOf()==='porta'?'colega da sala vermelha':'manter monitorizado'):'regulação ~60-100 min';
  const home=P.rx.filter(r=>r.home||(DRUGS[r.id]&&!isEVrx(DRUGS[r.id],r.via)&&DRUGS[r.id].v[0]!=='Solicitação'&&r.id!=='o2'&&r.dur!=='u'));
  let h=(window.visitHint?visitHint(P):'')+'<div class="dests">'+(window.destList?destList(P):DESTS).map(([k,n])=>{const dis=(k==='UTI'&&bedFree('uti')<=0)||(k==='ENF'&&bedFree('enf')<=0)||(k==='OBS'&&bedFree('obs')<=0)||(k==='AMA'&&bedFree('ama')<=0);
    return'<button class="dest dest2" data-a="dest:'+k+'" aria-pressed="'+(UI.destSel===k)+'"'+(dis?' disabled':'')+'>'+n+'<small>'+(dis?'lotado':info(k))+'</small></button>'}).join('')+'</div>';
  if(UI.destSel==='ALTA'){h+='<div class="card2"><h4>Alta médica</h4><p style="margin:0 0 6px">Antes: evolução de alta, receitas para casa, atestado e encaminhamento (guia Receitas e atestados), orientações.</p><div class="orient">'+ORIENT.map(([k,n])=>'<label class="orient2"><input type="checkbox" data-s="or" value="'+k+'"'+(P.orient.has(k)?' checked':'')+'> '+n+'</label>').join('')+'</div>'
    +'<label class="f" style="margin-top:6px">Retorno<select data-s="ret"><option value="">— escolha —</option>'+RET.map(([k,n])=>'<option value="'+k+'"'+(P.ret===k?' selected':'')+'>'+n+'</option>').join('')+'</select></label>'
    +'<p style="margin:6px 0 0"><b>Receita:</b> '+((P.docs||[]).some(d=>d.type==='rec')?'emitida':'<span class="warn">nenhuma receita emitida</span>')+' · <b>Evolução de alta:</b> '+((P.evos||[]).some(e=>e.type==='alta')?'registrada':'<span class="warn">não registrada</span>')+'</p>'
    +(home.length?'<p style="margin:4px 0 0">Para casa: '+home.map(r=>esc(DRUGS[r.id].n)).join(', ')+'</p>':'')+'</div>'}
  return h+msgHtml()+'<div class="row"><button class="btn red" data-a="commit"'+(UI.destSel?'':' disabled')+'>Carimbar e despachar</button><button class="btn amber" data-a="wait:5">Aguardar 5 min</button></div>';
}

/* ---------- guia Monitor: monitor multiparamétrico e dispositivos ---------- */
function monHtml(P){
  const mon=P.mov&&P.mov.mon!=null,v=vitNow(P),pa=P.nibp?P.nibp.v:v[0],ab=(i,x)=>vAbn(i,x)?' alarm':'';
  let h='<div class="monx"><div class="mwave"><div class="mlab">II</div><canvas id="ecgc" width="600" height="110"></canvas><div class="mlab c2">Pleth</div><canvas id="plc" width="600" height="60"></canvas><div class="mlab c3">Resp</div><canvas id="rsc" width="600" height="46"></canvas></div>'
   +'<div class="mnum">'+(mon?'<div class="mn g'+ab(1,v[1])+'"><span>FC</span><b>'+v[1]+'</b><small>bpm</small></div><div class="mn c'+ab(3,v[3])+'"><span>SpO2</span><b>'+v[3]+'</b><small>%</small></div>'
     +'<div class="mn w'+ab(0,pa)+'"><span>PNI '+(P.nibp?fmt(P.nibp.t):'')+'</span><b class="pa">'+pa+'</b><small>mmHg · ciclo 15 min</small></div><div class="mn y'+ab(2,v[2])+'"><span>FR</span><b>'+v[2]+'</b><small>irpm</small></div><div class="mn o'+ab(4,v[4])+'"><span>Temp</span><b>'+v[4]+'</b><small>°C</small></div>'
     :'<div class="mn off"><b>MONITOR DESLIGADO</b><small>Monitorize na Beira-leito (2 min) para ver as curvas e os números em tempo real.</small></div>')+'</div></div>';
  if(mon)h+='<div class="row" style="margin:0"><button class="btn" data-a="nibp">Medir PA agora '+tm(.5)+'</button><span style="color:#3b5a73">Os números mudam com o tempo e com o efeito das medicações.</span></div>';
  else h+='<div class="row" style="margin:0"><button class="btn" data-a="mov:mon">Monitorizar '+tm(2)+'</button></div>';
  const A=P.acc;
  h+='<div class="two even"><div class="card2"><h4>Acesso venoso</h4>'+(A?'<p style="margin:0">'+A.tipo+' '+A.cal+' em '+A.local+', puncionado às '+fmt(A.t)+'.</p><p style="margin:4px 0">Estado: <b class="'+(A.st==='pérvio'?'good':'warn')+'">'+A.st.toUpperCase()+'</b>'+(A.st==='flebite'?' (dor e hiperemia: trocar)':A.st==='perdido'?' (bombas e medicações EV paradas)':'')+'</p>':'<p style="margin:0">Sem acesso venoso.</p>')
   +(P.rx.some(r=>r.id==='cvc')?'<p style="margin:4px 0">Cateter venoso central em veia jugular interna direita: pérvio.</p>':'')
   +'<div class="row" style="margin:4px 0 0"><button class="btn" data-a="acc">'+(A?'Puncionar novo acesso':'Puncionar acesso')+' '+tm(3)+'</button></div></div>';
  const o2=P.rx.find(r=>r.id==='o2'),sv=P.rx.some(r=>r.id==='svd'||r.id==='sonda'),sng=P.rx.some(r=>r.id==='sne'||r.id==='sne2'),d=P.diu||[];
  const lastH=d.filter(x=>x[0]>G.t-60).reduce((a,x)=>a+x[1],0),tot=d.reduce((a,x)=>a+x[1],0);
  h+='<div class="card2"><h4>Outros dispositivos</h4><ul class="cart">'
   +'<li><span>Oxigênio</span><span>'+(o2?esc(DRUGS.o2.d[o2.i]):'ar ambiente')+'</span></li>'
   +'<li><span>Sonda vesical</span><span>'+(sv?'SVD em sistema fechado · diurese '+Math.round(lastH)+' mL na última hora ('+Math.round(tot)+' mL desde a passagem)':'não')+'</span></li>'
   +'<li><span>Sonda gástrica ou enteral</span><span>'+(sng?'posicionada, aberta em frasco':'não')+'</span></li>'
   +'<li><span>Isolamento</span><span>'+(P.mov&&P.mov.iso?ISO.find(x=>x[0]===P.mov.iso)[1]:'não')+'</span></li>'
   +'<li><span>Dieta</span><span>'+(P.mov&&P.mov.jej!=null?'zero':'liberada')+'</span></li></ul></div></div>';
  const B=P.rx.map((r,i)=>[r,i]).filter(([r])=>r.bic&&!FLUID.includes(r.id));
  h+='<div class="card2"><h4>Bombas de infusão (programadas pela enfermagem ao instalar)</h4>'+(B.length?B.map(([r,i])=>{const st=r.adm>G.t?'instalando até '+fmt(r.adm):r.bic.done?'terminou':!accOk(P)?'PARADA: sem acesso':r.ccih?'aguardando CCIH':r.bic.run?'infundindo':'PAUSADA';
    return'<div class="bic"><div class="bicl"><b>'+DRUGS[r.id].n+'</b><small>'+esc(r.bic.sol)+'</small><small>'+st+' · infundido '+Math.round(r.bic.vol)+' mL'+(+r.bic.hrs?' · por '+r.bic.hrs+' h':' · contínuo')+'</small></div><div class="bicr"><button class="btn sm" data-a="bic:'+i+':-1" aria-label="Diminuir vazão">−</button><span class="lcd2">'+r.bic.rate+'<small>mL/h</small></span><button class="btn sm" data-a="bic:'+i+':1" aria-label="Aumentar vazão">+</button><button class="btn sm" data-a="bict:'+i+'">'+(r.bic.run?'Pausar':'Retomar')+'</button></div></div>'}).join(''):'<p style="margin:0">Nenhuma bomba. Prescreva com frequência "Bomba de infusão contínua (BIC)".</p>')+'</div>';
  const F=P.rx.map((r,i)=>[r,i]).filter(([r])=>r.flu||(r.bic&&FLUID.includes(r.id)));
  h+='<div class="card2"><h4>Soros</h4>'+(F.length?'<div class="bottles">'+F.map(([r,i])=>{const isB=!!r.bic,vol=isB?500:r.flu.vol,inf=isB?r.bic.vol%500:r.flu.inf,left=Math.max(0,Math.round(vol-inf)),rate=isB?r.bic.rate:r.flu.rate,done=!isB&&r.flu.inf>=r.flu.vol;
    const end=rate?G.t+left/rate*60:G.t;return'<div class="btl"><div class="glass"><i style="height:'+Math.round(left/vol*100)+'%"></i></div><div><b>'+DRUGS[r.id].n+'</b><small>'+(done?'terminou ('+vol+' mL infundidos)':'restam '+left+' de '+vol+' mL · '+rate+' mL/h'+(r.adm>G.t?' · instalando':'')+(!accOk(P)?' · PARADO (sem acesso)':' · termina ~'+fmt(end)))+(isB?' · '+((r.bic.fr||0)+1)+'º frasco':'')+'</small>'+(isB?'<div class="row" style="margin:2px 0 0"><button class="btn sm" data-a="bic:'+i+':-1">−</button><button class="btn sm" data-a="bic:'+i+':1">+</button></div>':'')+'</div></div>'}).join('')+'</div>':'<p style="margin:0">Nenhum soro correndo.</p>')+'</div>'+msgHtml();
  return h;
}
/* curvas do monitor (animação contínua; os números mudam só com o tempo do jogo) */
function drawMon(){
  const P=cur(),a=$('#ecgc'),b=$('#plc'),c=$('#rsc');if(!P||!a)return;const mon=P.mov&&P.mov.mon!=null,v=vitNow(P),now=performance.now();
  const draw=(cv,col,per,shape,amp)=>{const X=cv.getContext('2d');if(!X)return;const W=cv.width,H=cv.height;X.fillStyle='#050a07';X.fillRect(0,0,W,H);X.strokeStyle=col;X.lineWidth=2;X.beginPath();
    for(let x=0;x<W;x++){const tau=now-(W-x)*8,ph=((tau%per)+per)%per/per,y=mon?shape(ph):0;const yy=H/2-y*amp;x?X.lineTo(x,yy):X.moveTo(x,yy)}X.stroke()};
  const ecg=p=>p<.08?Math.sin(p/.08*Math.PI)*.12:p<.14?0:p<.16?-.15:p<.19?1:p<.22?-.35:p<.3?0:p<.45?Math.sin((p-.3)/.15*Math.PI)*.25:0;
  const ple=p=>p<.25?Math.sin(p/.25*Math.PI/2):p<.45?1-(p-.25)/.2*.55+(p>.35&&p<.42?.12:0):.45*(1-(p-.45)/.55);
  const rsp=p=>Math.sin(p*2*Math.PI)*.8;
  draw(a,'#3ef07a',60000/Math.max(20,v[1]),ecg,42);draw(b,'#39d4f0',60000/Math.max(20,v[1]),ple,24);draw(c,'#f0d23a',60000/Math.max(4,v[2]),rsp,18);
}
setInterval(drawMon,80);
