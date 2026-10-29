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
const bounce=document.querySelector(".card__bounce");
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
  gsap.set(wrappers,{xPercent:-50,yPercent:-50,x:0,y:0,scale:1,scaleX:1,scaleY:1,rotation:0,clearProps:"translate"});
  gsap.set(card,{xPercent:-50,yPercent:-50,x:0,y:g.yInside,scale:g.scale,rotation:0,autoAlpha:0,zIndex:20});
  gsap.set(bounce,{scaleX:1,scaleY:1,transformOrigin:"50% 50%"});
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

  // 1. Anticipation: brief compression before the flap opens.
  tl.addLabel("anticipation",0);
  tl.to(wrappers,{y:4,scaleX:1.04,scaleY:.96,duration:.16,ease:"power2.in"},"anticipation");
  tl.to(wrappers,{y:0,scaleX:1,scaleY:1,duration:.30,ease:"back.out(1.45)"},"anticipation+=.16");

  // 2. Open the lid and move it behind the letter.
  tl.addLabel("flap",.19);
  tl.to(closedFlap,{scaleY:0,autoAlpha:0,duration:.31,ease:"power2.in"},"flap");
  tl.to(openFlap,{scaleY:1,autoAlpha:1,duration:.52,ease:"back.out(1.55)"},"flap+=.08");
  tl.set(flapWrapper,{zIndex:11},"flap+=.48");
  tl.set(card,{autoAlpha:1},"flap+=.48");

  // 3. Pull the card completely outside, at a constant size.
  tl.addLabel("extract","flap+=.53");
  tl.to(card,{y:g.yOutside,rotation:-3,duration:.64,ease:"back.out(1.32)"},"extract");
  tl.to(bounce,{scaleX:.97,scaleY:1.035,duration:.16,ease:"power2.out"},"extract+=.10");
  tl.to(bounce,{scaleX:1,scaleY:1,duration:.30,ease:"back.out(1.5)"},"extract+=.26");
  tl.set(card,{zIndex:60},"extract+=.64");

  // 4. UI-style pop: position and scale have DIFFERENT easing curves.
  //    The card launches smoothly, then its size springs into place.
  tl.addLabel("pop","extract+=.65");
  tl.to(card,{y:0,duration:.78,ease:"power3.out"},"pop");
  tl.to(card,{scale:1,duration:1.08,ease:"elastic.out(1,.62)"},"pop");
  tl.to(card,{rotation:g.rotate,duration:.81,ease:"power3.out"},"pop");

  // A little squash/stretch on arrival, separate from the flip transform.
  tl.to(bounce,{scaleX:1.045,scaleY:.965,duration:.14,ease:"power2.out"},"pop+=.42");
  tl.to(bounce,{scaleX:.988,scaleY:1.015,duration:.17,ease:"power2.inOut"},"pop+=.56");
  tl.to(bounce,{scaleX:1,scaleY:1,duration:.32,ease:"power3.out"},"pop+=.73");

  // Park the envelope simultaneously; it never interrupts the card's pop.
  tl.to(wrappers,{
    x:g.finalX,y:g.finalY,scale:g.parkScale,
    duration:.87,ease:"power3.inOut"
  },"pop+=.10");
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
