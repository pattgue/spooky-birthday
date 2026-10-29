/* V10 · Compact 2D cartoon choreography using WAAPI; no dependencies. */
const scene=document.getElementById('scene');
const envelope=document.getElementById('envelope');
const card=document.getElementById('card');
const motionReduced=window.matchMedia('(prefers-reduced-motion:reduce)');
let animating=false;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,motionReduced.matches?15:ms));

function geometry(){
  const w=envelope.offsetWidth,h=envelope.offsetHeight,fullWidth=card.offsetWidth;
  const ratio=Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-ratio'))||1.5;
  const smallScale=w*.79/fullWidth;
  const smallHeight=(fullWidth/ratio)*smallScale;
  const inY=-h/2+smallHeight/2+h*.08;
  const outY=-h/2-h*170/276-smallHeight/2-10;
  const turn=matchMedia('(max-width:700px) and (orientation:portrait)').matches?90:0;
  return {smallScale,inY,outY,turn};
}
function pose(x,y,a,s){return 'translate(-50%,-50%) translate('+x+'px,'+y+'px) rotate('+a+'deg) scale('+s+')';}
function slot(g){return pose(0,g.inY,0,g.smallScale)}
function pulled(g){return pose(0,g.outY,0,g.smallScale)}
function full(g){return pose(0,0,g.turn,1)}
function accessible(open){card.tabIndex=open?0:-1;card.setAttribute('aria-hidden',String(!open));}

async function animateCard(frames,duration,finalTransform){
  if(motionReduced.matches){card.style.transform=finalTransform;return;}
  const animation=card.animate(frames,{duration,fill:'both',easing:'linear'});
  try{await animation.finished;}finally{card.style.transform=finalTransform;animation.cancel();}
}

function resetPositions(){
  if(animating)return;
  const g=geometry();
  card.style.transform=scene.dataset.state==='opened'?full(g):slot(g);
}
window.addEventListener('resize',resetPositions,{passive:true});
resetPositions();

async function openCard(){
  const g=geometry();
  scene.dataset.state='opening';
  await pause(490);
  scene.dataset.state='extracting';
  await animateCard([
    {offset:0,transform:slot(g),easing:'cubic-bezier(.45,0,.3,.85)'},
    {offset:.12,transform:pose(0,g.inY+8,-.3,g.smallScale),easing:'cubic-bezier(.20,.55,.28,1)'},
    {offset:.76,transform:pose(-2,g.outY-9,1.2,g.smallScale),easing:'cubic-bezier(.15,.8,.27,1)'},
    {offset:1,transform:pulled(g)}
  ],760,pulled(g));
  scene.dataset.state='extracted';
  await pause(30);
  scene.dataset.state='presenting';
  await animateCard([
    {offset:0,transform:pulled(g),easing:'cubic-bezier(.2,.5,.25,1)'},
    {offset:.70,transform:pose(0,-6,g.turn+1.2,1.045),easing:'cubic-bezier(.18,.76,.2,1)'},
    {offset:.90,transform:pose(0,3,g.turn-.65,.993),easing:'cubic-bezier(.25,.6,.23,1)'},
    {offset:1,transform:full(g)}
  ],850,full(g));
  scene.dataset.state='opened';
  envelope.setAttribute('aria-label','Guardar la postal');
  accessible(true);
}

async function closeCard(){
  const g=geometry();
  accessible(false);
  if(card.classList.contains('is-flipped')){
    card.classList.remove('is-flipped');
    await pause(680);
  }
  scene.dataset.state='returning';
  await animateCard([
    {offset:0,transform:full(g),easing:'cubic-bezier(.55,0,.6,.9)'},
    {offset:.25,transform:pose(0,-12,g.turn+1.5,1.02),easing:'cubic-bezier(.3,.2,.55,.9)'},
    {offset:1,transform:pulled(g)}
  ],790,pulled(g));
  scene.dataset.state='inserting';
  await animateCard([
    {offset:0,transform:pulled(g),easing:'cubic-bezier(.44,0,.6,.9)'},
    {offset:.78,transform:pose(0,g.inY-8,-.6,g.smallScale),easing:'cubic-bezier(.18,.75,.22,1)'},
    {offset:1,transform:slot(g)}
  ],680,slot(g));
  scene.dataset.state='folding';
  await pause(480);
  scene.dataset.state='closed';
  envelope.setAttribute('aria-label','Abrir el sobre');
}

envelope.addEventListener('click',async()=>{
  if(animating||!['closed','opened'].includes(scene.dataset.state))return;
  animating=true;
  try{
    if(scene.dataset.state==='closed')await openCard();
    else await closeCard();
  }finally{animating=false;}
});
card.addEventListener('click',()=>{
  if(!animating&&scene.dataset.state==='opened')card.classList.toggle('is-flipped');
});