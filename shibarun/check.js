(()=>{
'use strict';
const c=document.getElementById('game'), ctx=c.getContext('2d');
const $=id=>document.getElementById(id), overlay=$('overlay'), panel=$('panel'), tip=$('tip');
const scoreEl=$('score'),bestEl=$('best'),bonesEl=$('bones');
const syrnikSprite=new Image();syrnikSprite.src='assets/syrnik.png';
let W=400,H=750,DPR=1,ground=580,scale=1,last=0,mode='ready',clock=0,meters=0,bones=0,best=0,musicEnabled=true,effectsEnabled=true,worldX=0,spawnTimer=0,objects=[],particles=[],shake=0;
try{best=Number(localStorage.getItem('shiba-run-best')||0)}catch(e){}bestEl.textContent=String(best).padStart(4,'0');
const dog={x:95,y:0,vy:0,jumps:0,rot:0,anim:'idle',animTime:0,actionTime:0,spinTime:0};
const skinCatalog=[
  {id:'classic',name:'Classic Shiba',price:0,image:'shiba-atlas.png'},
  {id:'ninja',name:'Ninja Shiba',price:25,image:'skins/ninja-atlas.png'},
  {id:'samurai',name:'Samurai Shiba',price:50,image:'skins/samurai-atlas.png'},
  {id:'hotdog',name:'Hot Dog Shiba',price:75,image:'skins/hotdog-atlas.png'}
];
const WORLD_CATALOG=[
 {id:'tokyo',name:'Tokyo',tag:'JP',dayBg:'backgrounds/day-street.webp',nightBg:'backgrounds/night-street.webp',road:'warm',desc:'Sakura streets, cats and ramen'},
 {id:'newyork',name:'New York',tag:'USA',dayBg:'worlds/ny_day/day.webp',nightBg:'worlds/ny_night/night.webp',road:'city',desc:'Burgers by day, rats by night',dayObstacles:[

    {id:'burger',path:'worlds/ny_day/burger.png',weight:18,w:68,hitW:.78,hitH:.78,level:0},
    {id:'coffee',path:'worlds/ny_day/coffee.png',weight:15,w:54,hitW:.62,hitH:.82,level:0},
    {id:'hydrant',path:'worlds/ny_day/hydrant.png',weight:14,w:60,hitW:.72,hitH:.82,level:1},
    {id:'pizza_box',path:'worlds/ny_day/pizza_box.png',weight:12,w:72,hitW:.82,hitH:.70,level:1}
  ],nightObstacles:[

    {id:'rat',path:'worlds/ny_night/rat.png',weight:18,w:58,hitW:.72,hitH:.62,level:0},
    {id:'trash_bags',path:'worlds/ny_night/trash_bags.png',weight:14,w:70,hitW:.82,hitH:.77,level:0},
    {id:'manhole',path:'worlds/ny_night/manhole.png',weight:14,w:72,hitW:.80,hitH:.40,level:1},
    {id:'open_pizza_box',path:'worlds/ny_night/open_pizza_box.png',weight:12,w:76,hitW:.84,hitH:.68,level:1}
   ]},
 {id:'moscow',name:'Moscow',tag:'RU',dayBg:'worlds/moscow_day/day.webp',nightBg:'worlds/moscow_night/night.webp',road:'warm',desc:'Matryoshkas by day, shawarma by night',dayObstacles:[

    {id:'militsiya_helmet',path:'worlds/moscow_day/militsiya_helmet.png',weight:16,w:60,hitW:.72,hitH:.78,level:0},
    {id:'samovar',path:'worlds/moscow_day/samovar.png',weight:14,w:60,hitW:.72,hitH:.82,level:0},
    {id:'matryoshka',path:'worlds/moscow_day/matryoshka.png',weight:16,w:58,hitW:.70,hitH:.86,level:1},
    {id:'bubliki',path:'worlds/moscow_day/bubliki.png',weight:12,w:70,hitW:.84,hitH:.60,level:1}
  ],nightObstacles:[

    {id:'shawarma',path:'worlds/moscow_night/shawarma.png',weight:17,w:70,hitW:.84,hitH:.62,level:0},
    {id:'sleepy_cat',path:'worlds/moscow_night/sleepy_cat.png',weight:15,w:68,hitW:.78,hitH:.58,level:0},
    {id:'bottle_crate',path:'worlds/moscow_night/bottle_crate.png',weight:12,w:66,hitW:.76,hitH:.80,level:1},
    {id:'accordion_case',path:'worlds/moscow_night/accordion_case.png',weight:10,w:78,hitW:.84,hitH:.78,level:2}
   ]},
 {id:'rome',name:'Rome',tag:'IT',dayBg:'worlds/rome/day.webp',nightBg:'worlds/rome/night.webp',road:'warm',desc:'Gelato, pizza and ancient ruins',dayObstacles:[

    {id:'gelato',path:'worlds/rome/gelato.png',weight:16,w:56,hitW:.62,hitH:.70,level:0},
    {id:'roman_helmet',path:'worlds/rome/roman_helmet.png',weight:15,w:62,hitW:.74,hitH:.80,level:0},
    {id:'pizza_slice',path:'worlds/rome/pizza_slice.png',weight:15,w:66,hitW:.82,hitH:.62,level:1},
    {id:'column_fragment',path:'worlds/rome/column_fragment.png',weight:10,w:84,hitW:.86,hitH:.72,level:2}
  ],nightObstacles:[

    {id:'gelato',path:'worlds/rome/gelato.png',weight:16,w:56,hitW:.62,hitH:.70,level:0},
    {id:'roman_helmet',path:'worlds/rome/roman_helmet.png',weight:15,w:62,hitW:.74,hitH:.80,level:0},
    {id:'pizza_slice',path:'worlds/rome/pizza_slice.png',weight:15,w:66,hitW:.82,hitH:.62,level:1},
    {id:'column_fragment',path:'worlds/rome/column_fragment.png',weight:10,w:84,hitW:.86,hitH:.72,level:2}
   ]},
 {id:'madrid',name:'Madrid',tag:'ES',dayBg:'worlds/madrid/day.webp',nightBg:'worlds/madrid/night.webp',road:'warm',desc:'Tapas, churros and football',dayObstacles:[

    {id:'tapas',path:'worlds/madrid/tapas.png',weight:15,w:68,hitW:.82,hitH:.65,level:0},
    {id:'churros',path:'worlds/madrid/churros.png',weight:16,w:60,hitW:.72,hitH:.82,level:0},
    {id:'fan',path:'worlds/madrid/fan.png',weight:13,w:62,hitW:.78,hitH:.74,level:1},
    {id:'soccer_ball',path:'worlds/madrid/soccer_ball.png',weight:12,w:56,hitW:.74,hitH:.74,level:1}
  ],nightObstacles:[

    {id:'tapas',path:'worlds/madrid/tapas.png',weight:15,w:68,hitW:.82,hitH:.65,level:0},
    {id:'churros',path:'worlds/madrid/churros.png',weight:16,w:60,hitW:.72,hitH:.82,level:0},
    {id:'fan',path:'worlds/madrid/fan.png',weight:13,w:62,hitW:.78,hitH:.74,level:1},
    {id:'soccer_ball',path:'worlds/madrid/soccer_ball.png',weight:12,w:56,hitW:.74,hitH:.74,level:1}
   ]},
 {id:'berlin',name:'Berlin',tag:'DE',dayBg:'worlds/berlin/day.webp',nightBg:'worlds/berlin/night.webp',road:'city',desc:'Currywurst, pretzels and boomboxes',dayObstacles:[

    {id:'currywurst',path:'worlds/berlin/currywurst.png',weight:16,w:72,hitW:.82,hitH:.65,level:0},
    {id:'doner',path:'worlds/berlin/doner.png',weight:15,w:72,hitW:.80,hitH:.78,level:0},
    {id:'pretzel',path:'worlds/berlin/pretzel.png',weight:14,w:66,hitW:.82,hitH:.66,level:1},
    {id:'boombox',path:'worlds/berlin/boombox.png',weight:10,w:80,hitW:.82,hitH:.76,level:2}
  ],nightObstacles:[

    {id:'currywurst',path:'worlds/berlin/currywurst.png',weight:16,w:72,hitW:.82,hitH:.65,level:0},
    {id:'doner',path:'worlds/berlin/doner.png',weight:15,w:72,hitW:.80,hitH:.78,level:0},
    {id:'pretzel',path:'worlds/berlin/pretzel.png',weight:14,w:66,hitW:.82,hitH:.66,level:1},
    {id:'boombox',path:'worlds/berlin/boombox.png',weight:10,w:80,hitW:.82,hitH:.76,level:2}
   ]}
 ,{id:'amsterdam',name:'Amsterdam',tag:'NL',dayBg:'worlds/amsterdam/day.webp',nightBg:'worlds/amsterdam/night.webp',road:'city',desc:'Canals, tulips, gulls and wonderfully bad decisions',dayObstacles:[
    {id:'tulip_bike',path:'worlds/amsterdam/tulip_bike.png',weight:12,w:79,hitW:.77,hitH:.66,level:1},
    {id:'gouda_cheese',path:'worlds/amsterdam/gouda_cheese.png',weight:19,w:69,hitW:.78,hitH:.70,level:0},
    {id:'wooden_clogs',path:'worlds/amsterdam/wooden_clogs.png',weight:17,w:68,hitW:.80,hitH:.62,level:0},
    {id:'fallen_friet',path:'worlds/amsterdam/fallen_friet.png',weight:14,w:60,hitW:.70,hitH:.71,level:1},
    {id:'cheeky_seagull',path:'worlds/amsterdam/cheeky_seagull.png',weight:10,w:65,hitW:.70,hitH:.70,level:2},
    {id:'suspicious_plant',path:'worlds/amsterdam/suspicious_plant.png',weight:8,w:55,hitW:.62,hitH:.79,level:2}
  ],nightObstacles:[
    {id:'cheeky_seagull',path:'worlds/amsterdam/cheeky_seagull.png',weight:18,w:65,hitW:.70,hitH:.70,level:0},
    {id:'fallen_friet',path:'worlds/amsterdam/fallen_friet.png',weight:18,w:60,hitW:.70,hitH:.71,level:0},
    {id:'suspicious_plant',path:'worlds/amsterdam/suspicious_plant.png',weight:14,w:55,hitW:.62,hitH:.79,level:1},
    {id:'wooden_clogs',path:'worlds/amsterdam/wooden_clogs.png',weight:14,w:68,hitW:.80,hitH:.62,level:1},
    {id:'tulip_bike',path:'worlds/amsterdam/tulip_bike.png',weight:10,w:79,hitW:.77,hitH:.66,level:2},
    {id:'gouda_cheese',path:'worlds/amsterdam/gouda_cheese.png',weight:12,w:69,hitW:.78,hitH:.70,level:2}
  ]}
];
const WORLD_MAP=Object.fromEntries(WORLD_CATALOG.map(w=>[w.id,w]));
const skinImages={};for(const skin of skinCatalog){const im=new Image();im.src=skin.image;skinImages[skin.id]=im;}
let wallet=0,owned=['classic'],selectedSkin='classic',selectedWorld='tokyo';
try{
  wallet=Math.max(0,Number(localStorage.getItem('shiba-run-wallet')||0)||0);
  const saved=JSON.parse(localStorage.getItem('shiba-run-owned')||'["classic"]');
  if(Array.isArray(saved))owned=['classic',...saved.filter(v=>skinCatalog.some(s=>s.id===v))];
  const sel=localStorage.getItem('shiba-run-skin');if(owned.includes(sel))selectedSkin=sel;
  const worldSel=localStorage.getItem('shiba-run-world');const migrated={ny_day:'newyork',ny_night:'newyork',moscow_day:'moscow',moscow_night:'moscow'};if(WORLD_MAP[worldSel])selectedWorld=worldSel;else if(WORLD_MAP[migrated[worldSel]])selectedWorld=migrated[worldSel];
}catch(e){}
function currentWorld(){return WORLD_MAP[selectedWorld]||WORLD_CATALOG[0]}
function saveWardrobe(){try{localStorage.setItem('shiba-run-wallet',String(wallet));localStorage.setItem('shiba-run-owned',JSON.stringify(owned));localStorage.setItem('shiba-run-skin',selectedSkin)}catch(e){}}
function saveWorld(){try{localStorage.setItem('shiba-run-world',selectedWorld)}catch(e){}}
function bindMenu(){
  const open=$('openShop');if(open)open.addEventListener('click',e=>{e.stopPropagation();showShop()});
  const worlds=$('openWorlds');if(worlds)worlds.addEventListener('click',e=>{e.stopPropagation();showWorlds()});
  const start=$('start');if(start)start.addEventListener('click',e=>{e.stopPropagation();reset()});
}
function showHome(){
 stopMusic();mode='ready';syncPauseButton();overlay.classList.remove('hidden');panel.classList.remove('shop-panel');
 const world=currentWorld();
 panel.innerHTML=`<div class="eyebrow">ONE-TAP WORLD TOUR</div><img class="ozzy-logo" src="assets/ozzy-logo.webp" alt="Ozzy: The Hunt for Syrniki" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><h1 class="logo-fallback">Ozzy:<br>The Hunt for Syrniki</h1><div class="world-current">CURRENT LOCATION · <strong>${world.name}</strong></div><p>One dog. One delicious mission.<br>Collect syrniki, dodge trouble, run the world!</p><button id="start">LET'S RUN →</button><button class="shop-btn" id="openWorlds">🌍 CHANGE LOCATION</button><button class="shop-btn" id="openShop">🐾 SHIBA WARDROBE</button><div class="hint">TAP ANYWHERE · SPACE · ↑</div>`;
 bindMenu();
}
function showShop(){
 stopMusic();mode='shop';syncPauseButton();overlay.classList.remove('hidden');panel.classList.add('shop-panel');
 const rows=skinCatalog.map(s=>{
  const got=owned.includes(s.id),on=selectedSkin===s.id;
  const disabled=on||(!got&&wallet<s.price);
  const txt=on?'EQUIPPED':got?'EQUIP':`<img src='assets/syrnik.png' class='syrnik-icon' alt=''> ${s.price}`;
  return `<div class="shop-row"><div class="shop-pic" style="background-image:url('${s.image}')"></div><div class="shop-meta">${s.name}<small>${on?'Currently wearing':got?'Unlocked':s.price+' syrniki'}</small></div><button class="shop-action" data-skin="${s.id}" ${disabled?'disabled':''}>${txt}</button></div>`;
 }).join('');
 panel.innerHTML=`<div class="eyebrow" style="text-align:center">COSTUME SHOP</div><h1>SHIBA WARDROBE</h1><div class="shop-balance"><img src='assets/syrnik.png' class='syrnik-icon' alt=''> YOUR SYRNIKI: ${wallet}</div>${rows}<button class="shop-btn" id="backHome">← BACK TO MENU</button><div class="hint" style="text-align:center">Costumes are cosmetic · Saved on this device</div>`;
 $('backHome').addEventListener('click',e=>{e.stopPropagation();showHome()});
 panel.querySelectorAll('[data-skin]').forEach(btn=>btn.addEventListener('click',e=>{
   e.stopPropagation();const id=btn.dataset.skin,s=skinCatalog.find(x=>x.id===id);
   if(!s)return;
   if(!owned.includes(id)){if(wallet<s.price)return;wallet-=s.price;owned.push(id);playEffect('bone')}
   selectedSkin=id;saveWardrobe();showShop();
 }));
}
function showWorlds(){
 stopMusic();mode='worlds';syncPauseButton();overlay.classList.remove('hidden');panel.classList.add('shop-panel');
 const rows=WORLD_CATALOG.map(w=>{
  const active=w.id===selectedWorld;
  return `<div class="world-card ${active?'active':''}"><div class="world-thumb-duo"><div class="world-half" style="background-image:url('${w.dayBg}')"></div><div class="world-half" style="background-image:url('${w.nightBg}')"></div></div><div class="world-meta">${w.name}<small>☀️ DAY ↔ 🌙 NIGHT</small></div><button class="world-pick ${active?'alt':''}" data-world="${w.id}" ${active?'disabled':''}>${active?'SELECTED':'CHOOSE'}</button></div>`;
 }).join('');
 panel.innerHTML=`<div class="eyebrow" style="text-align:center">CITY SELECT</div><h1>CHANGE<br>LOCATION</h1><p class="world-picker-intro">Choose a city. Day and night alternate automatically as you run.</p><div class="world-grid">${rows}</div><button class="shop-btn" id="backHome">← BACK TO MENU</button>`;
 $('backHome').addEventListener('click',e=>{e.stopPropagation();showHome()});
 panel.querySelectorAll('[data-world]').forEach(btn=>btn.addEventListener('click',e=>{
  e.stopPropagation();const id=btn.dataset.world;if(!WORLD_MAP[id])return;selectedWorld=id;saveWorld();showHome();
 }));
}
bindMenu();
const spriteFrames={idle:0,run_1:1,run_2:2,run_3:3,run_4:4,jump_launch:5,jump_air:6,double_jump:7,landing:8,hurt:9,collect:10,game_over:11};

// Mobile-friendly background layers; preload both themes so day/night transitions never stall.
const cityImages={};
for(const name of ['day-far','day-street','night-far','night-street']){
  const img=new Image(); img.decoding='async'; img.src='backgrounds/'+name+'.webp';
  cityImages[name]=img;
}
const worldBgImages={};
for(const world of WORLD_CATALOG){
  if(world.id==='tokyo')continue;
  worldBgImages[world.id]={};
  for(const phase of ['day','night']){
    const img=new Image(); img.decoding='async';img.src=world[phase+'Bg'];
    worldBgImages[world.id][phase]=img;
  }
}
// Lightweight animated cherry-blossom petals, generated on Canvas (no heavy animation textures).
const rand=(a,b)=>a+Math.random()*(b-a);
const sakura=Array.from({length:28},(_,i)=>({
  x:Math.random(),y:Math.random(),size:rand(2.0,4.8),speed:rand(.025,.065),
  drift:rand(.012,.040),phase:rand(0,Math.PI*2),tilt:rand(0,Math.PI*2)
}));
let gameOverDelay=0;
function anim(name){if(dog.anim!==name){dog.anim=name;dog.animTime=0}}
const pick=a=>a[Math.random()*a.length|0];
function resize(){DPR=Math.min(window.devicePixelRatio||1,2);W=window.innerWidth;H=window.innerHeight;c.width=Math.round(W*DPR);c.height=Math.round(H*DPR);c.style.width=W+'px';c.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);scale=Math.max(.75,Math.min(1.34,W/400));ground=Math.round(H*.75);if(H<560)ground=H*.79;dog.x=Math.max(66,W*.22);if(mode!=='playing')dog.y=ground-24*scale;}
window.addEventListener('resize',resize,{passive:true});resize();
let audio;
try{musicEnabled=localStorage.getItem('shiba-run-music')!=='off';effectsEnabled=localStorage.getItem('shiba-run-effects')!=='off'}catch(e){}
function syncAudioButtons(){const m=$('musicToggle'),s=$('effectsToggle');m.textContent=musicEnabled?'🎵':'🎵̸';s.textContent=effectsEnabled?'🔊':'🔇';m.setAttribute('aria-pressed',String(musicEnabled));s.setAttribute('aria-pressed',String(effectsEnabled));m.setAttribute('aria-label',musicEnabled?'Mute music':'Unmute music');s.setAttribute('aria-label',effectsEnabled?'Mute sound effects':'Unmute sound effects')}
syncAudioButtons();
// HTMLMediaElement playback is more dependable for iOS Safari, including silent-mode devices.
const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const themeMusic=new Audio();
const musicCandidates=['audio/bg_music_loop.mp3','audio/shiba-theme.wav'];
let musicCandidateIndex=0;
function loadThemeCandidate(index){
  musicCandidateIndex=index;
  themeMusic.src=musicCandidates[index];
}
loadThemeCandidate(0);
themeMusic.addEventListener('error',()=>{
  if(musicCandidateIndex<musicCandidates.length-1){
    loadThemeCandidate(musicCandidateIndex+1);
    themeMusic.load();
  }
});
themeMusic.loop=true;themeMusic.preload='auto';themeMusic.volume=.34;themeMusic.playsInline=true;
const audioEffects={};
for(const key of ['jump','double','bone','hit']){
  const el=new Audio('audio/'+key+'.wav'); el.preload='auto';el.volume=.65;
  audioEffects[key]=el;
}
function playEffect(key){
  if(!effectsEnabled)return;
  if(isiOS){
    const original=audioEffects[key];if(!original)return;
    // A clone permits rapid repeat events without interrupting the last effect.
    const sound=original.cloneNode();sound.volume=.72;
    const p=sound.play();if(p&&p.catch)p.catch(()=>{});
  }else{
    const settings={jump:[520,.11,'triangle',.065],double:[720,.11,'triangle',.065],bone:[850,.12,'sine',.065],hit:[170,.26,'sawtooth',.13]};
    beep(...(settings[key]||settings.jump));
  }
}
function startMusic(){
  if(!musicEnabled||mode!=='playing'){
    themeMusic.muted=true;
    themeMusic.pause();
    return;
  }
  themeMusic.muted=false;
  const p=themeMusic.play();if(p&&p.catch)p.catch(()=>{});
}
function stopMusic(){
  themeMusic.pause();
  themeMusic.muted=true;
}
themeMusic.addEventListener('play',()=>{
  if(!musicEnabled||mode!=='playing'){
    themeMusic.pause();
    themeMusic.muted=true;
  }
});
themeMusic.addEventListener('playing',()=>{
  if(!musicEnabled||mode!=='playing'){
    themeMusic.pause();
    themeMusic.muted=true;
  }
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden)stopMusic();else startMusic();
});
window.addEventListener('pagehide',stopMusic,{passive:true});
window.addEventListener('blur',()=>{if(mode!=='playing'||!musicEnabled)stopMusic();},{passive:true});
// iOS Safari requires starting/resuming Web Audio from a real user gesture.
function unlockAudio(){
  try{
    if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state!=='running')audio.resume().catch(()=>{});
    // A silent one-frame source primes the audio route on iOS.
    const buffer=audio.createBuffer(1,1,audio.sampleRate);
    const source=audio.createBufferSource();source.buffer=buffer;source.connect(audio.destination);source.start(0);
  }catch(e){}
}
function beep(freq=500,dur=.08,type='sine',volume=.07){
  if(!effectsEnabled)return;
  try{
    unlockAudio();if(!audio)return;
    const startAt=audio.currentTime+.005;
    const o=audio.createOscillator(),g=audio.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,startAt);
    o.frequency.exponentialRampToValueAtTime(Math.max(1,freq*.75),startAt+dur);
    g.gain.setValueAtTime(Math.min(.24,volume*1.7),startAt);
    g.gain.exponentialRampToValueAtTime(.001,startAt+dur);
    o.connect(g);g.connect(audio.destination);o.start(startAt);o.stop(startAt+dur+.01);
  }catch(e){}
}
// Unlock on pointer and touch gestures; keep controls and gameplay untouched.
document.addEventListener('pointerdown',unlockAudio,{passive:true});
document.addEventListener('touchstart',unlockAudio,{passive:true});
$('musicToggle').onclick=e=>{e.stopPropagation();musicEnabled=!musicEnabled;try{localStorage.setItem('shiba-run-music',musicEnabled?'on':'off')}catch(_){ }syncAudioButtons();if(musicEnabled){unlockAudio();startMusic()}else stopMusic()};
$('effectsToggle').onclick=e=>{e.stopPropagation();effectsEnabled=!effectsEnabled;try{localStorage.setItem('shiba-run-effects',effectsEnabled?'on':'off')}catch(_){ }syncAudioButtons();if(effectsEnabled){unlockAudio();playEffect('bone')}};
let savedDogOnPause=null;
function syncPauseButton(){
  const b=$('pauseToggle');
  const active=mode==='playing'||mode==='paused';
  b.classList.toggle('visible',active);
  const paused=mode==='paused';
  b.textContent=paused?'▶':'⏸';
  b.setAttribute('aria-label',paused?'Resume game':'Pause game');
  b.title=paused?'Resume game':'Pause game';
}
function togglePause(){
  if(mode==='playing'){
    savedDogOnPause={...dog};
    mode='paused';stopMusic();
    dog.y=ground-24*scale;dog.vy=0;dog.jumps=0;dog.rot=0;
    dog.anim='idle';dog.animTime=0;dog.actionTime=0;
    tip.style.opacity='0';
  }else if(mode==='paused'){
    if(savedDogOnPause)Object.assign(dog,savedDogOnPause);
    savedDogOnPause=null;
    mode='playing';startMusic();
  }else return;
  syncPauseButton();
}
$('pauseToggle').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault()});
$('pauseToggle').addEventListener('click',e=>{e.stopPropagation();togglePause()});
function reset(){savedDogOnPause=null;mode='playing';syncPauseButton();startMusic();clock=0;meters=0;bones=0;worldX=0;spawnTimer=1.1;objects=[];particles=[];shake=0;dog.y=ground-24*scale;dog.vy=0;dog.jumps=0;dog.rot=0;dog.anim='run_1';dog.animTime=0;dog.actionTime=0;dog.spinTime=0;gameOverDelay=0;scoreEl.textContent='0000';bonesEl.textContent='0';overlay.classList.add('hidden');tip.style.opacity='1'}
function jump(){if(dog.jumps>=2)return;dog.vy=-(dog.jumps===0?595:525)*scale;dog.jumps++;dog.actionTime=0;dog.spinTime=0;anim(dog.jumps===1?'jump_launch':'double_jump');playEffect(dog.jumps===1?'jump':'double');for(let i=0;i<7;i++)particles.push({x:dog.x-20*scale,y:ground-6*scale,vx:rand(-70,30)*scale,vy:rand(-100,-10)*scale,life:.35,color:'#e7c38f',r:rand(2,5)*scale});}
function action(e){if(e&&e.cancelable)e.preventDefault();if(mode==='playing')jump();else if(mode==='ready'||mode==='over')reset()}
c.addEventListener('pointerdown',action);$('start').addEventListener('pointerdown',e=>e.stopPropagation());document.addEventListener('keydown',e=>{if(e.code==='KeyP'||e.code==='Escape'){if(e.repeat)return;togglePause();return}if(['Space','ArrowUp','KeyW'].includes(e.code)){if(e.repeat)return;action(e)}});
// Eight distinct obstacles; weighted, tiered and individually sized for a mobile play lane.
const tokyoObstacleCatalog=[
 {id:'cone',path:'obstacles/cone.png',weight:18,w:54,hitW:.65,hitH:.83,level:0},
 {id:'sleeping_cat',path:'obstacles/sleeping_cat.png',weight:13,w:65,hitW:.73,hitH:.72,level:0},
 {id:'angry_cat',path:'obstacles/angry_cat.png',weight:11,w:62,hitW:.68,hitH:.85,level:1},
 {id:'tanuki',path:'obstacles/tanuki.png',weight:7,w:48,hitW:.68,hitH:.84,level:2},
 {id:'lantern',path:'obstacles/lantern.png',weight:14,w:65,hitW:.74,hitH:.66,level:0},
 {id:'boxes',path:'obstacles/boxes.png',weight:10,w:45,hitW:.78,hitH:.87,level:1},
 {id:'ramen',path:'obstacles/ramen.png',weight:16,w:44,hitW:.73,hitH:.55,level:0},
 {id:'umbrellas',path:'obstacles/umbrellas.png',weight:11,w:34,hitW:.68,hitH:.83,level:1}
];
// Tight source rectangles keep Tokyo illustrations at their original proportions.
const obstacleCrops={
 boxes:{x:12,y:52,w:232,h:191},
 cone:{x:12,y:32,w:232,h:211},
 lantern:{x:12,y:98,w:232,h:145},
 ramen:{x:12,y:84,w:232,h:159},
 tanuki:{x:12,y:75,w:232,h:168},
 umbrellas:{x:62,y:17,w:132,h:226},
};
function daylightAmount(){
 const cycle=((meters%420)+420)%420;
 if(cycle<185)return 0;
 if(cycle<225)return (cycle-185)/40;
 if(cycle<390)return 1;
 return 1-(cycle-390)/30;
}
function activeObstacleCatalog(){
 const world=currentWorld();
 if(world.id==='tokyo')return tokyoObstacleCatalog;
 return daylightAmount()<.5?world.dayObstacles:world.nightObstacles;
}
const obstacleImages={};
for(const spec of tokyoObstacleCatalog){const image=new Image();image.src=spec.path;obstacleImages[spec.id]=image}
for(const world of WORLD_CATALOG){
 for(const spec of [...(world.dayObstacles||[]),...(world.nightObstacles||[])]){
  const image=new Image();image.src=spec.path;obstacleImages[spec.id]=image;
 }
}
function chooseObstacle(){
 const difficulty=meters<110?0:meters<280?1:2;
 const pool=activeObstacleCatalog().filter(o=>o.level<=difficulty);
 const total=pool.reduce((s,o)=>s+o.weight,0);let value=Math.random()*total;
 for(const spec of pool){value-=spec.weight;if(value<0)return spec}return pool[0];
}
function makeObstacle(){
 const spec=chooseObstacle();
 const crop=obstacleCrops[spec.id];
 const image=obstacleImages[spec.id];
 const width=spec.w*scale;
 const ratio=(crop?crop.h/crop.w:(image&&image.naturalWidth?image.naturalHeight/image.naturalWidth:1));
 const height=Math.max(18*scale,width*ratio);
 objects.push({type:spec.id,x:W+68*scale,y:ground,w:width,h:height,hitW:spec.hitW,hitH:spec.hitH,hit:false});
 if(Math.random()<.7){const amount=Math.random()<.25?3:1;
  for(let i=0;i<amount;i++)objects.push({type:'bone',x:W+(amount===1?20:i*34)*scale+68*scale,y:ground-rand(87,140)*scale,w:20*scale,h:18*scale,hit:false})}
}
function puff(x,y,color,n=9){for(let i=0;i<n;i++)particles.push({x,y,vx:rand(-170,170)*scale,vy:rand(-240,-60)*scale,life:rand(.3,.65),color,r:rand(3,7)*scale})}
function gameOver(){stopMusic();mode='over';syncPauseButton();gameOverDelay=.62;anim('hurt');shake=9;playEffect('hit');if(Math.floor(meters)>best){best=Math.floor(meters);try{localStorage.setItem('shiba-run-best',best)}catch(e){}}bestEl.textContent=String(best).padStart(4,'0');const world=currentWorld();panel.innerHTML=`<div class="eyebrow">THE ADVENTURE ENDS</div><h1>OOPS! 🐕</h1><p>Our brave shiba has met an obstacle in <strong>${world.name}</strong>.</p><div class="results"><div><small>DISTANCE</small>${Math.floor(meters)} m</div><div><small>SYRNIKI</small>${bones} <img src='assets/syrnik.png' class='syrnik-icon' alt=''></div></div><button id="start">TRY AGAIN →</button><button class="shop-btn" id="openWorlds">🌍 CHANGE LOCATION</button><button class="shop-btn" id="openShop">🐾 SHIBA WARDROBE</button><div class="hint">TAP TO TRY AGAIN</div>`;bindMenu()}
function update(dt){if(mode==='paused')return;clock+=dt;dog.animTime+=dt;dog.actionTime+=dt;shake=Math.max(0,shake-dt*15);
if(mode!=='playing'){
if(mode==='ready'){anim('idle');dog.y=ground-24*scale+Math.sin(clock*3)*2;}
if(mode==='over'){if(dog.animTime>.30)anim('game_over');gameOverDelay-=dt;if(gameOverDelay<=0)overlay.classList.remove('hidden')}
return}
const speed=(250+Math.min(220,meters*.20))*scale;worldX+=speed*dt;meters+=speed*dt/27;scoreEl.textContent=String(Math.floor(meters)).padStart(4,'0');if(meters>25)tip.style.opacity='0';spawnTimer-=dt;if(spawnTimer<=0){makeObstacle();spawnTimer=rand(1.05,1.65)*250*scale/speed;}
 dog.vy+=1530*scale*dt;dog.y+=dog.vy*dt;if(dog.y>=ground-24*scale){if(dog.jumps>0&&dog.vy>0)puff(dog.x,ground-3*scale,'#edd1a4',4);const justLanded=dog.jumps>0;dog.y=ground-24*scale;dog.vy=0;dog.jumps=0;if(justLanded){anim('landing');dog.actionTime=0}}dog.rot=dog.vy<-50?-.04:dog.vy>50?.06:0;
if(dog.jumps===0){if(dog.anim==='landing'&&dog.actionTime<.14){}else if(dog.anim==='collect'&&dog.actionTime<.28){}else anim('run_1')}
else if(dog.jumps===2){anim('double_jump');dog.spinTime+=dt}
else if(dog.actionTime<.11)anim('jump_launch');else anim('jump_air');
 for(let i=objects.length-1;i>=0;i--){const o=objects[i];o.x-=speed*dt;if(o.x<-100){objects.splice(i,1);continue}if(o.hit)continue;const dx=Math.abs(o.x-dog.x),feet=dog.y+24*scale,bodyTop=dog.y-20*scale;if(o.type==='bone'){if(dx<27*scale&&Math.abs(dog.y-o.y)<34*scale){o.hit=true;if(dog.jumps===0){anim('collect');dog.actionTime=0}bones++;wallet++;saveWardrobe();bonesEl.textContent=bones;playEffect('bone');puff(o.x,o.y,'#ffca57',8);objects.splice(i,1)}}else{if(dx<(o.w*o.hitW*.5+12*scale)&&feet>ground-o.h*o.hitH+3*scale&&bodyTop<ground-5*scale){puff(dog.x+12*scale,dog.y,'#fff2d7',14);gameOver();break}}}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=450*scale*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1)} }
