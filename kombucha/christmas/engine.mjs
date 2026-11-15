export const RATE = 60;
export const MAX_TICKS = RATE * 3600;
export const HERO = 104;
export const POINTS = 10;
// Crop the transparent margins so each silhouette sits on the snow.
export const obstacles = [
  {name:'gift', crop:[3,4,250,208], width:43},
  {name:'birch-log', crop:[3,3,251,149], width:50},
  {name:'fir-branch', crop:[3,2,251,158], width:48},
  {name:'sled', crop:[3,48,250,185], width:50}
].map(obstacle=>({
  ...obstacle,
  height:obstacle.width*obstacle.crop[3]/obstacle.crop[2]
}));
export const BOTTLE_HEIGHT = 28;
const jumps = [-8.35,-7.3];
const bottleArc = [[-35,30],[0,44],[35,30]];
const BASE_SPEED = 4.05;
const SPEED_GAIN_PER_MINUTE = .2;
const MAX_SPEED_MULTIPLIER = 1.8;

export function speedAtTick(tick) {
  const minutes = tick / (RATE*60);
  return BASE_SPEED * Math.min(MAX_SPEED_MULTIPLIER,1+minutes*SPEED_GAIN_PER_MINUTE);
}

export function createRun(seed) {
  return {seed:seed>>>0, tick:0, distance:0, bottles:0, y:0, vy:0,
    jumps:0, landed:-100, picked:-100, objects:[], next:760, over:false};
}

function random(run) {
  run.seed = (Math.imul(run.seed,1664525)+1013904223)>>>0;
  return run.seed/4294967296;
}

function spawn(run) {
  const x = run.next;
  const kind = Math.floor(random(run)*obstacles.length);
  const {height} = obstacles[kind];
  for (const [offset,lift] of bottleArc) {
    run.objects.push({x:x+offset, y:height+lift, bottle:true});
  }
  run.objects.push({x, kind});
  run.next += speedAtTick(run.tick)*(91+Math.floor(random(run)*34));
}

export function step(run, jump = false) {
  if (run.over) return;
  if (jump && run.jumps<2) {
    run.vy = jumps[run.jumps++];
  }
  run.y += run.vy;
  run.vy += .46;
  if(run.y>=0) {
    if(run.jumps) run.landed=run.tick;
    run.y=0; run.vy=0; run.jumps=0;
  }
  run.distance += speedAtTick(run.tick);
  const jumpHeight = -run.y;
  while(run.next < run.distance+1200) spawn(run);
  for(const item of run.objects) {
    if(item.taken) continue;
    const dx = item.x-run.distance;
    if(item.bottle) {
      if(Math.abs(dx)<27 && jumpHeight>=18 && item.y>=jumpHeight-26 && item.y<=jumpHeight+65) {
        item.taken=true; run.bottles++; run.picked=run.tick;
      }
      continue;
    }
    const {width,height} = obstacles[item.kind];
    if(Math.abs(dx)<15+width*.35 && jumpHeight+5<height*.82) {
      run.over=true;
      break;
    }
  }
  run.objects = run.objects.filter(item=>!item.taken && item.x>run.distance-150);
  run.tick++;
  if(run.tick>=MAX_TICKS) run.over=true;
}

export function score(run) {
  return run.bottles*POINTS;
}

export function replay(seed, inputs, endTick) {
  if(!Number.isInteger(endTick)||endTick<1||endTick>MAX_TICKS||
     !Array.isArray(inputs)||inputs.length>endTick) return null;
  let previous=-1;
  for(const tick of inputs) {
    if(!Number.isInteger(tick)||tick<=previous||tick>=endTick) return null;
    previous=tick;
  }
  const run=createRun(seed);
  let cursor=0;
  while(!run.over && run.tick<endTick) {
    const jump=inputs[cursor]===run.tick;
    if(jump) cursor++;
    step(run,jump);
  }
  return run.over && run.tick===endTick ? run : null;
}
