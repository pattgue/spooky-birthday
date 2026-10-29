/* MIT adaptation: Minimal Envelope Animation by visnuravichandran
 * https://codepen.io/visnuravichandran/pen/xxZQrmG
 * Adapted into Spooky Birthday's independent envelope layers and reversible card.
 * GSAP 3.15.0 is vendored locally under the GreenSock Standard License.
 * https://gsap.com/standard-license
 */
"use strict";
const scene=document.getElementById("scene");
const card=document.getElementById("card");
const cardInner=document.querySelector(".card__inner");
const envelope=document.getElementById("envelope");
const wrappers=gsap.utils.toArray(".envelope");
const closedFlap=document.querySelector(".flap-closed");
const openFlap=document.querySelector(".flap-open");
const flapWrapper=document.querySelector(".envelope--flap");
const prefersReduced=matchMedia("(prefers-reduced-motion: reduce)");
let timeline;
let busy=false;
let direction="closed";
function geometry(){
  const w=envelope.offsetWidth,h=envelope.offsetHeight,fw=card.offsetWidth;
  const ratio=Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--postcard-ratio"))||1.5;
  const scale=w*.79/fw, smallH=fw/ratio*scale;
  const yInside=-h/2+smallH/2+h*.08;
  const yOutside=-h/2-h*170/276-smallH/2-12;
  const portrait=matchMedia("(max-width:700px) and (orientation:portrait)").matches;
  const compact=matchMedia("(max-height:520px) and (orientation:landscape)").matches;
  const finalX=portrait?0:(compact?33:36)-innerWidth/2;
  const finalY=innerHeight/2-(portrait?34:compact?30:38);
  return {scale,yInside,yOutside,rotate:portrait?90:0,finalX,finalY,parkScale:portrait?.24:.22};
}
function allowCard(yes){
  card.tabIndex=yes?0:-1;
  card.setAttribute("aria-hidden",String(!yes));
}
function build(){
  const g=geometry();
  gsap.set(wrappers,{xPercent:-50,yPercent:-50,x:0,y:0,scale:1,rotation:0,clearProps:"translate"});
  gsap.set(card,{xPercent:-50,yPercent:-50,x:0,y:g.yInside,scale:g.scale,rotation:0,autoAlpha:0,zIndex:20});
  gsap.set(closedFlap,{scaleY:1,autoAlpha:1,transformOrigin:"50% 0%"});
  gsap.set(openFlap,{scaleY:0,autoAlpha:0,transformOrigin:"50% 100%"});
  gsap.set(flapWrapper,{zIndex:50});
  const tl=gsap.timeline({
    paused:true,
    defaults:{overwrite:"auto"},
    onStart(){scene.dataset.state="opening";busy=true;},
    onComplete(){scene.dataset.state="opened";direction="opened";busy=false;allowCard(true);envelope.setAttribute("aria-label","Guardar la postal");},
    onReverseComplete(){scene.dataset.state="closed";direction="closed";busy=false;allowCard(false);envelope.setAttribute("aria-label","Abrir el sobre");}
  });
  // Exactly the tested CodePen's 3-beat principle: flap -> physical letter rise -> enlarged letter.
  tl.to(wrappers,{y:3,scaleX:1.025,scaleY:.98,duration:.14,ease:"power2.out"});
  tl.to(wrappers,{y:0,scaleX:1,scaleY:1,duration:.23,ease:"power2.inOut"});
  tl.to(closedFlap,{scaleY:0,autoAlpha:0,duration:.35,ease:"power2.inOut"},"-=.07");
  tl.to(openFlap,{scaleY:1,autoAlpha:1,duration:.45,ease:"back.out(1.25)"},"<.06");
  tl.set(flapWrapper,{zIndex:11});
  tl.set(card,{autoAlpha:1});
  tl.to(card,{y:g.yOutside,duration:.69,ease:"back.out(1.08)"});
  tl.set(card,{zIndex:60});
  tl.addLabel("card-out");
  tl.to(card,{y:0,scale:1,rotation:g.rotate,duration:.82,ease:"back.out(1.13)"});
  tl.to(wrappers,{x:g.finalX,y:g.finalY,scale:g.parkScale,duration:.80,ease:"power3.inOut"},"card-out+=.07");
  return tl;
}
function reset(){
  if(busy)return;
  const wasOpen=direction==="opened";
  if(timeline)timeline.kill();
  timeline=build();
  if(wasOpen)timeline.progress(1).pause();
  scene.dataset.state=wasOpen?"opened":"closed";
  allowCard(wasOpen);
}
reset();
window.addEventListener("resize",()=>{reset();},{passive:true});
envelope.addEventListener("click",()=>{
  if(busy)return;
  if(direction==="closed"){
    allowCard(false);
    timeline.timeScale(prefersReduced.matches?100:1).play();
  }else{
    allowCard(false);
    busy=true;
    const resume=()=>timeline.timeScale(prefersReduced.matches?100:1).reverse();
    if(card.classList.contains("is-flipped")){
      card.classList.remove("is-flipped");
      gsap.delayedCall(prefersReduced.matches?.01:.72,resume);
    }else resume();
  }
});
card.addEventListener("click",()=>{
 if(direction==="opened"&&!busy)card.classList.toggle("is-flipped");
});
