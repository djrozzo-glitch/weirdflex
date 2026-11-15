// Kombucha Christmas Run — Cloudflare Worker (D1 binding: env.db)
// Configure secret RUN_SECRET before enabling submissions.
const RATE = 60;
const MAX_TICKS = RATE * 3600;
const HERO = 104;
const POINTS = 10;
// Crop the transparent margins so each silhouette sits on the snow.
const obstacles = [
  {file:'gift.png', crop:[3,4,250,208], width:43},
  {file:'birch-log.png', crop:[3,3,251,149], width:50},
  {file:'fir-branch.png', crop:[3,2,251,158], width:48},
  {file:'sled.png', crop:[3,48,250,185], width:50},
  {file:'disco-ball.webp', crop:[0,0,192,179], width:38},
  {file:'fallen-skis.webp', crop:[0,0,192,64], width:58},
  {file:'frozen-synth.webp', crop:[0,0,192,105], width:58},
  {file:'frozen-toast.webp', crop:[0,0,192,120], width:56},
  {file:'gift-ufo.webp', crop:[0,0,192,86], width:58},
  {file:'ice-phone.webp', crop:[0,0,192,126], width:53},
  {file:'knitted-octopus.webp', crop:[0,0,192,161], width:42},
  {file:'ornament-crate.webp', crop:[0,0,192,99], width:58},
  {file:'penguin-skate.webp', crop:[0,0,139,192], width:25},
  {file:'snow-globe.webp', crop:[0,0,171,192], width:31},
  {file:'snowman.webp', crop:[0,0,159,192], width:29},
  {file:'snowy-mailbox.webp', crop:[0,0,192,126], width:53}
].map(obstacle=>({
  ...obstacle,
  height:obstacle.width*obstacle.crop[3]/obstacle.crop[2]
}));
const BOTTLE_HEIGHT = 36;
const jumps = [-8.35,-7.3];
const bottleArc = [[-35,30],[0,44],[35,30]];
const HIGH_ARC_CHANCE = .25;
// The lowest bottle in a high arc sits above the reach of a single jump.
const HIGH_ARC_MIN_HEIGHT = 152;
const BASE_SPEED = 4.05;
const SPEED_GAIN_PER_MINUTE = .2;
const MAX_SPEED_MULTIPLIER = 1.8;

function speedAtTick(tick) {
  const minutes = tick / (RATE*60);
  return BASE_SPEED * Math.min(MAX_SPEED_MULTIPLIER,1+minutes*SPEED_GAIN_PER_MINUTE);
}

function createRun(seed) {
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
  const highArc = random(run)<HIGH_ARC_CHANCE;
  const variation = Math.floor(random(run)*13);
  const arcBase = highArc ? HIGH_ARC_MIN_HEIGHT - bottleArc[0][1] : height;
  const arcLift = arcBase + variation;
  for (const [offset,lift] of bottleArc) {
    run.objects.push({x:x+offset, y:lift+arcLift, bottle:true});
  }
  run.objects.push({x, kind});
  run.next += speedAtTick(run.tick)*(91+Math.floor(random(run)*34));
}

function step(run, jump = false) {
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

function score(run) {
  return run.bottles*POINTS;
}

function replay(seed, inputs, endTick) {
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

const cors={'Access-Control-Allow-Origin':'https://weirdflex.online','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'};
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{...cors,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const bytes=s=>new TextEncoder().encode(s);
const b64=buffer=>btoa(String.fromCharCode(...new Uint8Array(buffer))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
async function signature(secret,message){const key=await crypto.subtle.importKey('raw',bytes(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64(await crypto.subtle.sign('HMAC',key,bytes(message)));}
function validName(s){return typeof s==='string'&&s.trim().length>0&&s.trim().length<=24&&!/[\p{Cc}\p{Cf}]/u.test(s);}
function validEmail(s){return typeof s==='string'&&s.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin');
  if(origin&&origin!=='https://weirdflex.online')return json({error:'Origin not allowed'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  if(!env.db)return json({error:'D1 binding missing: expected db'},503);
  const url=new URL(request.url);
  const path=url.pathname.replace(/\/$/,'');
  try{
   if(request.method==='GET'&&(path==='/api/kombucha/scores'||path==='/scores')){
    const {results}=await env.db.prepare('SELECT nickname AS name,best_score AS score FROM players WHERE best_score > 0 ORDER BY best_score DESC,updated_at ASC LIMIT 100').all();
    return json({entries:results});
   }
   if(request.method!=='POST')return json({error:'Not found'},404);
   if(!env.RUN_SECRET)return json({error:'RUN_SECRET not configured'},503);
   if(Number(request.headers.get('content-length')||0)>25000)return json({error:'Payload too large'},413);
   const data=await request.json();
   if(path==='/api/kombucha/run'||path==='/run'){
    const seed=crypto.getRandomValues(new Uint32Array(1))[0],issued=Date.now(),nonce=crypto.randomUUID();
    const payload=[seed,issued,nonce].join('.');
    return json({seed,token:payload+'.'+await signature(env.RUN_SECRET,payload)});
   }
   if(path==='/api/kombucha/scores'||path==='/scores'){
    const {token,inputs,endTick,name,email}=data||{};
    if(typeof token!=='string'||!Array.isArray(inputs)||!Number.isInteger(endTick)||!validName(name)||!validEmail(email))return json({error:'Invalid submission'},400);
    const parts=token.split('.');
    if(parts.length!==4)return json({error:'Invalid run token'},400);
    const payload=parts.slice(0,3).join('.');
    if(await signature(env.RUN_SECRET,payload)!==parts[3])return json({error:'Invalid run token'},403);
    const seed=Number(parts[0]),issued=Number(parts[1]);
    if(!Number.isInteger(seed)||seed<0||seed>4294967295||!Number.isFinite(issued)||issued>Date.now()+60000||Date.now()-issued>86400000)return json({error:'Expired run'},400);
    // Allow up to 2x simulation rate to accommodate mobile timing, but reject implausibly fast runs.
    if(Date.now()-issued<endTick*1000/RATE*.45)return json({error:'Run completed too quickly'},400);
    const result=replay(seed,inputs,endTick);
    if(!result||result.bottles<1)return json({error:'Invalid run'},400);
    const normalized=email.trim().toLowerCase(),nickname=name.trim(),id=crypto.randomUUID(),runId=parts[2];
    // Deduplicate runs by signed nonce. Keep one player per normalized email.
    const exists=await env.db.prepare('SELECT id FROM runs WHERE id=?').bind(runId).first();
    if(exists)return json({error:'Run already submitted'},409);
    await env.db.prepare('INSERT INTO players (id,nickname,email,email_normalized,best_score,best_bottles) VALUES (?,?,?,?,0,0) ON CONFLICT(email_normalized) DO NOTHING').bind(id,nickname,email.trim(),normalized).run();
    const player=await env.db.prepare('SELECT id FROM players WHERE email_normalized=?').bind(normalized).first();
    await env.db.prepare('INSERT INTO runs(id,player_id,score,bottles) VALUES(?,?,?,?)').bind(runId,player.id,score(result),result.bottles).run();
    await env.db.prepare("UPDATE players SET nickname=?,best_score=MAX(best_score,?),best_bottles=CASE WHEN ? > best_score THEN ? ELSE best_bottles END,updated_at=datetime('now') WHERE id=?").bind(nickname,score(result),score(result),result.bottles,player.id).run();
    return json({ok:true,score:score(result),bottles:result.bottles});
   }
   return json({error:'Not found'},404);
  }catch(error){console.error(error);return json({error:'Request failed'},500);}
 }
};
