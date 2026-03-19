// nano/core/router.js
// ─────────────────────────────────────────────
// Client-side Router de Nano
// Usa la History API nativa del browser
// ─────────────────────────────────────────────

/**
 * @typedef {{ [key: string]: string }} RouteParams
 */

/**
 * @typedef {Object} Route
 * @property {string} path - Ruta (soporta params: '/user/:id')
 * @property {(params: RouteParams) => HTMLElement} component - Componente a renderizar
 * @property {string} [title] - Título del documento para esta ruta
 * @property {(() => boolean) | null} [guard] - Función de guardia (retorna false para redirigir)
 * @property {string} [redirectTo] - Ruta a la que redirigir si el guard falla
 */

/**
 * @typedef {Object} RouterOptions
 * @property {string} [outlet='#root'] - Selector del contenedor de rutas
 * @property {string} [notFound] - Ruta fallback si no hay match (ej: '/404')
 */

export class Router {
  /** @type {Route[]} */
  #routes;
  /** @type {HTMLElement} */
  #outlet;
  /** @type {RouterOptions} */
  #options;
  /** @type {Array<(path: string) => void>} */
  #listeners = [];

  /**
   * @param {Route[]} routes
   * @param {RouterOptions} [options]
   *
   * @example
   * const router = new Router([
   *   { path: '/',         component: Home,    title: 'Inicio' },
   *   { path: '/user/:id', component: UserPage, title: 'Usuario' },
   * ]);
   */
  constructor(routes, options = {}) {
    this.#routes = routes;
    this.#options = { outlet: '#root', ...options };

    const el = document.querySelector(this.#options.outlet);
    if (!el) throw new Error(`[nano/router] Outlet "${this.#options.outlet}" not found`);
    this.#outlet = /** @type {HTMLElement} */ (el);

    // Escucha el botón atrás/adelante del browser
    window.addEventListener('popstate', () => this.#render());

    // Intercepta clicks en links con atributo data-link
    document.addEventListener('click', e => {
      const link = /** @type {Element} */ (e.target).closest('a[data-link]');
      if (!link) return;
      e.preventDefault();
      this.navigate(/** @type {HTMLAnchorElement} */ (link).pathname);
    });

    // Render inicial
    this.#render();
  }

  /**
   * Navega a una nueva ruta programáticamente.
   * @param {string} path - Ruta destino (ej: '/user/42')
   *
   * @example
   * router.navigate('/dashboard');
   */
  navigate(path) {
    if (window.location.pathname === path) return;
    window.history.pushState({}, '', path);
    this.#render();
  }

  /**
   * Reemplaza la ruta actual en el historial (sin añadir entrada).
   * @param {string} path
   */
  replace(path) {
    window.history.replaceState({}, '', path);
    this.#render();
  }

  /**
   * Registra un listener que se llama en cada cambio de ruta.
   * @param {(path: string) => void} fn
   * @returns {() => void} Función de cleanup
   */
  onNavigate(fn) {
    this.#listeners.push(fn);
    return () => {
      this.#listeners = this.#listeners.filter(l => l !== fn);
    };
  }

  /**
   * Parsea la ruta actual y encuentra el match en la tabla de rutas.
   * Soporta parámetros dinámicos con named groups: /user/:id → { id: '42' }
   *
   * @param {string} path
   * @returns {{ route: Route, params: RouteParams } | null}
   */
  #match(path) {
    for (const route of this.#routes) {
      const pattern = '^' + route.path.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '/?$';
      const regex = new RegExp(pattern);
      const match = path.match(regex);
      if (match) return { route, params: match.groups ?? {} };
    }
    return null;
  }

  /** Renderiza la ruta actual en el outlet. */
  #render() {
    const path = window.location.pathname;
    const matched = this.#match(path);

    if (!matched) {
      if (this.#options.notFound) {
        this.navigate(this.#options.notFound);
      } else {
        this.#outlet.innerHTML = `
          <div style="padding:40px;text-align:center;font-family:monospace">
            <h2>404</h2><p>Ruta <code>${path}</code> no encontrada.</p>
          </div>`;
      }
      return;
    }

    const { route, params } = matched;

    // Guardia de ruta
    if (route.guard && !route.guard()) {
      this.navigate(route.redirectTo ?? '/');
      return;
    }

    // Actualizar título del documento
    if (route.title) document.title = route.title;

    // Montar componente
    this.#outlet.innerHTML = '';
    this.#outlet.appendChild(route.component(params));

    // Notificar listeners
    this.#listeners.forEach(fn => fn(path));
  }
}

/**
 * Función global para navegar sin acceso a la instancia del router.
 * Dispara un popstate que el Router intercepta.
 *
 * @param {string} path
 *
 * @example
 * import { navigate } from '../core/router.js';
 * navigate('/dashboard');
 */
export function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * Retorna la ruta actual.
 * @returns {string}
 */
export function currentPath() {
  return window.location.pathname;
}
