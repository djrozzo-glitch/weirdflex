import {createRun,step,score,HERO,RATE,BOTTLE_HEIGHT,obstacles} from './engine.mjs';
import {scoreOrigin} from './config.mjs';

const $=id=>document.getElementById(id);
const canvas=$('trail'), ctx=canvas.getContext('2d');
const root=new URL('../',import.meta.url);
const img=path=>{
  const image=new Image();
  image.src=new URL(path,root);
  return image;
};
const panoramas=['woods','village','aurora'].map(name=>img('backgrounds/'+name+'.webp'));
const atlas=img('kombucha-atlas.png');
const terrain=img('terrain/snow.webp');
const bottle=img('assets/kombucha-bottle.webp');
const spark=img('effects/pickup-spark.png');
const puff=img('effects/snow-puff.png');
const snowflake=img('effects/snowflake.png');
const obstacleArt=obstacles.map(({name})=>img('obstacles/'+name+'.png'));
const essentialArt=Promise.all([...panoramas,atlas,terrain,bottle,...obstacleArt].map(image=>image.decode())).then(()=>true,()=>false);
const sceneTicks=15*RATE;
const transitionTicks=2*RATE;
const gallopFrames=[4,2,1,3];
const audio=Object.fromEntries(['jump','double','bone','hit'].map(name=>[name,new Audio(new URL('audio/'+name+'.wav',root))]));
const music=new Audio(new URL('audio/bg_music_loop.mp3',root));
music.loop=true;
music.volume=.28;
let enabled=get('kombucha-christmas-sound')!=='off';
let mode='start', previousMenu='start', run=createRun(123), ticket=null, inputs=[], queued=false;
let last=0, lag=0, width=0, height=0, scale=1, ground=0;
let latestScore=0, snowTime=0, boardRequest=0;
const snow=Array.from({length:42},(_,i)=>({x:(i*.6180339)%1,y:(i*.37797)%1,r:.7+(i%5)*.31}));

function get(key) { try { return localStorage.getItem(key); } catch { return null; } }
function set(key,value) { try { localStorage.setItem(key,value); } catch {} }
function syncAudio() {
  $('sound').setAttribute('aria-pressed',String(enabled));
  $('sound').firstElementChild.src=new URL('ui/sound-'+(enabled?'on':'off')+'.png',root);
  if(enabled&&mode==='playing') music.play().catch(()=>{});
  else music.pause();
}
function fx(name) {
  if(!enabled) return;
  const sound=audio[name];
  sound.currentTime=0;
  sound.volume=.47;
  sound.play().catch(()=>{});
}

function show(next) {
  mode=next;
  if(next!=='playing') queued=false;
  if(next!=='leaderboard') boardRequest++;
  $('screen').hidden=next==='playing'||next==='impact';
  $('screen').dataset.view=next;
  $('hud').hidden=next!=='playing';
  for(const id of ['start','paused','result','leaderboard']) $(id).hidden=id!==next;
  syncAudio();
}

