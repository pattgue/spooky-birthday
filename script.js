// V11 — Original postcard rhythm, real card extraction, no external libraries.
const scene=document.querySelector('#scene');
const envelope=document.querySelector('#envelope');
const card=document.querySelector('#card');
const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,reduced.matches?15:ms));
let busy=false;
function measure(){
  const w=envelope.offsetWidth,h=envelope.offsetHeight;
  const ratio=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ratio'))||1.5;
  const miniW=w*.79,miniH=miniW/ratio,miniScale=miniW/card.offsetWidth;
  const inY=-h/2+miniH/2+h*.08;
  const outY=-h/2-h*170/276-miniH/2-13;
  scene.style.setProperty('--mini-scale',String(miniScale));
  scene.style.setProperty('--inside-y',inY+'px');
  scene.style.setProperty('--outside-y',outY+'px');
}
function accessible(open){
  card.tabIndex=open?0:-1;
  card.setAttribute('aria-hidden',String(!open));
}
window.addEventListener('resize',()=>{if(!busy)measure();},{passive:true});
measure();
async function toggleEnvelope(){
  if(busy||!['closed','opened'].includes(scene.dataset.state))return;
  busy=true;
  try{
    if(scene.dataset.state==='closed'){
      measure();
      scene.dataset.state='opening';
      await wait(640);
      scene.dataset.state='extracting';
      await wait(780);
      scene.dataset.state='extracted';
      await wait(35);
      scene.dataset.state='presenting';
      await wait(1050);
      scene.dataset.state='opened';
      envelope.setAttribute('aria-label','Guardar la postal');
      accessible(true);
    }else{
      accessible(false);
      if(card.classList.contains('is-flipped')){
        card.classList.remove('is-flipped');
        await wait(790);
      }
      scene.dataset.state='returning';
      await wait(1000);
      scene.dataset.state='inserting';
      await wait(790);
      scene.dataset.state='folding';
      await wait(660);
      scene.dataset.state='closed';
      envelope.setAttribute('aria-label','Abrir el sobre');
    }
  }finally{busy=false;}
}
envelope.addEventListener('click',toggleEnvelope);
card.addEventListener('click',()=>{if(scene.dataset.state==='opened'&&!busy)card.classList.toggle('is-flipped');});