function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function poly(points,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();ctx.fill()}
function tiledPanorama(img,parallax,top,displayHeight,sourceTop=0,sourceHeight=null){
  if(!img.complete||!img.naturalWidth)return false;
  const sw=img.naturalWidth,sh=sourceHeight??img.naturalHeight;
  const dw=sw*displayHeight/sh;
  if(dw<1)return false;
  // Mirror every other tile so the repeating edges align, avoiding a harsh visual jump.
  const shift=((worldX*parallax)% (2*dw)+2*dw)%(2*dw);
  const initial=-shift-2*dw;
  for(let x=initial;x<W+dw;x+=dw){
    const tileIndex=Math.round((x+shift)/dw);
    ctx.save();
    if(Math.abs(tileIndex)%2===1){ctx.translate(x+dw,0);ctx.scale(-1,1);ctx.drawImage(img,0,sourceTop,sw,sh,0,top,dw,displayHeight)}
    else ctx.drawImage(img,0,sourceTop,sw,sh,x,top,dw,displayHeight);
    ctx.restore();
  }
  return true;
}
function cityTheme(which,opacity){
  if(opacity<=0)return;
  ctx.save();ctx.beginPath();ctx.rect(0,0,W,ground);ctx.clip();ctx.globalAlpha=opacity;
  const far=cityImages[which+'-far'],near=cityImages[which+'-street'];
  // Far panorama stays behind the skyline; foreground shops pass faster.
  const farHeight=Math.max(ground+20,320);
  tiledPanorama(far,.075,0,farHeight);
  const streetHeight=Math.min(ground*.68,410*scale);
  const nearTop=ground-streetHeight+24*scale;
  tiledPanorama(near,.32,nearTop,streetHeight,36,470);
  ctx.restore();
}
function drawSakura(){
  ctx.save();
  const elapsed=worldX*.00015 +clock*.04;
  for(const p of sakura){
    const x=((p.x-elapsed*p.drift)*W % (W+40) + W+40)%(W+40)-20;
    const y=((p.y+clock*p.speed)*ground % (ground+30)+ground+30)%(ground+30)-15;
    const px=x+Math.sin(clock*.8+p.phase)*14*scale;
    const py=y;
    const r=p.size*scale;
    ctx.save();ctx.translate(px,py);ctx.rotate(p.tilt+clock*.9);
    ctx.fillStyle='rgba(255,195,219,.86)';
    ctx.beginPath();ctx.ellipse(0,0,r*.68,r*1.35,.25,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,237,241,.52)';ctx.beginPath();ctx.ellipse(-r*.1,-r*.35,r*.25,r*.55,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
const roadPalettes={
 city:{top:'#9ba3ac',mid:'#b9c0c7',bottom:'#838a93',edge:'#6b7279',line:'#e7edf2',grid:'#a6abb1'},
 night:{top:'#6e6f83',mid:'#8b8ea2',bottom:'#575a70',edge:'#47495c',line:'#d5bfd0',grid:'#73697a'},
 warm:{top:'#d2ad9f',mid:'#e3bcae',bottom:'#b99a8a',edge:'#9e867b',line:'#f1d7c7',grid:'#b89286'}
};
function drawRoadSurface(kind='city'){
  const pal=roadPalettes[kind]||roadPalettes.city;
  const road=ctx.createLinearGradient(0,ground,0,H);
  road.addColorStop(0,pal.top); road.addColorStop(.2,pal.mid); road.addColorStop(1,pal.bottom);
  ctx.fillStyle=road;ctx.fillRect(0,ground,W,H-ground);
  ctx.fillStyle=pal.edge;ctx.fillRect(0,ground,W,5*scale);
  ctx.fillStyle=pal.line;ctx.fillRect(0,ground+5*scale,W,3*scale);
  const roadStep=82*scale;
  ctx.strokeStyle=pal.grid;ctx.lineWidth=Math.max(1,1.5*scale);
  for(let i=0;i<W/roadStep+3;i++){
    const x=i*roadStep-(worldX*.90%roadStep);
    ctx.beginPath();ctx.moveTo(x,ground+25*scale);ctx.lineTo(x-8*scale,H);ctx.stroke();
  }
  const step=56*scale;
  for(let i=0;i<W/step+3;i++){
    const x=i*step-(worldX*1.10%step);
    rounded(x,ground+45*scale,step-7*scale,3*scale,2*scale,kind==='night'?'#87748d':'#cba396');
  }
}
function drawTokyoBackground(){
  ctx.fillStyle='#f7d89f';ctx.fillRect(-20,-20,W+40,H+40);
  const night=daylightAmount();
  if(!cityImages['day-far'].complete||!cityImages['day-far'].naturalWidth){
    const fallback=ctx.createLinearGradient(0,0,0,ground);fallback.addColorStop(0,'#92cdf1');fallback.addColorStop(1,'#dff1f2');ctx.fillStyle=fallback;ctx.fillRect(0,0,W,H);
  }
  cityTheme('day',1); cityTheme('night',night); drawRoadSurface(night>.5?'night':'warm'); drawSakura();
}
function drawCustomWorldBackground(world){
 ctx.fillStyle='#f7d89f';ctx.fillRect(-20,-20,W+40,H+40);
 const group=worldBgImages[world.id];
 const alpha=daylightAmount();
 ctx.save();ctx.beginPath();ctx.rect(0,0,W,ground);ctx.clip();
 const h=Math.max(ground-4,320);
 const day=group?.day,night=group?.night;
 if(day?.complete&&day.naturalWidth){tiledPanorama(day,.14,0,h,0,day.naturalHeight)}
 else {ctx.fillStyle='#97cdf1';ctx.fillRect(0,0,W,ground)}
 if(alpha>0 && night?.complete && night.naturalWidth){
   ctx.save();ctx.globalAlpha=alpha;tiledPanorama(night,.14,0,h,0,night.naturalHeight);ctx.restore();
 }
 ctx.restore();
 drawRoadSurface(alpha>.5?'night':world.road||'city');
}
function background(){
  const world=currentWorld();
  if(world.id==='tokyo') drawTokyoBackground();
  else drawCustomWorldBackground(world);
}
function tree(x,y,kind){ctx.save();ctx.translate(x,y);rounded(-3*scale,0,6*scale,48*scale,3*scale,'#9a8154');ellipse(0,-5*scale,kind===0?31*scale:24*scale,35*scale,'#96ad77');ellipse(-13*scale,2*scale,22*scale,23*scale,'#a7bf83');ellipse(15*scale,0,21*scale,27*scale,'#a4bb80');ctx.restore()}
function shiba(x,y,t){ctx.save();ctx.translate(x,y);ctx.rotate(dog.rot);ctx.scale(scale,scale);const run=dog.jumps===0?Math.sin(t*17):.2,leg=run*5;
// curled tail
ctx.strokeStyle='#b75c27';ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-25,-5);ctx.bezierCurveTo(-42,-18,-42,-33,-29,-30);ctx.bezierCurveTo(-17,-27,-23,-16,-30,-19);ctx.stroke();
// back legs
rounded(-22,9+leg,11,15,5,'#b9622c');rounded(7,8-leg,11,16,5,'#b9622c');ellipse(-15,23+leg,8,4,'#fff0d6');ellipse(14,23-leg,8,4,'#fff0d6');
// body
ellipse(-4,0,29,21,'#d77b36');ellipse(10,8,18,12,'#fff3d8');
// pointy ears
poly([[6,-29],[15,-50],[25,-25]],'#b75a26');poly([[11,-32],[16,-43],[21,-29]],'#f9c6a5');poly([[26,-26],[37,-46],[45,-14]],'#b75a26');poly([[31,-28],[37,-39],[40,-19]],'#f9c6a5');
// head
ellipse(27,-12,24,23,'#dc843c');ellipse(32,-1,17,12,'#fff0d7');ellipse(43,-1,10,7,'#fff0d7');ellipse(46,-6,4,3,'#42342d');ellipse(22,-16,3,3.7,'#352c2a');ellipse(39,-17,3,3.7,'#352c2a');ellipse(30,-8,2.8,2,'#e8a07f');
// happy mouth
ctx.strokeStyle='#643d31';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(44,-1);ctx.quadraticCurveTo(42,4,38,3);ctx.stroke();
// bandana
poly([[10,4],[20,7],[12,18]],'#e54d44');ctx.restore()}
function drawDog(x,y,t){
const dogAtlas=skinImages[selectedSkin];if(!dogAtlas||!dogAtlas.complete||!dogAtlas.naturalWidth){shiba(x,y,t);return}
let frame=dog.anim;
if(frame==='run_1'){const idx=Math.floor(worldX/(33*scale))%4;frame=['run_1','run_2','run_3','run_4'][idx]}
if(frame==='hurt'&&dog.animTime>.27)frame='game_over';
// The double_jump artwork is already upside-down. Spin the upright airborne pose instead.
if(dog.jumps===2)frame='jump_air';
const index=spriteFrames[frame]??0,fw=320,fh=320;
const sx=(index%4)*fw,sy=Math.floor(index/4)*fh;
const size=137*scale;
const py=y+24*scale-(258/320)*size;
ctx.save();
if(dog.jumps===2){
  // Rotate around the dog's body, and finish one complete somersault in flight.
  ctx.translate(x,py+size*.49);
  ctx.rotate(Math.min(1,dog.spinTime/.46)*Math.PI*2);
  ctx.drawImage(dogAtlas,sx,sy,fw,fh,-size/2,-size*.49,size,size);
}else{
  ctx.translate(x,py+(258/320)*size);
  ctx.rotate(dog.rot);
  ctx.drawImage(dogAtlas,sx,sy,fw,fh,-size/2,-(258/320)*size,size,size);
}
ctx.restore();
}
function obstacle(o){
 const image=obstacleImages[o.type];
 if(image&&image.complete&&image.naturalWidth){
  // Render only the illustrated pixels, maintaining each sprite's original aspect ratio.
  // All obstacles use the same ground anchor; collision dimensions follow visible artwork.
  const crop=obstacleCrops[o.type];
  if(crop)ctx.drawImage(image,crop.x,crop.y,crop.w,crop.h,o.x-o.w/2,o.y-o.h,o.w,o.h);
  else ctx.drawImage(image,o.x-o.w/2,o.y-o.h,o.w,o.h);
 }else{
  // Keep the obstacle visible if one image is missing or not yet loaded.
  rounded(o.x-o.w*.45,o.y-o.h,o.w*.9,o.h,6*scale,'#d77f42');
 }
}
function boneShape(o){
 ctx.save();ctx.translate(o.x,o.y);ctx.rotate(Math.sin(clock*6+o.x*.012)*.14);
 const pulse=1+Math.sin(clock*7+o.x*.009)*.05;ctx.scale(scale*pulse,scale*pulse);
 if(syrnikSprite.complete&&syrnikSprite.naturalWidth){ctx.drawImage(syrnikSprite,-16,-13,32,26)}
 else {ellipse(0,0,14,10,'#dc8a35');ellipse(-2,-3,11,5,'#f7bc62')}
 ctx.restore();
}
function draw(){ctx.save();if(shake&&mode!=='paused')ctx.translate(rand(-shake,shake),rand(-shake,shake));background();const shadowSize=dog.jumps?Math.max(.4,1-(ground-dog.y)/200):1;ellipse(dog.x,ground+2*scale,26*scale*shadowSize,5*scale*shadowSize,'#708a5c66');objects.filter(o=>o.type==='bone').forEach(boneShape);objects.filter(o=>o.type!=='bone').forEach(obstacle);drawDog(dog.x,dog.y,clock);for(const p of particles){ctx.globalAlpha=Math.min(1,Math.max(0,p.life*2));ellipse(p.x,p.y,p.r,p.r,p.color)}ctx.globalAlpha=1;ctx.restore()}
function loop(now){const dt=Math.min(.032,(now-last)/1000||0);last=now;update(dt);draw();requestAnimationFrame(loop)}showHome();
requestAnimationFrame(loop);
})();