// V8 — animations use real envelope layers; no frameworks or dependencies.
const scene=document.querySelector('#scene');
const envelope=document.querySelector('#envelope');
const card=document.querySelector('#card');
const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion:reduce)');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,prefersReducedMotion.matches?25:ms));
let animating=false;

function calculatePath(){
  const width=envelope.offsetWidth;
  const height=envelope.offsetHeight;
  const ratio=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-ratio'))||1.5;
  const cardWidth=width*.79, cardHeight=cardWidth/ratio;
  const inside=-height/2+cardHeight/2+height*.08;
  // Move past the tip of the OPEN flap, not merely the top of the pocket.
  const outside=-height/2-height*(170/276)-cardHeight/2-12;
  scene.style.setProperty('--card-small-width',cardWidth+'px');
  scene.style.setProperty('--slot-y',inside+'px');
  scene.style.setProperty('--out-y',outside+'px');
}
calculatePath();
window.addEventListener('resize',calculatePath,{passive:true});

function enableCard(on){
  card.tabIndex=on?0:-1;
  card.setAttribute('aria-hidden',String(!on));
}

async function toggleEnvelope(){
  if(animating || !['closed','opened'].includes(scene.dataset.state))return;
  animating=true;
  if(scene.dataset.state==='closed'){
    calculatePath();
    scene.dataset.state='opening';
    await pause(630);
    scene.dataset.state='extracting';
    await pause(930);  // Extraction at a constant size.
    scene.dataset.state='extracted';
    await pause(65);   // No long, mechanical pause between phases.
    scene.dataset.state='presenting';
    await pause(1120);
    scene.dataset.state='opened';
    envelope.setAttribute('aria-label','Guardar la postal');
    enableCard(true);
  }else{
    enableCard(false);
    if(card.classList.contains('is-flipped')){
      card.classList.remove('is-flipped');
      await pause(810);
    }
    scene.dataset.state='shrinking';
    await pause(1130);
    scene.dataset.state='inserting';
    await pause(940);
    scene.dataset.state='folding';
    await pause(650);
    scene.dataset.state='closed';
    envelope.setAttribute('aria-label','Abrir el sobre');
  }
  animating=false;
}
envelope.addEventListener('click',toggleEnvelope);
card.addEventListener('click',()=>{
  if(!animating && scene.dataset.state==='opened')card.classList.toggle('is-flipped');
});
