import assert from 'node:assert/strict';
import {createEndlessGame, endlessOutcome, endlessTarget, trigger, stepGame, LEVELS, createGame, createDailyGame} from '../game-engine.mjs';

const seed = 128937;
for(let wave=1;wave<=50;wave++){
  const a=createEndlessGame(wave, seed), b=createEndlessGame(wave, seed);
  assert.deepEqual(a.particles,b.particles,`wave ${wave} reproducibility`);
  assert.equal(a.level.count,b.level.count);
  assert.ok(a.particles.length<=96);
  assert.ok(a.level.count>=26);
  assert.equal(a.particles.filter(p=>p.kind==='void').length,a.level.void);
  assert.equal(a.particles.filter(p=>p.kind==='freeze').length,a.level.freeze);
  assert.equal(a.particles.filter(p=>p.kind==='echo').length,a.level.echo);
  assert.equal(a.particles.filter(p=>p.kind==='amplifier').length,a.level.amp);
  assert.ok(a.level.count-a.level.void>0);
  assert.ok(endlessTarget(wave)>=42 && endlessTarget(wave)<=63);
  assert.notEqual(createEndlessGame(wave,seed).level.seed,createEndlessGame(wave+1,seed).level.seed);
  // Real wave simulation, including all special types and win/loss outcomes.
  for(let i=0;i<20;i++) stepGame(a);
  assert.equal(trigger(a,480,300),true);
  for(let i=0;i<2000 && a.phase!=='finished';i++) stepGame(a);
  assert.equal(a.phase,'finished',`wave ${wave} must resolve`);
  const outcome=endlessOutcome(a,3);
  assert.ok(outcome.percent>=0 && outcome.percent<=100);
  assert.ok(outcome.energy>=0 && outcome.energy<=3);
  assert.equal(outcome.cleared,outcome.percent>=outcome.target);
}
const campaign=createGame(1),daily=createDailyGame('2026-11-10');
assert.equal(LEVELS.length,30);
assert.equal(campaign.level.id,1);
assert.equal(daily.level.id,0);
const w1=createEndlessGame(1,1234),w10=createEndlessGame(10,1234);
assert.equal(w1.level.void,0);
assert.ok(w10.level.void>0 && w10.level.freeze>0);
// Fail reduces energy exactly once; strong clear refills by one, capped at 3.
let x=createEndlessGame(3,42);x.hits=0;assert.equal(endlessOutcome(x,2).energy,1);
x.hits=x.level.count-x.level.void;assert.equal(endlessOutcome(x,2).energy,3);
assert.equal(endlessOutcome(x,3).energy,3);
console.log('PASS — 50 Endless waves seeded, capped, and completed');
console.log('PASS — thresholds, energy, special particles, and existing game modes');
