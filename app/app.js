// Leonida Trophy Guide — checklist tracker: progress in localStorage, export/import,
// kind and grade filters, search, and a spoiler setting that hides un-earned story trophies.
const EARNED_KEY = 'leonida-trophy-guide-earned-v1';
const SPOILER_KEY = 'leonida-trophy-guide-spoiler-v1';
const KIND_LABELS = {
  all: 'All 55',
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectibles',
  activity: 'Activities',
  online: 'Online',
  platinum: 'Platinum',
};
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

const listEl = document.getElementById('trophy-list');
const emptyEl = document.getElementById('empty-state');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const earnedOnlyEl = document.getElementById('earned-only');
const kindFiltersEl = document.getElementById('kind-filters');
const filterNoteEl = document.getElementById('filter-note');

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const sourceNames = data.sources ?? {};

let earned = new Set(readStoredEarned());
let spoilerOn = localStorage.getItem(SPOILER_KEY) === '1';
let activeKind = 'all';
spoilerEl.checked = spoilerOn;

function readStoredEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((name) => typeof name === 'string') : [];
  } catch {
    return [];
  }
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort()));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
}

function isHiddenBySpoiler(trophy) {
  return spoilerOn && trophy.kinds.includes('story') && !earned.has(trophy.name);
}

function gradeCounts(pool) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of pool) counts[t.grade] = (counts[t.grade] ?? 0) + 1;
  return counts;
}

function renderProgress() {
  document.getElementById('earned-count').textContent = String(earned.size);
  document.getElementById('progress-fill').style.width = `${(earned.size / trophies.length) * 100}%`;
  const earnedTrophies = trophies.filter((t) => earned.has(t.name));
  const byGrade = gradeCounts(earnedTrophies);
  const total = gradeCounts(trophies);
  document.getElementById('progress-by-grade').textContent = GRADE_ORDER.map(
    (g) => `${g}: ${byGrade[g]}/${total[g]}`,
  ).join(' · ');
}

function renderRoadmap() {
  document.getElementById('missable-text').textContent = data.missable_warning ?? '';
  const stepsEl = document.getElementById('roadmap-steps');
  stepsEl.replaceChildren();
  for (const step of data.roadmap ?? []) {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    h3.textContent = `Step ${step.step} — ${step.title}`;
    const p = document.createElement('p');
    p.textContent = step.text;
    li.append(h3, p);
    stepsEl.append(li);
  }
  const sourceList = document.getElementById('source-list');
  sourceList.replaceChildren();
  for (const key of Object.keys(sourceNames)) {
    const li = document.createElement('li');
    li.textContent = sourceNames[key];
    sourceList.append(li);
  }
}

function renderKindFilters() {
  kindFiltersEl.replaceChildren();
  for (const kind of Object.keys(KIND_LABELS)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kind-chip';
    button.textContent = KIND_LABELS[kind];
    button.setAttribute('aria-pressed', String(activeKind === kind));
    button.addEventListener('click', () => {
      activeKind = kind;
      renderKindFilters();
      renderList();
    });
    kindFiltersEl.append(button);
  }
}

function trophyMatches(trophy) {
  if (activeKind !== 'all' && !trophy.kinds.includes(activeKind)) return false;
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (earnedOnlyEl.checked && !earned.has(trophy.name)) return false;
  const query = searchEl.value.trim().toLowerCase();
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function renderList() {
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren();
  emptyEl.hidden = shown.length > 0;
  if (activeKind === 'online') {
    filterNoteEl.textContent = 'No online trophies: all 55 are offline single-player, so this filter is empty by design (PowerPyx).';
  } else if (shown.length === 0) {
    filterNoteEl.textContent = '';
  } else {
    filterNoteEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies · ${earned.size} earned.`;
  }
  for (const trophy of shown) {
    const li = document.createElement('li');
    li.className = `trophy grade-${trophy.grade}${earned.has(trophy.name) ? ' earned' : ''}`;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', 'Mark this trophy as earned');
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveEarned();
      renderProgress();
      renderList();
    });

    const body = document.createElement('div');
    const head = document.createElement('div');
    head.className = 'trophy-head';
    const name = document.createElement('span');
    name.className = 'trophy-name';
    const gradeBadge = document.createElement('span');
    gradeBadge.className = 'grade-badge';
    gradeBadge.textContent = trophy.grade;
    head.append(name, gradeBadge);
    for (const kind of trophy.kinds) {
      const tag = document.createElement('span');
      tag.className = 'kind-tag';
      tag.textContent = KIND_LABELS[kind] ?? kind;
      head.append(tag);
    }
    if (trophy.missable) {
      const tag = document.createElement('span');
      tag.className = 'missable-tag';
      tag.textContent = '⚠ Missable';
      head.append(tag);
    }
    body.append(head);

    if (isHiddenBySpoiler(trophy)) {
      const hidden = document.createElement('p');
      hidden.className = 'spoiler-hidden';
      hidden.textContent = 'Hidden story trophy — its name and description stay hidden until you earn it. Tick the box when you have it to reveal it.';
      body.append(hidden);
    } else {
      name.textContent = trophy.name;
      const desc = document.createElement('p');
      desc.className = 'trophy-desc';
      desc.textContent = trophy.description;
      body.append(desc);
      if (trophy.missable && trophy.missable_note) {
        const note = document.createElement('p');
        note.className = 'missable-note';
        note.textContent = trophy.missable_note;
        body.append(note);
      }
      const guide = document.createElement('details');
      guide.className = 'guide';
      const summary = document.createElement('summary');
      summary.textContent = 'Guide';
      const guideText = document.createElement('p');
      guideText.textContent = trophy.guide;
      const sources = document.createElement('p');
      sources.className = 'guide-sources';
      sources.textContent = `Sources: ${(trophy.sources ?? []).map((key) => sourceNames[key] ?? key).join(' · ')}`;
      guide.append(summary, guideText, sources);
      body.append(guide);
    }

    li.append(box, body);
    listEl.append(li);
  }
  renderProgress();
}

function exportProgress() {
  const payload = {
    app: 'leonida-trophy-guide',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'gta6-trophy-progress.json';
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

async function importProgress(file) {
  const text = await file.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    filterNoteEl.textContent = 'That file is not valid JSON — nothing was imported.';
    return;
  }
  const names = Array.isArray(payload) ? payload : payload.earned;
  if (!Array.isArray(names)) {
    filterNoteEl.textContent = 'That file has no earned-trophy list — nothing was imported.';
    return;
  }
  const known = new Set(trophies.map((t) => t.name));
  const kept = names.filter((name) => typeof name === 'string' && known.has(name));
  earned = new Set(kept);
  saveEarned();
  renderList();
  filterNoteEl.textContent = `Imported ${kept.length} earned trophies (${names.length - kept.length} unknown names skipped).`;
}

document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) void importProgress(file);
  event.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  earned = new Set();
  saveEarned();
  renderList();
});
spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  saveSpoiler();
  renderList();
});
searchEl.addEventListener('input', renderList);
gradeEl.addEventListener('change', renderList);
earnedOnlyEl.addEventListener('change', renderList);

renderRoadmap();
renderKindFilters();
renderList();
