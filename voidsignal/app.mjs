import { WORLD, LEVELS, STEP, COLORS, createGame, createDailyGame, dailyKey, trigger, stepGame, starsFor, ratingFor } from './game-engine.mjs';

const $ = id => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d', { alpha: false });
const TOTAL_LEVELS = LEVELS.length;
const DAILY_SAVE = 'voidsignal.v04.daily';
function readDaily(){try{const d=JSON.parse(localStorage.getItem(DAILY_SAVE)||'{}');return d&&typeof d==='object'?d:{}}catch{return {}}}
let daily=readDaily();
let mode='campaign';
let slowTimer=0, collapseTimer=0, collapseDone=false;
const scorePopups=[];
function saveDaily(){try{localStorage.setItem(DAILY_SAVE,JSON.stringify(daily))}catch{}}
function todayDaily(){const day=dailyKey();if(!daily[day])daily[day]={attempts:0,best:0,percent:0};return {day,record:daily[day]};}
function refreshDaily(){const {day,record}=todayDaily();$('daily-date').textContent=day+' UTC';$('daily-attempts').textContent=`${Math.max(0,3-record.attempts)} / 3 ATTEMPTS REMAINING`;$('daily-best').textContent=record.best?`BEST ${record.best.toLocaleString('en-US')} · ${record.percent}%`:'NO SCORE YET';$('daily-play').disabled=record.attempts>=3;$('daily-play').textContent=record.attempts>=3?'COME BACK TOMORROW':'PLAY DAILY SIGNAL';}
const saveKey = 'voidsignal.v02.progress'; // Keep existing player progression
const soundKey = 'voidsignal.v02.muted'; // Preserve v0.2 sound preference

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(saveKey) || '{}');
    return {
      unlocked: Math.min(TOTAL_LEVELS, Math.max(1, d.unlocked || 1)),
      stars: d.stars || {},
      scores: d.scores || {},
    };
  } catch {
    return { unlocked: 1, stars: {}, scores: {} };
  }
}

let save = load();
let muted = false;
try { muted = localStorage.getItem(soundKey) === 'true'; } catch {}

let game = createGame(1);
let selected = 1;
let screen = 'home';
let panelBefore = 'home';
let soundCtx = null;
let lastTime = 0;
let accum = 0;
let shake = 0;
let backgroundClock = 0;
let lastUI = 0;
let prevFinish = false;
let recentAudio = 0;
let comboLabelTimer = 0;
const flashes = [];
const sparks = [];
const ripples = [];
const fxImages = {};
for (const name of ['core-cyan','core-amber','core-echo','shockwave','burst-amber','burst-violet','comet','nova','core-void','core-freeze','burst-void','burst-freeze','collapse']) {
  const img = new Image(); img.src = `./assets/fx/${name}.png`;
  fxImages[name] = img;
}
function drawFx(name, x, y, size, opacity=1, rotation=0) {
  const img=fxImages[name]; if (!img?.complete || !img.naturalWidth) return;
  ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=opacity;
  ctx.translate(x,y);ctx.rotate(rotation);ctx.drawImage(img,-size/2,-size/2,size,size);ctx.restore();
}
const motionReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (motionReduced) document.body.classList.add('reduce-motion');

function pad(num, n = 2) { return String(num).padStart(n, '0'); }
function levelAccessible(id) { return id <= save.unlocked; }
function persist() { try { localStorage.setItem(saveKey, JSON.stringify(save)); } catch {} }

function audioInit() {
  if (muted) return;
  try {
    soundCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (soundCtx.state === 'suspended') soundCtx.resume();
  } catch {
    soundCtx = null;
  }
}

function tone(freq, duration, volume = 0.06, type = 'sine', delay = 0) {
  if (muted || !soundCtx) return;
  const at = soundCtx.currentTime + delay;
  const osc = soundCtx.createOscillator();
  const amp = soundCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, at);
  osc.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 0.74), at + duration);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), at + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  osc.connect(amp).connect(soundCtx.destination);
  osc.start(at);
  osc.stop(at + duration + 0.01);
}

