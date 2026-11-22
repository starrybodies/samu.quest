import { paintedLabels, tideStars } from './island-quest.js';

// The branches follow the footpaths in the island illustration.
const points = {
  dock: [86.3, 75.5],
  stage: [72.7, 72.2],
  bend: [64.5, 69.7],
  steps: [58.9, 65.9],
  fork: [53.9, 60.2],
  slope: [57.5, 56.8],
  plaza: [61.7, 51.7],
  west: [50.0, 64.1],
  'field-station': [44.6, 52.8],
  garden: [50.7, 56.2],
  switchback: [53.5, 42.2],
  grove: [52.9, 35.9],
  observatory: [39.6, 26.1],
  glasshouse: [58.5, 31.9],
  east: [71.4, 44.6],
  workshop: [75.2, 36.4],
  library: [79.9, 52.3],
  ...Object.fromEntries(tideStars.map((star) => [star.id, star.map])),
};
const paths = [
  ['dock', 'harbour', 'stage', 'bend', 'steps', 'fork', 'slope', 'plaza'],
  ['fork', 'west', 'tidepool'],
  ['fork', 'garden', 'field-station'],
  ['plaza', 'switchback', 'grove', 'cedar', 'observatory'],
  ['grove', 'glasshouse'],
  ['plaza', 'east', 'workshop'],
  ['east', 'library'],
];
const neighbours = new Map(Object.keys(points).map((id) => [id, []]));
for (const path of paths)
  for (let i = 1; i < path.length; i++) {
    neighbours.get(path[i - 1]).push(path[i]);
    neighbours.get(path[i]).push(path[i - 1]);
  }
function routeBetween(start, end) {
  const queue = [[start]],
    seen = new Set([start]);
  for (const path of queue) {
    const last = path.at(-1);
    if (last === end) return path;
    for (const id of neighbours.get(last))
      if (!seen.has(id)) {
        seen.add(id);
        queue.push([...path, id]);
      }
  }
  return [];
}
const limit = (value, low, high) => Math.max(low, Math.min(high, value));
const length = (a, b) => Math.hypot(a[0] - b[0], (a[1] - b[1]) / 2);
const at = (el, [x, y]) => {
  el.style.left = x + '%';
  el.style.top = y + '%';
};
const travelerArt =
  '<svg viewBox="0 0 36 48"><ellipse cx="18" cy="45" rx="9" ry="2" fill="#161723" opacity=".45"/><g class="sprite-body"><path d="m13 32-1 11 4 1 4-12m0 0 2 11 4-1-2-12" fill="#34323c" stroke="#211f24" stroke-width="2"/><path d="M12 15c-4 4-3 14-8 20 4 0 7-1 9-3l-2 6c6 0 11-1 16-5l-4-17z" fill="#df885d" stroke="#754535" stroke-width="1.4"/><path d="m19 16 8 15-6 2-4-15z" fill="#ffbf91"/><path d="M15 13c-5 0-7 1-10 4l7 1-8 4c6 0 12-2 15-6z" fill="#a4cad5"/><path d="M16 6c4-4 9-1 10 3l1 2-2 1c0 4-2 6-5 6-4-1-6-6-4-12z" fill="#d79b75" stroke="#67483e"/><path d="M13 10c-1-7 4-10 8-8 4 0 6 3 6 6l-6-2-4 2-1 5z" fill="#40333a"/></g></svg>';
const foxArt =
  '<svg viewBox="0 0 52 34"><ellipse cx="30" cy="30" rx="15" ry="2" fill="#201c24" opacity=".4"/><g class="sprite-body"><g class="fox-tail"><path d="M25 22C13 26 5 19 2 10c6 2 8 0 14 3l11 7Z" fill="#aa5332" stroke="#613e35"/><path d="M3 11c3 1 6 0 9 1l-1 4 4 1-3 3c-4-2-7-5-9-9Z" fill="#fff0d5"/></g><path d="M21 23 19 29l4 1 4-6m7-1 2 7h3l-1-8" fill="#483b3a"/><path d="M18 21c2-6 9-7 15-5l7-5 4 8c-2 7-19 10-26 2Z" fill="#ce7545" stroke="#684233"/><path d="m33 13 1-10 6 6 4-6 2 9 5 4-8 6-6-2z" fill="#e39862" stroke="#684233"/><path d="m37 17 5 1 8-2-7 6z" fill="#f7dfbd"/><circle cx="45" cy="12" r="1.2" fill="#241f28"/><path d="m48 15 3 1-2 2z" fill="#241f28"/></g></svg>';
