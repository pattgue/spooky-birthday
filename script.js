// Máquina de estados mínima. La apariencia visual está en styles.css.
const scene = document.querySelector('#scene');
const envelope = document.querySelector('#envelope');
const card = document.querySelector('#card');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let locked = false;

const pause = (ms) => new Promise(resolve => {
  window.setTimeout(resolve, prefersReducedMotion.matches ? 90 : ms);
});

async function toggleEnvelope() {
  if (locked) return;
  locked = true;

  if (scene.dataset.state === 'closed') {
    scene.dataset.state = 'opening'; // Abre la solapa.
    await pause(520);
    scene.dataset.state = 'extracting'; // La postal sale del sobre.
    await pause(620);
    scene.dataset.state = 'opened'; // La postal crece; el sobre se aparta.
    envelope.setAttribute('aria-label', 'Guardar la postal');
    card.removeAttribute('aria-hidden');
    card.tabIndex = 0;
    await pause(910);
  } else if (scene.dataset.state === 'opened') {
    card.classList.remove('is-flipped');
    card.setAttribute('aria-hidden', 'true');
    card.tabIndex = -1;
    scene.dataset.state = 'returning'; // La postal se reduce.
    await pause(920);
    scene.dataset.state = 'folding'; // El sobre regresa al centro.
    await pause(850);
    scene.dataset.state = 'closed'; // Se cierra.
    envelope.setAttribute('aria-label', 'Abrir el sobre');
    await pause(550);
  }

  locked = false;
}

envelope.addEventListener('click', toggleEnvelope);
card.addEventListener('click', () => {
  if (scene.dataset.state === 'opened' && !locked) {
    card.classList.toggle('is-flipped');
  }
});
