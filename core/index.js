// nano/core/index.js
// ─────────────────────────────────────────────
// Barrel export — importa todo Nano desde un solo lugar
// ─────────────────────────────────────────────
//
// @example
// import { html, defineComponent, signal, Router } from './core/index.js';

export { html, defineComponent, mount, getRegistry } from './component.js';
export { signal, createStore, computed }             from './state.js';
export { diff }                                      from './vdom.js';
export { Router, navigate, currentPath }             from './router.js';
export { onMount, onVisible, onResize, onEvent }     from './lifecycle.js';
