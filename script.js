// No hay efectos visuales inventados: la secuencia corresponde a un objeto
// que primero abandona un sobre y después se presenta en primer plano.
const scene = document.querySelector('#scene');
const envelope = document.querySelector('#envelope');
const card = document.querySelector('#card');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, prefersReducedMotion.matches ? 40 : ms));
let animating = false;

function fitCardIntoPocket() {
  const cardWidth = card.offsetWidth;
  const cardHeight = card.offsetHeight;
  // El móvil guarda la tarjeta girada 90°; por eso intercambiamos sus ejes.
  const portrait = matchMedia('(max-width: 700px) and (orientation: portrait)').matches;
  const miniScale = portrait
    ? Math.min(envelope.offsetWidth * .77 / cardHeight, envelope.offsetHeight * .78 / cardWidth)
    : Math.min(envelope.offsetWidth * .84 / cardWidth, envelope.offsetHeight * .79 / cardHeight);
  const miniHeight = (portrait ? cardWidth : cardHeight) * miniScale;
  // La miniatura empieza enteramente dentro y termina enteramente fuera.
  const insideY = Math.round(envelope.offsetHeight * .04);
  const outsideY = -Math.round(envelope.offsetHeight / 2 + miniHeight / 2 + 15);
  card.style.setProperty('--mini-scale', miniScale.toFixed(5));
  card.style.setProperty('--inside-y', insideY + 'px');
  card.style.setProperty('--outside-y', outsideY + 'px');
}
fitCardIntoPocket();
window.addEventListener('resize', fitCardIntoPocket, {passive:true});

function allowFlip(allowed) {
  card.tabIndex = allowed ? 0 : -1;
  card.setAttribute('aria-hidden', String(!allowed));
}

async function toggleEnvelope() {
  if (animating || !['closed','opened'].includes(scene.dataset.state)) return;
  animating = true;
  if (scene.dataset.state === 'closed') {
    fitCardIntoPocket();
    scene.dataset.state = 'opening';
    await sleep(600);             // 1. Se abre la solapa.
    scene.dataset.state = 'extracting';
    await sleep(850);             // 2. La postal SALE ENTERA, a tamaño pequeño.
    scene.dataset.state = 'extracted';
    await sleep(340);             // 3. Ya está fuera. Pausa breve visible.
    scene.dataset.state = 'presenting';
    await sleep(1130);            // 4. AHORA se amplía; el sobre se aparta.
    scene.dataset.state = 'opened';
    envelope.setAttribute('aria-label', 'Guardar la postal');
    allowFlip(true);
  } else {
    allowFlip(false);
    if (card.classList.contains('is-flipped')) {
      card.classList.remove('is-flipped');
      await sleep(740);
    }
    scene.dataset.state = 'retrieving';
    await sleep(1130);            // La postal vuelve a su tamaño pequeño y el sobre regresa.
    scene.dataset.state = 'inserting';
    await sleep(860);             // Entra detrás de los pliegues delanteros.
    scene.dataset.state = 'folding';
    await sleep(600);             // Cierra la solapa.
    scene.dataset.state = 'closed';
    envelope.setAttribute('aria-label', 'Abrir el sobre');
  }
  animating = false;
}

envelope.addEventListener('click', toggleEnvelope);
card.addEventListener('click', () => {
  if (!animating && scene.dataset.state === 'opened') card.classList.toggle('is-flipped');
});
