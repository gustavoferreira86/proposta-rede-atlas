/* Presentation flows: no credentials, forms, purchases or guides go to a server. */
const atlasDialog=document.getElementById('atlas-dialog');
const dialogContent=document.getElementById('dialog-content');
const dialogTitle=document.getElementById('dialog-title');
const dialogBack=document.getElementById('dialog-back');
const OFFICIAL='https://cliente.redeatlas.com/cliente';
let screenStack=[], screenState=null, demoSession=false, pendingGuide=null, guideUnit=null, returnFocus=null;
const e=escapeHTML;
const icon=(name)=>{
  const paths={home:'M3 11 12 3l9 8v10H3z',gift:'M4 12v9h16v-9M2 7h20v5H2zM12 7v14M7 7C3 2 10 0 12 7c2-7 9-5 5 0',card:'M3 5h18v14H3zM3 10h18',user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-3a8 8 0 0 1 16 0v3',heart:'M12 21S2 15 3 8a5 5 0 0 1 9-2 5 5 0 0 1 9 2c1 7-9 13-9 13z',phone:'M5 3h4l2 5-3 2a17 17 0 0 0 6 6l2-3 5 2v4c0 4-9 1-13-3S1 3 5 3z',plus:'M12 3v18M3 12h18',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',help:'M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 4m0 3v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'};
  return `<svg width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.help}"/></svg>`;
};
const demoNote='<p class="demo-notice">Modo apresentação. Use dados fictícios. Nenhum cadastro, pagamento ou solicitação será enviado.</p>';
const officialLink=`<a class="text-button" href="${OFFICIAL}" target="_blank" rel="noopener">Abrir portal oficial da Atlas ↗</a>`;
function openScreen(type,data={},replace=false){
  if(!atlasDialog.open){returnFocus=document.activeElement;screenStack=[];screenState=null;atlasDialog.showModal();document.body.classList.add('dialog-open')}
  if(screenState&&!replace)screenStack.push(screenState);
  screenState={type,data};
  atlasDialog.dataset.screen=type;
  dialogBack.hidden=!screenStack.length;
  document.querySelectorAll('[data-screen="menu"][aria-expanded]').forEach(b=>b.setAttribute('aria-expanded','true'));
  renderScreen();
  atlasDialog.scrollTop=0;
  dialogTitle.setAttribute('tabindex','-1');dialogTitle.focus({preventScroll:true});
}
function closeAtlas(){atlasDialog.close()}
atlasDialog.addEventListener('close',()=>{
  document.body.classList.remove('dialog-open');
  document.querySelectorAll('[data-screen="menu"][aria-expanded]').forEach(b=>b.setAttribute('aria-expanded','false'));
  dialogContent.replaceChildren();screenState=null;screenStack=[];
  if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
});
document.getElementById('dialog-close').addEventListener('click',closeAtlas);
dialogBack.addEventListener('click',()=>{const prev=screenStack.pop();if(prev){screenState=prev;atlasDialog.dataset.screen=prev.type;dialogBack.hidden=!screenStack.length;renderScreen();atlasDialog.scrollTop=0;dialogTitle.focus()}});
atlasDialog.addEventListener('click',event=>{if(event.target===atlasDialog){const r=atlasDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeAtlas()}});
function menuItem(label,description,ico,attribute){return `<button class="menu-item" ${attribute}><span class="menu-icon">${icon(ico)}</span><span><strong>${label}</strong><small>${description}</small></span><span aria-hidden="true">›</span></button>`}
function formField(label,name,type='text',extra=''){return `<label class="form-field">${label}<input name="${name}" type="${type}" required ${extra}></label>`}
function passwordFields(repeat=false){return `<p class="form-hint">No site real, a senha seria digitada aqui. Nesta demonstração pública os campos de senha e CPF estão desativados — nenhum dado é solicitado ou enviado.</p>`}
function personalFields(){return formField('Nome (apelido para a demonstração)','name','text','minlength="2" autocomplete="off" placeholder="Como quer ser chamado"')}
function renderScreen(){
  const {type,data}=screenState;
  if(type==='menu'){
    dialogTitle.textContent='Menu';
    dialogContent.innerHTML=`<div class="menu-intro"><img src="assets/logo_rede_atlas_2.png" alt="Rede Atlas"><p>Seu cuidado, sempre perto.</p></div><div class="menu-items">${menuItem(demoSession?'Minha conta':'Acessar',demoSession?'Conta de demonstração':'Entre na área do cliente','user',`data-screen="${demoSession?'account':'login'}"`)}${menuItem('Início','Conheça a Rede Atlas','home','data-section="inicio"')}${menuItem('Rede de Vantagens',`${COMPANIES.length} empresas e 50 unidades parceiras`,'gift','data-section="vantagens"')}${menuItem('Comprar Plano','Encontre a proteção para sua família','card','data-section="planos"')}${menuItem('Cremação','Acolhimento e respeito em cada etapa','heart','data-section="cremacao"')}${menuItem('Assistência','Atendimento 24 horas','help','data-screen="assistance"')}${menuItem('Contatos','Fale com a sua unidade','phone','data-screen="contacts"')}${menuItem('Primeiro Acesso','Conheça o fluxo de cadastro','plus','data-screen="register"')}${menuItem('Baixar App','Tenha a Atlas na tela inicial','download','data-screen="install"')}</div><div class="menu-footer">Protótipo de apresentação ${officialLink}</div>`;
  }else if(type==='company'){
    const company=COMPANIES.find(c=>c.id===data.id);
    const matches=currentDirectory().find(c=>c.id===data.id)?.matchingUnits||company.units;
    const unit=company.units.find(u=>u.id===data.unitId)||matches[0];data.unitId=unit.id;
    dialogTitle.textContent=company.name;
    dialogContent.innerHTML=`<div class="company-heading"><img src="${company.image}" alt="${e(company.name)}"><div><p class="eyebrow">Rede de Vantagens</p><p>${company.units.length} ${company.units.length===1?'unidade parceira':'unidades parceiras'}</p></div></div>${company.units.length>1?`<label class="form-field unit-picker">Escolha a unidade<select id="unit-picker">${company.units.map(u=>`<option value="${u.id}" ${u.id===unit.id?'selected':''}>${e(u.city)} — ${e(u.address.split(' - ')[0])}</option>`).join('')}</select></label><p class="form-hint">Endereço, contatos e benefícios são específicos de cada unidade.</p>`:''}<div class="unit-details"><h3>${e(unit.name)}</h3><div class="specialty-tags">${unit.specialties.map(s=>`<span>${e(s)}</span>`).join('')}</div>${unit.description?`<div class="benefit-detail"><h4>Benefícios e serviços</h4><p>${e(unit.description)}</p></div>`:''}<h4>Endereço</h4><p>${e(unit.address)}</p><a class="text-button" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(unit.address)}" target="_blank" rel="noopener">Ver no Google Maps ↗</a><h4>Contato</h4><div class="contact-links">${unit.phones.map(phone=>`<a class="btn btn-ghost" href="tel:${phone.replace(/\D/g,'')}">${icon('phone')}${e(phone)}</a>`).join('')}${unit.emails.map(email=>`<a class="text-button" href="mailto:${e(email)}">${e(email)}</a>`).join('')}${unit.websites.filter(url=>/^(?:https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?$/i.test(url)).map(url=>`<a class="text-button" href="${e(/^https?:/.test(url)?url:'https://'+url)}" target="_blank" rel="noopener">${e(url)} ↗</a>`).join('')}${!unit.phones.length&&!unit.emails.length?'<p>Telefone não informado no catálogo. Consulte a Atlas para orientação.</p>':''}</div></div><div class="dialog-action"><p>Precisa de uma guia para usar o benefício?</p><button class="btn btn-teal" data-guide="${unit.id}">Tirar Guia</button><small>Confira as condições vigentes com a Atlas e com a unidade.</small></div>`;
  }else if(type==='login'){
    dialogTitle.textContent='Acesso Cliente';
    dialogContent.innerHTML=`${demoNote}${pendingGuide!==null?'<p class="context-note">Entre na demonstração para visualizar a guia da unidade selecionada.</p>':''}<form data-form="login" class="atlas-form">${passwordFields()}<label class="check-field"><input type="checkbox" name="keep"> Manter demonstração nesta aba</label><p class="form-error" role="alert"></p><button class="btn btn-teal" type="submit">Entrar na demonstração</button><button class="btn btn-ghost" type="button" data-demo-fill>Preencher dados de exemplo</button></form><div class="form-links"><button class="text-button" data-screen="recover">Recuperar Senha</button><button class="text-button" data-screen="register">Primeiro Acesso</button></div><div class="official-note">Já é cliente? Acesse sua conta real pelo portal oficial.${officialLink}</div>`;
  }else if(type==='register'){
    dialogTitle.textContent='Primeiro Acesso';
    dialogContent.innerHTML=`${demoNote}<form data-form="register" class="atlas-form"><div class="form-grid">${personalFields()}${formField('Nascimento','birth','date',`max="${new Date().toISOString().slice(0,10)}"`)}<label class="form-field">Cidade<select name="city" required><option value="">Selecione a cidade</option>${[...new Set(PARTNERS.map(p=>p.city))].sort().map(c=>`<option>${e(c)}</option>`).join('')}</select></label></div>${passwordFields(true)}<label class="check-field"><input name="terms" type="checkbox" required> Entendi que este cadastro é apenas uma demonstração.</label><button type="button" class="text-button" data-screen="terms">Termos e privacidade</button><p class="form-error" role="alert"></p><button class="btn btn-teal" type="submit">Simular cadastro</button><button class="btn btn-ghost" type="button" data-demo-fill>Preencher dados de exemplo</button></form>`;
  }else if(type==='recover'){
    dialogTitle.textContent='Recuperar Senha';
    dialogContent.innerHTML=`${demoNote}<form data-form="recover" class="atlas-form">${passwordFields(true)}<p class="form-error" role="alert"></p><button type="submit" class="btn btn-teal">Ver tela de confirmação</button></form><div class="official-note">Para alterar uma senha real, use “Recuperar Senha” no portal da Atlas.${officialLink}</div>`;
  }else if(type==='purchase'){
    const plan=Object.values(PLANS).flat().find(p=>p.name===data.plan);
    dialogTitle.textContent=`Contratar ${plan.name}`;
    dialogContent.innerHTML=`${demoNote}<div class="purchase-summary"><div><small>Plano escolhido</small><h3>${e(plan.name)}</h3></div><div><strong>R$ ${plan.price}</strong><small>/mês · entrada R$ ${plan.price}</small></div></div><details class="coverage"><summary>Ver coberturas e dependentes</summary><ul>${plan.items.map(item=>`<li>${e(item)}</li>`).join('')}</ul><p>Esposa ou marido, filhos(as), enteados(as), avós, mãe, pai, sogra, sogro e um extra, conforme condições contratuais da Atlas.</p></details><form class="atlas-form" data-form="purchase"><div class="form-grid">${personalFields()}</div><label class="check-field"><input type="checkbox" name="terms" required> Entendi que esta simulação não contrata o plano.</label><button class="text-button" type="button" data-screen="terms">Consultar condições de contratação</button><p class="form-error" role="alert"></p><button class="btn btn-teal" type="submit">Revisar proposta</button><button class="btn btn-ghost" type="button" data-demo-fill>Preencher dados de exemplo</button></form>`;
  }else if(type==='review'){
    dialogTitle.textContent='Revisão da proposta';
    dialogContent.innerHTML=`${demoNote}<div class="review-box"><h3>${e(data.plan)}</h3><dl><dt>Titular da simulação</dt><dd>${e(data.name)}</dd><dt>Mensalidade</dt><dd>R$ ${e(data.price)}</dd><dt>Entrada</dt><dd>Primeira mensalidade de R$ ${e(data.price)}</dd></dl></div><button class="btn btn-teal full-width" data-screen="purchase-success">Concluir simulação</button><p class="form-hint">Não haverá cobrança. A contratação real é feita com a Atlas.</p>`;
  }else if(type==='purchase-success'||type==='register-success'||type==='recover-success'){
    const titles={'purchase-success':'Simulação concluída','register-success':'Cadastro demonstrado','recover-success':'Recuperação demonstrada'};
    dialogTitle.textContent=titles[type];
    dialogContent.innerHTML=`<div class="success-view"><span class="success-icon">✓</span><h3>${titles[type]}</h3><p>${type==='purchase-success'?'O fluxo de escolha, preenchimento e revisão do plano está completo. Nenhuma compra foi realizada.':type==='register-success'?'Os campos foram validados. Nenhuma conta foi criada e nenhum e-mail foi enviado.':'As senhas foram validadas apenas nesta tela. Nenhuma senha real foi alterada.'}</p><button class="btn btn-teal" data-screen="${type==='purchase-success'?'contacts':'login'}">${type==='purchase-success'?'Falar com a Atlas':'Experimentar o acesso'}</button>${officialLink}</div>`;
  }else if(type==='account'){
    dialogTitle.textContent='Minha conta';
    dialogContent.innerHTML=`<p class="demo-notice">Conta fictícia para apresentação. Não representa contrato ou cobertura ativa.</p><div class="demo-card"><small>Rede Atlas · Demonstração</small><h3>Cliente demonstração</h3><p>Explore os serviços da sua área do cliente.</p></div><div class="menu-items">${menuItem('Rede de Vantagens','Encontre uma empresa e escolha a unidade','gift','data-section="vantagens"')}${menuItem('Assistência 24h','Canais oficiais de atendimento','phone','data-screen="assistance"')}${menuItem('Conhecer planos','Consulte as coberturas disponíveis','card','data-section="planos"')}</div><button class="text-button" data-logout>Sair da demonstração</button>`;
  }else if(type==='guide'){
    const unit=PARTNERS.find(p=>p.id===data.id);guideUnit=unit;
    dialogTitle.textContent='Guia de demonstração';
    dialogContent.innerHTML=`<p class="demo-notice">Exemplo para apresentação. Sem validade para atendimento.</p><div class="guide-preview"><div class="guide-brand"><img src="assets/logo_rede_atlas_2.png" alt="Rede Atlas"><strong>DEMONSTRAÇÃO</strong></div><h3>Guia de benefício</h3><dl><dt>Beneficiário</dt><dd>Cliente demonstração</dd><dt>Parceiro / unidade</dt><dd>${e(unit.name)}</dd><dt>Endereço</dt><dd>${e(unit.address)}</dd><dt>Especialidades</dt><dd>${e(unit.specialties.join(', '))}</dd><dt>Data da demonstração</dt><dd>${new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo'}).format(new Date())}</dd></dl><p class="guide-watermark">SEM VALIDADE • NÃO É UMA AUTORIZAÇÃO</p></div><div class="form-links"><button class="btn btn-teal" data-print-guide>Imprimir exemplo</button><button class="btn btn-ghost" data-download-guide>Baixar exemplo</button></div><p class="form-hint">A emissão de uma guia válida depende de acesso e autorização no portal oficial.</p>${officialLink}`;
  }else if(type==='contacts'||type==='assistance'){
    dialogTitle.textContent=type==='assistance'?'Assistência 24h':'Contatos';
    dialogContent.innerHTML=`<div class="emergency-box">${icon('phone')}<h3>Funerária e Cremação</h3><p>Atendimento 24 horas, todos os dias.</p><a href="tel:08008003070">0800 800 3070</a><small>Ligação gratuita</small></div><h3 class="subheading">Unidades · horário comercial</h3>${[['Guaratinguetá','(12) 3122-1765'],['Lorena','(12) 3153-2984'],['Cachoeira Paulista','(12) 3103-6083']].map(([city,phone])=>`<div class="contact-unit"><div><h4>${city}</h4><p>${phone}</p></div><a class="btn btn-ghost" href="tel:${phone.replace(/\D/g,'')}">Ligar<span class="sr-only"> para ${city}</span></a></div>`).join('')}<p class="form-hint">Os botões de ligação usam os números oficiais da Atlas.</p>`;
  }else if(type==='install'){
    dialogTitle.textContent='Baixar App';
    dialogContent.innerHTML=`<div class="install-heading">${icon('download')}<h3>A Atlas na tela inicial</h3><p>Abra o portal oficial no navegador do celular e adicione o aplicativo à tela inicial.</p></div><details class="coverage" open><summary>Android · Chrome</summary><ol><li>Abra o portal oficial da Atlas.</li><li>No menu do navegador, procure “Instalar aplicativo” ou “Adicionar à tela inicial”.</li><li>Confirme a instalação no seu aparelho.</li></ol></details><details class="coverage"><summary>iPhone · Safari</summary><ol><li>Abra o portal oficial no Safari.</li><li>Toque em Compartilhar.</li><li>Escolha “Adicionar à Tela de Início” e confirme.</li></ol></details><a class="btn btn-teal full-width" href="${OFFICIAL}" target="_blank" rel="noopener">Abrir app oficial</a><p class="form-hint">As opções podem variar conforme o navegador. Este protótipo não instala o app oficial.</p>`;
  }else if(type==='terms'){
    dialogTitle.textContent='Termos e privacidade';
    dialogContent.innerHTML=`<div class="legal-note"><h3>Sobre esta apresentação</h3><p>Os formulários demonstram a experiência proposta. Os dados digitados não são enviados à Atlas e são descartados quando a tela é substituída ou fechada.</p><p>A opção de manter a demonstração guarda somente o estado de acesso fictício nesta aba, nunca CPF ou senha.</p><h3>Contratação e uso reais</h3><p>Consulte os termos do contrato e a política de privacidade publicados no portal oficial antes de realizar qualquer cadastro ou contratação. Este protótipo não substitui esses documentos.</p>${officialLink}</div>`;
  }
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button,a');if(!button)return;
  if(button.dataset.screen){event.preventDefault();const type=button.dataset.screen;if(type==='login')pendingGuide=null;openScreen(type==='login'&&demoSession?'account':type)}
  else if(button.dataset.section){closeAtlas();document.getElementById(button.dataset.section)?.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});history.replaceState(null,'',`#${button.dataset.section}`)}
  else if(button.dataset.company){openScreen('company',{id:Number(button.dataset.company)})}
  else if(button.dataset.plan){openScreen('purchase',{plan:button.dataset.plan})}
  else if(button.dataset.guide){const id=Number(button.dataset.guide);if(demoSession)openScreen('guide',{id});else{pendingGuide=id;openScreen('login')}}
  else if(button.hasAttribute('data-show-password')){const input=button.parentElement.querySelector('input');const show=input.type==='password';input.type=show?'text':'password';button.textContent=show?'Ocultar':'Mostrar';button.setAttribute('aria-label',show?'Ocultar senha':'Mostrar senha')}
  else if(button.hasAttribute('data-demo-fill')){const form=button.closest('form');const values={cpf:'000.000.000-00',phone:'(00) 00000-0000',email:'demo@example.com',name:'Cliente Demonstração',birth:'1990-01-01',city:'Guaratinguetá',password:'AtlasDemo2026',confirm:'AtlasDemo2026'};for(const [name,value]of Object.entries(values))if(form.elements[name]){form.elements[name].value=value;form.elements[name].setCustomValidity('')}form.querySelector('.form-error').textContent=''}
  else if(button.hasAttribute('data-logout')){demoSession=false;pendingGuide=null;try{sessionStorage.removeItem('atlas-demo')}catch{}openScreen('login',{},true)}
  else if(button.hasAttribute('data-print-guide'))window.print();
  else if(button.hasAttribute('data-download-guide')&&guideUnit){const text=`REDE ATLAS — EXEMPLO SEM VALIDADE\nCliente demonstração\n${guideUnit.name}\n${guideUnit.address}\n${guideUnit.specialties.join(', ')}\n\nDEMONSTRAÇÃO. NÃO É UMA AUTORIZAÇÃO DE ATENDIMENTO.`;const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='guia-demonstracao-sem-validade.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
});
dialogContent.addEventListener('change',event=>{if(event.target.id==='unit-picker'){screenState.data.unitId=Number(event.target.value);renderScreen();document.getElementById('unit-picker').focus()}});
dialogContent.addEventListener('input',event=>{
  const input=event.target;if(input.tagName!=='INPUT')return;input.setCustomValidity('');
  if(input.dataset.mask==='cpf'){let v=input.value.replace(/\D/g,'').slice(0,11);input.value=v.replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3').replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/,'$1.$2.$3-$4')}
  if(input.dataset.mask==='phone'){const v=input.value.replace(/\D/g,'').slice(0,11);input.value=v.length>10?v.replace(/^(\d{2})(\d{5})(\d*)$/,'($1) $2-$3'):v.replace(/^(\d{2})(\d{4})(\d*)$/,'($1) $2-$3')}
});
dialogContent.addEventListener('submit',event=>{
  const form=event.target;if(!form.dataset.form)return;event.preventDefault();
  const values=new FormData(form);const error=form.querySelector('.form-error');
  if(values.has('confirm')&&values.get('confirm')!==values.get('password')){error.textContent='As senhas precisam ser iguais.';form.elements.confirm.focus();return}
  if(!form.reportValidity())return;
  if(form.dataset.form==='login'){
    demoSession=true;if(values.has('keep'))try{sessionStorage.setItem('atlas-demo','true')}catch{}
    if(pendingGuide!==null){const id=pendingGuide;pendingGuide=null;openScreen('guide',{id},true)}else openScreen('account',{},true);
  }else if(form.dataset.form==='register')openScreen('register-success',{},true);
  else if(form.dataset.form==='recover')openScreen('recover-success',{},true);
  else if(form.dataset.form==='purchase'){const plan=Object.values(PLANS).flat().find(p=>p.name===screenState.data.plan);openScreen('review',{plan:plan.name,price:plan.price,name:values.get('name')},true)}
});
try{demoSession=sessionStorage.getItem('atlas-demo')==='true'}catch{}
const navObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){document.querySelectorAll('.tabbar a').forEach(a=>{if(a.getAttribute('href')===`#${entry.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}},{rootMargin:'-15% 0px -55% 0px'});
['vantagens','planos'].forEach(id=>navObserver.observe(document.getElementById(id)));
document.querySelector('.tabbar a[href="#inicio"]').addEventListener('click',()=>{document.querySelectorAll('.tabbar a').forEach(a=>a.removeAttribute('aria-current'));document.querySelector('.tabbar a[href="#inicio"]').setAttribute('aria-current','location')});
