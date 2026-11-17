import {createRun,step,score,HERO,RATE,BOTTLE_HEIGHT,obstacles} from './engine.mjs';
import {scoreOrigin} from './config.mjs';

const $=id=>document.getElementById(id);
const canvas=$('trail'), ctx=canvas.getContext('2d',{alpha:false});
const root=new URL('../',import.meta.url);
const img=path=>{
  const image=new Image();
  image.src=new URL(path,root);
  return image;
};
const panoramas=['woods','village','aurora'].map(name=>img('backgrounds/'+name+'.webp'));
// Scenery families: each image has at most one Easter egg.
// Village opens with three consecutive versions of the same winter cottage.
const sceneryCatalog=[
  ['backgrounds/woods.webp','backgrounds/variants/C_forest_3_santa_courier.webp','backgrounds/variants/C_forest_4_green_santa.webp','backgrounds/variants/C_forest_5_reindeer_sweater.webp'],
  ['backgrounds/variants/B_village_0_cottage.webp','backgrounds/variants/B_village_1_putin_window.webp','backgrounds/variants/B_village_2_home_alone_window.webp','backgrounds/variants/B_village_3_suitcase.webp','backgrounds/variants/B_village_4_mailbox.webp','backgrounds/variants/B_village_5_scarf_raven.webp'],
  ['backgrounds/aurora.webp','backgrounds/variants/A_lake_3_red_balloon.webp','backgrounds/variants/A_lake_4_snow_boat.webp','backgrounds/variants/A_lake_5_smoke_heart.webp']
].map(paths=>paths.map(img));
const sceneOrder=[
  ...[0,1,2,3].map(variant=>({family:0,variant})),
  ...[0,1,2,3,4,5].map(variant=>({family:1,variant})),
  ...[0,1,2,3].map(variant=>({family:2,variant}))
];
// The SVG composites relied on external images, blocked in canvas on mobile.
// Always draw the verified WebP panorama first.
const atlas=img('kombucha-atlas.png');
const terrain=img('terrain/snow.webp');
const bottle=img('assets/kombucha-bottle.webp');
const spark=img('effects/pickup-spark.png');
const puff=img('effects/snow-puff.png');
const snowflake=img('effects/snowflake.png');
const obstacleArt=obstacles.map(({file})=>img('obstacles/'+file));
const essentialArt=Promise.all([...panoramas,atlas,terrain,bottle,...obstacleArt].map(image=>image.decode())).then(()=>true,()=>false);
const sceneTicks=8*RATE;
const easterEggs=['window-boy.svg','tv-address.svg','salad.svg','green-santa.svg'];
const eggArt=easterEggs.map(name=>img('backgrounds/easter/'+name));
const transitionTicks=2*RATE;
const gallopFrames=[4,2,1,3];
const audio=Object.fromEntries(['jump','double','bone','hit'].map(name=>[name,new Audio(new URL('audio/'+name+'.wav',root))]));
 // Decode the frequent bottle pickup once; never invoke HTMLAudioElement.play() per bottle.
const PickupAudioContext=window.AudioContext||window.webkitAudioContext;
let pickupContext=null, pickupBuffer=null;
if(PickupAudioContext) {
  try {
    pickupContext=new PickupAudioContext();
    fetch(new URL('audio/bone.wav',root))
      .then(response=>{if(!response.ok) throw Error('Pickup audio unavailable');return response.arrayBuffer();})
      .then(bytes=>pickupContext.decodeAudioData(bytes))
      .then(buffer=>{pickupBuffer=buffer;})
      .catch(()=>{pickupBuffer=null;});
  } catch { pickupContext=null; }
}
function unlockPickupAudio() {
  if(pickupContext?.state==='suspended') pickupContext.resume().catch(()=>{});
}
document.addEventListener('pointerdown',unlockPickupAudio,{passive:true});
document.addEventListener('keydown',unlockPickupAudio);

const music=new Audio(new URL('audio/caribou_theme.mp3',root));
music.preload='metadata';
music.loop=true;
music.volume=.14;
const legacySound=get('kombucha-christmas-sound');
const musicKey='kombucha-christmas-music';
const effectsKey='kombucha-christmas-effects';
let musicEnabled=(get(musicKey)??legacySound)!=='off';
let effectsEnabled=(get(effectsKey)??legacySound)!=='off';
let mode='start', previousMenu='start', run=createRun(123), ticket=null, inputs=[], queued=false;
let launchMenu=null;
let last=0, lag=0, width=0, height=0, scale=1, ground=0;
let latestScore=0, snowTime=0, boardRequest=0;
const snow=Array.from({length:42},(_,i)=>({x:(i*.6180339)%1,y:(i*.37797)%1,r:.7+(i%5)*.31}));

