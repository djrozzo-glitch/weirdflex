import assert from 'node:assert/strict';
import {LEVELS,createGame,createDailyGame,dailyKey,trigger,stepGame,starsFor,generateParticles} from '../game-engine.mjs';

function simulate(levelId,x,y,wait=0){
 const game=createGame(levelId);
 for(let i=0;i<wait;i++)stepGame(game);
 assert.ok(trigger(game,x,y));assert.equal(trigger(game,x,y),false);
 for(let i=0;i<1300&&game.phase!=='finished';i++)stepGame(game);
 assert.equal(game.phase,'finished');
 assert.ok(game.hits>=0&&game.hits<=game.level.count-(game.level.void||0));
 assert.ok(starsFor(game)>=0 && starsFor(game)<=3);
 return game;
}
assert.equal(LEVELS.length,30);
for(const lv of LEVELS){
 const a=generateParticles(lv),b=generateParticles(lv);assert.deepEqual(a,b);
 for(const kind of ['amplifier','echo','void','freeze'])assert.equal(a.filter(p=>p.kind===kind).length,lv[{amplifier:'amp',echo:'echo',void:'void',freeze:'freeze'}[kind]]||0,`level ${lv.id} ${kind}`);
 const a1=simulate(lv.id,480,300),a2=simulate(lv.id,480,300);
 assert.deepEqual([a1.score,a1.hits,a1.bestDepth],[a2.score,a2.hits,a2.bestDepth]);
 let best=0,bestHits=0;
 const positions=[...lv.clusters,[480,300],[300,270],[660,300],[480,400]];
 for(const [x,y] of positions)for(let wait of [0,20,55,95]){
  const g=simulate(lv.id,x,y,wait);
  best=Math.max(best,starsFor(g));bestHits=Math.max(bestHits,g.hits);
 }
 assert.ok(best>=1,`Level ${lv.id} cannot be passed in sampled openings`);
 console.log(`LEVEL ${String(lv.id).padStart(2,'0')} PASS | sampled best ${best} stars | hits ${bestHits}`);
}
const d1=createDailyGame('2026-11-10'),d2=createDailyGame('2026-11-10'),d3=createDailyGame('2026-11-11');
assert.deepEqual(d1.particles,d2.particles);
assert.notDeepEqual(d1.particles,d3.particles);
assert.equal(dailyKey(new Date('2026-11-10T23:59:59Z')),'2026-11-10');
assert.equal(dailyKey(new Date('2026-11-11T00:00:00Z')),'2026-11-11');
console.log('DAILY seeded reproducibility + UTC rollover PASS');
// Special mechanic regression: a VOID consumes its incoming wave and scores no hit.
const voidGame=createGame(21);
voidGame.particles=voidGame.particles.slice(0,2);
voidGame.particles[0]={...voidGame.particles[0],kind:'void',x:480,y:300,vx:0,vy:0,hit:false};
voidGame.particles[1]={...voidGame.particles[1],kind:'normal',x:600,y:300,vx:0,vy:0,hit:false};
assert.ok(trigger(voidGame,480,300));
let consumed=false;
for(let i=0;i<35;i++){stepGame(voidGame);if(voidGame.events.some(e=>e.type==='void'))consumed=true;}
assert.ok(consumed && voidGame.absorbed===1,'VOID consumed the wave');
assert.equal(voidGame.hits,0,'VOID does not earn points');
assert.equal(voidGame.particles[1].hit,false,'VOID stopped the incoming wave before it reached distant target');
console.log('VOID wave absorption PASS');

const freezeGame=createGame(22);
freezeGame.particles=freezeGame.particles.slice(0,2);
freezeGame.particles[0]={...freezeGame.particles[0],kind:'freeze',x:480,y:300,vx:0,vy:0,hit:false};
freezeGame.particles[1]={...freezeGame.particles[1],kind:'normal',x:610,y:300,vx:1,vy:0,hit:false};
assert.ok(trigger(freezeGame,480,300));
let frozen=false;
for(let i=0;i<15;i++){stepGame(freezeGame);if(freezeGame.particles[1].frozen>0){frozen=true;break;}}
assert.ok(frozen,'FREEZE stopped nearby moving targets');
assert.ok(freezeGame.frozen>=1);
console.log('FREEZE immobilization PASS');
