// nano-site/app/seo.js
// ─────────────────────────────────────────────
// Actualiza <title>, meta description y canonical
// en cada cambio de ruta para que Google vea
// cada página con sus propios metadatos.
// ─────────────────────────────────────────────

const BASE_URL = 'https://tu-usuario.github.io/tu-repo/nano-site';

/** @type {Record<string, { title: string, description: string }>} */
const META = {
  '/': {
    title: 'nano — micro-framework reactivo en Vanilla JS puro',
    description: 'nano es un micro-framework JavaScript de 6.9 KB sin dependencias. Signals, componentes, Virtual DOM, Router y ciclo de vida. Sin npm, sin build step.',
  },
  '/counter': {
    title: 'Contador reactivo con signal() — nano demos',
    description: 'Demo interactivo de signal() en nano: estado atómico reactivo que actualiza el DOM de forma granular sin re-renderizar el componente completo.',
  },
  '/signals': {
    title: 'Grafo reactivo con computed() — nano demos',
    description: 'Demo de computed() en nano: valores derivados que se recalculan automáticamente cuando cambia cualquier dependencia. Sin efectos secundarios.',
  },
  '/todo': {
    title: 'Lista de tareas con createStore() y diff() — nano demos',
    description: 'Demo de createStore() y diff() en nano: estado estructurado reactivo con diffing del DOM virtual en O(n) y reconciliación por clave.',
  },
  '/about': {
    title: 'Referencia completa de la API — nano',
    description: 'Documentación completa de los 15 exports de nano: html, signal, createStore, computed, diff, Router, onMount, onVisible, onResize, onEvent y storage.',
  },
};

/**
 * Actualiza los metadatos de la página según la ruta actual.
 * Llamar en cada navegación.
 * @param {string} path - ruta limpia sin basePath (ej: '/counter')
 */
export function updateMeta(path) {
  const meta = META[path] ?? META['/'];

  // Título
  document.title = meta.title;

  // Meta description
  let desc = document.querySelector('meta[name="description"]');
  if (!desc) {
    desc = document.createElement('meta');
    desc.setAttribute('name', 'description');
    document.head.appendChild(desc);
  }
  desc.setAttribute('content', meta.description);

  // Open Graph
  _setMeta('property', 'og:title',       meta.title);
  _setMeta('property', 'og:description', meta.description);
  _setMeta('property', 'og:url',         `${BASE_URL}${path === '/' ? '/' : path}`);

  // Twitter
  _setMeta('name', 'twitter:title',       meta.title);
  _setMeta('name', 'twitter:description', meta.description);

  // Canonical
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `${BASE_URL}${path === '/' ? '/' : path}`);
}

function _setMeta(attr, key, value) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}