function get(key) { try { return localStorage.getItem(key); } catch { return null; } }
function set(key,value) { try { localStorage.setItem(key,value); } catch {} }
function syncMusic() {
  if(musicEnabled&&(mode==='playing'||mode===launchMenu)) music.play().catch(()=>{});
  else music.pause();
}
function showAudioSetting(button,enabled) {
  button.setAttribute('aria-pressed',String(enabled));
}
function fx(name) {
  if(!effectsEnabled) return;
  if(name==='bone') {
    // Fire-and-forget Web Audio buffer: no media-element seek or decode on the game frame.
    if(!pickupContext||!pickupBuffer||pickupContext.state!=='running') return;
    const source=pickupContext.createBufferSource();
    const gain=pickupContext.createGain();
    source.buffer=pickupBuffer;
    gain.gain.value=.235;
    source.connect(gain).connect(pickupContext.destination);
    source.start();
    return;
  }
  const sound=audio[name];
  sound.currentTime=0;
  sound.volume=.235;
  sound.play().catch(()=>{});
}

function show(next) {
  const oldMode=mode;
  mode=next;
  if(next==='paused'&&oldMode==='playing') draw();
  if(next!=='playing') queued=false;
  if(next!=='leaderboard') boardRequest++;
  $('screen').hidden=next==='playing'||next==='impact';
  $('screen').dataset.view=next;
  $('hud').hidden=next!=='playing';
  for(const id of ['start','paused','result','leaderboard']) $(id).hidden=id!==next;
  syncMusic();
}

function resize() {
  width=canvas.clientWidth;
  height=canvas.clientHeight;
  const dpr=Math.min(devicePixelRatio||1,matchMedia('(pointer:coarse)').matches?1.25:2);
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
  const requestedFrom=mode;
  launchMenu=requestedFrom;
  // Start audio in the click gesture, before waiting for the score service.
  music.currentTime=0;
  syncMusic();
  const [artReady,nextTicket]=await Promise.all([essentialArt,api('run',{}).catch(()=>null)]);
  launchMenu=null;
  $('play').disabled=$('retry').disabled=false;
  if(mode!==requestedFrom||!artReady) {
    if(mode===requestedFrom) $(mode==='start'?'start-status':'retry-status').textContent='Не удалось загрузить игру. Обнови страницу и попробуй снова.';
    syncMusic();
    return;
  }
  ticket=nextTicket;
  run=createRun(ticket?.seed??crypto.getRandomValues(new Uint32Array(1))[0]);
  inputs=[]; queued=false; lag=0; latestScore=0;
  $('score').lastElementChild.textContent='0';
  show('playing');
  document.activeElement?.blur();
}

function russianPlural(n,one,few,many) {
  const a=Math.abs(n)%100, b=a%10;
  return a>=11&&a<=14?many:b===1?one:b>=2&&b<=4?few:many;
}
const bottleWord=n=>russianPlural(n,'бутылочка','бутылочки','бутылочек');
const pointWord=n=>russianPlural(n,'очко','очка','очков');

function finish() {
  const best=Math.max(Number(get('kombucha-christmas-best'))||0,score(run));
  set('kombucha-christmas-best',best);
  $('final').textContent=score(run);
  $('details').textContent=run.bottles+' '+bottleWord(run.bottles)+' · Личный рекорд: '+best+' '+pointWord(best);
  $('nickname').value=get('kombucha-christmas-name')||'';
  $('email').value=get('kombucha-christmas-email')||'';
  $('submit-score').hidden=!ticket||!run.bottles;
  $('save-status').textContent=ticket?'':'Тренировочный забег · Таблица рекордов пока недоступна.';
  show('result');
}

function tile(image,offset,y,w,h) {
  if(!image.naturalWidth) return;
  const first=-((offset%w+w)%w);
  for(let x=first;x<width;x+=w) ctx.drawImage(image,x,y,w+.5,h);
}

