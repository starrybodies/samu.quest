import { createPaintedIsland } from './island-painted.js';
import { tideStars } from './island-quest.js';

const screen = document.getElementById('world');
const host = document.getElementById('scene-host');
const directory = document.getElementById('island-directory');
const placesToggle = document.getElementById('places-toggle');
const dialog = document.getElementById('place-dialog');
const markerLayer = document.getElementById('map-labels');
const status = document.getElementById('world-status');
const nearby = document.getElementById('nearby');
const foxButton = document.getElementById('pet-fox');
const musicButton = document.getElementById('quest-sound');
const places = new Map(
  [...document.querySelectorAll('.place-section')].map((section) => [
    section.dataset.place,
    {
      section,
      name: section.querySelector('h2').textContent,
      color: section.dataset.color,
    },
  ])
);
const stars = new Map(tideStars.map((star) => [star.id, star]));
const directoryLinks = [...directory.querySelectorAll('[data-go]')];
const markers = new Map(),
  starMarkers = new Map(),
  starTrails = new Map();
const visitKey = 'samu-quest.island.places.v1',
  starKey = 'samu-quest.island.stars.v1';
function readProgress(key, items) {
  try {
    const ids = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(ids)) return new Set(ids.filter((id) => items.has(id)));
  } catch {}
  return new Set();
}
function save(key, ids) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {}
}
const visited = readProgress(visitKey, places),
  collected = readProgress(starKey, stars);
let scene,
  toastTimer,
  foxTimer,
  returnFocus,
  currentPlace,
  currentNearby,
  interacted = false,
  audio;
