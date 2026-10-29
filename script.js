/* V9: WAAPI choreography — extraction, arc, settle, coordinated envelope */
const scene=document.querySelector('#scene'),envelope=document.querySelector('#envelope'),envelopes=[...document.querySelectorAll('.envelope')],card=document.querySelector('#card');
const reduced=matchMedia('(prefers-reduced-motion:reduce)'),eased='cubic-bezier(.25,.8,.2,1)';
let busy=false;
const wait=ms=>new Promise(done=>setTimeout(done,reduced.matches?10:ms));
function measure(){
 const w=envelope.offsetWidth,h=envelope.offsetHeight,fullW=card.offsetWidth,ratio=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-ratio'))||1.5;
 const miniScale=w*.79/fullW,miniH=fullW/ratio*miniScale;
 return {miniScale,insideY:-h/2+miniH/2+h*.08,outsideY:-h/2-h*170/276-miniH/2-12,turn:matchMedia('(max-width:700px) and (orientation:portrait)').matches?90:0,
 park:matchMedia('(max-width:700px) and (orientation:portrait)').matches?{left:'50%',top:'calc(100% - 34px - env(safe-area-inset-bottom,0px))',scale:.24}:
 matchMedia('(max-height:520px) and (orientation:landscape)').matches?{left:'33px',top:'calc(100% - 30px)',scale:.22}:{left:'36px',top:'calc(100% - 38px)',scale:.22}};
}
const pose=(x,y,a,s)=>'translate(-50%,-50%) translate('+x+'px,'+y+'px) rotate('+a+'deg) scale('+s+')';
const inside=g=>pose(0,g.insideY,0,g.miniScale),outside=g=>pose(0,g.outsideY,-1.3,g.miniScale),full=g=>pose(0,0,g.turn,1);
function enable(on){card.tabIndex=on?0:-1;card.setAttribute('aria-hidden',String(!on));}
function animate(el,frames,opts,finalStyles){
 if(reduced.matches){Object.assign(el.style,finalStyles);return Promise.resolve();}
 const a=el.animate(frames,{fill:'both',...opts});
 return a.finished.then(()=>{Object.assign(el.style,finalStyles);a.cancel();}).catch(()=>{});
}
function moveCard(frames,duration,target){return animate(card,frames,{duration,easing:'linear'},{transform:target});}
function moveEnvelope(parked,g){
 const p=g.park,position={left:p.left,top:p.top,transform:'translate(-50%,-50%) scale('+p.scale+')'},center={left:'50%',top:'50%',transform:'translate(-50%,-50%) scale(1)'};
 const start=parked?center:position,finish=parked?position:center;
 const mid=parked?
 [{offset:.38,left:p.left==='50%'?'53%':'43%',top:'59%',transform:'translate(-50%,-50%) rotate(-2deg) scale(.82)',easing:'cubic-bezier(.32,.02,.19,.95)'},
 {offset:.77,left:p.left==='50%'?'48%':'14%',top:'84%',transform:'translate(-50%,-50%) rotate(2deg) scale(.34)',easing:'cubic-bezier(.2,.65,.22,1)'}]:
 [{offset:.23,left:p.left==='50%'?'48%':'14%',top:'84%',transform:'translate(-50%,-50%) rotate(2deg) scale(.34)',easing:'cubic-bezier(.4,0,.7,1)'},
 {offset:.64,left:p.left==='50%'?'53%':'43%',top:'59%',transform:'translate(-50%,-50%) rotate(-2deg) scale(.82)',easing:'cubic-bezier(.15,.7,.23,1)'}];
 const frames=[{...start,offset:0,easing:'cubic-bezier(.38,.05,.26,.96)'},...mid,{...finish,offset:1}];
 return Promise.all(envelopes.map(el=>animate(el,frames,{duration:parked?1210:1140},finish)));
}
async function openEnvelope(){
 const g=measure();scene.dataset.state='opening';
 await wait(500);
 scene.dataset.state='extracting';
 await moveCard([
 {offset:0,transform:inside(g),easing:'cubic-bezier(.45,.02,.5,.9)'},
 {offset:.16,transform:pose(0,g.insideY-13,-.6,g.miniScale),easing:eased},
 {offset:.55,transform:pose(-5,g.insideY+(g.outsideY-g.insideY)*.46,-1.5,g.miniScale),easing:eased},
 {offset:.86,transform:pose(3,g.outsideY+11,.6,g.miniScale),easing:'cubic-bezier(.14,.8,.28,1)'},
 {offset:1,transform:outside(g)}],990,outside(g));
 scene.dataset.state='extracted';
 scene.dataset.state='presenting';
 const grow=moveCard([
 {offset:0,transform:outside(g),easing:'cubic-bezier(.24,.02,.26,.9)'},
 {offset:.22,transform:pose(-12,g.outsideY-20,g.turn*.10-2.5,g.miniScale*1.19),easing:'cubic-bezier(.3,.5,.25,1)'},
 {offset:.56,transform:pose(18,-42,g.turn*.66+1.1,.77),easing:'cubic-bezier(.16,.8,.2,1)'},
 {offset:.84,transform:pose(-5,7,g.turn+2.5,1.025),easing:'cubic-bezier(.22,.75,.23,1)'},
 {offset:1,transform:full(g)}],1280,full(g));
 await wait(90);
 await Promise.all([grow,moveEnvelope(true,g)]);
 scene.dataset.state='opened';envelope.setAttribute('aria-label','Guardar la postal');enable(true);
}
async function closeEnvelope(){
 const g=measure();enable(false);
 if(card.classList.contains('is-flipped')){card.classList.remove('is-flipped');await wait(850);}
 scene.dataset.state='shrinking';
 const shrink=moveCard([
 {offset:0,transform:full(g),easing:'cubic-bezier(.5,.02,.62,.9)'},
 {offset:.22,transform:pose(-6,-5,g.turn+1.5,.98),easing:'cubic-bezier(.24,.05,.42,.92)'},
 {offset:.59,transform:pose(19,-54,g.turn*.35-2,.66),easing:eased},
 {offset:.84,transform:pose(-7,g.outsideY-15,-1,g.miniScale*1.10),easing:eased},
 {offset:1,transform:outside(g)}],1160,outside(g));
 await Promise.all([shrink,moveEnvelope(false,g)]);
 scene.dataset.state='inserting';
 await moveCard([
 {offset:0,transform:outside(g),easing:'cubic-bezier(.25,.09,.45,.94)'},
 {offset:.42,transform:pose(-4,g.outsideY+(g.insideY-g.outsideY)*.38,-1.2,g.miniScale),easing:eased},
 {offset:.80,transform:pose(2,g.insideY-11,.4,g.miniScale),easing:'cubic-bezier(.17,.8,.2,1)'},
 {offset:1,transform:inside(g)}],920,inside(g));
 scene.dataset.state='folding';await wait(690);scene.dataset.state='closed';
 envelope.setAttribute('aria-label','Abrir el sobre');
}
function layout(){
 if(busy)return;
 const g=measure();card.style.transform=scene.dataset.state==='opened'?full(g):inside(g);
 envelopes.forEach(el=>{
 if(scene.dataset.state==='opened'){el.style.left=g.park.left;el.style.top=g.park.top;el.style.transform='translate(-50%,-50%) scale('+g.park.scale+')';}
 else {el.style.left='50%';el.style.top='50%';el.style.transform='translate(-50%,-50%)';}
 });
}
layout();window.addEventListener('resize',layout,{passive:true});
envelope.addEventListener('click',async()=>{
 if(busy||!['closed','opened'].includes(scene.dataset.state))return;
 busy=true;
 try{if(scene.dataset.state==='closed')await openEnvelope();else await closeEnvelope();}
 finally{busy=false;}
});
card.addEventListener('click',()=>{if(!busy&&scene.dataset.state==='opened')card.classList.toggle('is-flipped');});