const screen = document.getElementById('world');
const intro = document.getElementById('world-intro');
const start = document.getElementById('begin-walk');
const directory = document.getElementById('island-directory');
const placesToggle = document.getElementById('places-toggle');
const dialog = document.getElementById('place-dialog');
const markerLayer = document.getElementById('map-labels');
const status = document.getElementById('world-status');
const nearby = document.getElementById('nearby');
const projectSections = [...document.querySelectorAll('.place-section')];
const places = new Map(projectSections.map(section => [section.dataset.place, {
  section, name: section.querySelector('h2').textContent, color: section.dataset.color,
}]));
const storageKey = 'samu-quest.island.places.v1';
let visited = new Set();
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (Array.isArray(saved)) visited = new Set(saved.filter(id => places.has(id)));
} catch {}
let scene;
let mode = 'intro';
let toastTimer;
let returnFocus;
let currentPlace;
let currentNearby;
const markers = new Map();
const directoryLinks = [...directory.querySelectorAll('[data-go]')];
const mapSpots = {
  observatory: [35, 18], 'field-station': [39, 45], workshop: [73, 28],
  stage: [76, 65], glasshouse: [56, 21], library: [84, 45],
};
function say(message, lasting = false) {
  clearTimeout(toastTimer);
  status.textContent = message;
  if (message && !lasting) toastTimer = setTimeout(() => { status.textContent = ''; }, 4800);
}
function updateProgress() {
  const complete = visited.size === places.size;
  document.getElementById('progress-text').textContent = complete
    ? 'Lighthouse lit · 6 of 6 places' : visited.size + ' of ' + places.size + ' places visited';
  screen.classList.toggle('lighthouse-lit', complete);
  for (const [id, marker] of markers) {
    marker.classList.toggle('visited', visited.has(id));
    marker.setAttribute('aria-label', places.get(id).name + (visited.has(id) ? ', visited' : ''));
  }
  directoryLinks.forEach(link => link.classList.toggle('visited', visited.has(link.dataset.go)));
  scene?.setVisited(visited);
}
function closeDirectory(restore = false) {
  directory.classList.remove('open');
  directory.inert = true;
  placesToggle.setAttribute('aria-expanded','false');
  if (restore) placesToggle.focus({preventScroll:true});
  scene?.setPaused(dialog.open);
}
function showDirectory(event) {
  event?.preventDefault();
  if (directory.classList.contains('open')) { closeDirectory(true); return; }
  scene?.setPaused(true);
  directory.inert = false;
  directory.classList.add('open');
  placesToggle.setAttribute('aria-expanded','true');
  directory.querySelector('[data-go]').focus({preventScroll:true});
}
function showPlace(id, origin) {
  const place = places.get(id);
  if (!place) return;
  returnFocus = origin || markers.get(id);
  closeDirectory();
  scene?.setPaused(true);
  currentPlace = id;
  document.getElementById('dialog-title').textContent = place.name;
  document.getElementById('dialog-category').textContent = place.section.querySelector('.quest-kicker').textContent;
  document.getElementById('dialog-intro').textContent = place.section.querySelector('.place-intro').textContent;
  const items = place.section.querySelector('.island-projects').cloneNode(true);
  document.getElementById('dialog-projects').replaceChildren(...items.children);
  dialog.style.setProperty('--place-tint',place.color);
  const firstVisit = !visited.has(id);
  visited.add(id);
  try { localStorage.setItem(storageKey,JSON.stringify([...visited])); } catch {}
  updateProgress();
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  const url = new URL(location.href); url.hash = 'place-' + id;
  history.replaceState(null,'',url);
  const complete = firstVisit && visited.size === places.size;
  const message = complete ? 'You found all six places. The lighthouse is lit.' : '';
  dialog.querySelector('.return-world').textContent = complete ? 'See the lighthouse' : 'Back to the island';
  if (message) say(message,true);
}
function finishPlace() {
  if (location.hash === '#place-' + currentPlace) history.replaceState(null,'',location.pathname+location.search);
  scene?.setPaused(false);
  const focus = returnFocus?.isConnected && !returnFocus.closest('[inert]') && !returnFocus.closest('[hidden]') ? returnFocus : null;
  if (focus && focus.getClientRects().length) focus.focus({preventScroll:true});
  else if (mode === 'intro') start.focus({preventScroll:true});
  else placesToggle.focus({preventScroll:true});
  if (visited.size === places.size) say('The lighthouse is lit. Welcome back anytime.');
}
function travel(id, origin) {
  const wasDirectory = directory.classList.contains('open');
  if (wasDirectory) closeDirectory(true);
  if (mode === '3d' && !wasDirectory) {
    scene.travelTo(id);
    returnFocus = origin;
    say('Walking to the ' + places.get(id).name + '…');
  } else {
    if (mode === '3d') scene.placeTraveler(id);
    showPlace(id,wasDirectory ? placesToggle : origin);
  }
}
function nearbyChanged(id) {
  currentNearby = id;
  nearby.hidden = !id;
  if (id) nearby.textContent = 'Enter ' + places.get(id).name;
  markers.forEach((marker,key) => marker.classList.toggle('near', key === id));
}
function illustratedMode() {
  scene?.dispose();
  scene = undefined; mode = 'map';
  screen.dataset.mode = mode;
  document.getElementById('world-hud').hidden = true;
  intro.hidden = true;
  markerLayer.hidden = false;
  markers.forEach((marker,id) => {
    const [x,y] = mapSpots[id];
    marker.style.left = x + '%'; marker.style.top = y + '%';
    marker.style.visibility = ''; marker.style.transform = '';
  });
  say('Illustrated map · Choose a landmark to open its projects.',true);
}
async function begin() {
  if (mode !== 'intro') return;
  mode = 'loading'; start.disabled = true; start.textContent = 'Opening the island…';
  try {
    const { createIsland } = await import('./island-scene.js');
    scene = createIsland({
      host: document.getElementById('scene-host'), markers, places,
      onArrive(id) { say(''); showPlace(id,markers.get(id)); },
      onNearby: nearbyChanged,
      onLost: illustratedMode,
    });
    mode = '3d'; screen.dataset.mode = mode;
    intro.hidden = true; markerLayer.hidden = false;
    document.getElementById('world-hud').hidden = false;
    document.getElementById('movement-tip').textContent = matchMedia('(pointer:coarse)').matches
      ? 'Tap a path to walk · Drag to orbit' : 'Click a path to walk · Drag to orbit · WASD to move';
    scene.setVisited(visited); scene.setPaused(dialog.open || directory.classList.contains('open'));
    scene.focus(); say('');
  } catch { illustratedMode(); }
}
screen.classList.add('interactive');
directory.classList.add('enhanced'); directory.inert = true;
directory.querySelector('.close-sheet').hidden = false;
markerLayer.hidden = true; start.hidden = false;
for (const [id,place] of places) {
  const marker = document.createElement('button');
  marker.type = 'button'; marker.className = 'place-marker'; marker.dataset.marker = id;
  marker.style.setProperty('--place-tint',place.color);
  const icon = directory.querySelector('[data-go="'+id+'"] .place-icon').cloneNode(true);
  const label = document.createElement('span'); label.textContent = place.name;
  marker.append(icon,label); marker.addEventListener('click',() => travel(id,marker));
  markers.set(id,marker); markerLayer.append(marker);
}
placesToggle.addEventListener('click',showDirectory);
document.querySelector('.intro-index').addEventListener('click',showDirectory);
directory.querySelector('.close-sheet').addEventListener('click',() => closeDirectory(true));
directoryLinks.forEach(link => link.addEventListener('click',event => { event.preventDefault(); travel(link.dataset.go,link); }));
directory.addEventListener('keydown', event => {
  if (event.key !== 'Tab' || !directory.classList.contains('open')) return;
  const first = directory.querySelector('.close-sheet'), last = directoryLinks.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
document.addEventListener('keydown',event => {
  if (event.key === 'Escape' && !dialog.open && directory.classList.contains('open')) closeDirectory(true);
});
document.addEventListener('pointerdown',event => {
  if (directory.classList.contains('open') && !directory.contains(event.target) && !placesToggle.contains(event.target)) closeDirectory();
});
start.addEventListener('click',begin);
dialog.querySelector('.close-place').addEventListener('click',() => dialog.close());
dialog.querySelector('.return-world').addEventListener('click',() => dialog.close());
dialog.addEventListener('click',event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
});
dialog.addEventListener('close',finishPlace);
nearby.addEventListener('click',() => { if (currentNearby) showPlace(currentNearby,nearby); });
document.getElementById('zoom-in').addEventListener('click',() => scene?.zoom(1.2));
document.getElementById('zoom-out').addEventListener('click',() => scene?.zoom(1/1.2));
document.getElementById('frame-island').addEventListener('click',() => scene?.frame());
function followHash() {
  const id = location.hash.startsWith('#place-') ? location.hash.slice(7) : '';
  if (places.has(id)) showPlace(id,placesToggle);
  else if (location.hash === '#island-directory' && !directory.classList.contains('open')) showDirectory();
}
window.addEventListener('hashchange',followHash);
updateProgress(); followHash();
