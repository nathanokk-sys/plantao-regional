/* ===== GERADOR LOCAL DE PACIENTES (roda só no navegador, sem IA) =====
 Cada plantão sorteia 9 modelos de caso (prioriza os que você ainda não viu) e cria uma pessoa nova para cada um:
 nome inédito, idade, sexo, município, ocupação, rosto, sinais vitais levemente diferentes e, às vezes, uma alergia. */
const pickOf=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const rr=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const NF=['Maria','Josefa','Antônia','Francisca','Raimunda','Cícera','Luzia','Damiana','Rosângela','Ivonete','Edileuza','Marinalva','Aparecida','Socorro','Conceição','Joana','Valdirene','Lucineide','Gilvanete','Rita','Severina','Terezinha','Jailma','Andreia','Patrícia','Juliana','Camila','Daiane','Tainá','Larissa','Kelly','Vitória','Bruna','Elaine','Rosilda','Zuleide','Neide','Iracema','Edinalva','Benedita','Quitéria','Lindalva','Geane','Mirian','Tatiane','Natália','Jaqueline','Gleice'];
const NM=['José','João','Antônio','Francisco','Manoel','Raimundo','Sebastião','Cícero','Luiz','Paulo','Edvaldo','Gilberto','Valdemir','Josivaldo','Genival','Damião','Severino','Expedito','Reginaldo','Adailton','Erivaldo','Joelson','Wellington','Cleiton','Rafael','Lucas','Mateus','Diego','Jefferson','Anderson','Alisson','Ítalo','Wesley','Gabriel','Davi','Ronaldo','Valmir','Zé Carlos','Natanael','Josué','Ademir','Edinaldo','Gerson','Moisés','Benedito','Osvaldo','Juvenal','Elias'];
const SOB=['Silva','Santos','Oliveira','Souza','Pereira','Lima','Ferreira','Alves','Rodrigues','Gomes','Ribeiro','Carvalho','Araújo','Barbosa','Nascimento','Cavalcanti','Rocha','Dias','Moura','Menezes','Brandão','Coelho','Amorim','Bezerra','Torres','Nunes','Freitas','Andrade','Campos','Gonçalves','Macedo','Feitosa','Sampaio','Teixeira','Bispo','Conceição','Jesus','Matos','Leite','Aragão','Batista','Nogueira','Pinheiro','Sá','Viana','Xavier','Lacerda','Damasceno','Calixto','Brito'];
const MUNS=['Juazeiro (BA)','Petrolina (PE)','Casa Nova (BA)','Sobradinho (BA)','Remanso (BA)','Sento Sé (BA)','Curaçá (BA)','Uauá (BA)','Campo Formoso (BA)','Senhor do Bonfim (BA)','Jaguarari (BA)','Pilão Arcado (BA)','Lagoa Grande (PE)','Santa Maria da Boa Vista (PE)','Afrânio (PE)','Dormentes (PE)','Cabrobó (PE)','Orocó (PE)','Ouricuri (PE)','Araripina (PE)','Salgueiro (PE)','Canudos (BA)','Pindobaçu (BA)'];
const OCUP={jovem:[['Estudante','Estudante'],['Ajudante de pedreiro','Atendente de loja'],['Entregador','Manicure'],['Estudante de curso técnico','Estudante de curso técnico']],
  adulto:[['Agricultor','Agricultora'],['Vendedor de frutas','Feirante'],['Motorista de aplicativo','Professora'],['Pescador','Merendeira'],['Pedreiro','Agente comunitária de saúde'],['Mototaxista','Cozinheira'],['Vigilante','Trabalhadora da fruticultura'],['Caminhoneiro','Doméstica'],['Comerciante','Costureira'],['Vaqueiro','Cabeleireira']],
  idoso:[['Aposentado','Aposentada'],['Lavrador aposentado','Lavradora aposentada'],['Aposentado, ex-pescador','Aposentada, ex-costureira']]};
const CLOTH=['#3d5a80','#8a4b5e','#4f6b43','#9a8f6a','#5b4a3a','#8c3f4f','#46586a','#6b4a4a','#7a6a46','#58506b','#a3834f','#2f6670','#7d8286','#a0522d'];
const ALTXT={penic:['Penicilina. Fiquei todo empolado e com falta de ar.','Anafilaxia por antibiótico da classe da penicilina: edema de glote e broncoespasmo.'],
  dipi:['Dipirona. Minha boca inchou da última vez.','Angioedema e hipotensão por dipirona.'],
  aine:['Anti-inflamatório. O diclofenaco me deu crise de falta de ar.','Broncoespasmo grave por anti-inflamatório.'],
  sulfa:['Sulfa. Deu bolha na pele toda.','Farmacodermia grave por sulfa.']};