function resize() {
  width=canvas.clientWidth;
  height=canvas.clientHeight;
  const dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(width*dpr);
  canvas.height=Math.round(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  scale=Math.min(1.27,width/370,height/350);
  ground=height-Math.min(130,Math.max(67,height*.17));
}
window.addEventListener('resize',resize);
resize();

async function api(endpoint,body) {
  const url=new URL('api/kombucha/'+endpoint,scoreOrigin||location.origin);
  const response=await fetch(url,{
    method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:undefined,
    body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(4000)
  });
  if(!response.ok) throw new Error('Score service unavailable');
  if(!response.headers.get('content-type')?.includes('application/json')) throw new Error('Score service unavailable');
  return response.json();
}

async function start() {
  if(mode==='playing'||$('play').disabled) return;
  $('play').disabled=$('retry').disabled=true;
  $('start-status').textContent='';
  $('retry-status').textContent='';
  const launchMenu=mode;
  // Start audio in the click gesture, before waiting for the score service.
  if(enabled) { music.currentTime=0; music.play().catch(()=>{}); }
  const [artReady,nextTicket]=await Promise.all([essentialArt,api('run',{}).catch(()=>null)]);
  $('play').disabled=$('retry').disabled=false;
  if(mode!==launchMenu||!artReady) {
    if(mode===launchMenu) $(mode==='start'?'start-status':'retry-status').textContent='Could not load game art. Reload the page to try again.';
    syncAudio();
    return;
  }
  ticket=nextTicket;
  run=createRun(ticket?.seed??crypto.getRandomValues(new Uint32Array(1))[0]);
  inputs=[]; queued=false; lag=0; latestScore=0;
  $('score').lastElementChild.textContent='0';
  show('playing');
  document.activeElement?.blur();
}

function finish() {
  const best=Math.max(Number(get('kombucha-christmas-best'))||0,score(run));
  set('kombucha-christmas-best',best);
  $('final').textContent=score(run);
  $('details').textContent=run.bottles+' '+(run.bottles===1?'bottle':'bottles')+' · Personal best '+best+' pts';
  $('nickname').value=get('kombucha-christmas-name')||'';
  $('submit-score').hidden=!ticket||!run.bottles;
  $('save-status').textContent=ticket?'':'Practice run · Online leaderboard unavailable.';
  show('result');
}

function tile(image,offset,y,w,h) {
  if(!image.naturalWidth) return;
  const first=-((offset%w+w)%w);
  for(let x=first;x<width;x+=w) ctx.drawImage(image,x,y,w+.5,h);
}

function landscape(image,offset) {
  if(!image.naturalWidth) return;
  const ratio=image.naturalWidth/image.naturalHeight;
  const h=Math.max(ground+height*.07,width/ratio);
  const w=Math.round(h*ratio);
  if(w>0) tile(image,offset,0,w,h);
}

function draw() {
  const zone=Math.floor(run.tick/sceneTicks);
  const sceneProgress=run.tick%sceneTicks;
  const blend=Math.max(0,(sceneProgress+transitionTicks-sceneTicks)/transitionTicks);
  const travel=run.distance*scale*.46;
  ctx.fillStyle='#132d48';
  ctx.fillRect(0,0,width,height);
  landscape(panoramas[zone%3],travel);
  ctx.globalAlpha=blend*blend*(3-2*blend);
  landscape(panoramas[(zone+1)%3],travel);
  ctx.globalAlpha=1;
  ctx.fillStyle='#b1cfe6';
  ctx.fillRect(0,ground+2,width,height-ground);
  const snowHeight=height-ground+7;
  if(terrain.naturalWidth) tile(terrain,run.distance*scale,ground-3,snowHeight*terrain.naturalWidth/terrain.naturalHeight,snowHeight);
  for(const flake of snow) {
    const x=((flake.x*width-snowTime*.29*(flake.r+1))%width+width)%width;
    const y=(flake.y*height+snowTime*.18*(flake.r+1))%height;
    ctx.globalAlpha=.35+flake.r*.16;
    ctx.fillStyle='#eff7ff';
    if(flake.r>1.7&&snowflake.naturalWidth) ctx.drawImage(snowflake,x,y,7,7);
    else ctx.fillRect(x,y,flake.r,flake.r);
  }
  ctx.globalAlpha=1;
  const heroX=Math.min(250,width*.24);
  for(const item of run.objects) {
    const x=heroX+(item.x-run.distance)*scale;
    if(x<-90||x>width+90) continue;
    if(item.bottle) {
      const y=ground-item.y*scale;
      const glow=ctx.createRadialGradient(x,y,2,x,y,17*scale);
      glow.addColorStop(0,'#ffcc7766');
      glow.addColorStop(1,'#ffcc7700');
      ctx.fillStyle=glow;
      ctx.fillRect(x-17*scale,y-17*scale,34*scale,34*scale);
      const h=BOTTLE_HEIGHT*scale;
      const w=h*bottle.naturalWidth/bottle.naturalHeight;
      ctx.drawImage(bottle,x-w/2,y-h/2,w,h);
    } else {
      const {crop,width,height}=obstacles[item.kind];
      const w=width*scale, h=height*scale;
      ctx.drawImage(obstacleArt[item.kind],...crop,x-w/2,ground-h,w,h);
    }
  }
  const size=HERO*1.52*scale;
  let frame=gallopFrames[Math.floor(run.distance/20)%gallopFrames.length];
  if(run.over) frame=9;
  else if(run.tick<5) frame=0;
  else if(run.jumps===2) frame=7;
  else if(run.jumps) frame=run.vy<-5?5:6;
  else if(run.tick-run.landed<6) frame=8;
  else if(run.tick-run.picked<6) frame=10;
  if(atlas.naturalWidth) ctx.drawImage(atlas,(frame%4)*320,Math.floor(frame/4)*320,320,320,
    heroX-size/2,ground+run.y*scale-size*258/320,size,size);
  if(run.tick-run.picked<15&&spark.naturalWidth) {
    ctx.globalAlpha=1-(run.tick-run.picked)/15;
    ctx.drawImage(spark,heroX+8*scale,ground+(run.y-70)*scale,54*scale,54*scale);
  }
  if(run.tick-run.landed<12&&puff.naturalWidth) {
    ctx.globalAlpha=.7*(1-(run.tick-run.landed)/12);
    ctx.drawImage(puff,heroX-39*scale,ground-20*scale,53*scale,30*scale);
  }
  ctx.globalAlpha=1;
}

function animate(now) {
  const elapsed=last?Math.min(100,now-last):0;
  last=now;
  if(mode==='playing') {
    lag+=elapsed;
    snowTime+=elapsed/16;
    while(lag>=1000/RATE&&!run.over) {
      if(queued&&run.jumps<2) {
        inputs.push(run.tick);
        fx(run.jumps?'double':'jump');
      }
      step(run,queued);
      queued=false;
      lag-=1000/RATE;
    }
    if(latestScore!==score(run)) {
      latestScore=score(run);
      $('score').lastElementChild.textContent=latestScore;
      fx('bone');
    }
    if(run.over) {
      draw();
      show('impact');
      fx('hit');
      setTimeout(finish,180);
    }
  }
  if(mode==='playing'||mode==='paused') draw();
  requestAnimationFrame(animate);
}

function jump() {
  if(mode==='playing') queued=true;
}
canvas.addEventListener('pointerdown',jump);
window.addEventListener('keydown',e=>{
  if(e.repeat||e.target instanceof HTMLInputElement) return;
  if(mode==='playing'&&['Space','ArrowUp'].includes(e.code)) {
    e.preventDefault(); jump();
  }
  if(e.code==='Escape'&&(mode==='playing'||mode==='paused')) {
    show(mode==='playing'?'paused':'playing');
  }
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&mode==='playing') show('paused');
});
for(const id of ['play','retry']) $(id).onclick=start;
$('pause').onclick=()=>show('paused');
$('resume').onclick=()=>show('playing');
$('quit').onclick=()=>show('start');
$('sound').onclick=()=>{
  enabled=!enabled;
  set('kombucha-christmas-sound',enabled?'on':'off');
  syncAudio();
};
$('back').onclick=()=>show(previousMenu);