const gullArt =
  '<svg viewBox="0 0 40 14"><path d="M1 8q10-6 19 2Q30 1 39 5c-8 0-12 5-18 8C11 9 8 8 1 8Z" fill="#e9e5de" stroke="#48515c" stroke-width=".65"/></svg>';

export function createPaintedIsland({
  host,
  markers,
  starMarkers,
  foxButton,
  onArrive,
  onNearby,
  onStar,
}) {
  const view = document.createElement('div');
  view.className = 'paint-view';
  view.tabIndex = 0;
  view.setAttribute(
    'aria-label',
    'Illustrated island. Choose a path to walk, or use the arrow keys to follow a trail. Press Enter at a landmark.'
  );
  const board = document.createElement('div');
  board.className = 'paint-board';
  board.setAttribute('aria-hidden', 'true');
  view.append(board);
  host.append(view);
  function sprite(className, art, point) {
    const el = document.createElement('span');
    el.className = className;
    el.innerHTML = art;
    board.append(el);
    at(el, point);
    return el;
  }
  const aurora = sprite('paint-aurora', '', [65, 8]);
  const beacon = sprite('paint-beacon', '', [93.2, 21.7]);
  [
    [64, 15],
    [69, 12.5],
    [73, 16],
  ].forEach((p, i) => {
    const el = sprite('paint-gull', gullArt, p);
    el.style.setProperty('--delay', -i * 2.2 + 's');
  });
  const player = sprite('paint-ranger', travelerArt, points.dock);
  const fox = sprite('paint-fox', foxArt, [84.6, 76.8]);
  player.style.setProperty('--face', -1);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController(),
    eventOptions = { signal: events.signal };
  let hero = [...points.dock],
    companion = [84.6, 76.8],
    current = 'dock',
    next = null;
  let route = [],
    visit = null,
    near = null,
    collected = new Set(),
    paused = false,
    disposed = false;
  let raf = 0,
    last = 0,
    drag = null,
    zoom = 1,
    following = true;
  let centre = [77.2, hero[1]],
    viewW = 1,
    viewH = 1,
    width = 1,
    left = 0,
    top = 0;
  const focus = () => view.focus({ preventScroll: true });
  function layout() {
    const height = width / 2;
    left =
      width < viewW
        ? (viewW - width) / 2
        : limit(viewW * 0.5 - (centre[0] * width) / 100, viewW - width, 0);
    top =
      height < viewH
        ? (viewH - height) * 0.48
        : limit(viewH * 0.54 - (centre[1] * height) / 100, viewH - height, 0);
    board.style.width = width + 'px';
    board.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(top) + 'px)';
    function pin(marker, p) {
      const x = left + (width * p[0]) / 100,
        y = top + (height * p[1]) / 100;
      marker.style.visibility = x < 10 || x > viewW - 10 || y < 12 || y > viewH - 16 ? 'hidden' : '';
      marker.style.transform =
        'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px) translate(-50%,-100%)';
    }
    pin(foxButton, companion);
    for (const [id, marker] of markers) pin(marker, paintedLabels[id]);
    for (const s of tideStars) pin(starMarkers.get(s.id), s.map);
  }
  function resize() {
    viewW = view.clientWidth;
    viewH = view.clientHeight;
    width = Math.max(viewW, Math.min(viewW * 3.5, viewH * 1.95)) * zoom;
    layout();
  }
  function changeZoom(factor) {
    zoom = limit(zoom * factor, 0.36, 2.1);
    resize();
  }
  function frame() {
    following = false;
    centre = [61, 50];
    zoom = 1;
    resize();
    changeZoom(Math.min(viewW / 0.79, viewH * 2) / width);
  }
  function updateActors() {
    at(player, hero);
    at(fox, companion);
    const nearby = Object.keys(paintedLabels).find((id) => length(hero, points[id]) < 1.1) || null;
    if (nearby !== near) {
      near = nearby;
      onNearby(near);
    }
    for (const s of tideStars) if (!collected.has(s.id) && length(hero, s.map) < 0.8) onStar(s.id);
  }
  function sparkle(point) {
    if (reduced.matches) return;
    const flare = sprite('paint-sparks', '', point);
    for (let i = 0; i < 9; i++) {
      const fleck = document.createElement('i'),
        angle = (i * Math.PI * 2) / 9;
      fleck.style.setProperty('--dx', Math.cos(angle) * 34 + 'px');
      fleck.style.setProperty('--dy', Math.sin(angle) * 28 - 9 + 'px');
      flare.append(fleck);
    }
    flare.addEventListener('animationend', () => flare.remove(), { once: true });
  }
  function setCollected(value, discovery) {
    collected = new Set(value);
    aurora.classList.toggle('lit', collected.size === tideStars.length);
    if (discovery) sparkle(points[discovery]);
  }
  let greetingTimer;
  function greet() {
    clearTimeout(greetingTimer);
    fox.classList.remove('greeting');
    void fox.offsetWidth;
    fox.classList.add('greeting');
    greetingTimer = setTimeout(() => fox.classList.remove('greeting'), 850);
  }
  function setVisited(value) {
    beacon.classList.toggle('lit', value.size === markers.size);
  }
  function idle() {
    player.classList.remove('walking');
    fox.classList.remove('walking');
  }
  function stop() {
    route = [];
    next = null;
    visit = null;
    idle();
  }
  function finish() {
    const id = visit;
    stop();
    if (id) onArrive(id);
  }
  function draw(now) {
    raf = 0;
    if (disposed || paused || document.hidden) return;
    const dt = last ? Math.min(1, (now - last) / 1000) : 0;
    last = now;
    let budget = dt * 14;
    while (next || route.length) {
      next ??= route.shift();
      const end = points[next],
        d = length(hero, end),
        dx = end[0] - hero[0],
        dy = end[1] - hero[1];
      if (Math.abs(dx) > 0.05) player.style.setProperty('--face', dx < 0 ? -1 : 1);
      if (d > budget) {
        hero = [hero[0] + (dx * budget) / d, hero[1] + (dy * budget) / d];
        break;
      }
      hero = [...end];
      budget -= d;
      current = next;
      next = null;
      if (!collected.has(current) && tideStars.some((s) => s.id === current)) onStar(current);
    }
    const dist = length(companion, hero),
      catchup = dist ? Math.min(1, (Math.max(0, dist - 1.35) * (1 - Math.exp(-dt * 7))) / dist) : 0;
    if (Math.abs(hero[0] - companion[0]) > 0.15)
      fox.style.setProperty('--face', hero[0] < companion[0] ? -1 : 1);
    companion = [
      companion[0] + (hero[0] - companion[0]) * catchup,
      companion[1] + (hero[1] - companion[1]) * catchup,
    ];
    if (following) {
      const ease = 1 - Math.exp(-dt * 6),
        lead = viewW / viewH < 0.8 ? 4 : 0;
      centre = [
        centre[0] + (hero[0] - lead - centre[0]) * ease,
        centre[1] + (hero[1] - centre[1]) * ease,
      ];
      layout();
    }
    updateActors();
    if (route.length || next) schedule();
    else finish();
  }
  function schedule() {
    if (!disposed && !paused && !document.hidden && !raf) raf = requestAnimationFrame(draw);
  }
  function jump(id) {
    stop();
    current = id;
    hero = [...points[id]];
    companion = [hero[0] - 1.4, hero[1] + 0.8];
    if (following) centre = [...hero];
    layout();
    updateActors();
  }
  function walk(id, open) {
    if (paused || !points[id]) return;
    following = true;
    if (reduced.matches) {
      jump(id);
      if (open) onArrive(id);
      return;
    }
    // A new destination can be chosen halfway along either end of the current trail.
    const start = next && length(hero, points[next]) < length(hero, points[current]) ? next : current;
    route = routeBetween(start, id);
    next = null;
    visit = open ? id : null;
    last = 0;
    player.classList.add('walking');
    fox.classList.add('walking');
    schedule();
  }
  function setPaused(value) {
    paused = value;
    view.classList.toggle('paused', value);
    if (value) {
      cancelAnimationFrame(raf);
      raf = 0;
      stop();
    }
    last = 0;
  }
  view.addEventListener(
    'pointerdown',
    (e) => {
      if (paused || drag || e.button !== 0) return;
      focus();
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, centre: [...centre], moved: false };
      view.setPointerCapture(e.pointerId);
    },
    eventOptions
  );
  view.addEventListener(
    'pointermove',
    (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 6) drag.moved = true;
      if (drag.moved) {
        following = false;
        centre = [
          limit(drag.centre[0] - (dx / width) * 100, 0, 100),
          limit(drag.centre[1] - (dy / width) * 200, 0, 100),
        ];
        layout();
      }
    },
    eventOptions
  );
  view.addEventListener(
    'pointerup',
    (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const moved = drag.moved;
      drag = null;
      if (paused || moved) return;
      const rect = view.getBoundingClientRect(),
        pt = [
          ((e.clientX - rect.left - left) / width) * 100,
          ((e.clientY - rect.top - top) / width) * 200,
        ];
      const closest = Object.keys(points).sort(
        (a, b) => length(pt, points[a]) - length(pt, points[b])
      )[0];
      if (length(pt, points[closest]) < 12) walk(closest, false);
    },
    eventOptions
  );
  view.addEventListener(
    'pointercancel',
    () => {
      drag = null;
    },
    eventOptions
  );
  const directions = {
    arrowup: [0, -1],
    w: [0, -1],
    arrowdown: [0, 1],
    s: [0, 1],
    arrowleft: [-1, 0],
    a: [-1, 0],
    arrowright: [1, 0],
    d: [1, 0],
  };
  window.addEventListener(
    'keydown',
    (e) => {
      if (
        paused ||
        e.altKey ||
        e.metaKey ||
        e.ctrlKey ||
        (document.activeElement !== view && document.activeElement !== document.body)
      )
        return;
      const key = e.key.toLowerCase(),
        dir = directions[key];
      if (dir) {
        e.preventDefault();
        if (document.activeElement !== view) focus();
        if (raf) return;
        let best = null,
          score = 0.03;
        for (const id of neighbours.get(current)) {
          const p = points[id],
            dx = p[0] - hero[0],
            dy = (p[1] - hero[1]) / 2;
          const dot = (dx * dir[0] + dy * dir[1]) / (Math.hypot(dx, dy) || 1);
          if (dot > score) {
            score = dot;
            best = id;
          }
        }
        if (best) walk(best, false);
      } else if ((key === 'e' || key === 'enter') && near && !e.repeat) {
        e.preventDefault();
        onArrive(near);
      }
    },
    eventOptions
  );
  document.addEventListener(
    'visibilitychange',
    () => {
      last = 0;
      if (!document.hidden && (route.length || next)) schedule();
    },
    eventOptions
  );
  reduced.addEventListener(
    'change',
    () => {
      if (reduced.matches && (route.length || next)) {
        const end = route.at(-1) || next,
          id = visit;
        jump(end);
        if (id) onArrive(id);
      }
    },
    eventOptions
  );
  const observer = new ResizeObserver(resize);
  observer.observe(view);
  resize();
  return {
    travelTo: (id) => walk(id, true),
    travelToStar: (id) => walk(id, false),
    placeTraveler: jump,
    greet,
    setVisited,
    setCollected,
    setPaused,
    zoom: changeZoom,
    frame,
    focus,
    dispose() {
      disposed = true;
      clearTimeout(greetingTimer);
      cancelAnimationFrame(raf);
      observer.disconnect();
      events.abort();
      view.remove();
    },
  };
}
