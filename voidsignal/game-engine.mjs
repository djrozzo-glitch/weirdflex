/* VOID SIGNAL v0.4 — deterministic simulation. No DOM dependencies. */
export const WORLD = Object.freeze({ width: 960, height: 600 });
export const STEP = 1 / 60;

export const LEVELS = [
  { id:1, code:'FIRST CONTACT', subtitle:'One spark is all it takes.', seed:11023, count:24, speed:.56, spread:80, clusters:[[280,270],[465,290],[650,310]], amp:0, echo:0, thresholds:[35,60,83], tip:'Wait for the particles to gather. Then tap once.' },
  { id:2, code:'THE DRIFT', subtitle:'Patience pays.', seed:22397, count:30, speed:.88, spread:90, clusters:[[240,200],[430,350],[690,260]], amp:0, echo:0, thresholds:[36,62,85], tip:'A well-timed pulse reaches more than a quick one.' },
  { id:3, code:'CROSS CURRENT', subtitle:'Watch the flow.', seed:33113, count:36, speed:1.05, spread:78, clusters:[[240,300],[450,220],[685,355]], amp:0, echo:0, thresholds:[38,64,86], tip:'Trigger where two groups are about to meet.' },
  { id:4, code:'OVERDRIVE', subtitle:'A new kind of energy.', seed:44969, count:37, speed:.89, spread:83, clusters:[[245,300],[470,290],[705,300]], amp:3, echo:0, thresholds:[40,65,87], tip:'Amber Amplifiers send out a much larger wave.' },
  { id:5, code:'DOMINO THEORY', subtitle:'Make it travel.', seed:51709, count:43, speed:1.15, spread:75, clusters:[[185,260],[370,325],[570,265],[760,325]], amp:4, echo:0, thresholds:[40,65,88], tip:'Reach an Amplifier to bridge distant clusters.' },
  { id:6, code:'AFTERIMAGE', subtitle:'Some signals return.', seed:63521, count:42, speed:1.05, spread:88, clusters:[[250,250],[485,320],[700,240]], amp:3, echo:4, thresholds:[40,67,88], tip:'Violet Echo particles send a second delayed pulse.' },
  { id:7, code:'DOUBLE TAKE', subtitle:'The second wave counts.', seed:74357, count:49, speed:1.3, spread:88, clusters:[[200,235],[400,345],[620,225],[790,370]], amp:4, echo:5, thresholds:[40,68,89], tip:'Let an Echo catch particles that escaped the first wave.' },
  { id:8, code:'CRITICAL MASS', subtitle:'Go for the cascade.', seed:85627, count:53, speed:1.5, spread:94, clusters:[[205,185],[400,240],[580,365],[750,325]], amp:6, echo:6, thresholds:[42,70,90], tip:'Amplifiers can reach Echoes across the field.' },
  { id:9, code:'THE SINGULARITY', subtitle:'Everything is connected.', seed:98179, count:58, speed:1.48, spread:89, clusters:[[210,205],[425,365],[605,200],[765,375]], amp:6, echo:8, thresholds:[44,71,91], tip:'Aim for the first link, not the largest cluster.' },
  { id:10, code:'VOID SIGNAL', subtitle:'One pulse. All of it.', seed:105943, count:64, speed:1.65, spread:96, clusters:[[155,210],[340,370],[505,190],[675,360],[815,215]], amp:8, echo:8, thresholds:[45,72,93], tip:'Master the timing and clear the entire board.' },

  { id:11, code:'WAVE BREAKER', subtitle:'Break through the middle.', seed:118811, count:48, speed:1.12, spread:72, clusters:[[180,180],[330,310],[485,185],[640,320],[790,210]], amp:5, echo:2, thresholds:[42,68,90], tip:'A small opening can turn into a huge cascade.' },
  { id:12, code:'SPLIT HORIZON', subtitle:'Left meets right.', seed:129901, count:54, speed:1.24, spread:78, clusters:[[205,240],[205,380],[760,220],[760,360],[480,300]], amp:5, echo:5, thresholds:[43,69,90], tip:'Use the center cluster as a bridge between both halves.' },
  { id:13, code:'LATE ARRIVAL', subtitle:'The delayed wave wins.', seed:133307, count:52, speed:1.33, spread:90, clusters:[[190,210],[385,350],[585,235],[775,350]], amp:2, echo:8, thresholds:[42,68,89], tip:'Echoes are strongest when the first wave leaves survivors behind.' },
  { id:14, code:'ORBIT FALL', subtitle:'Let the field come to you.', seed:147911, count:60, speed:1.45, spread:95, clusters:[[240,200],[480,180],[720,210],[320,390],[630,385]], amp:6, echo:6, thresholds:[44,70,90], tip:'Sometimes waiting half a second makes all the difference.' },
  { id:15, code:'WIDE OPEN', subtitle:'Big rings, tiny margins.', seed:152233, count:62, speed:1.52, spread:110, clusters:[[150,300],[315,185],[475,300],[640,420],[820,290]], amp:8, echo:4, thresholds:[44,71,91], tip:'Amplifiers reward bold openings and clean alignment.' },
  { id:16, code:'GHOST LOOP', subtitle:'What comes back, connects.', seed:166451, count:58, speed:1.40, spread:82, clusters:[[220,190],[220,390],[480,300],[740,200],[740,390]], amp:4, echo:9, thresholds:[43,70,90], tip:'A second pulse can finish what the first one started.' },
  { id:17, code:'CASCADE ARRAY', subtitle:'Build a long chain.', seed:177013, count:66, speed:1.56, spread:85, clusters:[[160,210],[305,300],[450,210],[605,300],[760,210],[450,410]], amp:7, echo:7, thresholds:[45,72,91], tip:'Think about chain depth, not just the first cluster.' },
  { id:18, code:'PHANTOM GRID', subtitle:'Tiny gaps everywhere.', seed:188119, count:70, speed:1.62, spread:78, clusters:[[190,190],[375,190],[570,190],[760,190],[190,390],[375,390],[570,390],[760,390]], amp:6, echo:10, thresholds:[46,73,92], tip:'Look for the opening that starts a diagonal collapse.' },
  { id:19, code:'ZERO HOUR', subtitle:'All systems unstable.', seed:199727, count:74, speed:1.7, spread:88, clusters:[[160,170],[320,300],[480,170],[640,300],[800,170],[240,430],[720,430]], amp:9, echo:10, thresholds:[46,74,92], tip:'Your best opening may not be anywhere near the largest group.' },
  { id:20, code:'EVENT HORIZON', subtitle:'Perfect timing. Total collapse.', seed:210991, count:80, speed:1.82, spread:94, clusters:[[155,195],[315,355],[480,185],[645,355],[815,205],[480,470]], amp:10, echo:12, thresholds:[47,75,93], tip:'This is the final exam. Watch the rhythm and strike once.' },
  { id:21, code:'DARK MATTER', subtitle:'The void swallows the wave.', seed:221113, count:60, speed:1.35, spread:80, clusters:[[165,200],[345,360],[500,200],[675,350],[805,220]], amp:5, echo:6, void:5, freeze:3, thresholds:[42, 67, 88], tip:'Watch the red absorbers and blue time-freeze nodes.' },
  { id:22, code:'ICE FIELD', subtitle:'Freeze the current.', seed:232417, count:64, speed:1.45, spread:83, clusters:[[165,200],[345,360],[500,200],[675,350],[805,220]], amp:5, echo:7, void:4, freeze:5, thresholds:[43, 68, 89], tip:'Watch the red absorbers and blue time-freeze nodes.' },
  { id:23, code:'RED SHIFT', subtitle:'Danger at every corner.', seed:243517, count:66, speed:1.55, spread:87, clusters:[[165,200],[345,360],[500,200],[675,350],[805,220]], amp:7, echo:7, void:6, freeze:4, thresholds:[43, 69, 90], tip:'Watch the red absorbers and blue time-freeze nodes.' },
  { id:24, code:'PERMAFROST', subtitle:'Make a moment last.', seed:254717, count:68, speed:1.57, spread:85, clusters:[[165,200],[345,360],[500,200],[675,350],[805,220]], amp:7, echo:8, void:4, freeze:8, thresholds:[44, 69, 90], tip:'Watch the red absorbers and blue time-freeze nodes.' },
  { id:25, code:'NEGATIVE SPACE', subtitle:'Bridge the impossible.', seed:265919, count:70, speed:1.63, spread:89, clusters:[[165,200],[345,360],[500,200],[675,350],[805,220]], amp:8, echo:8, void:7, freeze:5, thresholds:[44, 70, 91], tip:'Watch the red absorbers and blue time-freeze nodes.' },
  { id:26, code:'CRYO CASCADE', subtitle:'Time is on your side.', seed:276121, count:74, speed:1.67, spread:88, clusters:[[165,200],[345,360],[500,200],[675,350],[805,220]], amp:8, echo:10, void:6, freeze:9, thresholds:[44, 70, 91], tip:'Watch the red absorbers and blue time-freeze nodes.' },
  { id:27, code:'ZERO POINT', subtitle:'A dangerous beginning.', seed:287323, count:76, speed:1.72, spread:90, clusters:[[165,200],[345,360],[500,200],[675,350],[805,220]], amp:9, echo:10, void:8, freeze:6, thresholds:[45, 71, 92], tip:'Watch the red absorbers and blue time-freeze nodes.' },
  { id:28, code:'DEEP FREEZE', subtitle:'Slow everything down.', seed:298527, count:78, speed:1.78, spread:90, clusters:[[165,200],[345,360],[500,200],[675,350],[805,220]], amp:9, echo:11, void:8, freeze:10, thresholds:[45, 71, 92], tip:'Watch the red absorbers and blue time-freeze nodes.' },
  { id:29, code:'SILENT STORM', subtitle:'A storm of silence.', seed:309729, count:80, speed:1.82, spread:92, clusters:[[165,200],[345,360],[500,200],[675,350],[805,220]], amp:10, echo:12, void:9, freeze:8, thresholds:[46, 72, 92], tip:'Watch the red absorbers and blue time-freeze nodes.' },
  { id:30, code:'TOTAL COLLAPSE', subtitle:'One pulse. Beyond the void.', seed:320933, count:84, speed:1.9, spread:94, clusters:[[165,200],[345,360],[500,200],[675,350],[805,220]], amp:11, echo:12, void:10, freeze:10, thresholds:[46, 73, 93], tip:'Watch the red absorbers and blue time-freeze nodes.' }
];

