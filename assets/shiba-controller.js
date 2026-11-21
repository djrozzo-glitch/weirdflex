
/* Shiba world controller: one coordinate system for roaming, mischief and dragging. */
(function(){
 const dog=document.querySelector('.shiba-walker');
 if(!dog)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const speed=78.75, clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),wait=ms=>new Promise(r=>setTimeout(r,ms));
 let x=innerWidth*.45,y=innerHeight-95,face=-1,mode='walk',destination=null;
 let busy=false,drag=false,pointer=null,dx=0,dy=0,previous=performance.now(),nextDecision=0,epoch=0,edgeSide=1;
 let pressStart=0,pressX=0,pressY=0,pressMoved=false,petCount=0,hoverCooldown=0,secretInput='',secretLock=false;
 const secretSeen=new Set();
 function announce(message){let el=document.getElementById('shiba-secret-toast');if(!el){el=document.createElement('div');el.id='shiba-secret-toast';el.setAttribute('role','status');el.style.cssText='position:fixed;bottom:112px;left:50%;transform:translateX(-50%);z-index:99999;background:#191919;color:#fff;border-radius:18px;padding:12px 18px;font:600 14px/1.4 system-ui,sans-serif;box-shadow:0 8px 32px #0003;pointer-events:none;transition:opacity .25s';document.body.appendChild(el)}el.textContent=message;el.style.opacity='1';clearTimeout(el._hide);el._hide=setTimeout(()=>el.style.opacity='0',2600)}
 function unlock(name,message){if(secretSeen.has(name))return;secretSeen.add(name);announce(message+' · '+secretSeen.size+'/2 secrets');if(window.wfTrack)window.wfTrack('shiba_secret',{secret:name})}
 async function react(kind,duration){if(drag||busy||reduced||secretLock)return false;const token=++epoch;secretLock=true;busy=true;destination=null;state('idle');if(window.wfTrack)window.wfTrack('shiba_pet',{reaction:kind});if(dog.dataset['ready'+kind]==='1'){dog.dataset.extraAction=kind;dog.dataset.extraStarted=String(performance.now());dog.dispatchEvent(new Event('shiba-state-change'))}else state('look');await wait(duration);if(token===epoch&&!drag){busy=false;state('walk');nextDecision=performance.now()+800;secretLock=false}return true}

 const size=()=>({w:dog.offsetWidth||96,h:dog.offsetHeight||85});
 const bounds=()=>{const {w,h}=size();return {left:0,top:0,right:Math.max(0,innerWidth-w),bottom:Math.max(0,innerHeight-h)}};
 const edgeX=side=>side<0?-size().w-16:innerWidth+16;
 const render=()=>{dog.style.left=x+'px';dog.style.top=y+'px';dog.style.bottom='auto';dog.style.transform='scaleX('+face+')'};
 function state(s){if(s==='walk'){delete dog.dataset.extraAction;delete dog.dataset.extraStarted;delete dog.dataset.sitPhase;}mode=s;dog.dataset.motionState=s;dog.dispatchEvent(new Event('shiba-state-change'));dog.classList.toggle('is-approaching',s==='walk');dog.classList.toggle('is-looking',s==='look');dog.classList.toggle('is-sitting',s==='sit'||s==='scratch');dog.classList.toggle('is-scratching',s==='scratch');dog.classList.toggle('is-sniffing',s==='sniff');dog.classList.toggle('is-biting',s==='bite');dog.classList.toggle('is-peeing',s==='pee');dog.classList.toggle('is-playing',s!=='walk');}
 function randomDestination(){const b=bounds();return {x:b.left+Math.random()*(b.right-b.left),y:b.top+Math.random()*(b.bottom-b.top)};}
 function visibleHeadings(){return [...document.querySelectorAll('h1,h2,h3')].filter(el=>{const r=el.getBoundingClientRect();return r.width>55&&r.height>18&&r.bottom>45&&r.top<innerHeight-50&&r.right>25&&r.left<innerWidth-25})}
 function choose(){if(busy||drag||reduced)return;
   // Regular full-width crossings: walk completely offscreen, turn, come back.
   if(Math.random()<.22){const side=x<innerWidth/2?-1:1;destination={x:edgeX(side),y:clamp(y,0,bounds().bottom),action:null,edge:true};state('walk');return;}
   const titles=visibleHeadings();
   if(titles.length&&Math.random()<.42){const el=titles[Math.floor(Math.random()*titles.length)],r=el.getBoundingClientRect(),b=bounds();
     destination={x:clamp(r.left+r.width*.35,0,b.right),y:clamp(r.bottom+6,0,b.bottom),action:['sniff','bite','pee'][Math.floor(Math.random()*3)],target:el};
   }else destination={...randomDestination(),action:Math.random()<.48?'rest':null};
   state('walk');
 }
 async function scene(action,target){
   if(drag||busy)return;busy=true;destination=null;const token=epoch;
   const alive=()=>!drag&&token===epoch;
   try{
     if(action==='rest'){
       const extras=['tail','stretch','sleep','sneeze','tilt'];
       const available=extras.filter(k=>dog.dataset['ready'+k]==='1');
       if(available.length&&Math.random()<.65){
         const picked=available[Math.floor(Math.random()*available.length)];
         // The sprite player owns the full intro / loop / outro timeline.
         if(window.wfTrack)window.wfTrack('shiba_animation',{animation:picked});
         dog.dataset.extraAction=picked;
         dog.dataset.extraStarted=String(performance.now());
         state('idle');
         const duration={tail:4800,stretch:2600,sleep:10200,sneeze:1800,tilt:4100}[picked];
         await wait(duration);
         if(!alive())return;
         delete dog.dataset.extraAction;
         delete dog.dataset.extraStarted;
       }else if(Math.random()<.4){state('look');await wait(2800+Math.random()*1300)}
       else{
         dog.dataset.sitPhase='enter';state('sit');await wait(850);if(!alive())return;
         dog.dataset.sitPhase='hold';await wait(3200+Math.random()*2200);if(!alive())return;
         if(Math.random()<.55){state('scratch');await wait(3200+Math.random()*1600);if(!alive())return;state('sit');await wait(850)}
         if(!alive())return;dog.dataset.sitPhase='exit';await wait(850);
       }
     }else{
       if(window.wfTrack)window.wfTrack('shiba_interaction',{action:action,target:target?.tagName?.toLowerCase()||'none'});
       state(action);if(action==='bite'&&target)target.classList.add('shiba-nibbled');
       await wait(action==='pee'?2200:action==='sniff'?1900:1200);
     }
   }finally{
     if(target)target.classList.remove('shiba-nibbled');
     if(alive()){state('walk');nextDecision=performance.now()+650;busy=false}
   }
 }
 function tick(now){
   const dt=Math.min(.06,(now-previous)/1000);previous=now;
   if(!drag&&!reduced&&!document.hidden){
     if(!busy){
       if(!destination&&now>nextDecision)choose();
       if(destination){
         const vx=destination.x-x,vy=destination.y-y,dist=Math.hypot(vx,vy);
         if(dist<=Math.max(3,speed*dt+1)){x=destination.x;y=destination.y;const {action,target,edge}=destination;destination=null;
           if(edge){
             // Re-enter from the same edge, then return to normal wandering.
             const b=bounds();face=x<0?-1:1;
             destination={x:x<0?Math.min(b.right,innerWidth*.3):Math.max(0,innerWidth*.7-size().w),y:clamp(y+(Math.random()-.5)*innerHeight*.35,b.top,b.bottom),action:Math.random()<.5?'rest':null};
           }
           else if(action)scene(action,target);else nextDecision=now+700+Math.random()*1300;
         }else{
           const step=Math.min(dist,speed*dt),b=bounds();
           // Keep the target reachable even if viewport or sprite dimensions change.
           if(!destination.edge)destination.x=clamp(destination.x,b.left,b.right);destination.y=clamp(destination.y,b.top,b.bottom);
           x=destination.edge?x+vx/dist*step:clamp(x+vx/dist*step,b.left,b.right);y=clamp(y+vy/dist*step,b.top,b.bottom);
           if(Math.abs(vx)>1)face=vx<0?1:-1;
         }
       }
     }
   }
   render();requestAnimationFrame(tick);
 }
 function stopForDrag(e){
   if(e.button!==undefined&&e.button!==0)return;
   e.preventDefault();e.stopPropagation();
   pressStart=performance.now();pressX=e.clientX;pressY=e.clientY;pressMoved=false;
   const r=dog.getBoundingClientRect();dx=e.clientX-r.left;dy=e.clientY-r.top;
   x=r.left;y=r.top;pointer=e.pointerId;drag=true;epoch++;busy=false;destination=null;delete dog.dataset.extraAction;delete dog.dataset.extraStarted;delete dog.dataset.sitPhase;
   secretLock=false;
   if(window.wfTrack)window.wfTrack('shiba_drag_start',{input:e.pointerType||'mouse'});
   dog.setPointerCapture(e.pointerId);dog.classList.add('is-dragging');state('idle');
 }
 dog.addEventListener('pointerdown',stopForDrag);
 dog.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==pointer)return;
   if(Math.hypot(e.clientX-pressX,e.clientY-pressY)>12)pressMoved=true;
   const b=bounds();x=clamp(e.clientX-dx,b.left,b.right);y=clamp(e.clientY-dy,b.top,b.bottom);
 });
 function release(e){if(!drag||e.pointerId!==pointer)return;
   drag=false;pointer=null;dog.classList.remove('is-dragging');
   const tapped=!pressMoved&&performance.now()-pressStart<550;
   if(window.wfTrack)window.wfTrack('shiba_drag_end',{input:e.pointerType||'mouse',was_tap:tapped});
   if(tapped){state('idle');petCount++;if(petCount===5){petCount=0;unlock('five_pets','Best human unlocked!');react('tail',4800)}else react(petCount%2?'tilt':'stretch',petCount%2?4100:2600);return}
   state('look');busy=true;const token=epoch;
   wait(850).then(()=>{if(token===epoch&&!drag){busy=false;state('walk');nextDecision=performance.now()+350}});
 }
 dog.addEventListener('pointerup',release);dog.addEventListener('pointercancel',release);dog.addEventListener('lostpointercapture',e=>{if(drag&&e.pointerId===pointer)release(e)});
 dog.addEventListener('pointerenter',e=>{if(e.pointerType==='touch'||drag||busy||reduced||performance.now()<hoverCooldown)return;hoverCooldown=performance.now()+12000;state('look');busy=true;const token=epoch;wait(900).then(()=>{if(token===epoch&&!drag){busy=false;state('walk');nextDecision=performance.now()+500}})});
 document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,[contenteditable]'))return;if(e.key.length!==1)return;secretInput=(secretInput+e.key.toLowerCase()).slice(-4);if(secretInput==='ozzy'){secretInput='';unlock('ozzy','Ozzy knows his name!');react('tail',4800)}});
 addEventListener('resize',()=>{const b=bounds();x=clamp(x,b.left,b.right);y=clamp(y,b.top,b.bottom);destination=null});
 dog.style.animation='none';dog.style.bottom='auto';dog.style.right='auto';dog.style.margin='0';
 if(reduced){x=innerWidth-(size().w+16);y=innerHeight-(size().h+12);state('idle')}
 else{state('walk');nextDecision=performance.now()+600}
 render();requestAnimationFrame(tick);
})();