function say(message) {
  clearTimeout(toastTimer);
  status.textContent = message;
  if (message)
    toastTimer = setTimeout(() => {
      status.textContent = '';
    }, 5200);
}
function chime(midi) {
  if (!audio || musicButton.getAttribute('aria-pressed') !== 'true' || audio.state !== 'running') return;
  midi.forEach((note, i) => {
    const tone = audio.createOscillator(),
      envelope = audio.createGain(),
      t = audio.currentTime + 0.025 + i * 0.13;
    tone.type = 'sine';
    tone.frequency.value = 440 * Math.pow(2, (note - 69) / 12);
    envelope.gain.setValueAtTime(0.0001, t);
    envelope.gain.exponentialRampToValueAtTime(0.075, t + 0.022);
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
    tone.connect(envelope);
    envelope.connect(audio.destination);
    tone.start(t);
    tone.stop(t + 1);
    tone.onended = () => {
      tone.disconnect();
      envelope.disconnect();
    };
  });
}
function updatePlaces() {
  const complete = visited.size === places.size;
  document.getElementById('progress-text').textContent = complete
    ? 'Lighthouse lit'
    : visited.size + '/' + places.size + ' places';
  screen.classList.toggle('lighthouse-lit', complete);
  for (const [id, marker] of markers) {
    marker.classList.toggle('visited', visited.has(id));
    marker.setAttribute('aria-label', places.get(id).name + (visited.has(id) ? ', visited' : ''));
  }
  for (const link of directoryLinks) link.classList.toggle('visited', visited.has(link.dataset.go));
  scene?.setVisited(visited);
}
function updateStars(discovery) {
  const complete = collected.size === stars.size;
  document.getElementById('star-count').textContent = complete
    ? 'Aurora awake'
    : collected.size + '/' + stars.size + ' tide stars';
  screen.classList.toggle('aurora-awake', complete);
  for (const [id, marker] of starMarkers) {
    marker.hidden = collected.has(id);
    const trail = starTrails.get(id);
    trail.disabled = marker.hidden;
    trail.querySelector('small').textContent = marker.hidden ? 'Found' : stars.get(id).hint;
  }
  scene?.setCollected(collected, discovery);
}
function collect(id) {
  if (!stars.has(id) || collected.has(id)) return;
  const heldFocus = document.activeElement === starMarkers.get(id);
  collected.add(id);
  save(starKey, collected);
  updateStars(id);
  if (heldFocus) scene.focus();
  if (collected.size === stars.size) {
    say('Three tide stars. The northern lights are awake.');
    chime([62, 69, 74, 78, 81]);
    scene.frame();
  } else {
    const star = stars.get(id);
    say(
      star.name +
        ' found. ' +
        (stars.size - collected.size) +
        (collected.size === 1 ? ' stars left.' : ' star left.')
    );
    chime(collected.size === 1 ? [74, 81] : [78, 81, 85]);
  }
}
function closeDirectory(restore = false) {
  directory.classList.remove('open');
  directory.inert = true;
  placesToggle.setAttribute('aria-expanded', 'false');
  if (restore) placesToggle.focus({ preventScroll: true });
  scene?.setPaused(dialog.open);
}
function showDirectory(event) {
  event?.preventDefault();
  if (directory.classList.contains('open')) {
    closeDirectory(true);
    return;
  }
  scene?.setPaused(true);
  directory.inert = false;
  directory.classList.add('open');
  placesToggle.setAttribute('aria-expanded', 'true');
  directoryLinks[0].focus({ preventScroll: true });
}
function showPlace(id, origin) {
  const place = places.get(id);
  if (!place) return;
  returnFocus = origin || markers.get(id);
  closeDirectory();
  scene?.setPaused(true);
  currentPlace = id;
  say('');
  document.getElementById('dialog-title').textContent = place.name;
  document.getElementById('dialog-category').textContent =
    place.section.querySelector('.quest-kicker').textContent;
  document.getElementById('dialog-intro').textContent =
    place.section.querySelector('.place-intro').textContent;
  const items = place.section.querySelector('.island-projects').cloneNode(true);
  document.getElementById('dialog-projects').replaceChildren(...items.children);
  dialog.style.setProperty('--place-tint', place.color);
  const firstVisit = !visited.has(id);
  visited.add(id);
  save(visitKey, visited);
  updatePlaces();
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  const url = new URL(location.href);
  url.hash = 'place-' + id;
  history.replaceState(null, '', url);
  const complete = firstVisit && visited.size === places.size;
  dialog.querySelector('.return-world').textContent = complete
    ? 'See the lighthouse'
    : 'Back to the island';
  if (firstVisit) chime(complete ? [62, 66, 69, 74] : [62, 69]);
}
function finishPlace() {
  if (location.hash === '#place-' + currentPlace)
    history.replaceState(null, '', location.pathname + location.search);
  scene?.setPaused(false);
  if (
    returnFocus?.isConnected &&
    !returnFocus.closest('[inert],[hidden]') &&
    returnFocus.getClientRects().length &&
    getComputedStyle(returnFocus).visibility !== 'hidden'
  )
    returnFocus.focus({ preventScroll: true });
  else scene?.focus();
  if (visited.size === places.size) say('All six places visited. The lighthouse is lit.');
}
function travel(id, origin) {
  if (directory.classList.contains('open')) {
    closeDirectory(true);
    scene?.placeTraveler(id);
    showPlace(id, placesToggle);
    return;
  }
  returnFocus = origin;
  say('Walking to the ' + places.get(id).name + '…');
  scene?.travelTo(id);
}
function findStar(id) {
  if (collected.has(id)) return;
  if (directory.classList.contains('open')) closeDirectory(true);
  scene?.focus();
  say(stars.get(id).hint + '…');
  scene?.travelToStar(id);
}
function nearbyChanged(id) {
  currentNearby = id;
  nearby.hidden = !id;
  if (id) nearby.textContent = 'Enter ' + places.get(id).name;
  for (const [key, marker] of markers) marker.classList.toggle('near', key === id);
}
for (const [id, place] of places) {
  const marker = document.createElement('button');
  marker.type = 'button';
  marker.className = 'place-marker';
  marker.dataset.marker = id;
  marker.style.setProperty('--place-tint', place.color);
  const icon = directory.querySelector('[data-go="' + id + '"] .place-icon').cloneNode(true);
  const label = document.createElement('span');
  label.textContent = place.name;
  marker.append(icon, label);
  marker.addEventListener('click', () => travel(id, marker));
  markers.set(id, marker);
  markerLayer.append(marker);
}
const starIcon =
  '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 2 3.8 10.2L28 16l-8.2 3.8L16 30l-3.8-10.2L4 16l8.2-3.8Z" fill="#ffe7b3" stroke="#9a654c" stroke-width="1.1"/><path d="m16 6 1.1 9-1.1 9-1.1-9z" fill="#fff9e7"/></svg>';
