// Secuencia: abrir solapa → extraer → ampliar/girar → vuelta → recoger → cerrar.
// Los tiempos y dimensiones se gestionan aquí; el arte sigue separado en assets.
const scene = document.querySelector('#scene');
const envelope = document.querySelector('#envelope');
const card = document.querySelector('#card');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let busy = false;
const wait = ms => new Promise(resolve => setTimeout(resolve, reduceMotion.matches ? 55 : ms));

function updatePocketSize() {
  // offsetWidth/Height son medidas sin transformar, por eso funcionan también
  // mientras el sobre está en miniatura al fondo de la pantalla.
  const envelopeWidth = envelope.offsetWidth;
  const envelopeHeight = envelope.offsetHeight;
  const scale = envelopeWidth * .82 / card.offsetWidth;
  const miniatureCardHeight = card.offsetHeight * scale;
  card.style.setProperty('--slot-scale', scale.toFixed(5));
  card.style.setProperty('--slot-y', Math.round(envelopeHeight * .13) + 'px');
  card.style.setProperty('--pulled-y', Math.round(-envelopeHeight / 2 - miniatureCardHeight / 2 - 12) + 'px');
}
updatePocketSize();
window.addEventListener('resize', updatePocketSize, {passive: true});

function enableCard(enabled) {
  card.tabIndex = enabled ? 0 : -1;
  card.setAttribute('aria-hidden', String(!enabled));
}

async function toggleEnvelope() {
  if (busy) return;
  const state = scene.dataset.state;
  if (state !== 'closed' && state !== 'opened') return;
  busy = true;

  if (state === 'closed') {
    updatePocketSize();
    scene.dataset.state = 'opening';
    await wait(540); // Solapa completamente abierta.
    scene.dataset.state = 'pulling';
    await wait(690); // La tarjeta se desliza fuera del sobre.
    scene.dataset.state = 'presenting';
    await wait(1010); // Se amplía y el sobre se retira a un lado.
    scene.dataset.state = 'opened';
    envelope.setAttribute('aria-label', 'Guardar la postal');
    enableCard(true);
  } else {
    enableCard(false);
    if (card.classList.contains('is-flipped')) {
      card.classList.remove('is-flipped');
      await wait(740);
    }
    scene.dataset.state = 'minimizing';
    await wait(950); // Sobre vuelve al centro y tarjeta se reduce.
    scene.dataset.state = 'inserting';
    await wait(60); // Tarjeta pasa detrás del borde del sobre.
    scene.dataset.state = 'tucking';
    await wait(690); // Se introduce en el sobre.
    scene.dataset.state = 'closing';
    await wait(540); // Se cierra la solapa.
    scene.dataset.state = 'closed';
    envelope.setAttribute('aria-label', 'Abrir el sobre');
  }
  busy = false;
}

envelope.addEventListener('click', toggleEnvelope);
card.addEventListener('click', () => {
  if (!busy && scene.dataset.state === 'opened') {
    card.classList.toggle('is-flipped');
  }
});
