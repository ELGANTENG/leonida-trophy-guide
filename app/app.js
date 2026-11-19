// Leonida Trophy Guide — an offline tracker for the 55 GTA VI trophies on PlayStation 5.
// Progress lives in localStorage; the guide data comes from data/trophies.json beside this file.
// Nothing here fetches anything over the network: source links are plain anchors a reader follows.
const KEY = 'leonida-trophy-guide-v1';
const params = new URLSearchParams(location.search);

const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const earnedFilterEl = document.getElementById('earned-filter');
const spoilerEl = document.getElementById('spoiler');
const progressText = document.getElementById('progress-text');
const progressPct = document.getElementById('progress-pct');
const progressFill = document.getElementById('progress-fill');
const gradeCountsEl = document.getElementById('grade-counts');
const resultCountEl = document.getElementById('result-count');
const onlineNoteEl = document.getElementById('online-note');

let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
} catch {
  earned = new Set();
}
const openId = Number(params.get('open') ?? '0') || null;
const expanded = new Set(openId ? [openId] : []);

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sources = doc.sources;
const byId = new Map(trophies.map((t) => [t.id, t]));

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeLabel(grade) {
  return grade === 'platinum' ? 'Platinum' : grade[0].toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  const labels = {
    story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
    activities: 'Activities', completion: '100% completion', platinum: 'Platinum', online: 'Online',
  };
  return labels[kind] ?? kind;
}

function isSpoilerHidden(t) {
  return spoilerEl.checked && t.hidden && !earned.has(t.id);
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function trophyCard(t) {
  const li = el('li', 'trophy' + (earned.has(t.id) ? ' earned' : ''));
  const head = el('div', 'trophy-head');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    renderAll();
  });
  head.append(box);

  const main = el('div', 'trophy-main');
  const name = el('h3', 'trophy-name');
  if (isSpoilerHidden(t)) {
    name.append(el('span', 'hidden-mark', 'Hidden story trophy'));
  } else {
    name.textContent = t.name;
  }
  main.append(name);
  main.append(el('p', 'trophy-desc', isSpoilerHidden(t) ? 'Hidden on PlayStation until earned.' : t.description));

  const tags = el('div', 'trophy-tags');
  tags.append(el('span', 'tag ' + t.grade, gradeLabel(t.grade)));
  tags.append(el('span', 'tag', kindLabel(t.kind)));
  if (t.hidden) tags.append(el('span', 'tag hidden-tag', 'Hidden'));
  if (t.missable) tags.append(el('span', 'tag missable', 'Potentially missable'));
  if (t.count !== null && t.count !== undefined) {
    tags.append(el('span', 'tag', 'Count: ' + t.count.toLocaleString('en-US')));
  }
  tags.append(el('span', 'tag', 'Roadmap stage ' + t.roadmap_stage));
  main.append(tags);
  head.append(main);

  if (!isSpoilerHidden(t)) {
    const btn = el('button', 'guide-btn', expanded.has(t.id) ? 'Hide guide' : 'Guide');
    btn.type = 'button';
    btn.addEventListener('click', () => {
      if (expanded.has(t.id)) expanded.delete(t.id);
      else expanded.add(t.id);
      renderAll();
    });
    head.append(btn);
  }
  li.append(head);

  if (expanded.has(t.id) && !isSpoilerHidden(t)) {
    const detail = el('div', 'trophy-detail');
    detail.append(el('h4', null, 'How to get it'));
    detail.append(el('p', null, t.guide));
    if (t.steps && t.steps.length) {
      detail.append(el('h4', null, 'Steps'));
      const ol = document.createElement('ol');
      for (const step of t.steps) ol.append(el('li', null, step));
      detail.append(ol);
    }
    const src = el('p', 'sources', 'Sources: ');
    (t.sources ?? []).forEach((key, i) => {
      const s = sources[key];
      if (!s) return;
      if (i > 0) src.append(document.createTextNode(' · '));
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      src.append(a);
    });
    detail.append(src);
    detail.append(el('p', 'stage-note', 'Roadmap stage ' + t.roadmap_stage + ' — ' + doc.roadmap[t.roadmap_stage - 1].title + '.'));
    li.append(detail);
  }
  return li;
}

function filtered() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kindEl.value === 'online') return false;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (earnedFilterEl.value === 'earned' && !earned.has(t.id)) return false;
    if (earnedFilterEl.value === 'unearned' && earned.has(t.id)) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  progressText.textContent = done + ' of ' + total + ' earned';
  progressPct.textContent = Math.round((done / total) * 100) + '%';
  progressFill.style.width = (done / total) * 100 + '%';
  gradeCountsEl.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const ofGrade = trophies.filter((t) => t.grade === grade);
    const got = ofGrade.filter((t) => earned.has(t.id)).length;
    gradeCountsEl.append(el('span', null, gradeLabel(grade) + ' ' + got + '/' + ofGrade.length));
  }
}

function renderList() {
  const rows = filtered();
  listEl.replaceChildren(...rows.map(trophyCard));
  emptyEl.classList.toggle('hidden', rows.length > 0);
  resultCountEl.textContent = rows.length + ' of ' + trophies.length + ' shown';
  onlineNoteEl.classList.toggle('hidden', kindEl.value !== 'online');
}

function renderRoadmap() {
  const ol = document.getElementById('roadmap');
  ol.replaceChildren();
  for (const stage of doc.roadmap) {
    const li = document.createElement('li');
    li.append(el('h3', null, stage.title));
    li.append(el('p', null, stage.text));
    const chips = el('div', 'chips');
    for (const id of stage.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      chips.append(el('span', 'chip' + (earned.has(id) ? ' done' : ''), t.name));
    }
    li.append(chips);
    ol.append(li);
  }
}

function renderMissables() {
  const ul = document.getElementById('missable-list');
  ul.replaceChildren(...trophies.filter((t) => t.missable).map(trophyCard));
}

function renderSources() {
  const ul = document.getElementById('source-list');
  ul.replaceChildren();
  for (const s of Object.values(sources)) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a);
    ul.append(li);
  }
}

function renderAll() {
  renderProgress();
  renderList();
  renderRoadmap();
  renderMissables();
}

function showView(name) {
  for (const button of document.querySelectorAll('.tabs button')) {
    button.classList.toggle('active', button.dataset.view === name);
  }
  for (const section of document.querySelectorAll('main .view')) {
    section.classList.toggle('hidden', section.id !== 'view-' + name);
  }
}

for (const button of document.querySelectorAll('.tabs button')) {
  button.addEventListener('click', () => showView(button.dataset.view));
}

for (const control of [searchEl, kindEl, gradeEl, earnedFilterEl, spoilerEl]) {
  control.addEventListener('input', renderList);
  control.addEventListener('change', renderList);
}

document.getElementById('export').addEventListener('click', () => {
  const data = { game: doc.game, exported: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(ids.filter((id) => byId.has(id)));
    earned = valid;
    save();
    renderAll();
  } catch {
    alert('That file is not a Leonida Trophy Guide progress export.');
  }
  event.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    save();
    renderAll();
  }
});

// Deep links for screenshots and sharing: ?view=roadmap|missables|sources, ?kind=, ?grade=, ?spoiler=off, ?open=<id>
if (params.get('view')) showView(params.get('view'));
if (params.get('kind')) kindEl.value = params.get('kind');
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('spoiler') === 'off') spoilerEl.checked = false;

renderSources();
renderAll();