// Earlier layouts stay stable; targets are tuned by sampled solvability in tests.
for (const level of LEVELS) {
  if (level.id <= 20) {
    level.thresholds = [Math.max(32, level.thresholds[0]-3), Math.max(58, level.thresholds[1]-2), Math.max(78, level.thresholds[2]-1)];
    level.void = level.id < 11 ? 0 : Math.min(5, Math.floor((level.id-9)/3));
    level.freeze = level.id < 13 ? 0 : Math.min(6, Math.floor((level.id-11)/3));
    if(level.id >= 11) level.tip = level.id < 13 ? 'Red VOID nodes cancel the wave that reaches them.' : 'VOID absorbs a wave. FREEZE holds nearby particles in place.';
  }
}
export const COLORS = { normal:'#58d9ff', amplifier:'#ffb35b', echo:'#c48aff', void:'#ff507d', freeze:'#89f5e4' };
export function dailyKey(date=new Date()) { return date.toISOString().slice(0,10); }
export function createDailyGame(day=dailyKey()) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day+'T00:00:00Z'))) throw new Error('Invalid day');
  const seed=[...day].reduce((a,c)=>Math.imul(a^c.charCodeAt(0),16777619)>>>0,2166136261);
  const level={id:0,code:'DAILY SIGNAL',subtitle:`UTC DAILY / ${day}`,seed,count:58,speed:1.40,spread:90,clusters:[[180,205],[350,365],[510,205],[680,365],[795,215]],amp:7,echo:8,void:4,freeze:5,thresholds:[40,67,89],tip:'Three attempts per UTC day. The same field for everyone.'};
  return createGameFromLevel(level);
}

