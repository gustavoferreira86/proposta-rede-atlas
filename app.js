
/* ---------- Planos ---------- */
const PLANS = {
  0: [
    {name:'Silver', price:'105,90', items:['Serviço funerário completo','Translado 100 km','Velório online','Rede de Vantagens Atlas']},
    {name:'Platinum', price:'135,00', featured:true, items:['Serviço funerário completo','Cremação no Crematório Atlas','Translado 400 km','Velório online','Rede de Vantagens Atlas']},
  ],
  1: [
    {name:'Silver + Pet', price:'140,90', items:['Serviço funerário completo','Dois pets com cremação','Translado 100 km','Velório online','Rede de Vantagens Atlas']},
    {name:'Platinum + Pet', price:'170,00', featured:true, items:['Serviço funerário completo','Cremação no Crematório Atlas','Dois pets com cremação','Translado 400 km','Velório online','Rede de Vantagens Atlas']},
  ]
};
const check = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
function renderPlans(pet){
  document.getElementById('plans').innerHTML = PLANS[pet].map(p => `
    <article class="plan ${p.featured?'featured':''}">
      ${p.featured?'<span class="badge">Mais completo</span>':''}
      <h3>${p.name}</h3>
      <div class="price"><small>R$</small><b>${p.price}</b><small>/mês</small></div>
      <p class="note">Entrada = primeira mensalidade (R$ ${p.price})</p>
      <ul>${p.items.map(i=>`<li>${check}${i}</li>`).join('')}</ul>
      <button class="btn btn-gold" data-plan="${p.name}">Contratar ${p.name}</button>
    </article>`).join('');
}
document.querySelectorAll('.toggle button').forEach(b => b.onclick = () => {
  document.querySelectorAll('.toggle button').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false')});
  b.classList.add('on'); b.setAttribute('aria-pressed','true'); renderPlans(b.dataset.pet);
});
renderPlans(0);

/* ---------- Rede de vantagens ---------- */
const CATS = {todos:'Todos',hospital:'Hospitais',clinica:'Clínicas e médicos',lab:'Laboratórios',odonto:'Odontologia',farmacia:'Farmácias',lazer:'Lazer e hospedagem'};
const COLORS = {hospital:'#027373',clinica:'#123e43',lab:'#3c7f8f',odonto:'#437448',farmacia:'#a85027',lazer:'#80621a'};
let cat='todos', limit=12;
const fEl=document.getElementById('filters'), gEl=document.getElementById('partners'), qEl=document.getElementById('q'), cEl=document.getElementById('city');
fEl.innerHTML=Object.entries(CATS).map(([k,v])=>`<button class="chip ${k==='todos'?'on':''}" data-c="${k}" aria-pressed="${k==='todos'}">${v}</button>`).join('');
[...new Set(PARTNERS.map(p=>p.city))].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(c=>cEl.add(new Option(c,c)));
fEl.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;cat=b.dataset.c;limit=12;fEl.querySelectorAll('.chip').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',String(x===b))});render()};
qEl.oninput=cEl.onchange=()=>{limit=12;render()};
document.getElementById('moreBtn').onclick=()=>{limit+=12;render()};
function currentDirectory(){return filterCompanies({query:qEl.value,city:cEl.value,category:cat,specialty:document.getElementById('specialty').value})}
function render(){
  const list=currentDirectory();
  gEl.innerHTML=list.slice(0,limit).map(company=>{
    const units=company.matchingUnits, cities=[...new Set(units.map(u=>u.city))];
    const specialties=[...new Set(units.flatMap(u=>u.specialties))];
    const category=cat==='todos'?units[0].categories[0]:cat;
    return `<article class="partner"><div class="thumb"><img src="${company.image}" alt="" loading="lazy"><span class="pill" style="background:${COLORS[category]}">${CATS[category]}</span>${company.units.length>1?`<span class="branch-badge">${company.units.length} unidades</span>`:''}</div><div class="body"><h3>${escapeHTML(company.name)}</h3><div class="tags">${escapeHTML(specialties.slice(0,3).join(' · '))}${specialties.length>3?` +${specialties.length-3}`:''}</div><div class="city">${escapeHTML(cities.slice(0,2).join(' · '))}${cities.length>2?` +${cities.length-2} cidades`:''}</div>${units.length<company.units.length?`<p class="branch-match">${units.length} de ${company.units.length} unidades correspondem à busca</p>`:''}<button class="partner-detail" data-company="${company.id}">${company.units.length>1?'Ver unidades':'Ver detalhes'}<span class="sr-only"> de ${escapeHTML(company.name)}</span><span aria-hidden="true">↗</span></button></div></article>`;
  }).join('');
  if(!list.length)gEl.innerHTML='<div class="empty-state"><strong>Nenhum parceiro por aqui.</strong><p>Tente outro nome, cidade ou especialidade.</p><button class="btn btn-teal" id="reset-search">Limpar filtros</button></div>';
  const units=list.reduce((total,c)=>total+c.matchingUnits.length,0);
  document.getElementById('count').textContent=list.length?`Mostrando ${Math.min(limit,list.length)} de ${list.length} empresas · ${units} ${units===1?'unidade encontrada':'unidades encontradas'}`:'Nenhum parceiro encontrado.';
  document.getElementById('moreBtn').hidden=list.length<=limit;
}
render();

/* Navigation, benefit shortcuts and video controls. */
const specialtyEl=document.getElementById('specialty');
[...new Set(PARTNERS.flatMap(p=>p.specialties))].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(s=>specialtyEl.add(new Option(s,s)));
specialtyEl.addEventListener('change',()=>{limit=12;render()});
function resetFilters(){qEl.value='';cEl.value='';specialtyEl.value='';fEl.querySelector('[data-c="todos"]').click()}
document.getElementById('clear-filters').addEventListener('click',resetFilters);
document.querySelectorAll('[data-category]').forEach(a=>a.addEventListener('click',()=>{qEl.value='';cEl.value='';specialtyEl.value='';fEl.querySelector(`[data-c="${a.dataset.category}"]`).click()}));
gEl.addEventListener('click',e=>{if(e.target.id==='reset-search'){resetFilters();qEl.focus()}});
const video=document.getElementById('atlas-video');
const videoButton=document.querySelector('.video-toggle');
function videoState(){videoButton.textContent=video.paused?'▶':'Ⅱ';videoButton.setAttribute('aria-label',video.paused?'Reproduzir vídeo':'Pausar vídeo')}
video.addEventListener('play',videoState);video.addEventListener('pause',videoState);
videoButton.addEventListener('click',()=>{if(video.paused){video.play().catch(()=>{videoButton.textContent='↻';videoButton.setAttribute('aria-label','Tentar reproduzir vídeo novamente')})}else video.pause()});
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!reducedMotion.matches)video.play().catch(videoState);
reducedMotion.addEventListener('change',e=>{if(e.matches)video.pause()});
