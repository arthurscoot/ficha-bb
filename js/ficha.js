// Brasas e Brasões · Ficha de Personagem · lógica da ficha
(function(){
const D=window.DADOS;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ASP={Brutalista:{vida:8,cor:'var(--bru)',pass:'+1 DA por rodada. Estojo abaixo de 10 recebe +1 dado. Ao chegar a 20, o estojo zera.'},
  'Lâmina':{vida:8,cor:'var(--lam)',pass:'+1 DD por rodada. Estojo esvaziado recebe o dobro na rodada seguinte.'},
  Vidente:{vida:10,cor:'var(--vid)',pass:'DM até 10, usável a qualquer momento. Estojo com 10 ou mais não recebe dados por rodada.'}};
const ASPX={Brutalista:{tag:'Acumula até o limite e encerra o combate em um único movimento.',pas:'+1 DA por rodada. Enquanto um estojo de combate estiver abaixo da metade da capacidade (10), recebe +1 dado por rodada nele; a partir daí, recebe normalmente. O bônus não se aplica aos dados da primeira rodada. Se atingir o máximo (20), todos os dados daquele estojo são perdidos e ele retorna a zero.',como:'O Brutalista acumula o maior número possível de dados para utilizar habilidades de custo elevado e efeito duradouro. Seus estojos enchem rapidamente no início do combate e desaceleram depois da metade; com catorze ou quinze dados acumulados, é capaz de eliminar um adversário. O risco está em ultrapassar o limite e perder tudo, de modo que o momento ideal para agir é imediatamente antes do transbordo.'},
 'Lâmina':{tag:'Constante e resistente. Dificilmente derrubado, raramente sem recursos.',pas:'+1 DD por rodada. Se um estojo de combate for esvaziado, na rodada seguinte o personagem recebe o dobro de dados naquele estojo.',como:'O Lâmina é o Aspecto de aprendizado mais simples. Suas habilidades são de baixo custo, seu dano é constante embora moderado, e dispõe de diversas respostas contra condições. É o personagem que menos sofre com a falta de dados, uma vez que gastar tudo é recompensado. Isoladamente não produz resultados extraordinários, mas abre espaço para o Brutalista e converte em combinações os dados fornecidos pelo Vidente.'},
 Vidente:{tag:'Manipula os dados de todo o grupo. O mais exigente dos três.',pas:'O estojo Morto comporta até 10 dados, e o Vidente pode usar o Dado Morto a qualquer momento, mesmo que o estojo substituído não esteja vazio. Em contrapartida, quando um estojo de combate atinge a metade da capacidade (10), deixa de receber dados por rodada, podendo crescer apenas por meio de habilidades.',como:'O Vidente é o Aspecto mais complexo e o mais singular. É o único que trata todos os dados como um conjunto, operando sobre o máximo e o mínimo de cada estojo, e o único capaz de mover dados: entre os próprios estojos e para os aliados. Seu estilo se apoia no Dado Morto, na redistribuição e na escolha precisa do momento de gastar tudo de uma vez, seja para garantir um ataque contra um inimigo difícil, seja para fortalecer o grupo.'}};
const ORIG={Humano:{vida:10,traco:'Adaptável. No início de cada cena, pode transferir até 2 pontos de capacidade entre os estojos narrativos, até o fim da cena.'}};
const NARR=[['chama','Chama','Pelo que luta. Paga Golpes fora do combate; vira DA.','var(--da)'],['fumaca','Fumaça','O que teme. Paga Rolls fora do combate; vira DD.','var(--dd)'],['lume','Lume','O que o comove. Paga Pensamentos fora do combate; vira DE.','var(--de)']];
const TRT=[['marcante','MARCANTE','d8','d10'],['comum1','COMUM','d4','2d4'],['comum2','COMUM','d4','2d4'],['assumido','ASSUMIDO','d4','2d4']];
const HAB=Object.fromEntries(D.hab.map(h=>[h.nome,h]));
const ECO=Object.fromEntries(D.ecos.map(e=>[e.nome,e]));
const ARMA=Object.fromEntries(D.armas.map(a=>[a.nome,a]));
const KEY='brasas-fichas-v1';

function blank(){return{id:'f'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),nome:'',jogador:'',conceito:'',origem:'Humano',aspecto:'Lâmina',kit2:'Caçador da Fera',conto:'Comum',heranca:'',ancora:'',
 vAjuste:0,vDireto:0,fer:[],cap:{chama:5,fumaca:4,lume:5},cur:{chama:5,fumaca:4,lume:5},
 tracos:{chama:{},fumaca:{},lume:{}},comb:{on:false,rodada:0,DA:0,DD:0,DE:0,DM:0,vaz:{}},inic:'',brasa:'DA',
 conds:{},habs:[],ecos:[],arma:'Espada',brut:'0',armaOutra:'',itens:'',historia:'',culpas:'',notas:''}}
function exemplo(){const f=blank();Object.assign(f,{nome:'Rhaya',conceito:'Caçadora que conhece as feras que rondam o seu lar.',aspecto:'Lâmina',kit2:'Caçador da Fera',
 cap:{chama:5,fumaca:4,lume:5},cur:{chama:5,fumaca:4,lume:5},habs:['Rolamento','Ler o Golpe'],arma:'Finca de Árvore',
 tracos:{chama:{marcante:{t:'Protege quem não sabe se defender'},comum1:{t:'Teimosa até o fim'},comum2:{t:'Não deixa dívida sem pagar'}},
  fumaca:{marcante:{t:'Desconfia de cidades grandes'},comum1:{t:'Dorme com um olho aberto'},comum2:{t:'Odeia ficar presa'}},
  lume:{marcante:{t:'Conhece as feras que rondam o seu lar'},comum1:{t:'Lê o tempo pelo céu'},comum2:{t:'Curiosa com o que é antigo'}}},
 itens:'Arco curto, corda, ervas de cura, pele de inverno.',notas:'Ficha de exemplo, baseada na Rhaya do livro. Crie a sua em “Nova ficha”.'});return f}

let st={fichas:[],atual:null};
try{const r=localStorage.getItem(KEY);if(r)st=JSON.parse(r)}catch(e){}
if(!st.fichas||!st.fichas.length){const e=exemplo();st={fichas:[e],atual:e.id}}
let F=st.fichas.find(f=>f.id===st.atual)||st.fichas[0];
function fix(f){const b=blank();for(const k in b)if(f[k]===undefined)f[k]=b[k];for(const k of['chama','fumaca','lume'])f.tracos[k]=f.tracos[k]||{};f.comb.vaz=f.comb.vaz||{};return f}
st.fichas.forEach(fix);
function save(){st.atual=F.id;try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}

const epico=()=>F.conto!=='Comum';
function vidaMax(){let v=(ORIG[F.origem]?.vida||10)+ASP[F.aspecto].vida;if(epico())v+=ASP[F.aspecto].vida;if(F.habs.includes('Vidro Temperado'))v-=5;return v+(+F.vAjuste||0)}
function dmMax(){return F.aspecto==='Vidente'?10:5}
function espTotal(){let b=F.kit2==='Kit Próprio'?10:2;if(epico())b+=6;return b}
function culpaTotal(){let t=2;for(const k of['chama','fumaca','lume']){const tr=F.tracos[k];for(const[s]of TRT)if(tr[s]?.cor)t+=s==='marcante'?8:4}return t}
function kitHabs(){const k=D.hab.filter(h=>h.tipo==='kit'&&h.aspecto===F.aspecto);const s=F.kit2!=='Kit Próprio'?D.hab.filter(h=>h.grupo==='Sub-Aspecto · '+F.kit2):[];return[k,s]}

function opts(sel,list,val){sel.innerHTML=list.map(o=>{const[v,t]=Array.isArray(o)?o:[o,o];return`<option value="${esc(v)}"${v===val?' selected':''}>${esc(t)}</option>`}).join('')}
function pillCost(c){if(!c)return'';return c.split(' + ').map(p=>{const m=p.match(/\b(DA|DD|DE|DM)\b/);const k=m?{DA:'a',DD:'v',DE:'i',DM:'m'}[m[1]]:'';return`<span class="pill ${k}">${esc(p)}</span>`}).join(' ')}
function shape(cat){return`<svg class="shape" viewBox="0 0 60 60"><use href="#s-${cat}"/></svg>`}

function renderTop(){
 opts($('sel'),st.fichas.map(f=>[f.id,f.nome||'Sem nome']),F.id);
 $('hNome').textContent=F.nome||'Ficha de Personagem';
 $('hSub').textContent=[F.origem,F.aspecto,F.kit2,'Conto '+F.conto].filter(Boolean).join(' · ');
}
function renderIdent(){
 opts($('kit2'),D.subs.map(s=>[s.nome,`${s.nome} (afinidade ${s.afin})`]).concat([['Kit Próprio','Kit Próprio']]),F.kit2);
 const hs=['', ...new Set(D.hab.filter(h=>h.tipo==='heranca').map(h=>h.grupo.replace('Herança · ','')))];
 opts($('heranca'),hs.map(h=>[h,h||'Nenhuma']),F.heranca);
 opts($('arma'),[['','Sem arma da lista'],...D.armas.map(a=>a.nome)],F.arma);
 for(const el of document.querySelectorAll('[data-k]')){const v=F[el.dataset.k];if(el.tagName==='SELECT'&&el.id!=='kit2'&&el.id!=='heranca'&&el.id!=='arma')el.value=v??'';else if(el.tagName!=='SELECT')el.value=v??''}
 $('origemTraco').innerHTML=`<b>Traço da Origem.</b> ${esc(ORIG[F.origem]?.traco||'')}`;
}
function renderVida(){
 const mx=vidaMax(),sf=F.fer.reduce((a,f)=>a+(+f.g||0),0),disp=mx-(+F.vDireto||0)-sf;
 $('vidaCorpo').hidden=!F.heranca; $('vMax').textContent=mx;$('vDisp').textContent=disp;
 $('vidaNota').textContent=`${F.origem} ${ORIG[F.origem]?.vida} + ${F.aspecto} ${ASP[F.aspecto].vida}${epico()?' + Épico '+ASP[F.aspecto].vida:''}${F.habs.includes('Vidro Temperado')?' − 5 Vidro Temperado':''}`;
 $('ferList').innerHTML=F.fer.map((f,i)=>`<tr><td><input type="number" min="0" value="${esc(f.g)}" data-fer="${i}" data-f="g"></td><td><input value="${esc(f.d)}" data-fer="${i}" data-f="d" placeholder="Ex.: corte no braço, Sangrando 1"></td><td><button class="x" data-ferx="${i}" aria-label="Remover">×</button></td></tr>`).join('')||`<tr><td colspan="3" style="color:var(--mute);font-size:14px">Nenhum Ferimento.</td></tr>`;
}
function pips(n,on,color,attr,half){let h='';for(let i=0;i<n;i++)h+=`<button class="pip${i<on?' on':''}${half&&i===half-1?' half':''}" style="--pc:${color}" ${attr}="${i+1}" aria-label="${i+1}"></button>`;return h}
function renderNarr(){
 const tot=F.cap.chama+F.cap.fumaca+F.cap.lume,alvo=epico()?20:14,mx=epico()?12:8;
 const bad=NARR.some(([k])=>F.cap[k]<2||F.cap[k]>mx);
 $('capNota').innerHTML=`${tot} de ${alvo} pontos · mínimo 2, máximo ${mx} em cada ${tot===alvo&&!bad?'<span class="okt">✓</span>':'<span class="warnt">· confira</span>'}`;
 $('narr').innerHTML=NARR.map(([k,n,w,c])=>{
  const tr=F.tracos[k];
  return`<div class="estn"><div class="t"><span class="nm">${n.toUpperCase()}</span><span class="lbl">Cap.</span><input type="number" min="0" max="12" value="${F.cap[k]}" data-cap="${k}" aria-label="Capacidade de ${n}"></div>
  <p class="what">${w}</p>
  <div class="pips">${pips(F.cap[k],Math.min(F.cur[k],F.cap[k]),c,'data-narr-'+k)}</div>
  <div class="grp" style="margin-top:10px">Traços ${n==='Lume'?'do':'da'} ${n}</div>
  ${TRT.map(([s,l,d1,d2])=>{const t=tr[s]||{};return`<div class="tr${t.cor?' cor':''}"><span class="tg">${l}<b>${epico()?d2:d1}</b></span><input type="text" value="${esc(t.t)}" data-tr="${k}.${s}" data-f="t" placeholder="${s==='assumido'?'Vem de uma habilidade':'Frase sobre quem o personagem é'}" aria-label="Traço ${l}"><label title="Usado neste combate"><input type="checkbox" ${t.u?'checked':''} data-tr="${k}.${s}" data-f="u">usado</label><label title="Traço corrompido"><input type="checkbox" ${t.cor?'checked':''} data-tr="${k}.${s}" data-f="cor">corr.</label></div>`}).join('')}
 </div>`}).join('');
}
const CMB=[['DA','ATAQUE','var(--da)','var(--da-l)'],['DD','DEFESA','var(--dd)','var(--dd-l)'],['DE','ESTRATÉGIA','var(--de)','var(--de-l)'],['DM','MORTO','var(--dm)','var(--dm-l)']];
function renderComb(){
 const c=F.comb;
 $('rodada').textContent=c.on?`Rodada ${c.rodada}`:'Fora de combate';
 const ax=ASPX[F.aspecto],ab=$('aspBox');ab.style.setProperty('--ac',ASP[F.aspecto].cor);
 const wasOpen=ab.open;ab.innerHTML=`<summary><span class="an">${esc(F.aspecto.toUpperCase())}</span><span class="at">${esc(ax.tag)}</span><p class="ap"><b>Passiva principal.</b> ${esc(ax.pas)}</p><span class="more">Mostrar como o Aspecto joga ▾</span></summary><div class="body">${esc(ax.como)}</div>`;ab.open=wasOpen;
 $('brasaL').hidden=!epico();
 $('comb').innerHTML=CMB.map(([k,l,col,bg])=>{const mx=k==='DM'?dmMax():20;const v=Math.min(c[k],mx);
  const vz=F.aspecto==='Lâmina'&&k!=='DM'?`<button class="tag${c.vaz[k]?' on':''}" data-vaz="${k}" title="Esvaziado nesta rodada: recebe o dobro na próxima">esvaziado</button>`:'';
  const lk=lockedBy(k);
  return`<div class="estc${lk?' lock':''}" style="--pc:${col};--bgk:${bg}"><div class="t"><span>${l} · ${k}</span><b>${v}</b><span class="lbl">/&nbsp;${mx}</span>${lk?`<span class="lk">BLOQUEADO · ${esc(lk.toUpperCase())}</span>`:''}<span class="sp"></span>${vz}<span class="ctl"><button class="btn" data-dec="${k}" aria-label="Gastar 1 ${k}"${lk?' disabled':''}>−</button><button class="btn" data-inc="${k}" aria-label="Receber 1 ${k}">+</button></span></div>
  <div class="pips">${pips(mx,v,col,'data-cmb-'+k,mx===20?10:0).replace(/<button class="pip/g,lk?'<button disabled class="pip':'<button class="pip')}</div></div>`}).join('');
}
function renderConds(){
 const grupos=[...new Set(D.cond.map(c=>c.grupo))];
 $('conds').innerHTML=grupos.map(g=>`<div class="cgrp">${esc(g)}</div><div class="chips">${D.cond.filter(c=>c.grupo===g).map(c=>`<button class="chip${g==='Benefícios'?' ben':''}${F.conds[c.nome]?' on':''}" data-cond="${esc(c.nome)}" title="${esc(c.efeito)}">${esc(c.nome)}</button>`).join('')}</div>`).join('');
 const at=D.cond.filter(c=>F.conds[c.nome]);
 $('condAct').innerHTML=at.map(c=>`<div><b>${esc(c.nome.replace(' X',''))}</b>${/ X$/.test(c.nome)?`<input value="${esc(F.conds[c.nome].x||'')}" data-condx="${esc(c.nome)}" placeholder="X" aria-label="Valor">`:''} ${esc(c.efeito)}</div>`).join('');
}
function card(h,rm){
 const locked=h.epica&&!epico();
 const fr=h.traco?`<p class="fr"><span class="lbl">Traço da habilidade</span> <i>“${esc(h.traco.frase)}”</i> <span class="pill o">${esc(h.traco.custo)}</span> ${esc(h.traco.bonus)}</p>`:'';
 const u=useState(h);
 return`<div class="ab${u.cls}"${u.attr}><div class="h"><span class="nm">${shape(h.cat)}${esc(h.nome)}</span>${h.epica?'<span class="pill ep">ÉPICA</span>':''}${locked?'<span class="pill lock">liberada no Conto Épico</span>':''}${pillCost(h.custo)}${h.usado?`<span class="pill o">usado com ${esc(h.usado.replace(/^com /,''))}</span>`:''}${h.esp?`<span class="pill o">${h.esp} ${h.esp>1?'espaços':'espaço'}</span>`:''}${rm?`<button class="x" data-habx="${esc(h.nome)}" aria-label="Remover">×</button>`:''}</div>
 <p>${esc(h.efeito)}</p>${fr}${u.html}</div>`}
function renderHabs(){
 const[k,s]=kitHabs();
 const her=D.hab.filter(x=>x.tipo==='heranca'&&F.heranca&&x.grupo==='Herança · '+F.heranca);
 const used=F.habs.reduce((a,n)=>a+(HAB[n]?.esp||0),0)+(F.heranca?2:0),tot=espTotal();
 $('espBar').style.width=Math.min(100,used/tot*100)+'%';$('espBar').style.background=used>tot?'var(--warn)':'var(--rubro)';
 $('espTxt').textContent=`${used} / ${tot}`;
 $('espNota').textContent=F.kit2==='Kit Próprio'?`Kit Próprio: 10 espaços${epico()?' + 6 do Conto Épico':''}`:`Sub-Aspecto ocupa 8 de 10: sobram 2${epico()?' + 6 do Conto Épico':''}`;
 let h=`<div class="grp">Kit do Aspecto · ${esc(F.aspecto)}</div>`+k.map(x=>card(x)).join('');
 if(s.length)h+=`<div class="grp">Sub-Aspecto · ${esc(F.kit2)}</div>`+s.map(x=>card(x)).join('');
 if(her.length)h+=`<div class="grp">Herança · ${esc(F.heranca)} · entrada de 2 espaços, habilidades incluídas</div>`+her.map(x=>card(Object.assign({},x,{esp:0}))).join('');
 h+=`<div class="grp">${F.kit2==='Kit Próprio'?'Kit Próprio e avulsas':'Habilidades avulsas'}</div>`;
 h+=F.habs.map(n=>HAB[n]?card(HAB[n],true):'').join('')||`<p class="hint">Nenhuma habilidade avulsa ainda. Busque abaixo pelo nome.</p>`;
 $('habs').innerHTML=h;
 const pool=D.hab.filter(x=>x.tipo==='avulsa');
 $('habDL').innerHTML=pool.filter(x=>!F.habs.includes(x.nome)).map(x=>`<option value="${esc(x.nome)}">${esc(x.grupo.replace('Avulsa · ',''))} · ${x.esp} esp.</option>`).join('');
}
function renderEcos(){
 const used=F.ecos.reduce((a,n)=>a+(ECO[n]?.esp||0),0),tot=culpaTotal();
 $('culBar').style.width=Math.min(100,used/tot*100)+'%';$('culBar').style.background=used>tot?'var(--warn)':'var(--rubro)';
 $('culTxt').textContent=`${used} / ${tot}`;
 $('ecoNota').textContent=F.ancora?`Afinidade: ${F.ancora}`:'Sem Âncora de afinidade';
 const MP={'ataque':'DA','reação':'DD','estratégia':'DE'};
 $('ecos').innerHTML=F.ecos.map(n=>{const e=ECO[n];if(!e)return'';const af=F.ancora===e.ancora;
  const body=e.fracasso?`<p>${esc(e.texto)}</p>`:e.formas.map(f=>{const v=Math.max(0,f.valor-(af?1:0));const unit=f.forma==='Implantada'?'dados narrativos':MP[f.momento||e.momento];const us=f.forma==='Implantada'?{cls:'',attr:''}:ecoUse(e,f,v,MP[f.momento||e.momento]);return`<div class="forma${us.cls}"${us.attr}><b>${f.forma.toUpperCase()}</b> ${pillCost((f.forma==='Padrão'||f.forma==='Caótica'?'1 DM + ':'')+v+' '+unit)}${af&&f.valor>0?' <span class="pill o">−1 afinidade</span>':''} ${esc(f.texto)}</div>`}).join('');
  return`<div class="ab"><div class="h"><span class="nm">${e.momento?shape({ataque:'Golpe','reação':'Roll','estratégia':'Pensamento'}[e.momento]):''}${esc(e.nome)} <span class="anc">${esc(e.ancora.toUpperCase())}</span></span>${e.momento?`<span class="pill o">${esc(e.momento)}</span>`:''}<span class="pill o">${e.esp} ${e.esp===1?'espaço':'espaços'}</span><button class="x" data-ecox="${esc(n)}" aria-label="Remover">×</button></div>${body}</div>`}).join('')||`<p class="hint">Nenhum eco. Escolha abaixo.</p>`;
 opts($('ecoIn'),D.ecos.filter(e=>!F.ecos.includes(e.nome)).map(e=>[e.nome,`${e.nome} · ${e.ancora}${e.fracasso?'':' · '+e.esp+' esp.'}`]),'');
}
function renderArma(){
 const a=ARMA[F.arma];
 if(!a){$('armaInfo').innerHTML='';return}
 const b=+F.brut||0;
 $('armaInfo').innerHTML=`<p class="hint" style="margin-top:8px"><span class="pill o">${esc(a.uso)}</span> ${esc(a.prop)}</p><p class="hint"><b>Bônus de Aspecto:</b> ${esc(a.bonus)}</p>
 <div class="dmg">${a.dano.map((d,i)=>`<div class="${i===b?'on':''}"><small>BRUT. ${i}</small>${esc(d)}</div>`).join('')}</div>`;
}
function renderAll(){renderTop();renderIdent();renderVida();renderNarr();renderComb();renderConds();renderHabs();renderEcos();renderArma()}

function log(t){$('log').textContent=t}
const LOCKS={Tonto:['DA'],Premeditado:['DA'],Morrendo:['DA'],Desmaiado:['DA','DD','DE','DM']};
function lockedBy(k){if(!F.comb.on)return'';for(const c in LOCKS)if(F.conds[c]&&LOCKS[c].includes(k))return c;return''}
const GAIN={'Nascido na Paz':{DA:2,DD:2,DE:2},'Sadismo Reflexo':{DM:1}};
function costOf(s){const r={dice:{},all:null};if(!s||s==='sem custo')return r;
 const m=s.match(/todos os DM(?: · mín\. (\d+))?/);if(m){r.all=+(m[1]||1);return r}
 for(const p of s.split(' + ')){const q=p.match(/^(\d+) (DA|DD|DE|DM)$/);if(q)r.dice[q[2]]=(r.dice[q[2]]||0)+ +q[1]}return r}
function plan(cost){const c=F.comb,sp={};let dm=0;
 if(cost.all!=null){const l=lockedBy('DM');if(l)return{why:'DM bloqueado por '+l};if(c.DM<cost.all)return{why:`precisa de ${cost.all} DM`};return{spend:{DM:c.DM}}}
 for(const k in cost.dice){const n=cost.dice[k],l=lockedBy(k);if(l)return{why:`${k} bloqueado por ${l}`};
  if(k==='DM'){dm+=n;continue}const p=Math.min(c[k],n);if(p)sp[k]=p;dm+=n-p}
 if(dm){const l=lockedBy('DM');if(l)return{why:'DM bloqueado por '+l};if(c.DM<dm)return{why:'dados insuficientes'};sp.DM=dm}
 return{spend:sp}}
function block(usado){if(F.conds.Desmaiado)return'Desmaiado';if(F.conds.Ceifado)return'Ceifado: sem habilidades nem ecos';const u=(usado||'').toLowerCase();
 if(F.conds.Ofuscado&&/bloqueio|contra-ataque/.test(u))return'Ofuscado: sem Bloqueio nem Contra-ataque';
 if(F.conds.Agarrado&&/esquiva/.test(u))return'Agarrado: não pode esquivar';return''}
const fmtD=d=>Object.entries(d).filter(([,v])=>v).map(([k,v])=>`${v>0?'+':'−'}${Math.abs(v)} ${k}`).join(', ');
function mudar(d){for(const k in d){const mx=k==='DM'?dmMax():20,old=F.comb[k],v=Math.max(0,Math.min(mx,old+d[k]));F.comb[k]=v;if(F.aspecto==='Lâmina'&&k!=='DM'&&old>0&&v===0)F.comb.vaz[k]=true}}
function rerUse(){save();renderComb();renderHabs();renderEcos()}
function avail(id,costStr,usado,epLock){const c=F.comb;if(c.uso&&c.uso.id===id)return{used:true};
 if(!c.on)return{why:''};if(epLock)return{why:'liberada no Conto Épico'};const b=block(usado);if(b)return{why:b};
 if(id==='Colheita'){const ks=['DA','DD','DE'].filter(k=>c[k]>=10&&!lockedBy(k));return ks.length?{ok:true,ks}:{why:'nenhum estojo com 10 ou mais'}}
 const p=plan(costOf(costStr));return p.why?{why:p.why}:{ok:true}}
function useState(h){const interactive=!(h.cat==='Passiva'&&(!h.custo||h.custo==='sem custo'));
 if(!interactive)return{cls:'',attr:'',html:''};
 const a=avail(h.nome,h.custo,h.usado,h.epica&&!epico()),id=esc(h.nome);
 if(a.used){let x='';if(h.nome==='Amplificação Lâmina'&&!F.comb.uso.extra)x=`<button class="mini" data-extra="volta">Acertou: o DD volta</button>`;
  if(h.nome==='Marcar Alvo')x=`<button class="mini" data-extra="alvo">+1 alvo (2 DE)</button>`;
  if(h.nome==='Sadismo Reflexo'&&!F.comb.uso.extra)x=`<button class="mini" data-extra="sadismo">+1 DM (Ferimento só fora do combate)</button>`;
  return{cls:' used',attr:` data-use="${id}" role="button" tabindex="0"`,html:`<p class="why">EM USO · ${esc(fmtD(F.comb.uso.d)||'sem dados')} · clique no cartão para desfazer</p>${x}`}}
 if(a.ok){if(h.nome==='Colheita')return{cls:' can',attr:'',html:a.ks.map(k=>`<button class="mini" data-colh="${k}">Colher 2 de ${k}</button>`).join('')};
  return{cls:' can',attr:` data-use="${id}" role="button" tabindex="0"`,html:''}}
 return{cls:a.why?' cant':'',attr:'',html:a.why?`<p class="why">${esc(a.why)}</p>`:''}}
function ecoUse(e,f,v,k){const id=`eco:${e.nome}:${f.forma}`,cs=(f.forma==='Estendida'?'':'1 DM + ')+(v?v+' '+k:'').replace(/ \+ $/,'');
 const a=avail(id,cs||'sem custo','');
 if(a.used)return{cls:' used',attr:` data-use="${esc(id)}" role="button" tabindex="0" title="Em uso (${esc(fmtD(F.comb.uso.d))}): clique para desfazer"`};
 if(a.ok)return{cls:' can',attr:` data-use="${esc(id)}" role="button" tabindex="0" title="Reverberar"`};
 return{cls:a.why?' cant':'',attr:a.why?` title="${esc(a.why)}"`:''}}
function costFor(id){if(id.startsWith('eco:')){const[,n,fo]=id.split(':');const e=ECO[n],f=e.formas.find(x=>x.forma===fo);const v=Math.max(0,f.valor-(F.ancora===e.ancora?1:0));const k={'ataque':'DA','reação':'DD','estratégia':'DE'}[f.momento||e.momento];return{cs:((fo==='Estendida'?'':'1 DM + ')+(v?v+' '+k:'')).replace(/ \+ $/,'')||'sem custo',usado:'',lbl:`${n} (${fo})`}}
 const h=HAB[id];return{cs:h.custo,usado:h.usado,lbl:id,ep:h.epica&&!epico()}}
function usar(id,custom){const c=F.comb,info=costFor(id);
 if(c.uso&&c.uso.id===id){mudar(Object.fromEntries(Object.entries(c.uso.d).map(([k,v])=>[k,-v])));c.vaz=c.uso.vaz;c.uso=null;rerUse();log(`${info.lbl}: uso desfeito, os dados voltaram.`);return}
 if(!c.on){log('Inicie o combate para gastar os dados pelas habilidades.');return}
 const a=avail(id,info.cs,info.usado,info.ep);if(!a.ok){log(`${info.lbl}: ${a.why}.`);return}
 let d={};if(custom)d=custom;else{const p=plan(costOf(info.cs));for(const k in p.spend)d[k]=-p.spend[k];const G=GAIN[id];if(G)for(const k in G)d[k]=(d[k]||0)+G[k]}
 const vaz={...c.vaz};mudar(d);c.uso={id,d,vaz};rerUse();log(`${info.lbl}: ${fmtD(d)||'usada, sem custo'}.`)}
function extra(t){const u=F.comb.uso;if(!u)return;let d={};
 if(t==='volta'){d={DD:1};u.extra=true}
 if(t==='sadismo'){d={DM:1};u.extra=true}
 if(t==='alvo'){const p=plan({dice:{DE:2}});if(p.why){log('Marcar Alvo: '+p.why+'.');return}for(const k in p.spend)d[k]=-p.spend[k]}
 mudar(d);for(const k in d)u.d[k]=(u.d[k]||0)+d[k];rerUse();log(`${u.id}: ${fmtD(d)}.`)}
document.addEventListener('input',e=>{
 const el=e.target;
 if(el.dataset.k){F[el.dataset.k]=el.dataset.num!==undefined?(el.value===''?'':+el.value):el.value;save();
  if(['nome','conto','aspecto','kit2','origem'].includes(el.dataset.k))renderTop();
  if(['conto','aspecto','kit2','heranca','ancora'].includes(el.dataset.k)){renderVida();renderNarr();renderComb();renderHabs();renderEcos()}
  if(['vAjuste','vDireto'].includes(el.dataset.k))renderVida();
  if(['arma','brut'].includes(el.dataset.k))renderArma();
  return}
 if(el.dataset.fer!==undefined){F.fer[+el.dataset.fer][el.dataset.f]=el.dataset.f==='g'?+el.value:el.value;save();const mx=vidaMax(),sf=F.fer.reduce((a,f)=>a+(+f.g||0),0);$('vDisp').textContent=mx-(+F.vDireto||0)-sf;return}
 if(el.dataset.cap){F.cap[el.dataset.cap]=Math.max(0,Math.min(12,+el.value||0));save();renderNarr();const i=document.querySelector(`[data-cap="${el.dataset.cap}"]`);i.focus();i.setSelectionRange?.(9,9);return}
 if(el.dataset.tr){const[k,s]=el.dataset.tr.split('.');F.tracos[k][s]=F.tracos[k][s]||{};F.tracos[k][s][el.dataset.f]=el.type==='checkbox'?el.checked:el.value;save();
  if(el.dataset.f==='cor'){renderNarr();renderEcos()}return}
 if(el.dataset.condx){F.conds[el.dataset.condx].x=el.value;save();return}
});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('[data-use]')){e.preventDefault();usar(e.target.dataset.use)}});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');
 if(!b){const u=e.target.closest('[data-use]');if(u)usar(u.dataset.use);return}
 const d=b.dataset;
 if(d.extra){extra(d.extra);return}
 if(d.colh){usar('Colheita',{[d.colh]:-2,DM:2});return}
 for(const k of['chama','fumaca','lume'])if(d['narr'+k[0].toUpperCase()+k.slice(1)]){const n=+d['narr'+k[0].toUpperCase()+k.slice(1)];F.cur[k]=F.cur[k]===n?n-1:n;save();renderNarr();return}
 for(const k of['DA','DD','DE','DM'])if(d['cmb'+k[0]+k.slice(1).toLowerCase()]){const n=+d['cmb'+k[0]+k.slice(1).toLowerCase()];setC(k,F.comb[k]===n?n-1:n);return}
 if(d.inc){setC(d.inc,F.comb[d.inc]+1);return}
 if(d.dec){setC(d.dec,F.comb[d.dec]-1);return}
 if(d.vaz){F.comb.vaz[d.vaz]=!F.comb.vaz[d.vaz];save();renderComb();return}
 if(d.ferx!==undefined){F.fer.splice(+d.ferx,1);save();renderVida();return}
 if(d.cond){if(F.conds[d.cond])delete F.conds[d.cond];else F.conds[d.cond]={};save();renderConds();renderComb();renderHabs();renderEcos();return}
 if(d.habx){F.habs=F.habs.filter(n=>n!==d.habx);save();renderHabs();renderVida();return}
 if(d.ecox){F.ecos=F.ecos.filter(n=>n!==d.ecox);save();renderEcos();return}
});
function setC(k,v){const mx=k==='DM'?dmMax():20;const old=F.comb[k];if(v<old&&lockedBy(k)){log(`${k} bloqueado por ${lockedBy(k)}: não dá para gastar agora.`);return}v=Math.max(0,Math.min(mx,v));F.comb[k]=v;if(F.aspecto==='Lâmina'&&k!=='DM'&&old>0&&v===0)F.comb.vaz[k]=true;save();renderComb()}

