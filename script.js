// La tarjeta sale REALMENTE del sobre; no crece hasta haber salido por completo.
const scene=document.querySelector('#scene');
const envelope=document.querySelector('#envelope');
const card=document.querySelector('#card');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const sleep=duration=>new Promise(r=>setTimeout(r,reducedMotion.matches?30:duration));
let busy=false;

function calculatePath(){
  const width=envelope.offsetWidth;
  const height=envelope.offsetHeight;
  const ratio=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-ratio'))||1.5;
  const cardWidth=width*.79;
  const cardHeight=cardWidth/ratio;
  const vertical=matchMedia('(max-width:700px) and (orientation:portrait)').matches;
  const inside=-height/2+cardHeight/2+height*.08;
  // Debe superar también el vértice de la solapa abierta antes de ampliarse.
  const outside=-height/2-height*.62-cardHeight/2-13;
  scene.style.setProperty('--card-small-width',cardWidth+'px');
  scene.style.setProperty('--slot-x','0px');
  scene.style.setProperty('--slot-y',inside+'px');
  scene.style.setProperty('--out-x','0px');
  scene.style.setProperty('--out-y',outside+'px');
}
calculatePath();
window.addEventListener('resize',calculatePath,{passive:true});
function setCardAccessible(enabled){
  card.tabIndex=enabled?0:-1;
  card.setAttribute('aria-hidden',String(!enabled));
}
async function toggleEnvelope(){
  if(busy||!['closed','opened'].includes(scene.dataset.state))return;
  busy=true;
  if(scene.dataset.state==='closed'){
    calculatePath();
    scene.dataset.state='opening';
    await sleep(650);
    scene.dataset.state='extracting';
    await sleep(900); // Recorrido completo, manteniendo el tamaño pequeño.
    scene.dataset.state='extracted';
    await sleep(210);
    scene.dataset.state='presenting';
    await sleep(1140); // Solo aquí se amplía y se aparta el sobre.
    scene.dataset.state='opened';
    envelope.setAttribute('aria-label','Guardar la postal');
    setCardAccessible(true);
  }else{
    setCardAccessible(false);
    if(card.classList.contains('is-flipped')){
      card.classList.remove('is-flipped');
      await sleep(760);
    }
    scene.dataset.state='shrinking';
    await sleep(1170);
    scene.dataset.state='inserting';
    await sleep(920);
    scene.dataset.state='folding';
    await sleep(650);
    scene.dataset.state='closed';
    envelope.setAttribute('aria-label','Abrir el sobre');
  }
  busy=false;
}
envelope.addEventListener('click',toggleEnvelope);
card.addEventListener('click',()=>{
  if(!busy&&scene.dataset.state==='opened')card.classList.toggle('is-flipped');
});