function hitTone(kind, depth) {
  const now = performance.now();
  if (now - recentAudio < 24) return;
  recentAudio = now;
  const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
  const note = scale[Math.min(9, (depth - 1) % 10)];
  const base = kind === 'amplifier' ? 165 : kind === 'echo' ? 250 : 220;
  tone(base * Math.pow(2, note / 12), kind === 'amplifier' ? 0.26 : 0.17, kind === 'amplifier' ? 0.07 : 0.04, kind === 'echo' ? 'triangle' : 'sine');
}
function launchTone() { tone(135, 0.32, 0.075, 'sine'); tone(270, 0.13, 0.035, 'triangle', 0.03); }
function finishTone(stars) {
  if (!stars) { tone(175, 0.24, 0.047, 'triangle'); return; }
  for (let i = 0; i < Math.min(3, stars); i++) tone(392 * Math.pow(2, i * 4 / 12), 0.25, 0.055, 'sine', i * 0.08);
}

function populateList() {
  const list = $('mission-list');
  const grid = $('level-grid');
  list.innerHTML = '';
  grid.innerHTML = '';
  for (const lv of LEVELS) {
    const unlocked = levelAccessible(lv.id);
    const stars = save.stars[lv.id] || 0;
    const item = document.createElement('button');
    item.className = `mission-item ${lv.id === selected ? 'selected' : ''}`;
    item.disabled = !unlocked;
    item.innerHTML = `<span class="mission-index">${pad(lv.id)}</span><span class="mission-name">${lv.code}</span><span class="mission-status ${stars ? 'complete' : ''}">${unlocked ? (stars ? '★'.repeat(stars) : '○') : '⌁'}</span>`;
    item.title = unlocked ? `Play ${lv.code}` : 'Locked';
    item.onclick = () => choose(lv.id);
    list.appendChild(item);

    const tile = document.createElement('button');
    tile.className = `level-card ${lv.id === selected ? 'current' : ''}`;
    tile.disabled = !unlocked;
    tile.innerHTML = `<b>${pad(lv.id)}</b><span>${unlocked ? lv.code : 'LOCKED'}</span><span class="level-stars">${stars ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : unlocked ? '☆☆☆' : '⌁'}</span>`;
    tile.onclick = () => choose(lv.id);
    grid.appendChild(tile);
  }
}

function updateMission() {
  const l = game.level;
  if(mode==='campaign') selected = l.id;
  $('level-kicker').innerHTML = mode==='daily'?`DAILY SIGNAL <span class="sublabel">// ${dailyKey()} UTC</span>`:`MISSION ${pad(l.id)} <span class="sublabel">// CAMPAIGN</span>`;
  $('mission-title').textContent = l.code;
  $('mission-description').textContent = l.subtitle;
  $('total-count').textContent = '/ ' + (l.count-(l.void||0));
  $('field-tip').textContent = l.tip;
  $('void-key').classList.toggle('inactive', !l.void);
  $('freeze-key').classList.toggle('inactive', !l.freeze);
  $('amplifier-key').classList.toggle('inactive', !l.amp);
  $('echo-key').classList.toggle('inactive', !l.echo);
  $('best-score').textContent = pad(mode==='daily'?todayDaily().record.best:(save.scores[l.id]||0),6);
  $('campaign-progress').textContent = `${pad(Math.min(save.unlocked, TOTAL_LEVELS))} / ${pad(TOTAL_LEVELS)}`;
  $('mission-count-home').textContent = `${TOTAL_LEVELS} MISSIONS`;
  refreshDaily();
  $('mission-unlock-note').textContent = `Clear at least ${LEVELS[0].thresholds[0]}–${LEVELS.at(-1).thresholds[0]}% to unlock the next mission.`;
  populateList();
  refreshTelemetry();
}

