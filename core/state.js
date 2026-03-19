// nano/core/state.js
// ─────────────────────────────────────────────
// Estado reactivo de Nano: signal y createStore
// ─────────────────────────────────────────────

/**
 * @template T
 * @typedef {{ get: () => T, set: (v: T | ((prev: T) => T)) => void, subscribe: (fn: (v: T) => void) => () => void }} Signal
 */

/**
 * @template T
 * @typedef {{ get: () => T, set: (updater: Partial<T> | ((prev: T) => T)) => void, subscribe: (fn: (state: T) => void) => () => void }} Store
 */

/**
 * Crea un Signal: estado atómico reactivo.
 * Ideal para valores simples (números, strings, booleans).
 *
 * @template T
 * @param {T} initial - Valor inicial
 * @returns {Signal<T>}
 *
 * @example
 * const count = signal(0);
 * count.subscribe(v => console.log('nuevo valor:', v));
 * count.set(v => v + 1);
 */
export function signal(initial) {
  let value = initial;
  /** @type {Set<(v: T) => void>} */
  const subs = new Set();

  return {
    get() {
      return value;
    },

    set(updater) {
      const next = typeof updater === 'function' ? updater(value) : updater;
      if (Object.is(value, next)) return; // sin cambio → sin notificación
      value = next;
      subs.forEach(fn => fn(value));
    },

    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn); // retorna función de cleanup
    }
  };
}

/**
 * Crea un Store: estado estructurado reactivo.
 * Ideal para objetos con múltiples propiedades relacionadas.
 * Usa structuredClone para inmutabilidad real.
 *
 * @template {Object} T
 * @param {T} initialState - Estado inicial (objeto plano)
 * @returns {Store<T>}
 *
 * @example
 * const store = createStore({ user: null, loading: false });
 * store.subscribe(state => renderApp(state));
 * store.set({ loading: true });
 * store.set(s => ({ ...s, user: { name: 'Ana' }, loading: false }));
 */
export function createStore(initialState) {
  let state = structuredClone(initialState);
  /** @type {Set<(state: T) => void>} */
  const subscribers = new Set();

  return {
    get() {
      return state;
    },

    set(updater) {
      const next =
        typeof updater === 'function'
          ? updater(state)
          : { ...state, ...updater };

      // Comparación shallow para evitar renders innecesarios
      if (JSON.stringify(state) === JSON.stringify(next)) return;
      state = next;
      subscribers.forEach(fn => fn(state));
    },

    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    }
  };
}

/**
 * Computed: deriva un valor desde uno o más signals/stores.
 * Se recalcula automáticamente cuando alguna dependencia cambia.
 *
 * @template T
 * @param {() => T} computeFn - Función que retorna el valor derivado
 * @param {Array<Signal<any> | Store<any>>} deps - Dependencias reactivas
 * @returns {Signal<T>}
 *
 * @example
 * const firstName = signal('Ana');
 * const lastName  = signal('García');
 * const fullName  = computed(() => `${firstName.get()} ${lastName.get()}`, [firstName, lastName]);
 */
export function computed(computeFn, deps) {
  const result = signal(computeFn());

  deps.forEach(dep => {
    dep.subscribe(() => {
      result.set(computeFn());
    });
  });

  return {
    get: result.get.bind(result),
    subscribe: result.subscribe.bind(result),
    set: () => { throw new Error('[nano] A computed signal is read-only'); }
  };
}
