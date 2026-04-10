// Tema claro/escuro
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;
const body = document.body;
const saved = localStorage.getItem('theme') || 'dark';
if (saved === 'light') {
  body.classList.add('light');
  root.classList.add('light');
  themeToggle.textContent = '☀️';
} else {
  themeToggle.textContent = '🌙';
}
themeToggle.addEventListener('click', () => {
  const isLight = body.classList.toggle('light');
  root.classList.toggle('light');
  themeToggle.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Modal de preview
const modal = document.getElementById('previewModal');
const modalTitle = document.getElementById('modalTitle');
const previewFrame = document.getElementById('previewFrame');
const openInNew = document.getElementById('openInNew');
const closeModal = document.getElementById('closeModal');

document.querySelectorAll('.card .preview').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    const title = card.dataset.title;
    const url = card.dataset.url;
    modalTitle.textContent = title;
    previewFrame.src = url;
    openInNew.href = url;
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  });
});

closeModal.addEventListener('click', () => {
  modal.setAttribute('aria-hidden','true');
  previewFrame.src = '';
  document.body.style.overflow = '';
});

modal.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    closeModal.click();
  }
});

// Pequena animação de entrada
window.addEventListener('load', () => {
  document.querySelectorAll('.card').forEach((c, i) => {
    c.style.transitionDelay = `${i * 60}ms`;
    c.style.opacity = 0;
    requestAnimationFrame(() => {
      c.style.opacity = 1;
      c.style.transform = 'translateY(0)';
    });
  });
});