function refreshTelemetry() {
  $('live-score').textContent = pad(game.score, 6);
  $('hits-count').textContent = pad(game.hits);
  $('chain-depth').textContent = pad(game.bestDepth);
  const targetCount=game.level.count-(game.level.void||0);
  const pc = Math.round(game.hits / targetCount * 100);
  $('hit-percent').textContent = pc + '% OF FIELD';
  $('progress-fill').style.width = pc + '%';
  $('star-row').innerHTML = game.level.thresholds.map(v => `<div class="star-goal"><span class="star ${pc >= v ? 'earned' : ''}">★</span><small>${v}%</small></div>`).join('');
  $('coord').textContent = `X: ${pad(Math.floor(game.pulse?.x ?? 480), 3)} Y: ${pad(Math.floor(game.pulse?.y ?? 300), 3)}`;
  const secs = game.elapsed;
  const mm = pad(Math.floor(secs / 60));
  const ss = pad(Math.floor(secs % 60));
  const hs = pad(Math.floor((secs % 1) * 100));
  $('timer-readout').textContent = `∆ ${mm}:${ss}.${hs}`;
  const message = screen === 'home' ? 'AWAITING TRANSMISSION' : game.phase === 'ready' ? 'AWAITING INPUT' : game.phase === 'active' ? 'CHAIN REACTION ACTIVE' : 'TRANSMISSION COMPLETE';
  $('system-message').textContent = message;
  $('pulse-indicator').classList.toggle('active', game.phase === 'active');
  $('level-state').textContent = game.phase === 'ready' ? '● READY' : game.phase === 'active' ? '● LIVE' : '● COMPLETE';
  $('level-state').className = 'level-state ' + (game.phase === 'active' ? 'active' : game.phase === 'finished' ? 'complete' : '');
}

function display(screenName) {
  screen = screenName;
  for (const [id, state] of [['home-overlay', 'home'], ['select-overlay', 'select'], ['help-overlay', 'help'], ['result-overlay', 'result'], ['daily-overlay','daily']]) {
    $(id).classList.toggle('hidden', state !== screenName);
  }
  $('play-hint').classList.toggle('hide', screenName !== 'play' || game.phase !== 'ready');
  refreshTelemetry();
}

function resetFx() {
  slowTimer=0;collapseTimer=0;collapseDone=false;scorePopups.length=0;
  flashes.length = 0;
  sparks.length = 0;
  ripples.length = 0;
  comboLabelTimer = 0;
  $('combo-banner').classList.add('hidden');
  shake = 0;
  accum = 0;
  prevFinish = false;
}

function choose(id) {
  if (!levelAccessible(id)) return;
  mode='campaign';
  selected = id;
  game = createGame(id);
  resetFx();
  updateMission();
  display('play');
}
function openDaily(){const {record}=todayDaily();if(record.attempts>=3){display('daily');return;} mode='daily';game=createDailyGame();resetFx();updateMission();display('play');}
function restart() { if(mode==='daily'){openDaily();return;} game = createGame(selected); resetFx(); updateMission(); display('play'); }
function goHome() { mode='campaign';selected=Math.max(1,selected);game = createGame(selected); resetFx(); updateMission(); display('home'); }
function openPanel(which) { panelBefore = screen; display(which); }
function closePanel() { display(panelBefore === 'select' || panelBefore === 'help' ? 'home' : panelBefore); }