$('addFer').onclick=()=>{F.fer.push({g:0,d:''});save();renderVida();const ins=document.querySelectorAll('[data-fer][data-f="g"]');ins[ins.length-1]?.focus()};
$('bCena').onclick=()=>{F.cur={...F.cap};save();renderNarr()};
$('bTracos').onclick=()=>{for(const k in F.tracos)for(const s in F.tracos[k])if(F.tracos[k][s])F.tracos[k][s].u=false;save();renderNarr()};
$('bIni').onclick=()=>{const c=F.comb;c.on=true;c.rodada=1;c.DA=Math.floor(F.cap.chama/2);c.DD=Math.floor(F.cap.fumaca/2);c.DE=Math.floor(F.cap.lume/2);c.DM=0;c.vaz={};c.uso=null;
 for(const k in F.tracos)for(const s in F.tracos[k])if(F.tracos[k][s])F.tracos[k][s].u=false;
 save();renderComb();renderNarr();renderHabs();renderEcos();log(`Rodada 1: metade das capacidades, ${c.DA} DA, ${c.DD} DD, ${c.DE} DE e nenhum DM. Traços liberados.`)};
$('bRod').onclick=()=>{const c=F.comb;if(!c.on){log('Inicie o combate primeiro.');return}
 c.rodada++;const a=F.aspecto,out=[];
 for(const k of['DA','DD','DE']){let g=2;if(a==='Brutalista'&&k==='DA')g++;if(a==='Lâmina'&&k==='DD')g++;
  if(a==='Brutalista'&&c[k]<10)g++;
  if(a==='Vidente'&&c[k]>=10)g=0;
  if(a==='Lâmina'&&c.vaz[k])g*=2;
  if(epico()&&F.brasa===k)g++;
  if(k==='DD'&&F.conds.Ofuscado){g=0;out.push('Ofuscado: sem DD')}
  let v=c[k]+g;
  if(a==='Brutalista'&&v>=20){out.push(`${k} transbordou e zerou`);v=0}else v=Math.min(20,v);
  out.push(`+${g} ${k}`);c[k]=v}
 const dg=Math.min(dmMax(),c.DM+1)-c.DM;c.DM+=dg;out.push(`+${dg} DM`);c.vaz={};c.uso=null;
 const lk=['DA','DD','DE','DM'].map(k=>[k,lockedBy(k)]).filter(x=>x[1]);if(lk.length)out.push('bloqueado até encerrar o turno: '+lk.map(x=>x[0]+' ('+x[1]+')').join(', '));
 save();renderComb();renderHabs();renderEcos();log(`Rodada ${c.rodada}: ${out.join(', ')}.`)};
