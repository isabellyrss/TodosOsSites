// Script para gerenciar os links da turma
const STORAGE_KEY = 'turma_sites_v1';

const defaultSites = [
  { id: cryptoRandomId(), title: 'Projeto A', url: 'https://exemplo.com', description: 'Site do Projeto A', category: 'Projeto' },
  { id: cryptoRandomId(), title: 'Portfólio B', url: 'https://exemplo.org', description: 'Portfólio do aluno B', category: 'Portfólio' }
];

// Utilitário para id simples
function cryptoRandomId() {
  return 'id-' + Math.random().toString(36).slice(2,9);
}

// DOM
const cardsEl = document.getElementById('cards');
const searchEl = document.getElementById('search');
const categoryFilterEl = document.getElementById('categoryFilter');
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const linkForm = document.getElementById('linkForm');
const linkIdEl = document.getElementById('linkId');
const titleEl = document.getElementById('title');
const urlEl = document.getElementById('url');
const descEl = document.getElementById('description');
const categoryEl = document.getElementById('category');

let sites = loadSites();
renderCategoryOptions();
renderCards();

// Event listeners
searchEl.addEventListener('input', renderCards);
categoryFilterEl.addEventListener('change', renderCards);
addBtn.addEventListener('click', () => openModal());
closeModal.addEventListener('click', closeModalFn);
cancelBtn.addEventListener('click', closeModalFn);
modal.addEventListener('click', (e) => { if(e.target === modal) closeModalFn(); });
linkForm.addEventListener('submit', onSave);

// Load from storage or default
function loadSites(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSites));
      return defaultSites.slice();
    }
    return JSON.parse(raw);
  } catch(e) {
    console.error('Erro ao carregar sites', e);
    return defaultSites.slice();
  }
}

function saveSites(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  renderCategoryOptions();
  renderCards();
}

// Render categorias no filtro
function renderCategoryOptions(){
  const cats = Array.from(new Set(sites.map(s => s.category).filter(Boolean)));
  // limpa exceto a opção all
  categoryFilterEl.innerHTML = '<option value="all">Todas as categorias</option>';
  cats.sort().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    categoryFilterEl.appendChild(opt);
  });
}

// Render dos cards
function renderCards(){
  const q = searchEl.value.trim().toLowerCase();
  const cat = categoryFilterEl.value;
  const filtered = sites.filter(s => {
    const matchesQ = (s.title + ' ' + (s.description||'')).toLowerCase().includes(q);
    const matchesCat = cat === 'all' ? true : s.category === cat;
    return matchesQ && matchesCat;
  }).sort((a,b) => a.title.localeCompare(b.title));

  cardsEl.innerHTML = '';
  if(filtered.length === 0){
    cardsEl.innerHTML = '<div class="muted">Nenhum site encontrado.</div>';
    return;
  }

  filtered.forEach(site => {
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role','link');
    card.addEventListener('click', () => window.open(site.url, '_blank'));
    card.addEventListener('keypress', (e) => { if(e.key === 'Enter') window.open(site.url, '_blank'); });

    const favicon = document.createElement('div');
    favicon.className = 'favicon';
    favicon.textContent = faviconText(site.title);

    const meta = document.createElement('div');
    meta.className = 'meta';
    const h3 = document.createElement('h3');
    h3.textContent = site.title;
    const p = document.createElement('p');
    p.textContent = site.description || site.url;
    const small = document.createElement('div');
    small.className = 'muted';
    small.textContent = site.category || '';

    meta.appendChild(h3);
    meta.appendChild(p);
    meta.appendChild(small);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.title = 'Editar';
    editBtn.innerHTML = '✎';
    editBtn.addEventListener('click', (e) => { e.stopPropagation(); openModal(site); });

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.title = 'Excluir';
    delBtn.innerHTML = '🗑';
    delBtn.addEventListener('click', (e) => { e.stopPropagation(); onDelete(site.id); });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    card.appendChild(favicon);
    card.appendChild(meta);
    card.appendChild(actions);

    cardsEl.appendChild(card);
  });
}

// Gera texto para favicon (iniciais)
function faviconText(title){
  if(!title) return 'S';
  const parts = title.trim().split(/\s+/);
  if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Modal
function openModal(site){
  modalTitle.textContent = site ? 'Editar site' : 'Adicionar site';
  linkIdEl.value = site ? site.id : '';
  titleEl.value = site ? site.title : '';
  urlEl.value = site ? site.url : '';
  descEl.value = site ? site.description : '';
  categoryEl.value = site ? site.category : '';
  modal.setAttribute('aria-hidden','false');
  // foco no título
  setTimeout(()=> titleEl.focus(), 120);
}

function closeModalFn(){
  modal.setAttribute('aria-hidden','true');
  linkForm.reset();
}

// Salvar novo ou editar
function onSave(e){
  e.preventDefault();
  const id = linkIdEl.value || cryptoRandomId();
  const newSite = {
    id,
    title: titleEl.value.trim(),
    url: normalizeUrl(urlEl.value.trim()),
    description: descEl.value.trim(),
    category: categoryEl.value.trim()
  };
  const idx = sites.findIndex(s => s.id === id);
  if(idx >= 0) sites[idx] = newSite;
  else sites.push(newSite);
  saveSites();
  closeModalFn();
}

// Normaliza URL simples
function normalizeUrl(u){
  if(!u) return u;
  if(!/^https?:\/\//i.test(u)) return 'https://' + u;
  return u;
}

// Excluir
function onDelete(id){
  if(!confirm('Excluir este site?')) return;
  sites = sites.filter(s => s.id !== id);
  saveSites();
}

// Inicialização: acessibilidade para fechar com Esc
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModalFn();
});
// Adiciona botão de alternância de tema no header (executar após DOM carregado)
(function(){
    const header = document.querySelector('.header-inner');
    if(!header) return;
  
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.type = 'button';
    toggle.innerHTML = 'Tema claro';
    toggle.title = 'Alternar tema claro/escuro';
  
    // Carrega preferência
    const saved = localStorage.getItem('turma_theme');
    if(saved === 'light') document.documentElement.setAttribute('data-theme','light');
  
    updateLabel();
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      if(current === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('turma_theme');
      } else {
        document.documentElement.setAttribute('data-theme','light');
        localStorage.setItem('turma_theme','light');
      }
      updateLabel();
    });
  
    function updateLabel(){
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      toggle.textContent = isLight ? 'Tema escuro' : 'Tema claro';
    }
  
    header.querySelector('.controls')?.appendChild(toggle);
  })();
  