function onFinish() {
  const stars = starsFor(game);
  if(mode==='daily'){const {record}=todayDaily();record.best=Math.max(record.best,game.score);record.percent=Math.max(record.percent,Math.round(game.hits*100/(game.level.count-(game.level.void||0))));saveDaily();refreshDaily();}
  else {
  if (stars) {
    save.stars[selected] = Math.max(save.stars[selected] || 0, stars);
    save.unlocked = Math.max(save.unlocked, Math.min(TOTAL_LEVELS, selected + 1));
  }
  save.scores[selected] = Math.max(save.scores[selected] || 0, game.score);
  persist();
  }
  $('best-score').textContent = pad(mode==='daily'?todayDaily().record.best:save.scores[selected], 6);
  $('result-kicker').textContent = stars ? '// TRANSMISSION COMPLETE' : '// TRANSMISSION INCOMPLETE';
  $('result-rating').textContent = ratingFor(game);
  $('result-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  $('result-hits').textContent = game.hits + ' / ' + (game.level.count-(game.level.void||0));
  $('result-depth').textContent = pad(game.bestDepth);
  $('result-score').textContent = game.score.toLocaleString('en-US');
  const pc = Math.round(game.hits * 100 / (game.level.count-(game.level.void||0)));
  const nextThreshold = game.level.thresholds.find(t => pc < t);
  $('result-line').textContent = pc === 100 ? 'Every particle. One perfect signal.' : nextThreshold ? `Just ${nextThreshold - pc}% away from the next star. Try another timing.` : stars === 3 ? 'All three stars secured. Can you beat your score?' : 'A new mission is waiting.';
  if (!stars) $('result-line').textContent = mode==='daily'?'Signal incomplete. Try another timing.':`Reach ${game.level.thresholds[0]}% to unlock the next mission.`;
  $('next').innerHTML = mode==='daily'?'<span>DAILY RESULTS</span><b>→</b>':stars ? (selected === TOTAL_LEVELS ? '<span>MISSION SELECT</span><b>→</b>' : '<span>NEXT MISSION</span><b>→</b>') : '<span>TRY AGAIN</span><b>→</b>';
  finishTone(stars);
  populateList();
  if(pc===100) {collapseTimer=1.65;collapseDone=true;slowTimer=Math.max(slowTimer,.6);$('result-rating').textContent='TOTAL COLLAPSE';$('result-overlay').classList.add('perfect');} else $('result-overlay').classList.remove('perfect');
  display('result');
}

function fire(clientX, clientY) {
  if (screen !== 'play' || game.phase !== 'ready') return;
  const rect = canvas.getBoundingClientRect();
  const x = (clientX - rect.left) / rect.width * WORLD.width;
  const y = (clientY - rect.top) / rect.height * WORLD.height;
  audioInit();
  if(mode==='daily'){const {record}=todayDaily();if(record.attempts>=3){display('daily');return;}record.attempts++;saveDaily();refreshDaily();}
  if (trigger(game, Math.max(0, Math.min(WORLD.width, x)), Math.max(0, Math.min(WORLD.height, y)))) {
    launchTone();
    shake = 3;
    ripples.push({ x, y, r: 10, life: 20, maxLife:20, speed:2.5, kind: 'normal' });
    $('play-hint').classList.add('hide');
    refreshTelemetry();
  }
}

canvas.addEventListener('pointerdown', e => { e.preventDefault(); fire(e.clientX, e.clientY); });
canvas.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && screen === 'play' && game.phase === 'ready') {
    e.preventDefault();const r=canvas.getBoundingClientRect();fire(r.left+r.width/2,r.top+r.height/2);
  }
});

$('play').onclick = () => choose(selected);
$('levels-home').onclick = () => openPanel('select');
$('daily-home').onclick=()=>{refreshDaily();openPanel('daily')};
$('daily-close').onclick=closePanel;
$('daily-play').onclick=()=>openDaily();
$('daily-menu').onclick=()=>{goHome();openPanel('daily')};
$('close-levels').onclick = closePanel;
$('close-help').onclick = closePanel;
$('help-go').onclick = closePanel;
$('help').onclick = () => openPanel('help');
$('retry').onclick = restart;
$('restart-top').onclick = restart;
$('brand').onclick = goHome;
$('next').onclick = () => {
  if(mode==='daily'){goHome();openPanel('daily');return;}
  const solved = starsFor(game) > 0;
  const nextId = solved ? Math.min(TOTAL_LEVELS, selected + 1) : selected;
  if (solved && selected === TOTAL_LEVELS) { openPanel('select'); return; }
  choose(nextId);
};

function updateSound() {
  const btn = $('sound');
  btn.classList.toggle('off', muted);
  btn.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
  btn.title = muted ? 'Unmute sound' : 'Mute sound';
}
$('sound').onclick = () => { muted = !muted; try { localStorage.setItem(soundKey, String(muted)); } catch {} if (!muted) { audioInit(); tone(540, .1, .03); } updateSound(); };
updateSound();

addEventListener('keydown', e => {
  const tag = document.activeElement?.tagName;
  if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); restart(); }
  else if (e.key === 'Escape' && (screen === 'help' || screen === 'select'||screen==='daily')) closePanel();
  else if (e.key === 'Escape' && screen === 'play') goHome();
  else if (e.key.toLowerCase() === 'm' && tag !== 'INPUT') $('sound').click();
});

function showCombo(depth) {
  if (depth < 5 || depth === game.bestDepth-1) return;
  const banner = $('combo-banner');
  const label = depth >= 20 ? `MEGA CHAIN x${depth}` : depth >= 12 ? `CHAIN BURST x${depth}` : `CHAIN x${depth}`;
  banner.textContent = label;
  banner.classList.remove('hidden');
  comboLabelTimer = 1.0;
}

