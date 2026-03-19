// nano/core/component.js
// ─────────────────────────────────────────────
// Sistema de componentes de Nano
// ─────────────────────────────────────────────

/** @typedef {{ [key: string]: any }} Props */
/** @typedef {(props?: Props) => HTMLElement} ComponentFn */

/**
 * Tagged template literal para convertir HTML string → nodo DOM real.
 * Soporta nodos anidados, arrays de nodos y valores primitivos.
 *
 * @param {TemplateStringsArray} strings
 * @param {...any} values
 * @returns {HTMLElement}
 *
 * @example
 * const el = html`<button class="btn">${label}</button>`;
 */
export function html(strings, ...values) {
  const raw = strings.reduce((acc, str, i) => {
    const val = values[i - 1];
    let safe;
    if (Array.isArray(val)) {
      safe = val
        .map(v => (v instanceof HTMLElement ? v.outerHTML : (v ?? '')))
        .join('');
    } else if (val instanceof HTMLElement) {
      safe = val.outerHTML;
    } else {
      safe = val ?? '';
    }
    return acc + safe + str;
  });

  const template = document.createElement('template');
  template.innerHTML = raw.trim();
  return /** @type {HTMLElement} */ (template.content.firstElementChild);
}

/**
 * Registro global de componentes.
 * @type {Map<string, ComponentFn>}
 */
const _registry = new Map();

/**
 * Define un componente reutilizable con nombre único.
 *
 * @param {string} name - Nombre del componente (ej: 'Button')
 * @param {(props: Props) => HTMLElement} renderFn - Función que recibe props y retorna un HTMLElement
 * @returns {(props?: Props) => HTMLElement} Función fábrica del componente
 *
 * @example
 * export const Button = defineComponent('Button', ({ label, onClick }) => {
 *   const el = html`<button>${label}</button>`;
 *   el.addEventListener('click', onClick);
 *   return el;
 * });
 */
export function defineComponent(name, renderFn) {
  _registry.set(name, renderFn);

  return function Component(props = {}) {
    const el = renderFn(props);
    el.setAttribute('data-nano-component', name);
    return el;
  };
}

/**
 * Monta un componente raíz en un selector del DOM.
 *
 * @param {() => HTMLElement} componentFn - Función del componente a montar
 * @param {string} [selector='#root'] - CSS selector del contenedor
 *
 * @example
 * mount(App, '#root');
 */
export function mount(componentFn, selector = '#root') {
  const root = document.querySelector(selector);
  if (!root) throw new Error(`[nano] Mount target "${selector}" not found`);
  root.innerHTML = '';
  root.appendChild(componentFn());
}

/**
 * Retorna el registro global de componentes (útil para devtools).
 * @returns {Map<string, ComponentFn>}
 */
export function getRegistry() {
  return _registry;
}
