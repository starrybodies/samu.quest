(() => {
  const scenes = [...document.querySelectorAll('.hero-art, .quest-cover')]
    .filter(scene => scene.querySelector('.art-motion-toggle'));
  if (!scenes.length) return;

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const visible = new Set();
  const views = [];
  let paused = false;
  try { paused = sessionStorage.getItem('samu-quest-art-paused') === 'true'; } catch {}

  function update() {
    const resting = paused || preference.matches;
    for (const { scene, button, label, reset } of views) {
      const running = !resting && visible.has(scene) && !document.hidden;
      scene.dataset.running = String(running);
      scene.dataset.paused = String(resting);
      button.hidden = preference.matches;
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', paused ? 'Resume artwork motion' : 'Pause artwork motion');
      button.title = button.getAttribute('aria-label');
      label.textContent = paused ? 'Resume motion' : 'Pause motion';
      if (!running || !pointer.matches) reset();
    }
  }

  for (const scene of scenes) {
    const surface = scene.querySelector('.art-viewport') || scene;
    const button = scene.querySelector('.art-motion-toggle');
    const label = button.querySelector('span');
    let frame = 0;
    let clientX, clientY;

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      for (const name of ['--art-rx', '--art-ry', '--art-x', '--art-y']) {
        scene.style.removeProperty(name);
      }
    }

    function position() {
      const bounds = surface.getBoundingClientRect();
      const x = (clientX - bounds.left) / bounds.width - .5;
      const y = (clientY - bounds.top) / bounds.height - .5;
      scene.style.setProperty('--art-rx', `${-y * 4}deg`);
      scene.style.setProperty('--art-ry', `${x * 4}deg`);
      scene.style.setProperty('--art-x', `${x * 12}px`);
      scene.style.setProperty('--art-y', `${y * 12}px`);
      frame = 0;
    }

    surface.addEventListener('pointermove', event => {
      if (scene.dataset.running !== 'true' || !pointer.matches || event.pointerType === 'touch') return;
      clientX = event.clientX;
      clientY = event.clientY;
      if (!frame) frame = requestAnimationFrame(position);
    }, { passive: true });
    surface.addEventListener('pointerleave', reset);
    button.addEventListener('click', () => {
      paused = !paused;
      try { sessionStorage.setItem('samu-quest-art-paused', String(paused)); } catch {}
      update();
    });
    views.push({ scene, button, label, reset });
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    update();
  });
  scenes.forEach(scene => observer.observe(scene));
  document.addEventListener('visibilitychange', update);
  preference.addEventListener('change', update);
  pointer.addEventListener('change', update);
  update();
})();
