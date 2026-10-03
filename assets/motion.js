(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const active = new Set();
  const seen = new WeakSet();

  function reveal(element, duration = 400, delay = 0) {
    if (preference.matches || !element) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(18px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration, delay, easing, fill: 'backwards' });
    active.add(animation);
    animation.finished.then(() => active.delete(animation), () => active.delete(animation));
  }

  // First visit: name at 0ms, summary at 50ms, actions at 100ms.
  let firstVisit = true;
  try {
    firstVisit = !sessionStorage.getItem('samu-quest-intro');
    sessionStorage.setItem('samu-quest-intro', 'seen');
  } catch {}
  if (firstVisit) {
    ['.hero h1', '.hero-summary', '.hero .actions'].forEach((selector, index) => {
      reveal(document.querySelector(selector), 600, index * 50);
    });
  }

  const sections = document.querySelectorAll('.work-head, .engineering-head, .engineering-record, .project-showcase, .ecosystem-links, .talk-feature, .personal-heading, .personal-grid, .about-grid, .contact-heading, .detail-section > .wrap');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!seen.has(entry.target) && entry.boundingClientRect.top > 0) reveal(entry.target);
      seen.add(entry.target);
      observer.unobserve(entry.target);
    }
  }, { threshold: 0, rootMargin: '0px 0px -35px 0px' });
  sections.forEach(element => observer.observe(element));

  document.querySelectorAll('.case-study').forEach(element => {
    element.addEventListener('toggle', () => {
      if (element.open) reveal(element.querySelector('.case-body'), 200);
    });
  });

  const hero = document.querySelector('.hero');
  const art = document.querySelector('.hero-art img');
  if (hero && art) {
    hero.addEventListener('pointermove', event => {
      if (preference.matches || event.pointerType !== 'mouse') return;
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      art.style.transform = `translate(${x * 16}px, ${y * 12}px)`;
    });
    hero.addEventListener('pointerleave', () => { art.style.transform = ''; });
  }

  const progress = document.createElement('div');
  progress.className = 'page-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let queued = false;
  function updateProgress() {
    const distance = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0})`;
    queued = false;
  }
  window.addEventListener('scroll', () => {
    if (queued || preference.matches) return;
    queued = true;
    requestAnimationFrame(updateProgress);
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    active.forEach(animation => animation.cancel());
    if (art) art.style.transform = '';
  });
})();
