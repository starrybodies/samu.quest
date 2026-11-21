(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const active = new Set();

  function reveal(element, duration = 360, delay = 0) {
    if (preference.matches || !element) return;
    const animation = element.animate([
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration, delay, easing, fill: 'backwards' });
    active.add(animation);
    animation.finished.then(() => active.delete(animation), () => active.delete(animation));
  }

  // Choreograph each fresh homepage load, including a visit from a project deep link.
  const cover = document.querySelector('.quest-cover');
  if (cover && !preference.matches) {
    cover.querySelector('.name-letters').classList.add('name-arriving');
    ['.hero-role', '.hero-intro', '.quest-actions'].forEach((selector, index) => {
      reveal(cover.querySelector(selector), 420, 100 + index * 65);
    });
  }

  const sections = document.querySelectorAll('.collection-heading, .exhibit, .project-record, .work-head, .engineering-head, .engineering-record, .projects-heading, .professional-project, .ecosystem-links, .talk-feature, .personal-heading, .personal-project, .publishing-note, .about-grid, .contact-heading, .detail-section > .wrap');
  const observer = new IntersectionObserver(entries => {
    let cardDelay = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      if (entry.boundingClientRect.top > 0 && !element.contains(document.activeElement)) {
        const card = element.matches('.exhibit, .project-record');
        reveal(element, card ? 440 : 360, card ? cardDelay : 0);
        if (card) cardDelay = Math.min(100, cardDelay + 50);
      }
      observer.unobserve(element);
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
    if (preference.matches) {
      cover?.querySelector('.name-letters')?.classList.remove('name-arriving');
      active.forEach(animation => animation.cancel());
    }
    updateProgress();
  });
})();