$('bTurno').onclick=()=>{const c=F.comb;if(!c.on){log('Inicie o combate primeiro.');return}c.uso=null;let t='Turno encerrado.';if(F.conds.Tonto){delete F.conds.Tonto;t+=' Tonto terminou: o DA está liberado.'}save();renderConds();renderComb();renderHabs();renderEcos();log(t)};
$('bFim').onclick=()=>{Object.assign(F.comb,{on:false,rodada:0,DA:0,DD:0,DE:0,DM:0,vaz:{},uso:null});save();renderComb();renderHabs();renderEcos();log('Combate encerrado. Os estojos de combate foram zerados.')};
$('habAdd').onclick=addHab;$('habIn').addEventListener('keydown',e=>{if(e.key==='Enter')addHab()});
function addHab(){const n=$('habIn').value.trim();const h=HAB[n];
 if(!h){$('habMsg').textContent='Não encontrei essa habilidade. Escolha um nome da lista.';return}
 if(h.tipo!=='avulsa'){$('habMsg').textContent=h.tipo==='heranca'?'Habilidades do Corpo Aberto vêm com a Herança: escolha a Herança na Identidade.':'Essa habilidade faz parte de um kit e já aparece com ele.';return}
 if(F.habs.includes(n)){$('habMsg').textContent='Ela já está na ficha.';return}
 F.habs.push(n);$('habIn').value='';const used=F.habs.reduce((a,x)=>a+(HAB[x]?.esp||0),0)+(F.heranca?2:0);
 $('habMsg').textContent=used>espTotal()?`Passou dos espaços: ${used} de ${espTotal()}.`:'';
 if(h.req)$('habMsg').textContent+=` Requisito: ${h.req}.`;
 save();renderHabs();renderVida()}
