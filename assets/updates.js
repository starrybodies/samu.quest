(() => {
  const curated = new Set(['starrybodies/overshoot', 'starrybodies/ghg-calculator']);
  function projectURL(value) {
    const url = new URL(value);
    return url.origin + url.pathname.replace(/\/+$/, '');
  }
  const curatedURLs = new Set(Array.from(document.querySelectorAll('.professional-project, .personal-project, .publishing-note a'), anchor => projectURL(anchor.href)));
  const root = 'https://raw.githubusercontent.com/starrybodies/samu.quest/main/data/';

  function link(label, url) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Invalid project URL');
    const element = document.createElement('a');
    element.textContent = label;
    element.href = parsed.href;
    element.target = '_blank';
    element.rel = 'noopener noreferrer';
    return element;
  }

  function render(records, announcements = false) {
    const groups = { professional: [], personal: [] };
    for (const record of records) {
      if (!groups[record.category] || (!announcements && (curated.has(record.id) || curatedURLs.has(projectURL(record.url))))) continue;
      const article = document.createElement('article');
      article.className = 'shipped-project';
      const heading = document.createElement(record.category === 'personal' ? 'h4' : 'h5');
      heading.textContent = record.title;
      const description = document.createElement('p');
      description.textContent = record.description;
      const links = document.createElement('div');
      links.className = 'engineering-links';
      if (announcements) {
        const source = new URL(record.source);
        if (!['linkedin.com', 'www.linkedin.com'].includes(source.hostname)) continue;
        links.append(link('Announcement ↗', record.source));
      } else {
        const source = new URL(record.source);
        if (source.hostname !== 'github.com' || !source.pathname.startsWith('/starrybodies/')) continue;
        links.append(link('Live project ↗', record.url), link('Source code ↗', record.source));
      }
      article.append(heading);
      if (record.description) article.append(description);
      article.append(links);
      groups[record.category].push(article);
    }
    // Preserve a visible section's position when a remote feed expands above it.
    const anchor = document.getElementById(location.hash.slice(1));
    const anchorTop = anchor?.getBoundingClientRect().top;
    for (const [category, articles] of Object.entries(groups)) {
      if (!articles.length) continue;
      const prefix = announcements ? 'announcements' : 'shipped';
      const container = document.getElementById(`${prefix}-${category}`);
      if (!container) continue;
      container.replaceChildren(...articles.slice(0, 6));
      container.parentElement.hidden = false;
    }
    if (anchor && anchorTop >= 0 && anchorTop < innerHeight) {
      const shift = anchor.getBoundingClientRect().top - anchorTop;
      if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: 'instant' });
    }
  }

  for (const [file, announcements] of [['production-projects.json', false], ['announcements.json', true]]) {
    fetch(root + file, { cache: 'no-cache', signal: AbortSignal.timeout(10000) })
      .then(response => {
        if (!response.ok) throw new Error('Project feed unavailable');
        return response.json();
      })
      .then(records => render(records, announcements))
      .catch(() => {}); // Curated, static case studies remain available if a feed cannot be read.
  }
})();
