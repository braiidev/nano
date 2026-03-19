// nano/core/router.js
// ─────────────────────────────────────────────
// Client-side Router de Nano
// Soporta basePath para subdirectorios
// ─────────────────────────────────────────────

/** @typedef {{ [key: string]: string }} RouteParams */

/**
 * @typedef {Object} Route
 * @property {string} path - Ruta relativa al basePath (ej: '/habitos')
 * @property {(params: RouteParams) => HTMLElement} component
 * @property {string} [title]
 * @property {(() => boolean) | null} [guard]
 * @property {string} [redirectTo]
 */

/**
 * @typedef {Object} RouterOptions
 * @property {string} [outlet='#root']
 * @property {string} [basePath='auto'] - '/nano' | 'auto' | ''
 * @property {string} [notFound]
 */

/** @type {Router | null} */
let _instance = null;

export class Router {
  /** @type {Route[]}               */ #routes;
  /** @type {HTMLElement}           */ #outlet;
  /** @type {RouterOptions}         */ #options;
  /** @type {string}                */ #base;
  /** @type {Array<(p:string)=>void>} */ #listeners = [];

  /**
   * @param {Route[]} routes
   * @param {RouterOptions} [options]
   *
   * @example
   * // Auto-detecta el subdirectorio donde vive el index.html
   * new Router(routes);
   *
   * @example
   * // Forzar un base explícito
   * new Router(routes, { basePath: '/nano' });
   *
   * @example
   * // Sin subdirectorio (dominio raíz)
   * new Router(routes, { basePath: '' });
   */
  constructor(routes, options = {}) {
    this.#routes  = routes;
    this.#options = { outlet: '#root', basePath: 'auto', ...options };
    this.#base    = this.#resolveBase(this.#options.basePath);

    const el = document.querySelector(this.#options.outlet);
    if (!el) throw new Error(`[nano/router] Outlet "${this.#options.outlet}" not found`);
    this.#outlet = /** @type {HTMLElement} */ (el);

    _instance = this;

    window.addEventListener('popstate', () => this.#render());

    // Intercepta <a data-link href="/habitos"> y navega sin recargar
    document.addEventListener('click', e => {
      const link = /** @type {Element} */ (e.target).closest('a[data-link]');
      if (!link) return;
      e.preventDefault();
      const pathname = /** @type {HTMLAnchorElement} */ (link).pathname;
      this.navigate(this.#stripBase(pathname));
    });

    this.#render();
  }

  /**
   * Navega a una ruta relativa al basePath.
   * @param {string} path - ej: '/habitos' (sin el basePath)
   */
  navigate(path) {
    const full = this.#full(path);
    if (window.location.pathname === full) return;
    window.history.pushState({}, '', full);
    this.#render();
  }

  /** Reemplaza la entrada actual del historial sin agregar una nueva. */
  replace(path) {
    window.history.replaceState({}, '', this.#full(path));
    this.#render();
  }

  /**
   * Suscribe un listener a cambios de ruta.
   * @param {(path: string) => void} fn
   * @returns {() => void} cleanup
   */
  onNavigate(fn) {
    this.#listeners.push(fn);
    return () => { this.#listeners = this.#listeners.filter(l => l !== fn); };
  }

  /** El basePath resuelto (sin slash final). Ej: '/nano' */
  get base() { return this.#base; }

  /** Ruta actual sin el basePath. Ej: '/habitos' */
  cleanPath() { return this.#stripBase(window.location.pathname); }

  // ── Privados ──────────────────────────────────────────────────────────────────

  /**
   * Resuelve el basePath a partir de la opción dada.
   *
   * 'auto' → infiere desde la URL del script principal o desde pathname actual.
   *          Si index.html está en /nano/, base = '/nano'.
   *          Si está en /, base = ''.
   *
   * '/nano' → usa ese valor literal.
   * ''      → sin subdirectorio.
   *
   * @param {string | undefined} opt
   * @returns {string} base normalizado, sin slash final
   */
  #resolveBase(opt) {
    if (opt === 'auto') {
      // Estrategia 1: leer <base href="/nano/"> si existe en el HTML
      const baseEl = document.querySelector('base[href]');
      if (baseEl) {
        const href = new URL(/** @type {HTMLBaseElement} */(baseEl).href).pathname;
        return href.replace(/\/$/, '');
      }

      // Estrategia 2: inferir desde la ruta del script principal (type="module")
      // Si el script es /nano/app/main.js → base es /nano
      const scriptEl = document.querySelector('script[type="module"][src]');
      if (scriptEl) {
        const src   = /** @type {HTMLScriptElement} */ (scriptEl).src;
        const parts = new URL(src).pathname.split('/');
        // Quitar los segmentos del archivo y carpeta app: ['', 'nano', 'app', 'main.js']
        // Nos quedamos con todo hasta el primer segmento que no sea parte del path de carpetas
        // Buscamos "app" o el penúltimo segmento como indicador de carpeta de app
        const appIdx = parts.findIndex(p => p === 'app' || p === 'src');
        if (appIdx > 1) {
          return parts.slice(0, appIdx).join('/');
        }
      }

      // Estrategia 3: tomar el directorio del pathname actual como base
      // /nano/habitos → /nano  |  /habitos → ''  |  / → ''
      const path = window.location.pathname;
      // Si estamos en la raíz, no hay base
      if (path === '/') return '';
      // Buscar si alguna ruta definida matchea el pathname completo
      // para deducir qué prefijo sobra — lo hacemos en #render, acá usamos
      // el directorio del primer segmento como heurística
      const firstSegment = path.split('/').filter(Boolean)[0];
      if (!firstSegment) return '';
      // Comprobar si el primer segmento es una ruta conocida
      const knownPaths = this.#routes.map(r => r.path.split('/').filter(Boolean)[0]);
      if (knownPaths.includes(firstSegment)) return ''; // es una ruta, no un base
      return '/' + firstSegment;
    }

    // Valor explícito: normalizar
    if (!opt) return '';
    const base = opt.replace(/\/$/, '');
    return base.startsWith('/') ? base : '/' + base;
  }

  /**
   * Construye el pathname completo (base + ruta limpia) para pushState.
   * @param {string} path - ruta limpia ej: '/habitos'
   * @returns {string} ej: '/nano/habitos'
   */
  #full(path) {
    if (!this.#base) return path;
    // base='/nano', path='/' → '/nano'
    if (path === '/') return this.#base || '/';
    return this.#base + path;
  }

  /**
   * Quita el basePath de un pathname completo.
   * '/nano/habitos' con base '/nano' → '/habitos'
   * '/habitos'      con base ''     → '/habitos'
   * @param {string} fullPath
   * @returns {string}
   */
  #stripBase(fullPath) {
    if (!this.#base) return fullPath;
    if (fullPath === this.#base || fullPath === this.#base + '/') return '/';
    if (fullPath.startsWith(this.#base + '/')) {
      return fullPath.slice(this.#base.length);
    }
    return fullPath;
  }

  /**
   * Matchea una ruta limpia contra la tabla de rutas.
   * Soporta params dinámicos: '/user/:id' → { id: '42' }
   * @param {string} cleanPath
   * @returns {{ route: Route, params: RouteParams } | null}
   */
  #match(cleanPath) {
    for (const route of this.#routes) {
      const pattern = '^' + route.path.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '/?$';
      const match   = cleanPath.match(new RegExp(pattern));
      if (match) return { route, params: match.groups ?? {} };
    }
    return null;
  }

  /** Renderiza la ruta actual en el outlet. */
  #render() {
    const cleanPath = this.#stripBase(window.location.pathname);
    const matched   = this.#match(cleanPath);

    if (!matched) {
      if (this.#options.notFound) {
        this.navigate(this.#options.notFound);
      } else {
        this.#outlet.innerHTML = `
          <div style="padding:48px 24px;text-align:center;font-family:monospace">
            <div style="font-size:56px;margin-bottom:8px">404</div>
            <p style="color:#666;margin-bottom:20px">
              Ruta <code style="background:#f1f1f1;padding:2px 8px;border-radius:4px">${cleanPath}</code> no encontrada.
            </p>
            <a href="${this.#full('/')}"
               style="color:#2563eb;font-size:14px;text-decoration:none">
              ← Volver al inicio
            </a>
          </div>`;
      }
      return;
    }

    const { route, params } = matched;

    if (route.guard && !route.guard()) {
      this.navigate(route.redirectTo ?? '/');
      return;
    }

    if (route.title) document.title = route.title;
    this.#outlet.innerHTML = '';
    this.#outlet.appendChild(route.component(params));
    this.#listeners.forEach(fn => fn(cleanPath));
  }
}

/**
 * Navega programáticamente usando la instancia activa del Router.
 * Funciona desde cualquier módulo sin importar el Router directamente.
 * @param {string} path - ruta limpia (ej: '/habitos')
 */
export function navigate(path) {
  if (_instance) {
    _instance.navigate(path);
  } else {
    console.warn('[nano/router] navigate() llamado antes de crear el Router');
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

/**
 * Ruta actual sin el basePath.
 * @returns {string}
 */
export function currentPath() {
  return _instance ? _instance.cleanPath() : window.location.pathname;
}
