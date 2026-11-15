export const RATE = 60;
export const MAX_TICKS = RATE * 3600;
export const HERO = 104;
export const POINTS = 10;
export const obstacleSizes = [[55,43],[74,34],[65,29],[74,39]];
const jumps = [-8.35,-7.3];

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
  const kind = Math.floor(random(run)*4);
  const offset = random(run);
  if (offset < .33) {
    run.objects.push({x:x-38, y:46, bottle:true});
    run.objects.push({x:x+29, y:86, bottle:true});
    run.objects.push({x:x+99, y:44, bottle:true});
  } else {
    run.objects.push({x:x-112, y:39, bottle:true});
    run.objects.push({x:x-45, y:48, bottle:true});
  }
  run.objects.push({x, kind});
  if (offset >= .33) run.objects.push({x:x+115, y:36, bottle:true});
  const speed = Math.min(7.15,4.05+run.tick/5400);
  run.next += speed*(91+Math.floor(random(run)*34));
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
  run.distance += Math.min(7.15,4.05+run.tick/5400);
  while(run.next < run.distance+1200) spawn(run);
  for(const item of run.objects) {
    if(item.taken) continue;
    const dx = item.x-run.distance;
    if(item.bottle) {
      if(Math.abs(dx)<37 && item.y>=-run.y+7 && item.y<=-run.y+80) {
        item.taken=true; run.bottles++; run.picked=run.tick;
      }
      continue;
    }
    const [w,h] = obstacleSizes[item.kind];
    if(Math.abs(dx)<21+w*.30 && -run.y+6<h*.82) {
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
