// Set the saved theme before styles paint. Dark is the intentional default.
document.documentElement.classList.add('js');
try {
  document.documentElement.dataset.theme = localStorage.getItem('samu-quest-theme') === 'light' ? 'light' : 'dark';
} catch {
  document.documentElement.dataset.theme = 'dark';
}
