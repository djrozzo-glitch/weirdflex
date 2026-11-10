import assert from 'node:assert/strict';
import {LEVELS,createGame,trigger,stepGame,starsFor,generateParticles,rngFromSeed} from '../game-engine.mjs';
const report=[];
function run(id,x,y,wait=0){const g=createGame(id);for(let i=0;i<wait;i++)stepGame(g);assert.equal(trigger(g,x,y),true);assert.equal(trigger(g,x,y),false,'Only one launch allowed');for(let i=0;i<1200&&g.phase!=='finished';i++)stepGame(g);assert.equal(g.phase,'finished','Mission must complete');assert.ok(g.hits>=0&&g.hits<=g.level.count);assert.ok(starsFor(g)>=0&&starsFor(g)<=3);return g;}
assert.equal(LEVELS.length,10);report.push('PASS — 10 campaign missions');
for(const lv of LEVELS){const a=generateParticles(lv),b=generateParticles(lv);assert.deepEqual(a,b,`Mission ${lv.id} particle generation stable`);assert.equal(a.length,lv.count);assert.equal(a.filter(p=>p.kind==='amplifier').length,lv.amp);assert.equal(a.filter(p=>p.kind==='echo').length,lv.echo);
 const probe=run(lv.id,lv.clusters[0][0],lv.clusters[0][1]);const same=run(lv.id,lv.clusters[0][0],lv.clusters[0][1]);assert.deepEqual({score:probe.score,hits:probe.hits,depth:probe.bestDepth},{score:same.score,hits:same.hits,depth:same.bestDepth});
 let best=probe;for(const p of [...lv.clusters,[480,300],[390,310],[570,300]]){const g=run(lv.id,...p);if(starsFor(g)>starsFor(best)||g.hits>best.hits)best=g;}assert.equal(starsFor(best),3,`Mission ${lv.id} must have an achievable 3-star solution`);report.push(`PASS — mission ${String(lv.id).padStart(2,'0')} (${lv.code}): deterministic, finish, achievable 3 stars`)}
const testEcho=createGame(6);assert.ok(testEcho.particles.some(p=>p.kind==='echo'));assert.ok(testEcho.particles.some(p=>p.kind==='amplifier'));report.push('PASS — Amplifier and Echo introduced as designed');
console.log(report.join('\n'));console.log(`ALL ${report.length} CHECKS PASSED`);