for(const button of document.querySelectorAll('.board')) button.onclick=async()=>{
  previousMenu=mode;
  show('leaderboard');
  const request=++boardRequest;
  $('leaders').replaceChildren();
  $('board-status').textContent='Loading scores…';
  const data=await api('scores').catch(()=>null);
  if(request!==boardRequest) return;
  $('board-status').textContent=data?(data.entries.length?'':'No scores yet.'):'Online leaderboard unavailable.';
  for(const [index,entry] of (data?.entries||[]).entries()) {
    const li=document.createElement('li');
    for(const value of [index+1,entry.name,entry.score+' pts']) {
      const span=document.createElement('span');
      span.textContent=value;
      li.append(span);
    }
    if(index===0) {
      const podium=document.createElement('img');
      podium.src=new URL('ui/podium.png',root);
      podium.className='rank-icon';
      podium.alt='1st';
      li.firstElementChild.replaceChildren(podium);
    }
    $('leaders').append(li);
  }
};

$('submit-score').onsubmit=async e=>{
  e.preventDefault();
  if(!ticket) return;
  const button=e.target.querySelector('button');
  const name=$('nickname').value.trim().normalize('NFKC');
  if(!name||name.length>24||/[\p{Cc}\p{Cf}]/u.test(name)) {
    $('save-status').textContent='Enter a valid name up to 24 characters.';
    return;
  }
  const resultTicket=ticket;
  button.disabled=true;
  $('retry').disabled=true;
  $('save-status').textContent='Verifying run…';
  try {
    await api('scores',{token:resultTicket.token,inputs,endTick:run.tick,name});
    set('kombucha-christmas-name',name);
    $('submit-score').hidden=true;
    $('save-status').textContent='Score added to the leaderboard.';
  } catch {
    $('save-status').textContent='Could not save this score. Try again.';
  } finally {
    button.disabled=false;
    $('retry').disabled=false;
  }
};

show('start');
requestAnimationFrame(animate);
