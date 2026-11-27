(function(){
const dog=document.querySelector('.shiba-walker'),sprite=dog&&dog.querySelector('.shiba-png');if(!sprite)return;
const root='/assets/shiba/',baseFrames=['walk_1','walk_2','sniff','bite','leg_lift','jump','sit'];const walkFrames=Array.from({length:8},(_,i)=>'walk_'+String(i+1).padStart(2,'0'));const cache={};
let walk=0,frameTimer,walking=['walk_1','walk_2'],walkInterval=140,lifeTick=0,lastLifeState='',lastSitPhase='';
const extraCounts={tail:8,stretch:6,sleep:8,sneeze:6,tilt:5};
const extraFrames=Object.fromEntries(Object.entries(extraCounts).map(([k,n])=>[k,Array.from({length:n},(_,i)=>k+'_'+String(i+1).padStart(2,'0'))]));
const extraReady={};const lifeFrames={look:Array.from({length:6},(_,i)=>'look_'+String(i+1).padStart(2,'0')),sit:Array.from({length:4},(_,i)=>'sit_'+String(i+1).padStart(2,'0')),scratch:Array.from({length:8},(_,i)=>'scratch_'+String(i+1).padStart(2,'0'))};const lifeReady={look:false,sit:false,scratch:false};
function pingPong(t,length){if(length<=1)return 0;const period=2*(length-1),p=t%period;return p<length?p:period-p}
function setFrame(name){if(cache[name]&&sprite.src!==cache[name].src)sprite.src=cache[name].src}
function motion(){return dog.dataset.motionState||'walk'}
function syncFrame(){const m=motion();if(m==='walk'){walk=0;setFrame(walking[0])}else if(m==='sit'||m==='scratch')setFrame(lifeReady.sit?lifeFrames.sit[0]:'sit');else if(m==='look')setFrame(lifeReady.look?lifeFrames.look[0]:'idle');else if(m==='sniff')setFrame('sniff');else if(m==='bite')setFrame('bite');else if(m==='pee')setFrame('leg_lift');else setFrame('idle')}
dog.addEventListener('shiba-state-change',()=>{lastLifeState='';lastSitPhase='';lifeTick=0;syncFrame()});
function begin(){if(document.hidden||!dog.classList.contains('has-png'))return;if(frameTimer)clearInterval(frameTimer);syncFrame();frameTimer=setInterval(()=>{
 const m=motion();
 const extra=m!=='walk'&&!dog.classList.contains('is-dragging')?(dog.dataset.extraAction||''):'';
 const lifeState=extra?'extra:'+extra:m;
 const sitPhase=dog.dataset.sitPhase||'';
 if(lifeState!==lastLifeState||sitPhase!==lastSitPhase){lifeTick=0;lastLifeState=lifeState;lastSitPhase=sitPhase;}
 if(extra&&extraReady[extra]){
   const seq=extraFrames[extra];
   const config={
     tail:{duration:4800,enter:600,exit:750,loop:[2,5],rate:125},
     stretch:{duration:2600,enter:850,exit:650,loop:[2,3],rate:300},
     sleep:{duration:10200,enter:1600,exit:1000,loop:[4,5],rate:700},
     sneeze:{duration:1800,enter:650,exit:650,loop:[3,4],rate:180},
     tilt:{duration:4100,enter:750,exit:700,loop:[1,3],rate:350}
   }[extra];
   const elapsed=Math.max(0,performance.now()-Number(dog.dataset.extraStarted||performance.now()));
   let idx;
   if(elapsed<config.enter){
     idx=Math.min(config.loop[0],Math.floor(elapsed/config.enter*(config.loop[0]+1)));
   }else if(elapsed<config.duration-config.exit){
     const [lo,hi]=config.loop,period=2*(hi-lo);
     const p=Math.floor((elapsed-config.enter)/config.rate)%(period||1);
     idx=lo+(period?(p<=hi-lo?p:period-p):0);
   }else{
     const [lo,hi]=config.loop;
     const progress=Math.min(1,(elapsed-(config.duration-config.exit))/config.exit);
     idx=Math.min(seq.length-1,hi+Math.floor(progress*(seq.length-hi)));
   }
   setFrame(seq[Math.max(0,Math.min(seq.length-1,idx))]);
 }
 else if(m==='scratch'){const seq=lifeFrames.scratch;setFrame(lifeReady.scratch?seq[pingPong(Math.floor(lifeTick++/2),seq.length)]:'sit')}
 else if(m==='sit'){const seq=lifeFrames.sit,phase=dog.dataset.sitPhase||'hold';const idx=phase==='hold'?seq.length-1:phase==='exit'?Math.max(0,seq.length-1-Math.floor(lifeTick++/2)):Math.min(seq.length-1,Math.floor(lifeTick++/2));setFrame(lifeReady.sit?seq[idx]:'sit')}
 else if(m==='look'){const seq=lifeFrames.look;setFrame(lifeReady.look?seq[pingPong(Math.floor(lifeTick++/3),seq.length)]:'idle')}
 else if(m==='pee')setFrame('leg_lift');
 else if(m==='sniff')setFrame('sniff');
 else if(m==='bite')setFrame('bite');
 else if(m!=='walk')setFrame('idle');
 else {walk=(walk+1)%walking.length;setFrame(walking[walk])}
},walkInterval)}
// Prioritize the visible dog: base poses and walking frames first.
// Optional animations are fetched when the browser is idle, not during first paint.
function loadFrame(name,version=''){
 if(cache[name])return Promise.resolve(true);
 return new Promise(resolve=>{
  const im=new Image();
  if(name==='idle')im.fetchPriority='high';
  im.onload=()=>{
   cache[name]=im;
   if(!dog.classList.contains('has-png')){
    setFrame(name);
    dog.classList.add('has-png');
    begin();
   }
   resolve(true);
  };
  im.onerror=()=>resolve(false);
  im.src=root+name+'.png'+(version?'?v='+version:'');
 });
}
async function loadIdle(){
 if(await loadFrame('idle'))return;
 await new Promise(resolve=>setTimeout(resolve,500));
 await loadFrame('idle');
}
async function boot(){
 // Give the preloaded pose a head start without letting a stalled request block fallback frames.
 let fallbackTimer;
 await Promise.race([loadIdle(),new Promise(resolve=>{fallbackTimer=setTimeout(resolve,1500)})]);
 clearTimeout(fallbackTimer);
 await Promise.all(baseFrames.map(name=>loadFrame(name)));
 const walkLoads=Promise.all(walkFrames.map(name=>loadFrame(name,'3')));
 if('requestIdleCallback' in window)requestIdleCallback(loadOptional,{timeout:3500});
 else setTimeout(loadOptional,1600);
 await walkLoads;
 const available=walkFrames.filter(name=>cache[name]);
 if(available.length){
  walking=available;
  walkInterval=105;
  begin();
 }
}
boot();
function loadOptional(){
 Object.entries(lifeFrames).forEach(([kind,seq])=>
  Promise.all(seq.map(name=>loadFrame(name,'3'))).then(results=>{lifeReady[kind]=results.every(Boolean)})
 );
 Object.entries(extraFrames).forEach(([kind,seq])=>
  Promise.all(seq.map(name=>loadFrame(name,'1'))).then(results=>{
   extraReady[kind]=results.every(Boolean);
   dog.dataset['ready'+kind]=extraReady[kind]?'1':'0';
  })
 );
}
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){
  clearInterval(frameTimer);
  frameTimer=null;
 }else if(!frameTimer)begin();
});
})();