for (const star of tideStars) {
  const marker = document.createElement('button');
  marker.type = 'button';
  marker.className = 'star-marker';
  marker.innerHTML = starIcon;
  marker.setAttribute('aria-label', 'Find the ' + star.name);
  marker.title = star.name;
  marker.dataset.star = star.id;
  marker.addEventListener('click', () => findStar(star.id));
  starMarkers.set(star.id, marker);
  markerLayer.append(marker);
  const trail = document.createElement('button');
  trail.type = 'button';
  trail.innerHTML = starIcon + '<span></span><small></small>';
  trail.querySelector('span').textContent = star.name;
  trail.addEventListener('click', () => findStar(star.id));
  document.getElementById('star-trails').append(trail);
  starTrails.set(star.id, trail);
}
placesToggle.addEventListener('click', showDirectory);
document.querySelector('.skip').addEventListener('click', showDirectory);
directory.querySelector('.close-sheet').addEventListener('click', () => closeDirectory(true));
directoryLinks.forEach((link) =>
  link.addEventListener('click', (e) => {
    e.preventDefault();
    travel(link.dataset.go, link);
  })
);
directory.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab' || !directory.classList.contains('open')) return;
  const items = directory.querySelectorAll('button:not(:disabled),[data-go]');
  const first = items[0],
    last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  }
  if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !dialog.open && directory.classList.contains('open')) closeDirectory(true);
});
document.addEventListener('pointerdown', (e) => {
  if (
    directory.classList.contains('open') &&
    !directory.contains(e.target) &&
    !placesToggle.contains(e.target)
  )
    closeDirectory();
});
dialog.querySelector('.close-place').addEventListener('click', () => dialog.close());
dialog.querySelector('.return-world').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => {
  if (e.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
    dialog.close();
});
dialog.addEventListener('close', finishPlace);
nearby.addEventListener('click', () => {
  if (currentNearby) showPlace(currentNearby, nearby);
});
foxButton.addEventListener('click', () => {
  scene?.greet();
  clearTimeout(foxTimer);
  foxButton.classList.add('happy');
  foxTimer = setTimeout(() => foxButton.classList.remove('happy'), 1050);
  say('The fox wags its tail.');
  chime([69, 76]);
});
document.getElementById('zoom-in').addEventListener('click', () => scene?.zoom(1.2));
document.getElementById('zoom-out').addEventListener('click', () => scene?.zoom(1 / 1.2));
document.getElementById('frame-island').addEventListener('click', () => scene?.frame());
const AudioEngine = window.AudioContext || window.webkitAudioContext;
if (!AudioEngine) musicButton.hidden = true;
musicButton.addEventListener('click', async () => {
  const enable = musicButton.getAttribute('aria-pressed') !== 'true';
  try {
    if (enable) {
      audio ??= new AudioEngine();
      await audio.resume();
    } else if (audio) await audio.suspend();
    musicButton.setAttribute('aria-pressed', String(enable));
    musicButton.title = enable ? 'Mute sound' : 'Turn sound on';
    if (enable) chime([69, 74]);
  } catch {
    say('Sound is unavailable on this device.');
  }
});
function followHash() {
  const id = location.hash.startsWith('#place-') ? location.hash.slice(7) : '';
  if (places.has(id)) {
    scene?.placeTraveler(id);
    showPlace(id, placesToggle);
  } else if (location.hash === '#island-directory' && !directory.classList.contains('open'))
    showDirectory();
}
window.addEventListener('hashchange', followHash);
const options = {
  host,
  markers,
  starMarkers,
  foxButton,
  places,
  onArrive: (id) => showPlace(id, markers.get(id)),
  onNearby: nearbyChanged,
  onStar: collect,
  onLost: usePainting,
};
function activate(next, mode) {
  const restoreInput = host.contains(document.activeElement);
  scene?.dispose();
  scene = next;
  screen.dataset.mode = mode;
  const coarse = matchMedia('(pointer:coarse)').matches;
  document.getElementById('movement-tip').textContent =
    mode === '3d'
      ? coarse
        ? 'Tap to walk · Drag to orbit'
        : 'Click to walk · Drag to orbit · WASD to move'
      : coarse
        ? 'Tap a trail · Drag to look around'
        : 'Click a trail · Drag to look around · Arrow keys to walk';
  nearbyChanged(null);
  updatePlaces();
  updateStars();
  if (dialog.open && places.has(currentPlace)) scene.placeTraveler(currentPlace);
  scene.setPaused(dialog.open || directory.classList.contains('open'));
  if (restoreInput && !dialog.open && !directory.classList.contains('open')) scene.focus();
}
function usePainting() {
  activate(createPaintedIsland(options), 'map');
}
async function enable3D() {
  const canvas = document.createElement('canvas'),
    attrs = { alpha: false, antialias: true, powerPreference: 'low-power' };
  const switchButton = document.getElementById('switch-3d');
  let context;
  function release() {
    canvas.remove();
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  }
  try {
    context = canvas.getContext('webgl2', attrs) || canvas.getContext('webgl', attrs);
    if (!context) return;
    const { createIsland } = await import('./island-scene.js');
    const enter = () => {
      switchButton.hidden = true;
      try {
        activate(createIsland({ ...options, canvas, context }), '3d');
      } catch {
        release();
      }
    };
    if (interacted) {
      // Keep an in-progress walk intact if the 3D engine arrives over a slow connection.
      switchButton.hidden = false;
      switchButton.addEventListener('click', enter, { once: true });
    } else enter();
  } catch {
    release();
  }
}
for (const event of ['pointerdown', 'keydown'])
  document.addEventListener(
    event,
    () => {
      interacted = true;
    },
    { capture: true, once: true }
  );
screen.classList.add('interactive');
directory.classList.add('enhanced');
directory.inert = true;
directory.querySelector('.close-sheet').hidden = false;
for (const el of [
  markerLayer,
  document.getElementById('world-hud'),
  document.getElementById('star-guide'),
  screen.querySelector('.world-progress'),
])
  el.hidden = false;
usePainting();
followHash();
if (!location.hash && !collected.size) say('Find three tide stars to wake the northern lights.');
requestAnimationFrame(() => requestAnimationFrame(enable3D));
