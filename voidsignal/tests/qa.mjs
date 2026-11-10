import assert from 'node:assert/strict';
import {LEVELS, WORLD, createGame, trigger, stepGame, starsFor, generateParticles} from '../game-engine.mjs';

const report=[];

function run(id,x,y,wait=0){
  const g=createGame(id);
  for(let i=0;i<wait;i++) stepGame(g);
  assert.equal(trigger(g,x,y),true);
  assert.equal(trigger(g,x,y),false,'Only one launch allowed');
  for(let i=0;i<1500 && g.phase!=='finished'; i++) stepGame(g);
  assert.equal(g.phase,'finished','Mission must complete');
  assert.ok(g.hits>=0 && g.hits<=g.level.count);
  assert.ok(starsFor(g)>=0 && starsFor(g)<=3);
  return g;
}

function candidatePositions(level){
  const pos=[];
  for(const c of level.clusters) pos.push(c);
  pos.push([480,300],[360,300],[600,300],[480,220],[480,380]);
  for(let gx=180; gx<=780; gx+=180){
    for(let gy=180; gy<=420; gy+=120) pos.push([gx,gy]);
  }
  // dedupe
  const seen=new Set();
  return pos.filter(([x,y])=>{const k=`${x}|${y}`; if(seen.has(k)) return false; seen.add(k); return true;});
}

assert.equal(LEVELS.length,20); report.push('PASS — 20 campaign missions');
for(const lv of LEVELS){
  const a=generateParticles(lv), b=generateParticles(lv);
  assert.deepEqual(a,b,`Mission ${lv.id} particle generation stable`);
  assert.equal(a.length,lv.count);
  assert.equal(a.filter(p=>p.kind==='amplifier').length,lv.amp);
  assert.equal(a.filter(p=>p.kind==='echo').length,lv.echo);

  const probe=run(lv.id, lv.clusters[0][0], lv.clusters[0][1]);
  const same=run(lv.id, lv.clusters[0][0], lv.clusters[0][1]);
  assert.deepEqual({score:probe.score,hits:probe.hits,depth:probe.bestDepth},{score:same.score,hits:same.hits,depth:same.bestDepth},`Mission ${lv.id} deterministic`);

  let best=probe;
  for(const [x,y] of candidatePositions(lv)){
    for(let wait=0; wait<=90; wait+=9){
      const g=run(lv.id,x,y,wait);
      if(starsFor(g)>starsFor(best) || (starsFor(g)===starsFor(best) && g.hits>best.hits)) best=g;
    }
  }
  const bestPercent=Math.round(best.hits*100/lv.count);
  assert.equal(starsFor(best),3,`Mission ${lv.id} must have an achievable 3-star solution; found ${bestPercent}%`);
  report.push(`PASS — mission ${String(lv.id).padStart(2,'0')} (${lv.code}): best sample ${bestPercent}%`);
}
console.log(report.join('\n'));
console.log(`ALL ${report.length} CHECKS PASSED`);
