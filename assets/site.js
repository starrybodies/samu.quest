const toggle = document.querySelector('.menu-toggle');
const links = document.querySelector('#site-navigation');

function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  links.classList.remove('is-open');
}

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  links.classList.toggle('is-open', open);
});

links.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    toggle.focus();
  }
});

const themeToggle = document.querySelector('.theme-toggle');

function syncTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
  themeToggle.setAttribute('aria-label', label);
  themeToggle.setAttribute('title', label);
  document.querySelector('meta[name="theme-color"]').content = dark ? '#090909' : '#eeeee8';
}

themeToggle.addEventListener('click', () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('samu-quest-theme', root.dataset.theme); } catch {}
  syncTheme();
});

window.addEventListener('storage', event => {
  if (event.key !== 'samu-quest-theme') return;
  document.documentElement.dataset.theme = event.newValue === 'light' ? 'light' : 'dark';
  syncTheme();
});

syncTheme();