function landscape(image,offset) {
  if(!image.naturalWidth) return;
  // Fit every panorama to the full scenery height with uniform scaling.
  // No artificial sky strip and no vertical or horizontal distortion.
  const targetHeight=ground+4;
  const drawHeight=targetHeight;
  const stripWidth=image.naturalWidth*drawHeight/image.naturalHeight;
  if(!Number.isFinite(stripWidth)||stripWidth<=0) return;
  const y=0;
  const x0=-((offset%stripWidth+stripWidth)%stripWidth);
  for(let x=x0-stripWidth;x<width;x+=stripWidth)
    ctx.drawImage(image,x,y,stripWidth+.5,drawHeight);
}

function draw() {
  const zone=Math.floor(run.tick/sceneTicks);
  const sceneProgress=run.tick%sceneTicks;
  const blend=Math.max(0,(sceneProgress+transitionTicks-sceneTicks)/transitionTicks);
  const travel=run.distance*scale*.46;
  ctx.fillStyle='#132d48';
  ctx.fillRect(0,0,width,height);
  // Reliable baseline: paint the original scenery first.
  // Optional complete WebP artwork may replace a scene only after decoding.
  const sceneImage=index=>{
    const {family,variant}=sceneOrder[((index%sceneOrder.length)+sceneOrder.length)%sceneOrder.length];
    const candidate=sceneryCatalog[family][variant];
    // Avoid blank frames while optional images load or if deployment is delayed.
    return candidate?.complete && candidate.naturalWidth>0 ? candidate : panoramas[family];
  };
  landscape(sceneImage(zone),travel);
  ctx.globalAlpha=blend*blend*(3-2*blend);
  landscape(sceneImage(zone+1),travel);
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
      const h=BOTTLE_HEIGHT*scale;
      const w=h*bottle.naturalWidth/bottle.naturalHeight;
      ctx.drawImage(bottle,x-w/2,y-h/2,w,h);
    } else {
      const {crop,width,height}=obstacles[item.kind];
      const w=(item.tall ? width*1.44 : width)*scale;
      const h=(item.tall ? height*1.44 : height)*scale;
      const art=obstacleArt[item.kind];
      // Always render a visible obstacle, even if an asset is still loading.
      // A subtle snow shadow anchors small sprites to the running surface.
      ctx.save();
      ctx.fillStyle='rgba(7,20,32,.48)';
      ctx.beginPath();
      ctx.ellipse(x,ground-2*scale,Math.max(14,w*.46),Math.max(3,5*scale),0,0,Math.PI*2);
      ctx.fill();
      if(art?.complete && art.naturalWidth>0) {
        ctx.drawImage(art,...crop,x-w/2,ground-h,w,h);
      } else {
        ctx.fillStyle='#a4d3df';
        ctx.strokeStyle='#24445a';
        ctx.lineWidth=Math.max(2,3*scale);
        ctx.beginPath();
        ctx.roundRect(x-w/2,ground-h,w,h,Math.min(12,w*.18));
        ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }
  }
  const size=HERO*1.52*scale;
  // Fixed 10 FPS gallop: game speed changes travel, not leg animation cadence.
  let frame=gallopFrames[Math.floor(run.tick/(RATE/10))%gallopFrames.length];
  if(run.over) frame=9;
  else if(run.tick<5) frame=0;
  else if(run.jumps===2) frame=7;
  else if(run.jumps) frame=run.vy<-5?5:6;
  else if(run.tick-run.landed<6) frame=8;
  if(atlas.naturalWidth) {
    const spin=run.jumps===2 ? Math.max(0,run.tick-(run.flipStart??run.tick))/25*Math.PI*2 : 0;
    const cx=heroX, cy=ground+run.y*scale-size*258/320+size/2;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(spin);
    ctx.drawImage(atlas,(frame%4)*320,Math.floor(frame/4)*320,320,320,-size/2,-size/2,size,size);
    ctx.restore();
  }
  if(run.tick-run.picked<15&&spark.naturalWidth) {
    ctx.globalAlpha=Math.max(0,1-(run.tick-run.picked)/15);
    ctx.drawImage(spark,heroX+8*scale,ground+(run.y-70)*scale,54*scale,54*scale);
    ctx.globalAlpha=1;
  }
  if(run.tick-run.landed<12&&puff.naturalWidth) {
    ctx.globalAlpha=.7*(1-(run.tick-run.landed)/12);
    ctx.drawImage(puff,heroX-39*scale,ground-20*scale,53*scale,30*scale);
  }
  ctx.globalAlpha=1;
}

