(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const garden = document.querySelector('#network-garden');
  const alias = document.querySelector('#music-signal');
  const notice = document.createElement('p');
  notice.className = 'secret-notice';
  notice.setAttribute('role', 'status');
  document.body.append(notice);
  let noticeTimer;

  function announce(message) {
    notice.textContent = message;
    notice.classList.add('is-visible');
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => notice.classList.remove('is-visible'), 5000);
  }

  function openDialog(dialog) {
    if (!dialog || dialog.open) return;
    dialog.showModal();
  }

  const sigil = document.querySelector('.sigil-trigger');
  if (sigil) {
    sigil.disabled = false;
    sigil.addEventListener('click', () => openDialog(garden));
  }
  document.querySelector('.name-trigger')?.addEventListener('click', event => {
    if (!alias) return;
    event.preventDefault();
    openDialog(alias);
  });

  [garden, alias].filter(Boolean).forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      dialog.querySelectorAll('svg *').forEach(element => element.getAnimations().forEach(animation => animation.cancel()));
    });
  });

  if (garden) {
    const svg = garden.querySelector('.garden-canvas');
    const counter = garden.querySelector('.garden-count');
    const namespace = 'http://www.w3.org/2000/svg';
    let nodes;

    function reset() {
      svg.replaceChildren();
      nodes = [{ x: 300, y: 300 }];
      const seed = document.createElementNS(namespace, 'circle');
      seed.setAttribute('cx', 300);
      seed.setAttribute('cy', 300);
      seed.setAttribute('r', 5);
      svg.append(seed);
      counter.textContent = '0 connections';
    }

    function grow(x, y) {
      if (nodes.length >= 51) {
        counter.textContent = '50 connections. Reset to grow another network.';
        return;
      }
      const point = { x: Math.max(12, Math.min(588, x)), y: Math.max(12, Math.min(348, y)) };
      const nearest = nodes.reduce((best, node) => Math.hypot(point.x - node.x, point.y - node.y) < Math.hypot(point.x - best.x, point.y - best.y) ? node : best);
      const branch = document.createElementNS(namespace, 'path');
      const midpoint = (nearest.y + point.y) / 2;
      branch.setAttribute('d', `M ${nearest.x} ${nearest.y} C ${nearest.x} ${midpoint}, ${point.x} ${midpoint}, ${point.x} ${point.y}`);
      const leaf = document.createElementNS(namespace, 'circle');
      leaf.setAttribute('cx', point.x);
      leaf.setAttribute('cy', point.y);
      leaf.setAttribute('r', 4);
      svg.append(branch, leaf);
      if (!preference.matches) {
        const length = branch.getTotalLength();
        branch.animate([{ strokeDasharray: String(length), strokeDashoffset: length }, { strokeDasharray: String(length), strokeDashoffset: 0 }], { duration: 400, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      }
      nodes.push(point);
      counter.textContent = `${nodes.length - 1} ${nodes.length === 2 ? 'connection' : 'connections'}`;
    }

    svg.addEventListener('click', event => {
      const coordinates = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
      grow(coordinates.x, coordinates.y);
    });
    garden.querySelector('.grow-network').addEventListener('click', () => grow(30 + Math.random() * 540, 25 + Math.random() * 260));
    garden.querySelector('.reset-network').addEventListener('click', reset);
    reset();
  }

  let sequence = '';
  let lastKey = 0;
  document.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || event.target.closest('input, textarea, select, [contenteditable="true"]') || document.querySelector('dialog[open]')) return;
    if (event.key.length !== 1) return;
    if (Date.now() - lastKey > 1800) sequence = '';
    lastKey = Date.now();
    sequence = (sequence + event.key.toLowerCase()).slice(-4);
    if (sequence !== 'samu') return;
    document.documentElement.classList.toggle('constellation-mode');
    announce(document.documentElement.classList.contains('constellation-mode') ? 'Constellation mode discovered. Type SAMU again to turn it off.' : 'Constellation mode off.');
    sequence = '';
  });

  preference.addEventListener('change', () => {
    if (preference.matches && garden) garden.querySelectorAll('svg *').forEach(element => element.getAnimations().forEach(animation => animation.cancel()));
  });
})();