$('ecoAdd').onclick=()=>{const n=$('ecoIn').value;if(!n)return;F.ecos.push(n);save();renderEcos()};
$('sel').onchange=e=>{F=st.fichas.find(f=>f.id===e.target.value);save();log('');renderAll()};
$('bNova').onclick=()=>{F=blank();st.fichas.push(F);save();renderAll();$('nome').focus()};
$('bDup').onclick=()=>{const c=JSON.parse(JSON.stringify(F));c.id=blank().id;c.nome=(F.nome||'Sem nome')+' (cópia)';st.fichas.push(c);F=c;save();renderAll()};
$('bDel').onclick=()=>{$('cDel').classList.add('show');$('bDel').hidden=true};
$('bDelNao').onclick=()=>{$('cDel').classList.remove('show');$('bDel').hidden=false};
$('bDelSim').onclick=()=>{st.fichas=st.fichas.filter(f=>f!==F);if(!st.fichas.length)st.fichas.push(blank());F=st.fichas[0];save();$('bDelNao').onclick();renderAll()};
// exportar / importar
const dlg=$('dlg');
function openDlg(mode){$('dlgMsg').textContent='';const ex=mode==='exp';
 $('dlgT').textContent=ex?'Exportar ficha':'Importar ficha';
 $('dlgH').textContent=ex?'Guarde este texto ou o arquivo para abrir a ficha em outro aparelho.':'Escolha um arquivo .json exportado daqui ou cole o texto.';
 $('dlgTx').value=ex?JSON.stringify(F,null,1):'';$('dlgTx').readOnly=ex;
 $('dlgCopy').hidden=!ex;$('dlgSave').hidden=!ex;$('dlgOk').hidden=ex;$('dlgFile').hidden=ex;
 dlg.showModal()}
