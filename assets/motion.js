(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const active = new Set();
  const seen = new WeakSet();

  function reveal(element, duration = 360, delay = 0) {
    if (preference.matches || !element) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(8px)' },
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
    ['.hero h1', '.hero-summary', '.hero .actions', '.work-map'].forEach((selector, index) => {
      reveal(document.querySelector(selector), 420, index * 45);
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

  // Keep native details semantics; interpolate between measured heights on interaction.
  document.querySelectorAll('.case-study').forEach(element => {
    const summary = element.querySelector('summary');
    const body = element.querySelector('.case-body');
    let animation;
    let expanded = element.open;
    function settle() {
      animation?.cancel();
      animation = undefined;
      element.open = expanded;
      element.style.height = '';
      element.style.overflow = '';
      body.inert = false;
      delete element.dataset.expanded;
    }
    summary.addEventListener('click', event => {
      event.preventDefault();
      const start = element.getBoundingClientRect().height;
      if (!animation) expanded = element.open;
      expanded = !expanded;
      if (preference.matches) { settle(); return; }
      animation?.cancel();
      element.style.height = '';
      element.open = true;
      const full = element.getBoundingClientRect().height;
      const end = expanded ? full : full - body.getBoundingClientRect().height;
      element.style.height = `${start}px`;
      element.style.overflow = 'clip';
      element.dataset.expanded = String(expanded);
      body.inert = !expanded;
      animation = element.animate([
        { height: `${start}px` }, { height: `${end}px` }
      ], { duration: expanded ? 240 : 180, easing });
      const current = animation;
      active.add(current);
      current.finished.then(() => {
        active.delete(current);
        if (animation === current) settle();
      }, () => active.delete(current));
    });
    preference.addEventListener('change', () => { if (preference.matches) settle(); });
  });

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
  });
})();
