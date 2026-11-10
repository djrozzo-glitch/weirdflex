import assert from 'node:assert/strict';
import {ENDLESS_CAP,createEndlessGame,endlessOutcome,endlessTarget,trigger,stepGame,LEVELS,createGame,createDailyGame} from '../game-engine.mjs';

const seed=128937;
for(let wave=1;wave<=50;wave++){
  const a=createEndlessGame(wave,seed),b=createEndlessGame(wave,seed);
  assert.deepEqual(a.particles,b.particles,`wave ${wave} reproducibility`);
  assert.equal(a.particles.length,a.level.count);
  assert.ok(a.particles.length<=ENDLESS_CAP);
  assert.equal(a.particles.filter(p=>p.kind==='void').length,a.level.void);
  assert.equal(a.particles.filter(p=>p.kind==='freeze').length,a.level.freeze);
  assert.equal(a.particles.filter(p=>p.kind==='echo').length,a.level.echo);
  assert.equal(a.particles.filter(p=>p.kind==='amplifier').length,a.level.amp);
  assert.ok(a.level.count-a.level.void>0);
  assert.ok(endlessTarget(wave)>=42&&endlessTarget(wave)<=63);
  assert.notEqual(createEndlessGame(wave,seed).level.seed,createEndlessGame(wave+1,seed).level.seed);
  for(let i=0;i<20;i++)stepGame(a);
  assert.equal(trigger(a,480,300),true);
  for(let i=0;i<2000&&a.phase!=='finished';i++)stepGame(a);
  assert.equal(a.phase,'finished',`wave ${wave} must resolve`);
  const outcome=endlessOutcome(a,3);
  assert.ok(outcome.percent>=0&&outcome.percent<=100);
  assert.ok(outcome.energy>=0&&outcome.energy<=3);
  assert.equal(outcome.cleared,outcome.percent>=outcome.target);
}

// Survivors retain their identity, position, trajectory and special kind.
const first=createEndlessGame(1,seed);
const survivors=first.particles.slice(0,9).map(p=>({...p,x:p.x+3,y:p.y+4,frozen:40}));
const carried=createEndlessGame(2,seed,survivors);
assert.equal(carried.carried,9);
assert.ok(carried.added>0);
assert.equal(carried.particles.length,carried.added+9);
for(let i=0;i<9;i++){
  assert.equal(carried.particles[i].id,survivors[i].id);
  assert.equal(carried.particles[i].x,survivors[i].x);
  assert.equal(carried.particles[i].y,survivors[i].y);
  assert.equal(carried.particles[i].vx,survivors[i].vx);
  assert.equal(carried.particles[i].vy,survivors[i].vy);
  assert.equal(carried.particles[i].frozen,0);
}
assert.deepEqual(carried.particles,createEndlessGame(2,seed,survivors).particles);
assert.ok(!carried.particles.some(p=>p.hit));

// Simulate many additions without destroying survivors. At capacity the run ends explicitly.
let kept=first.particles;
let overloaded=false;
for(let wave=2;wave<100;wave++){
  const next=createEndlessGame(wave,seed,kept);
  if(!next){overloaded=true;assert.equal(kept.length,ENDLESS_CAP);break;}
  assert.ok(next.added>=1);
  assert.equal(next.carried,kept.length);
  assert.deepEqual(next.particles.slice(0,kept.length).map(p=>p.id),kept.map(p=>p.id));
  assert.ok(next.particles.length<=ENDLESS_CAP);
  kept=next.particles;
}
assert.ok(overloaded,'Must signal full field instead of removing survivors');
assert.equal(createEndlessGame(99,seed,kept),null);

const campaign=createGame(1),daily=createDailyGame('2026-11-10');
assert.equal(LEVELS.length,30);
assert.equal(campaign.level.id,1);
assert.equal(daily.level.id,0);
const w1=createEndlessGame(1,1234),w10=createEndlessGame(10,1234);
assert.equal(w1.level.void,0);
assert.ok(w10.level.void>0 && w10.level.freeze>0);
let x=createEndlessGame(3,42);x.hits=0;assert.equal(endlessOutcome(x,2).energy,1);
x.hits=x.level.count-x.level.void;assert.equal(endlessOutcome(x,2).energy,3);
assert.equal(endlessOutcome(x,3).energy,3);
console.log('PASS — 50 Endless seeds and actual resolution');
console.log('PASS — survivors persist unmodified across waves; new batches append');
console.log('PASS — 150 particle overload protects mobile performance');
console.log('PASS — campaign, Daily, energy and particle signatures');