export function rngFromSeed(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateParticles(level) {
  const rand = rngFromSeed(level.seed);
  const particles = [];
  for (let i = 0; i < level.count; i++) {
    const center = level.clusters[i % level.clusters.length];
    const ang = rand() * Math.PI * 2;
    const radius = Math.sqrt(rand()) * level.spread;
    const heading = rand() * Math.PI * 2;
    const velocity = (.65 + rand() * .65) * level.speed;
    particles.push({
      id: i,
      x: Math.max(22, Math.min(938, center[0] + Math.cos(ang) * radius)),
      y: Math.max(22, Math.min(578, center[1] + Math.sin(ang) * radius)),
      vx: Math.cos(heading) * velocity,
      vy: Math.sin(heading) * velocity,
      kind: 'normal',
      hit: false,
      hitTime: -1,
      depth: 0,
      phase: rand() * 6.28,
      size: 4 + rand() * 2.2,
    });
  }

  // Unique deterministic special indices; no accidental overwrites.
  const counts = {amplifier:level.amp||0, echo:level.echo||0, void:level.void||0, freeze:level.freeze||0};
  const pool=particles.map(p=>p.id);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  let cursor=0;
  for(const [kind,num] of Object.entries(counts)) {
    for(let i=0;i<num && cursor<pool.length;i++) particles[pool[cursor++]].kind=kind;
  }
  return particles;
}

export function createGame(id) {
  const level = LEVELS[id - 1];
  if (!level) throw new Error('Unknown mission ' + id);
  return createGameFromLevel(level);
}
export function createGameFromLevel(level) {
  return {
    level,
    particles: generateParticles(level),
    waves: [],
    elapsed: 0,
    frame: 0,
    phase: 'ready',
    hits: 0,
    score: 0,
    bestDepth: 0,
    pulse: null,
    events: [],
    settle: 0,
    finished: false,
    peak: 0,
    absorbed:0, frozen:0,
  };
}

export function trigger(game, x, y) {
  if (game.phase !== 'ready') return false;
  game.phase = 'active';
  game.pulse = { x, y };
  addWave(game, x, y, 'origin', 0, 0);
  game.events.push({ type: 'launch', x, y });
  return true;
}

function addWave(game, x, y, kind, depth, delay = 0) {
  const max = kind === 'amplifier' ? 178 : kind === 'echo' ? 116 : kind === 'freeze' ? 108 : kind === 'origin' ? 115 : 100;
  const speed = kind === 'amplifier' ? 5.8 : kind === 'echo' ? 4.9 : 4.8;
  game.waves.push({ x, y, kind, depth, r: 0, max, age: 0, delay, life: 0, speed });
}

export function stepGame(game) {
  if (game.phase === 'finished') return;
  game.elapsed += STEP;
  game.frame++;
  game.events = [];

  for (const p of game.particles) {
    if (p.hit) continue;
    if(p.frozen>0){p.frozen--;continue;}
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 17) { p.x = 17; p.vx = Math.abs(p.vx); }
    else if (p.x > 943) { p.x = 943; p.vx = -Math.abs(p.vx); }
    if (p.y < 17) { p.y = 17; p.vy = Math.abs(p.vy); }
    else if (p.y > 583) { p.y = 583; p.vy = -Math.abs(p.vy); }
  }

  if (game.phase !== 'active') return;

  const alive = [];
  for (const w of game.waves) {
    if (w.delay > 0) { w.delay--; alive.push(w); continue; }
    w.age++;
    const previous = w.r;
    w.r = Math.min(w.max, w.r + w.speed);

    // VOID consumes exactly the wave that reaches it. Other waves remain active.
    // Prioritize absorbers before scoring collisions at an identical step.
    const intersects = p => !p.hit && Math.hypot(p.x-w.x,p.y-w.y) <= w.r+p.size && Math.hypot(p.x-w.x,p.y-w.y) >= Math.max(0,previous-p.size-5);
    const absorber=game.particles.find(p=>p.kind==='void'&&intersects(p));
    if(absorber){
      absorber.hit=true; game.absorbed++;
      game.events.push({type:'void',kind:'void',x:absorber.x,y:absorber.y,depth:w.depth});
      continue; // The absorber destroys this wave, not all waves.
    }
    for (const p of game.particles) {
      if(!intersects(p)) continue;
      p.hit = true; p.hitTime=game.elapsed; p.depth=w.depth+1;
      game.hits++; game.bestDepth=Math.max(game.bestDepth,p.depth);
      const kindBonus = p.kind==='amplifier'?1.4:p.kind==='echo'?1.2:p.kind==='freeze'?1.25:1;
      const points=Math.round(100*(1+Math.min(15,p.depth)*.28)*kindBonus);
      game.score+=points;
      game.events.push({type:'hit',kind:p.kind,x:p.x,y:p.y,depth:p.depth,hit:game.hits,points});
      addWave(game,p.x,p.y,p.kind,p.depth,0);
      if(p.kind==='echo') addWave(game,p.x,p.y,'echo',p.depth,28);
      if(p.kind==='freeze') {
        let held=0;
        for(const other of game.particles){
          if(!other.hit && other.kind!=='void' && Math.hypot(other.x-p.x,other.y-p.y)<160){other.frozen=Math.max(other.frozen||0,92);held++;}
        }
        game.frozen+=held;
        game.events.push({type:'freeze',kind:'freeze',x:p.x,y:p.y,depth:p.depth,held});
      }
    }

    if (w.r < w.max) alive.push(w);
    else { w.life++; if (w.life < 12) alive.push(w); }
  }

  game.waves = alive;
  game.peak = Math.max(game.peak, game.waves.length);
  if (game.waves.length === 0) {
    game.settle++;
    if (game.settle >= 20) {
      game.phase = 'finished';
      game.finished = true;
      game.events.push({ type: 'finish' });
    }
  } else {
    game.settle = 0;
  }
}

export function starsFor(game) {
  const percent = Math.round(game.hits * 100 / (game.level.count-(game.level.void||0)));
  return game.level.thresholds.reduce((n, t) => n + (percent >= t ? 1 : 0), 0);
}

export function ratingFor(game) {
  const pc = Math.round(100 * game.hits / (game.level.count-(game.level.void||0)));
  return pc === 100 ? 'PERFECT CHAIN' : pc >= 90 ? 'SPECTACULAR' : pc >= 70 ? 'EXCELLENT' : pc >= 45 ? 'GOOD SIGNAL' : 'SIGNAL LOST';
}
