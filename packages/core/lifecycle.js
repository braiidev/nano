// nano/core/lifecycle.js
// ─────────────────────────────────────────────
// Hooks de ciclo de vida de Nano
// Usa MutationObserver e IntersectionObserver nativos
// ─────────────────────────────────────────────

/**
 * onMount: ejecuta un callback cuando el elemento es insertado en el DOM.
 * Si el callback retorna una función, ésta se ejecuta al desmontar (cleanup).
 * Equivalente a useEffect(() => { ... return cleanup }, []) en React.
 *
 * @param {HTMLElement} el - Elemento a observar
 * @param {() => ((() => void) | void)} callback - Se ejecuta al montar; puede retornar cleanup
 *
 * @example
 * onMount(el, () => {
 *   const timer = setInterval(() => tick(), 1000);
 *   return () => clearInterval(timer); // cleanup al desmontar
 * });
 */
export function onMount(el, callback) {
  // Si ya está en el DOM, ejecutar de inmediato (siguiente microtask)
  if (document.body.contains(el)) {
    Promise.resolve().then(() => {
      const cleanup = callback();
      if (typeof cleanup === 'function') {
        _watchUnmount(el, cleanup);
      }
    });
    return;
  }

  // Esperar a que entre al DOM
  const observer = new MutationObserver(() => {
    if (!document.body.contains(el)) return;
    observer.disconnect();

    const cleanup = callback();
    if (typeof cleanup === 'function') {
      _watchUnmount(el, cleanup);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Observa cuándo el elemento sale del DOM y ejecuta el cleanup.
 * @param {HTMLElement} el
 * @param {() => void} cleanup
 */
function _watchUnmount(el, cleanup) {
  const observer = new MutationObserver(() => {
    if (!document.body.contains(el)) {
      cleanup();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * onVisible: ejecuta un callback cuando el elemento entra al viewport.
 * Útil para animaciones on-scroll, lazy loading e infinite scroll.
 * Se ejecuta una sola vez por defecto.
 *
 * @param {HTMLElement} el - Elemento a observar
 * @param {(entry: IntersectionObserverEntry) => void} callback
 * @param {{ threshold?: number, once?: boolean, rootMargin?: string }} [options]
 *
 * @example
 * onVisible(card, () => card.classList.add('visible'), { threshold: 0.2 });
 */
export function onVisible(el, callback, { threshold = 0.1, once = true, rootMargin = '0px' } = {}) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        callback(entry);
        if (once) observer.disconnect();
      }
    },
    { threshold, rootMargin }
  );
  observer.observe(el);
  return () => observer.disconnect();
}

/**
 * onResize: ejecuta un callback cuando el elemento cambia de tamaño.
 * Usa ResizeObserver nativo.
 *
 * @param {HTMLElement} el
 * @param {(entry: ResizeObserverEntry) => void} callback
 * @returns {() => void} cleanup
 *
 * @example
 * onMount(canvas, () => {
 *   return onResize(canvas, ({ contentRect }) => {
 *     canvas.width = contentRect.width;
 *   });
 * });
 */
export function onResize(el, callback) {
  const observer = new ResizeObserver(([entry]) => callback(entry));
  observer.observe(el);
  return () => observer.disconnect();
}

/**
 * onEvent: registra un event listener y retorna su cleanup.
 * Pensado para usarse dentro de onMount.
 *
 * @template {keyof HTMLElementEventMap} K
 * @param {HTMLElement | Window | Document} target
 * @param {K} event
 * @param {(e: HTMLElementEventMap[K]) => void} handler
 * @param {boolean | AddEventListenerOptions} [options]
 * @returns {() => void} cleanup
 *
 * @example
 * onMount(el, () => {
 *   return onEvent(window, 'keydown', e => {
 *     if (e.key === 'Escape') close();
 *   });
 * });
 */
export function onEvent(target, event, handler, options) {
  target.addEventListener(event, /** @type {EventListener} */ (handler), options);
  return () => target.removeEventListener(event, /** @type {EventListener} */ (handler), options);
}