function drawBackground(t) {
  ctx.fillStyle = '#070e1c';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  const grad = ctx.createRadialGradient(480, 300, 45, 480, 300, 680);
  grad.addColorStop(0, '#10213b');
  grad.addColorStop(0.6, '#0b1429');
  grad.addColorStop(1, '#060a15');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  const glowA = ctx.createRadialGradient(240 + Math.sin(t * 0.5) * 40, 180, 10, 240, 180, 240);
  glowA.addColorStop(0, 'rgba(88,217,255,0.15)'); glowA.addColorStop(1, 'rgba(88,217,255,0)');
  ctx.fillStyle = glowA; ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  const glowB = ctx.createRadialGradient(730, 420 + Math.cos(t * 0.6) * 30, 10, 730, 420, 260);
  glowB.addColorStop(0, 'rgba(196,138,255,0.12)'); glowB.addColorStop(1, 'rgba(196,138,255,0)');
  ctx.fillStyle = glowB; ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#1b344b45';
  ctx.beginPath();
  for (let x = 0; x < WORLD.width; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.height); }
  for (let y = 0; y < WORLD.height; y += 40) { ctx.moveTo(0, y); ctx.lineTo(WORLD.width, y); }
  ctx.stroke();

  ctx.fillStyle = '#4a729655';
  for (let x = 20; x < WORLD.width; x += 40) for (let y = 20; y < WORLD.height; y += 40) ctx.fillRect(x - .6, y - .6, 1.2, 1.2);

  ctx.strokeStyle = '#203d5755';
  ctx.beginPath();
  ctx.moveTo(480, 16); ctx.lineTo(480, 584); ctx.moveTo(16, 300); ctx.lineTo(944, 300);
  ctx.stroke();
}

function drawParticle(p, time) {
  const col = COLORS[p.kind];
  const flicker = 0.86 + Math.sin(time * 2.5 + p.phase) * 0.14;
  const r = p.kind === 'normal' ? p.size : p.size + 2;

  drawFx(p.kind === 'amplifier' ? 'core-amber' : p.kind === 'echo' ? 'core-echo' : p.kind==='void'?'core-void':p.kind==='freeze'?'core-freeze':'core-cyan', p.x, p.y, p.kind === 'normal' ? 27 : 41, .57);
  // trail
  const tx = p.x - p.vx * 8;
  const ty = p.y - p.vy * 8;
  const grad = ctx.createLinearGradient(p.x, p.y, tx, ty);
  const rgb = p.kind === 'amplifier' ? '255,179,97' : p.kind === 'echo' ? '196,138,255' : p.kind === 'void' ? '255,80,125' : p.kind === 'freeze' ? '137,245,228' : '88,217,255';
  grad.addColorStop(0, `rgba(${rgb},0.20)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  ctx.strokeStyle = grad;
  ctx.lineWidth = Math.max(1.2, r * 0.7);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(tx, ty);
  ctx.stroke();

  ctx.globalAlpha = flicker;
  ctx.shadowBlur = p.kind === 'normal' ? 18 : 29;
  ctx.shadowColor = col;
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r + 1.7, -0.6, 1.6);
  ctx.stroke();

  if (p.kind !== 'normal') {
    const size = p.kind === 'amplifier' ? 13 : 11;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.kind === 'amplifier' ? Math.PI / 4 + time * 0.7 : time * 0.4);
    ctx.strokeStyle = col;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.4;
    if (p.kind === 'void') {ctx.beginPath();ctx.moveTo(-size,-size);ctx.lineTo(size,size);ctx.moveTo(size,-size);ctx.lineTo(-size,size);ctx.stroke();} else if(p.kind==='freeze'){for(let i=0;i<6;i++){const ang=i*Math.PI/3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(ang)*size,Math.sin(ang)*size);ctx.stroke()}} else if (p.kind === 'amplifier') ctx.strokeRect(-size / 2, -size / 2, size, size);
    else {
      ctx.beginPath(); ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, size * 1.15, -0.4, 0.5); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawWave(w) {
  if (w.delay > 0) return;
  const rgb = w.kind === 'amplifier' ? '255,179,97' : w.kind === 'echo' ? '196,138,255' : w.kind==='freeze'?'137,245,228':'88,217,255';
  const fade = (1 - w.r / w.max);
  const alpha = w.r >= w.max ? Math.max(0, (12 - w.life) / 12) * 0.12 : 0.10 + fade * 0.62;

  if (w.r > 14) drawFx('shockwave',w.x,w.y,w.r*2.3,Math.min(.48,alpha*.7));
  ctx.strokeStyle = `rgba(${rgb},${alpha})`;
  ctx.lineWidth = w.kind === 'amplifier' ? 4 : 3;
  ctx.shadowBlur = 28;
  ctx.shadowColor = `rgba(${rgb},0.7)`;
  ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(${rgb},${alpha * 0.24})`;
  ctx.lineWidth = 12;
  ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.18})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(w.x, w.y, Math.max(0, w.r - 8), 0, Math.PI * 2); ctx.stroke();
}

