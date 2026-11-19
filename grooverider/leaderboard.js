const origin = 'https://kombucha-leaderboard.djrozzo.workers.dev/api/waves-of-light';
const dialog = document.querySelector('#globalScores');
const form = document.querySelector('#scoreForm');
const button = document.querySelector('#openScores');
const status = document.querySelector('#scoreStatus');
const entries = document.querySelector('#scoreEntries');
let run;
let finished;
let view = 0;

async function api(path, data) {
  const response = await fetch(origin + path, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
    ...(data && {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data)})
  });
  if (!response.ok) throw Error('Leaderboard request failed');
  return response.json();
}

async function loadScores(success = '') {
  const id = ++view;
  entries.replaceChildren();
  status.textContent = 'Loading scores…';
  try {
    const {entries: rows} = await api('/scores');
    if (id !== view) return;
    const items = rows.map(({name, score}) => {
      const li = document.createElement('li');
      li.textContent = name + ' — ' + score.toLocaleString('en');
      return li;
    });
    entries.replaceChildren(...items);
    status.textContent = success || (items.length ? '' : 'No scores yet.');
  } catch {
    if (id === view) status.textContent = success || 'Global scores are unavailable right now.';
  }
}

async function openScores() {
  form.hidden = true;
  dialog.showModal();
  const loading = loadScores();
  const current = finished;
  const token = current && await current.run;
  if (dialog.open && current === finished && token && !current.saved) {
    form.hidden = false;
    document.querySelector('#submitScoreValue').textContent = finished.score.toLocaleString('en');
  }
  await loading;
}

button.addEventListener('click', openScores);
const available = api('/scores').then(() => { button.hidden = false; return true; }).catch(() => false);
dialog.addEventListener('close', () => { view++; });
document.addEventListener('waves-run-start', () => {
  finished = null;
  run = available.then(ready => ready ? api('/run', {}).then(result => result.token) : null).catch(() => null);
});
document.addEventListener('waves-run-end', ({detail}) => {
  finished = detail > 0 ? {score: detail, run, saved: false} : null;
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  const current = finished;
  if (!current || current.saved) return;
  const submit = form.querySelector('button');
  submit.disabled = true;
  view++;
  status.textContent = 'Saving score…';
  try {
    await api('/scores', {name: form.elements.nickname.value.trim(), score: current.score, token: await current.run});
    current.saved = true;
    if (dialog.open) {
      form.hidden = true;
      await loadScores('Score saved.');
    }
  } catch {
    if (dialog.open) status.textContent = 'Could not save the score. Try again.';
  } finally {
    submit.disabled = false;
  }
});