$('bExp').onclick=()=>openDlg('exp');$('bImp').onclick=()=>openDlg('imp');$('dlgClose').onclick=()=>dlg.close();
$('dlgCopy').onclick=()=>{const t=$('dlgTx');navigator.clipboard?.writeText(t.value).then(()=>$('dlgMsg').textContent='Copiado.',()=>{t.select();$('dlgMsg').textContent='Texto selecionado: copie com Ctrl+C.'})??(t.select())};
$('dlgSave').onclick=()=>{try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([$('dlgTx').value],{type:'application/json'}));a.download=(F.nome||'ficha').replace(/[^\wÀ-ú -]/g,'')+'.json';document.body.appendChild(a);a.click();a.remove();$('dlgMsg').textContent='Se o download não começar, use Copiar.'}catch(e){$('dlgMsg').textContent='O download não é permitido aqui. Use Copiar.'}};
$('dlgFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('dlgTx').value=r.result};r.readAsText(f)};
$('dlgOk').onclick=()=>{try{const o=JSON.parse($('dlgTx').value);if(!o||typeof o!=='object'||!o.cap)throw 0;o.id=blank().id;fix(o);st.fichas.push(o);F=o;save();renderAll();dlg.close()}catch(e){$('dlgMsg').textContent='Esse texto não é uma ficha válida. Confira se copiou o conteúdo inteiro.'}};

const TEMAS=['auto','light','dark'],TN={auto:'automático',light:'claro',dark:'escuro'};
let tema='auto';try{tema=localStorage.getItem('brasas-tema')||'auto'}catch(e){}
function aplicaTema(){if(tema==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',tema);$('bTema').textContent='Tema: '+TN[tema]}
$('bTema').onclick=()=>{tema=TEMAS[(TEMAS.indexOf(tema)+1)%3];try{localStorage.setItem('brasas-tema',tema)}catch(e){}aplicaTema()};
aplicaTema();
renderAll();
})();