function drawHitFlash(f) {
  const a = Math.max(0, f.life / 22);
  drawFx(f.kind==='amplifier'?'burst-amber':f.kind==='echo'?'burst-violet':f.kind==='freeze'?'burst-freeze':f.kind==='void'?'burst-void':'nova', f.x, f.y, 30+(22-f.life)*3.8, Math.min(1,a*.75));
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = COLORS[f.kind];
  ctx.shadowColor = COLORS[f.kind];
  ctx.shadowBlur = 26;
  ctx.beginPath();
  ctx.arc(f.x, f.y, 2 + (22 - f.life) * 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSpark(s) {
  if (s.life > s.maxLife*.72) drawFx('comet',s.x,s.y,12,.19,Math.atan2(s.vy,s.vx));
  ctx.save();
  ctx.globalAlpha = Math.max(0, s.life / s.maxLife);
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.beginPath();
  ctx.moveTo(s.x, s.y);
  ctx.lineTo(s.x - s.vx * 2.3, s.y - s.vy * 2.3);
  ctx.stroke();
  ctx.restore();
}

function drawRipple(r) {
  ctx.save();
  const rgb = r.kind === 'amplifier' ? '255,179,97' : r.kind === 'echo' ? '196,138,255' : r.kind==='void'?'255,80,125':r.kind==='freeze'?'137,245,228':'88,217,255';
  ctx.globalAlpha = Math.max(0, r.life / r.maxLife) * 0.7;
  ctx.strokeStyle = `rgba(${rgb},1)`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function drawComboCallout(time) {
  if (comboLabelTimer <= 0 || game.phase === 'finished') return;
  const depth = game.bestDepth;
  const y = 96 + Math.sin(time * 8) * 2;
  ctx.save();
  ctx.globalAlpha = Math.min(1, comboLabelTimer * 1.4);
  ctx.textAlign = 'center';
  ctx.font = '700 18px Inter, system-ui, sans-serif';
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#58d9ff';
  ctx.fillStyle = depth >= 12 ? '#ffcb72' : '#9fe8ff';
  ctx.fillText(depth >= 12 ? `CHAIN BURST x${depth}` : `CHAIN x${depth}`, 480, y);
  ctx.restore();
}

function draw(time) {
  ctx.save();
  if (shake > 0 && !motionReduced) {
    ctx.translate((Math.sin(time * 70) * shake) * 0.6, (Math.cos(time * 57) * shake) * 0.6);
    shake *= 0.88;
    if (shake < 0.2) shake = 0;
  }
  drawBackground(time);
  for (const p of game.particles) if (!p.hit) drawParticle(p, time);
  for (const w of game.waves) drawWave(w);
  for (const r of ripples) drawRipple(r);
  for (const f of flashes) drawHitFlash(f);
  for (const s of sparks) drawSpark(s);
  drawComboCallout(time);
  for(const pop of scorePopups){ctx.save();ctx.globalAlpha=Math.min(1,pop.life/22);ctx.font='800 20px system-ui';ctx.textAlign='center';ctx.shadowBlur=13;ctx.shadowColor=pop.color;ctx.fillStyle=pop.color;ctx.fillText(pop.text,pop.x,pop.y);ctx.restore();}
  if(collapseTimer>0){const k=1-collapseTimer/1.65;ctx.save();ctx.globalCompositeOperation='lighter';drawFx('collapse',480,300,240+k*650,Math.min(.95,collapseTimer*.65),k*1.8);ctx.strokeStyle=`rgba(255,215,147,${Math.min(.8,collapseTimer*.5)})`;ctx.lineWidth=10;ctx.beginPath();ctx.arc(480,300,k*740,0,Math.PI*2);ctx.stroke();ctx.restore();}
  if (game.phase === 'ready' && screen === 'play') {
    const pulse = 0.5 + Math.sin(time * 3) * 0.3;
    ctx.strokeStyle = `rgba(95,222,255,${0.09 + pulse * 0.11})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(480, 300, 28 + pulse * 13, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#3f92ad99';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ONE PULSE AVAILABLE', 480, 342);
  }
  ctx.restore();
}

function advanceFx(delta) {
  for (let i = flashes.length - 1; i >= 0; i--) { flashes[i].life -= delta * 60; if (flashes[i].life <= 0) flashes.splice(i, 1); }
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx; s.y += s.vy; s.vx *= 0.985; s.vy *= 0.985; s.life -= delta * 60;
    if (s.life <= 0) sparks.splice(i, 1);
  }
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i]; r.r += r.speed; r.life -= delta * 60; if (r.life <= 0) ripples.splice(i, 1);
  }
  for(let i=scorePopups.length-1;i>=0;i--){const pop=scorePopups[i];pop.life-=delta*60;pop.y-=delta*24;if(pop.life<=0)scorePopups.splice(i,1);}
  collapseTimer=Math.max(0,collapseTimer-delta);slowTimer=Math.max(0,slowTimer-delta);
  if (comboLabelTimer > 0) {
    comboLabelTimer -= delta;
    if (comboLabelTimer <= 0) $('combo-banner').classList.add('hidden');
  }
}

function emitBurst(ev) {
  const color = COLORS[ev.kind];
  flashes.push({ x: ev.x, y: ev.y, kind: ev.kind, life: 22 });
  ripples.push({ x: ev.x, y: ev.y, r: 4, speed: ev.kind === 'amplifier' ? 3.5 : 2.2, life: 14, maxLife: 14, kind: ev.kind });
  const count = ev.kind === 'amplifier' ? 22 : ev.kind === 'echo' ? 16 : ev.kind==='void'?20:ev.kind==='freeze'?16:12;
  if(ev.points && scorePopups.length<50)scorePopups.push({x:ev.x,y:ev.y-15,life:35,text:'+'+ev.points,color});
  for (let i = 0; i < count && sparks.length < 300; i++) {
    const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = (ev.kind === 'amplifier' ? 3.5 : 2.6) + Math.random() * 1.4;
    sparks.push({
      x: ev.x, y: ev.y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: 17 + Math.random() * 14,
      maxLife: 31,
      width: ev.kind === 'amplifier' ? 2 : 1.4,
      color,
    });
  }
}

function tick(ts) {
  if (!lastTime) lastTime = ts;
  const delta = Math.min(0.06, (ts - lastTime) / 1000);
  lastTime = ts;
  backgroundClock += delta;
  const simulationActive = screen === 'play' || screen === 'result';

  if (simulationActive) {
    accum += delta*(slowTimer>0 && !motionReduced ? .38 : 1);
    let steps = 0;
    while (accum >= STEP && steps < 5) {
      if (screen === 'play' && game.phase !== 'finished') {
        stepGame(game);
        for (const ev of game.events) {
          if (ev.type === 'void') {emitBurst(ev);shake=Math.min(8,shake+2);}
          else if(ev.type==='freeze'){ripples.push({x:ev.x,y:ev.y,r:2,speed:5,life:25,maxLife:25,kind:'freeze'});}
          else if (ev.type === 'hit') {
            hitTone(ev.kind, ev.depth);
            emitBurst(ev);
            if (ev.kind === 'amplifier') shake = Math.min(6, shake + 1.3);
            else shake = Math.min(4.5, shake + 0.25);
            showCombo(ev.depth);
            if(ev.depth>=12 && ev.depth%6===0)slowTimer=Math.max(slowTimer,.23);
            if(game.hits===game.level.count-(game.level.void||0)){collapseTimer=1.65;slowTimer=.8;}
          } else if (ev.type === 'finish') {
            prevFinish = true;
          }
        }
      }
      accum -= STEP;
      steps++;
    }
    if (prevFinish) { prevFinish = false; onFinish(); }
  }

  advanceFx(delta);
  draw(backgroundClock);
  if (ts - lastUI > 70) { refreshTelemetry(); lastUI = ts; }
  requestAnimationFrame(tick);
}

updateMission();
display('home');
requestAnimationFrame(tick);
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
