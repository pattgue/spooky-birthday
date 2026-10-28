# Spooky Birthday · postal interactiva

Prototipo técnico **sin dirección de arte definitiva**.

## Qué hace
- Aparece un sobre pequeño que flota.
- Al tocarlo, se abre y sale una postal.
- Al tocar la postal, gira y muestra la otra cara.
- El sobre se queda pequeño para poder volver a guardar la postal.
- En pantallas de móvil verticales, el sobre es vertical y la postal gira 90° al ampliarse.
- La web se adapta automáticamente si se gira el dispositivo.

Sin bibliotecas, cuentas de terceros, seguimiento ni servidor. Solo HTML, CSS y JavaScript.

## Archivos
- `index.html`: estructura de la página.
- `styles.css`: tamaños, composición y animaciones.
- `script.js`: acciones y transiciones.
- `assets/anverso.svg` y `assets/reverso.svg`: **marcadores provisionales**, no diseños definitivos.

Cuando exportemos las ilustraciones desde Figma, añadiremos sus archivos y cambiaremos las dos rutas de imagen de `index.html`. Si el formato no es 3:2, también ajustaremos `--card-ratio` en `styles.css`.

## Publicación gratuita con GitHub Pages
En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**.

Dirección prevista: https://pattgue.github.io/spooky-birthday/

El sitio es público; no incluir mensajes personales privados si no quieres que cualquier visitante con el enlace pueda verlos.

## Pendiente
- Sustituir por diseños finales de Figma.
- Probar y ajustar animaciones en Safari iOS / Chrome Android y escritorio.
- Afinar proporciones y movimientos.
- Colección anual: **fuera de esta primera versión**.
