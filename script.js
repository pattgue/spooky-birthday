/* V5 ambient artwork update (motion unchanged)
 * MIT adaptation: Minimal Envelope Animation by visnuravichandran
 * https://codepen.io/visnuravichandran/pen/xxZQrmG
 * Adapted into Spooky Birthday's independent envelope layers and reversible card.
 * GSAP 3.15.0 is vendored locally under the GreenSock Standard License.
 * https://gsap.com/standard-license
 */
"use strict";
const scene=document.getElementById("scene");
const card=document.getElementById("card");
const cardInner=document.querySelector(".card__inner");
const bounce=document.querySelector(".card__bounce");
const envelope=document.getElementById("envelope");
const returnButton=document.getElementById("return-envelope");
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
  gsap.set(wrappers,{
    xPercent:-50,yPercent:-50,x:0,y:0,scale:1,scaleX:1,scaleY:1,
    rotation:0,clearProps:"translate"
  });
  gsap.set(card,{
    xPercent:-50,yPercent:-50,x:0,y:g.yInside,scale:g.scale,
    rotation:0,autoAlpha:1,zIndex:20
  });
  gsap.set(returnButton,{autoAlpha:0,scale:.89,y:7,transformOrigin:"50% 50%"});
  gsap.set(bounce,{scaleX:1,scaleY:1,transformOrigin:"50% 50%"});
  gsap.set(closedFlap,{scaleY:1,autoAlpha:1,transformOrigin:"50% 0%"});
  gsap.set(openFlap,{scaleY:0,autoAlpha:0,transformOrigin:"50% 100%"});
  gsap.set(flapWrapper,{zIndex:50});
  const tl=gsap.timeline({
    paused:true,
    defaults:{overwrite:"auto"},
    onStart(){
      scene.dataset.state="opening";
      busy=true;
    },
    onComplete(){
      scene.dataset.state="opened";
      direction="opened";
      busy=false;
      allowCard(true);
      envelope.setAttribute("aria-label","Guardar la postal");
    },
    onReverseComplete(){
      scene.dataset.state="closed";
      direction="closed";
      busy=false;
      allowCard(false);
      envelope.setAttribute("aria-label","Abrir el sobre");
    }
  });

  // 1. A very restrained anticipation, then a deliberate opening.
  tl.addLabel("prepare",0);
  tl.to(wrappers,{
    y:3,scaleX:1.015,scaleY:.985,
    duration:.24,ease:"sine.inOut"
  },"prepare");
  tl.to(wrappers,{
    y:0,scaleX:1,scaleY:1,
    duration:.38,ease:"power2.out"
  },"prepare+=.24");

  tl.addLabel("open-lid",.29);
  tl.to(closedFlap,{
    scaleY:0,autoAlpha:0,duration:.46,ease:"sine.inOut"
  },"open-lid");
  tl.to(openFlap,{
    scaleY:1,autoAlpha:1,duration:.71,ease:"power2.out"
  },"open-lid+=.08");
  // This layering matters: the open lid goes behind the postcard;
  // the lower pocket continues to mask the postcard until it exits.
  tl.set(flapWrapper,{zIndex:11},"open-lid+=.69");
  // The real postcard is present in the pocket from the first rendered frame.
  // The flap and pocket physically occlude it; never toggle card opacity.

  // 2. Extract the actual postcard without changing its size.
  // Slow start, gently accelerating middle, long deceleration at the end.
  tl.addLabel("extract","open-lid+=.73");
  tl.to(card,{
    y:g.yOutside,rotation:-1.5,
    duration:1.08,ease:"power2.inOut"
  },"extract");
  tl.to(bounce,{
    scaleX:.992,scaleY:1.008,duration:.30,ease:"sine.out"
  },"extract+=.19");
  tl.to(bounce,{
    scaleX:1,scaleY:1,duration:.49,ease:"sine.inOut"
  },"extract+=.49");

  // 3. ONLY after leaving the pocket: smooth enlargement with a tiny settle.
  // No repeated elastic oscillations. The softness comes from timing,
  // controlled overshoot (~1.5%) and a quiet final correction.
  tl.set(card,{zIndex:60},"extract+=1.08");
  tl.addLabel("reveal","extract+=1.10");
  tl.to(card,{
    y:-8,duration:1.19,ease:"power3.out"
  },"reveal");
  tl.to(card,{
    y:0,duration:.36,ease:"sine.out"
  },"reveal+=1.19");
  tl.to(card,{
    scale:1.015,duration:1.16,ease:"power3.out"
  },"reveal");
  tl.to(card,{
    scale:1,duration:.39,ease:"sine.out"
  },"reveal+=1.16");
  tl.to(card,{
    rotation:g.rotate,duration:1.32,ease:"power2.inOut"
  },"reveal");

  // Subtle animated-paper response, not a rubber-card distortion.
  tl.to(bounce,{
    scaleX:1.01,scaleY:.993,duration:.20,ease:"sine.out"
  },"reveal+=.99");
  tl.to(bounce,{
    scaleX:1,scaleY:1,duration:.42,ease:"sine.out"
  },"reveal+=1.19");

  // The envelope retreats concurrently rather than waiting for the card.
  // Hand off the full-size envelope to an independent outlined UI button.
  // No detached open flap is left behind at miniature scale.
  tl.to(wrappers,{
    autoAlpha:0,scale:.86,y:10,
    duration:.62,ease:"power2.inOut"
  },"reveal+=.35");
  tl.to(returnButton,{
    autoAlpha:1,scale:1,y:0,
    duration:.56,ease:"power2.out"
  },"reveal+=.83");
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
function toggleEnvelope(){
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
}
envelope.addEventListener("click",toggleEnvelope);
returnButton.addEventListener("click",toggleEnvelope);
card.addEventListener("click",()=>{
  if(direction==="opened"&&!busy){
    card.classList.toggle("is-flipped");
    card.classList.add("flip-hint-dismissed");
  }
});
