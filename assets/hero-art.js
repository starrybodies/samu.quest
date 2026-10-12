(() => {
  const scene = document.querySelector('.hero-art');
  if (!scene) return;
  const button = scene.querySelector('.art-motion-toggle');
  const surface = scene.querySelector('.art-viewport');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false;
  let visible = false;
  let frame = 0;
  let position;
  try { paused = sessionStorage.getItem('samu-quest-art-paused') === 'true'; } catch {}

  function resetPerspective() {
    cancelAnimationFrame(frame);
    frame = 0;
    ['--art-rx', '--art-ry', '--art-x', '--art-y'].forEach(property => scene.style.removeProperty(property));
  }

  function update() {
    const resting = paused || preference.matches;
    scene.dataset.running = String(!resting && visible && !document.hidden);
    scene.dataset.paused = String(resting);
    button.hidden = preference.matches;
    button.setAttribute('aria-pressed', String(paused));
    button.querySelector('span').textContent = paused ? 'Resume motion' : 'Pause motion';
    button.setAttribute('aria-label', paused ? 'Resume artwork motion' : 'Pause artwork motion');
    if (resting || document.hidden || !visible) resetPerspective();
  }

  button.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('samu-quest-art-paused', String(paused)); } catch {}
    update();
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    update();
  }, { threshold: 0 }).observe(scene);
  document.addEventListener('visibilitychange', update);
  preference.addEventListener('change', update);
  pointer.addEventListener('change', resetPerspective);

  // One scheduled update per pointer event burst; no continuous rendering loop.
  surface.addEventListener('pointermove', event => {
    if (paused || preference.matches || !pointer.matches) return;
    const bounds = surface.getBoundingClientRect();
    position = { x: (event.clientX - bounds.left) / bounds.width - .5, y: (event.clientY - bounds.top) / bounds.height - .5 };
    if (frame) return;
    frame = requestAnimationFrame(() => {
      scene.style.setProperty('--art-rx', `${-position.y * 4}deg`);
      scene.style.setProperty('--art-ry', `${position.x * 4}deg`);
      scene.style.setProperty('--art-x', `${position.x * 12}px`);
      scene.style.setProperty('--art-y', `${position.y * 12}px`);
      frame = 0;
    });
  }, { passive: true });
  surface.addEventListener('pointerleave', resetPerspective);
  update();
})();