/* troca de gênero nos textos quando o modelo aceita os dois sexos */
const GW=[['Ele','Ela'],['ele','ela'],['prostrado','prostrada'],['Prostrado','Prostrada'],['orientado','orientada'],['Orientado','Orientada'],['desorientado','desorientada'],['Desorientado','Desorientada'],['lúcido','lúcida'],['Lúcido','Lúcida'],['sonolento','sonolenta'],['Sonolento','Sonolenta'],['ansioso','ansiosa'],['Ansioso','Ansiosa'],['agitado','agitada'],['Agitado','Agitada'],['corado','corada'],['descorado','descorada'],['Emagrecido','Emagrecida'],['taquicárdico','taquicárdica'],['bradicárdico','bradicárdica'],['dispneico','dispneica'],['taquipneico','taquipneica'],['hipotenso','hipotensa'],['cansado','cansada'],['fraco','fraca'],['desperto','desperta'],['confuso','confusa'],['Calmo','Calma'],['internado','internada'],['Anticoagulado','Anticoagulada'],['conversando','conversando'],['Atropinizado','Atropinizada'],['descontaminado','descontaminada'],['estável','estável']];
const GRX=GW.map(([m,f])=>[new RegExp('(?<![\\p{L}])'+m+'(?![\\p{L}])','gu'),f]);
function genderSwap(s){if(typeof s!=='string')return s;GRX.forEach(([r,f])=>{s=s.replace(r,f)});return s}
function loadH(){try{const h=JSON.parse(localStorage.getItem('pr_hist')||'{}');return{n:h.n||[],t:h.t||[]}}catch(e){return{n:[],t:[]}}}
function saveH(h){try{localStorage.setItem('pr_hist',JSON.stringify({n:h.n.slice(-3000),t:h.t.slice(-80)}))}catch(e){}}
function newName(sx,H,taken){
  for(let i=0;i<400;i++){
    const f=pickOf(sx==='F'?NF:NM);if(taken.has(f))continue;
    const a=pickOf(SOB),b=pickOf(SOB);if(a===b)continue;
    const n=f+' '+a+' '+b;if(!H.n.includes(n)){taken.add(f);return n}
  }
  return pickOf(sx==='F'?NF:NM)+' '+pickOf(SOB)+' '+pickOf(SOB)+' '+pickOf(SOB);
}
function jit(v){const[s,d]=String(v[0]).split('/').map(Number);const j=rr(-6,6),k=rr(-4,4);
  return[(s+j)+'/'+Math.max(30,d+k),Math.max(25,v[1]+rr(-4,4)),Math.max(4,v[2]+rr(-1,1)),Math.min(100,Math.max(50,v[3]+rr(-1,1))),Math.round((v[4]+rr(-2,2)/10)*10)/10]}
function vary(tpl,i,H,taken){
  const c=JSON.parse(JSON.stringify(tpl));c.base=tpl.id;c.id=tpl.id+'_'+Date.now().toString(36)+i;
  const sx=!tpl.sexo||tpl.sexo==='*'?(Math.random()<.5?'F':'M'):tpl.sexo;c.sexo=sx;
  const ar=tpl.ageR||[Math.max(16,tpl.idade-8),tpl.idade+8];c.idade=Math.max(16,rr(ar[0],ar[1]));
  const oldFirst=tpl.nome?tpl.nome.split(' ')[0]:null;c.nome=newName(sx,H,taken);const first=c.nome.split(' ')[0];
  c.mun=pickOf(MUNS);
  const band=c.idade<=22?'jovem':c.idade>=66?'idoso':'adulto';c.ocup=tpl.ocups?pickOf(tpl.ocups):pickOf(OCUP[band])[sx==='F'?1:0];
  const fix=s=>{if(typeof s!=='string')return s;s=s.split('{N}').join(first);if(oldFirst)s=s.split(oldFirst).join(first);if(sx==='F'&&tpl.sexo==='*')s=genderSwap(s);return s};
  ['ok','part','bad','obito'].forEach(k=>{c.out[k]=fix(c.out[k])});c.queixa=fix(c.queixa);c.ensina=fix(c.ensina);
  if(sx==='F'&&tpl.sexo==='*'){Object.keys(c.ex).forEach(k=>c.ex[k]=fix(c.ex[k]));Object.keys(c.reav).forEach(k=>c.reav[k]=fix(c.reav[k]));c.perg=c.perg.map(p=>[fix(p[0]),fix(p[1]),p[2]]);c.comorb=fix(c.comorb)}
  Object.keys(c.vit).forEach(k=>{c.vit[k]=jit(c.vit[k])});
  /* alergia sorteada: nunca à classe de uma conduta crítica, para o caso continuar tratável */
  if(!c.alergia.length&&Math.random()<.3){
    const keyAl=new Set(c.key.flatMap(k=>k.ids).map(id=>DRUGS[id].al).filter(Boolean));
    const opts=ALERG.filter(a=>!keyAl.has(a));
    if(opts.length){const a=pickOf(opts);c.alergia=[a];c.alergiaTxt=ALTXT[a][0];c.alergiaMsg=ALTXT[a][1]}
  }
  const old=c.idade>=62,mid=c.idade>=45;
  const hairs=['#1a1410','#2b2018','#47301f','#6a4a2a','#8b6a38','#1a1410','#2b2018'];
  const rural=/Lavrador|Vaqueiro|Agricultor|Agricultora|Pescador|povoado/i.test(c.ocup)||tpl.hat;
  c.look={skin:rr(0,5),hair:old?pickOf(['#d8d6d0','#b5b0a8','#e6e4de','#9a958e']):mid&&Math.random()<.4?'#77726c':pickOf(hairs),
    hs:sx==='F'?pickOf(['long','bun','short','curly','long']):rural&&Math.random()<.7?'hat':pickOf(mid?['short','buzz','bald','curly','short']:['short','buzz','curly','short']),
    beard:sx==='M'?pickOf(['none','none','stubble','full','mustache']):'none',glasses:mid&&Math.random()<.4,cloth:pickOf(CLOTH)};
  return c;
}
function procStart(){
  const H=loadH(),last={};H.t.forEach((t,i)=>{last[t]=i});
  const order=shuffle(CASES.slice()).sort((a,b)=>(last[a.id]==null?-1:last[a.id])-(last[b.id]==null?-1:last[b.id]));
  const pick=shuffle(order.slice(0,G.slots.length));
  const g=pick.findIndex(c=>c.tri==='VERMELHO'||c.tri==='LARANJA');if(g>0)[pick[0],pick[g]]=[pick[g],pick[0]];
  const taken=new Set();
  pick.forEach((tpl,i)=>{const c=vary(tpl,i,H,taken);H.n.push(c.nome);H.t.push(tpl.id);admit(c,i)});
  saveH(H);
}
