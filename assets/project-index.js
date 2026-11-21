(() => {
  const controls = document.getElementById('index-controls');
  const search = document.getElementById('project-query');
  const count = document.getElementById('result-count');
  const clear = document.getElementById('clear-index');
  const records = [...document.querySelectorAll('.project-record')];
  const buttons = [...controls.querySelectorAll('[data-filter]')];
  let field = 'all';
  function filter(updateURL) {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const record of records) {
      record.hidden = (field !== 'all' && record.dataset.place !== field) ||
        !record.textContent.toLocaleLowerCase().includes(query);
      if (!record.hidden) visible++;
    }
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === field)));
    count.textContent = visible + (visible === 1 ? ' project' : ' projects');
    document.getElementById('empty-search').hidden = visible > 0;
    clear.hidden = field === 'all' && !query;
    if (updateURL) {
      const url = new URL(location.href);
      field === 'all' ? url.searchParams.delete('place') : url.searchParams.set('place', field);
      query ? url.searchParams.set('q', search.value.trim()) : url.searchParams.delete('q');
      url.hash = '';
      history.replaceState(null, '', url);
    }
  }
  function readLocation() {
    const url = new URL(location.href);
    const name = url.searchParams.get('place');
    field = buttons.some(b => b.dataset.filter === name) ? name : 'all';
    search.value = url.searchParams.get('q') || '';
    const linkedRecord = document.getElementById(url.hash.slice(1));
    if (linkedRecord?.matches('.project-record')) { field = 'all'; search.value = ''; }
    filter(false);
  }
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (button) { field = button.dataset.filter; filter(true); }
  });
  search.addEventListener('input', () => filter(true));
  clear.addEventListener('click', () => { field = 'all'; search.value = ''; filter(true); search.focus(); });
  window.addEventListener('popstate', readLocation);
  window.addEventListener('hashchange', readLocation);
  controls.hidden = false;
  readLocation();
})();