function animate(now) {
  const elapsed=last?Math.min(66,now-last):0;
  last=now;
  if(mode==='playing') {
    lag+=elapsed;
    snowTime+=elapsed/16;
    while(lag>=1000/RATE&&!run.over) {
      if(queued&&run.jumps<2) {
        inputs.push(run.tick);
        if(!matchMedia('(pointer:coarse)').matches) fx(run.jumps?'double':'jump');
      }
      if(queued&&run.jumps===1) run.flipStart=run.tick;
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
  if(mode==='playing') draw();
  requestAnimationFrame(animate);
}

function jump() {
  if(mode==='playing') queued=true;
}
canvas.addEventListener('pointerdown',e=>{ e.preventDefault(); jump(); },{passive:false});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('selectstart',e=>{if(e.target instanceof Element&&!e.target.closest('input,textarea'))e.preventDefault();});
document.addEventListener('contextmenu',e=>{if(e.target instanceof Element&&!e.target.closest('input,textarea'))e.preventDefault();});
document.querySelectorAll('img').forEach(image=>{image.draggable=false;});
window.addEventListener('keydown',e=>{
  if(e.repeat||e.target instanceof HTMLInputElement) return;
  if(mode==='playing'&&['Space','ArrowUp'].includes(e.code)) {
    if(e.code==='Space'&&e.target instanceof HTMLButtonElement&&e.target.matches(':focus-visible')) return;
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
const musicToggle=$('music-toggle'), effectsToggle=$('effects-toggle');
showAudioSetting(musicToggle,musicEnabled);
showAudioSetting(effectsToggle,effectsEnabled);
musicToggle.onclick=()=>{
  musicEnabled=!musicEnabled;
  set(musicKey,musicEnabled?'on':'off');
  showAudioSetting(musicToggle,musicEnabled);
  syncMusic();
};
effectsToggle.onclick=()=>{
  effectsEnabled=!effectsEnabled;
  set(effectsKey,effectsEnabled?'on':'off');
  showAudioSetting(effectsToggle,effectsEnabled);
  if(!effectsEnabled) for(const sound of Object.values(audio)) sound.pause();
};
$('back').onclick=()=>show(previousMenu);

for(const button of document.querySelectorAll('.board')) button.onclick=async()=>{
  previousMenu=mode;
  show('leaderboard');
  const request=++boardRequest;
  $('leaders').replaceChildren();
  $('board-status').textContent='Загружаем рекорды…';
  const data=await api('scores').catch(()=>null);
  if(request!==boardRequest) return;
  $('board-status').textContent=data?(data.entries.length?'':'Пока ни одного рекорда. Будешь первым?'):'Не удалось загрузить таблицу рекордов.';
  for(const [index,entry] of (data?.entries||[]).entries()) {
    const li=document.createElement('li');
    for(const value of [index+1,entry.name,entry.score+' '+pointWord(entry.score)]) {
      const span=document.createElement('span');
      span.textContent=value;
      li.append(span);
    }
    if(index===0) {
      const podium=document.createElement('img');
      podium.src=new URL('ui/podium.png',root);
      podium.className='rank-icon';
      podium.alt='Первое место';
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
  const email=$('email').value.trim();
  if(!name||name.length>24||/[\p{Cc}\p{Cf}]/u.test(name)) {
    $('save-status').textContent='Укажи имя длиной до 24 символов.';
    return;
  }
  if(!$('email').validity.valid||!email) { $('save-status').textContent='Проверь адрес электронной почты.'; return; }
  const resultTicket=ticket;
  button.disabled=true;
  $('retry').disabled=true;
  $('save-status').textContent='Проверяем результат…';
  try {
    await api('scores',{token:resultTicket.token,inputs,endTick:run.tick,name,email});
    set('kombucha-christmas-name',name);
    set('kombucha-christmas-email',email);
    $('submit-score').hidden=true;
    $('save-status').textContent='Готово! Твой результат в таблице рекордов.';
  } catch {
    $('save-status').textContent='Не удалось сохранить результат. Попробуй ещё раз.';
  } finally {
    button.disabled=false;
    $('retry').disabled=false;
  }
};

show('start');
requestAnimationFrame(animate);
