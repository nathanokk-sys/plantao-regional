/* ===== Parte 10: suspender prescrição, isolamento, paciente mandado pelo colega, desfechos por turno ===== */
function suspRx(P,idx){
  const r=P.rx[idx];if(!r)return'Prescrição não encontrada.';const D=DRUGS[r.id];
  P.rx.splice(idx,1);(P.rxOff=P.rxOff||[]).push(Object.assign({},r,{off:G.t}));
  /* tratamento contínuo interrompido deixa de contar como feito */
  if(r.freq!=='u')P.c.key.forEach((k,ki)=>{if(k.ids.includes(r.id)&&P.ks[ki]!=null&&!P.rx.some(x=>k.ids.includes(x.id)&&okIdx(k,x.id).includes(x.i))){P.ks[ki]=null}});
  if(P.ksPend)P.ksPend=P.ksPend.filter(x=>!(x.ccih&&P.c.key[x.ki].ids.includes(r.id)));
  P.log.push({t:G.t,k:'m',q:'Prescrição',a:D.n+': suspenso.',fresh:1});
  return null;
}
function doIso(P,k){
  const it=ISO.find(x=>x[0]===k);if(!it)return null;
  if(P.mov.iso===k){delete P.mov.iso;P.log.push({t:G.t,k:'m',q:'Enfermagem',a:'Isolamento suspenso.',fresh:1});return null}
  P.mov.iso=k;P.log.push({t:G.t,k:'m',q:'Enfermagem',a:it[2]+': paciente no leito de isolamento, com placa e EPI na porta.',fresh:1});return null;
}
function isoHtml(P){
  const m=P.mov||{};
  return'<p class="sub" style="margin:8px 0 4px">Isolamento (1 min e EPI; toque de novo para suspender)</p><div class="grid mov">'+ISO.map(([k,n])=>'<button class="btn paper opt'+(m.iso===k?' on':'')+'" data-a="mov:'+k+'">'+n[0].toUpperCase()+n.slice(1)+'<small>'+(m.iso===k?'ativo':movCostTxt(k))+'</small></button>').join('')+'</div>';
}
/* o colega do outro posto manda um paciente de verdade para a sua fila */
function extraPt(posto){
  const pool=poolFor(posto==='porta'?'porta':'sala');if(!pool.length)return null;
  const H=loadH(),taken=new Set(G.pts.map(p=>p.c.nome.split(' ')[0]));
  const c=vary(pickOf(pool),G.slots.length,H,taken);H.n.push(c.nome);H.t.push(c.base);saveH(H);
  c.arr=G.t;G.slots.push(G.t);admit(c,G.slots.length-1);return c.nome.split(' ')[0];
}
/* desfechos que aconteceram desde o último relatório */
function shiftOutcomes(){
  if(!W||!G||!G.week)return'';
  const L=G.mode==='visit'?W.done.slice(W.mark||0):[],inp=W.inp;
  if(!L.length&&!inp.length)return'';
  const desc=R=>R.sector==='UTI'?'na UTI':R.trend>=1?'melhorando':R.trend<=-2?'grave':R.trend<0?'pior':'estável';
  return'<p class="sub">Seus pacientes: o que aconteceu</p><div class="rep">'
   +L.map(x=>'<div class="rp"><h4><span>'+esc(x.nome)+', '+x.idade+'</span><span class="tag t-'+(/^Óbito/.test(x.out)?'obito':/insegura|precoce/.test(x.out)?'ruim':/^Alta/.test(x.out)?'otimo':'pend')+'">'+esc(x.out.toUpperCase())+'</span></h4>'
     +'<div style="color:var(--ink2);font-size:18px">'+x.path.map(esc).join(' → ')+'</div>'
     +(x.could.length?'<div style="font-size:18px"><b>Nesse caso, poderia ter feito:</b></div><ul class="warn">'+[...new Set(x.could)].slice(0,7).map(e=>'<li>'+esc(e)+'</li>').join('')+'</ul>':'')+'</div>').join('')
   +(inp.length?'<div class="rp"><h4><span>Seguem internados</span></h4><ul>'+inp.map(R=>'<li>'+esc(R.nome)+', '+R.idade+' · '+SECN[R.sector]+' · D'+R.hd+(G.mode==='visit'?' · '+desc(R):R.hd===1&&R.adm.day===W.day?' · internado esta noite':'')+'</li>').join('')+'</ul></div>':'')
   +'</div>';
}
