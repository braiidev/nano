// nano-site/app/pages/AboutPage.js
import { defineComponent, html, onVisible, onMount, onEvent } from '../../packages/nano.min.js';

const API = [
  { fn: 'html``',            mod: 'component', desc: 'Tagged template literal → HTMLElement. Soporta nodos anidados y arrays.' },
  { fn: 'defineComponent()', mod: 'component', desc: 'Registra una fábrica de componentes con nombre. Retorna una función que acepta props.' },
  { fn: 'mount()',           mod: 'component', desc: 'Monta un componente raíz en un selector del DOM. Limpia el contenedor primero.' },
  { fn: 'signal()',          mod: 'state',     desc: 'Valor reactivo atómico. .get() / .set(val|fn) / .subscribe(fn) → cleanup.' },
  { fn: 'createStore()',     mod: 'state',     desc: 'Estado estructurado reactivo. Fusión parcial de actualizaciones. Usa structuredClone internamente.' },
  { fn: 'computed()',        mod: 'state',     desc: 'Signal derivado de solo lectura. Se recalcula cuando cambia cualquier dependencia listada.' },
  { fn: 'diff()',            mod: 'vdom',      desc: 'Diffing del DOM en O(n). Parchea atributos e hijos en el lugar. Soporta data-key para listas.' },
  { fn: 'Router',            mod: 'router',    desc: 'Clase. Router con History API, detección automática de basePath, guards y rutas con :param dinámicos.' },
  { fn: 'navigate()',        mod: 'router',    desc: 'Navegación programática sin referencia al Router. Lee la instancia activa.' },
  { fn: 'currentPath()',     mod: 'router',    desc: 'Retorna la ruta actual sin el prefijo basePath.' },
  { fn: 'onMount()',         mod: 'lifecycle', desc: 'Ejecuta el callback cuando el elemento entra al DOM. Retorná una función para el cleanup al desmontar.' },
  { fn: 'onVisible()',       mod: 'lifecycle', desc: 'Wrapper de IntersectionObserver. Se dispara una vez cuando el elemento entra al viewport.' },
  { fn: 'onResize()',        mod: 'lifecycle', desc: 'Wrapper de ResizeObserver. Retorna cleanup. Ideal dentro de onMount.' },
  { fn: 'onEvent()',         mod: 'lifecycle', desc: 'addEventListener que retorna removeEventListener como cleanup.' },
  { fn: 'storage',           mod: 'storage',   desc: 'localStorage tipado: .get(clave, fallback) / .set(clave, val) / .remove(clave). Nunca lanza errores.' },
];

const MOD_COLORS = {
  component: 'var(--amber)',
  state:     'var(--green)',
  vdom:      'var(--blue)',
  router:    '#ff9eb5',
  lifecycle: '#c9b8ff',
  storage:   '#7efff5',
};

export const AboutPage = defineComponent('AboutPage', () => {
  const el = html`
    <div class="page">
      <div class="section-header">
        <span class="section-num">ref</span>
        <span class="section-title">referencia de la api</span>
      </div>

      <div class="about-grid" style="margin-bottom:48px">
        <div class="about-card">
          <h3>filosofía</h3>
          <p>Nano no intenta reemplazar React ni Vue. Es una demostración de que la plataforma web ya tiene todo lo necesario para construir UIs reactivas — signals, diffing, routing — sin ninguna abstracción encima.</p>
        </div>
        <div class="about-card">
          <h3>tamaño</h3>
          <p>El framework completo es un único archivo <code style="color:var(--amber)">nano.min.js</code>. 6.9 KB sin comprimir, ~3 KB con gzip. No hace falta tree-shaking porque no hay nada que sacudir.</p>
        </div>
        <div class="about-card">
          <h3>módulos</h3>
          <p>Seis módulos empaquetados juntos: <span style="color:var(--amber)">component</span>, <span style="color:var(--green)">state</span>, <span style="color:var(--blue)">vdom</span>, <span style="color:#ff9eb5">router</span>, <span style="color:#c9b8ff">lifecycle</span>, <span style="color:#7efff5">storage</span>.</p>
        </div>
        <div class="about-card">
          <h3>compatibilidad</h3>
          <p>Cualquier browser que soporte módulos ES2022, campos privados de clase y structuredClone. Chrome 98+, Firefox 94+, Safari 15.4+. Sin polyfills.</p>
        </div>
      </div>

      <div class="section-header" style="margin-top:48px">
        <span class="section-num">—</span>
        <span class="section-title">exports</span>
      </div>

      <table class="api-table">
        <thead>
          <tr>
            <th>export</th>
            <th>módulo</th>
            <th>descripción</th>
          </tr>
        </thead>
        <tbody id="api-body"></tbody>
      </table>

      <div class="section-header" style="margin-top:64px">
        <span class="section-num">—</span>
        <span class="section-title">patrón de uso</span>
      </div>

      <div class="code-wrap">
        <div class="code-bar">
          <div class="code-dots">
            <div class="code-dot"></div><div class="code-dot"></div><div class="code-dot"></div>
          </div>
          <span class="code-filename">app/main.js — esqueleto completo</span>
          <button class="code-copy" id="skel-copy">copiar</button>
        </div>
        <pre><span class="t-kw">import</span> {
  html, defineComponent, mount,
  signal, createStore,
  Router, navigate,
  onMount, onEvent,
  storage
} <span class="t-kw">from</span> <span class="t-str">'https://braiidev.github.io/nano/packages/nano.min.js'</span>;

<span class="t-cmt">// ── Estado ─────────────────────────────────────────</span>
<span class="t-kw">const</span> appStore = <span class="t-fn">createStore</span>({ tema: <span class="t-str">'dark'</span>, usuario: <span class="t-kw">null</span> });

<span class="t-cmt">// ── Componente ─────────────────────────────────────</span>
<span class="t-kw">const</span> App = <span class="t-fn">defineComponent</span>(<span class="t-str">'App'</span>, () => {
  <span class="t-kw">const</span> el = html<span class="t-str">\`&lt;<span class="t-tag">main</span>&gt;&lt;/<span class="t-tag">main</span>&gt;\`</span>;

  <span class="t-fn">onMount</span>(el, () => {
    <span class="t-kw">const</span> cancelar = appStore.<span class="t-fn">subscribe</span>(estado => <span class="t-fn">render</span>(estado));
    <span class="t-kw">return</span> cancelar; <span class="t-cmt">// cleanup al desmontar</span>
  });

  <span class="t-kw">return</span> el;
});

<span class="t-cmt">// ── Router ─────────────────────────────────────────</span>
<span class="t-fn">mount</span>(NavBar, <span class="t-str">'#nav'</span>);

<span class="t-kw">new</span> <span class="t-fn">Router</span>([
  { path: <span class="t-str">'/'</span>,       component: Inicio },
  { path: <span class="t-str">'/acerca'</span>, component: Acerca },
], { basePath: <span class="t-str">'auto'</span> });</pre>
      </div>
    </div>
  `;

  const tbody = el.querySelector('#api-body');
  API.forEach(row => {
    const tr = html`
      <tr>
        <td class="api-fn">${row.fn}</td>
        <td class="api-mod" style="color:${MOD_COLORS[row.mod]}">${row.mod}</td>
        <td class="api-desc">${row.desc}</td>
      </tr>
    `;
    tbody.appendChild(tr);
    tr.style.opacity = '0';
    tr.style.transform = 'translateX(-8px)';
    onVisible(tr, () => {
      tr.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      tr.style.opacity = '1';
      tr.style.transform = 'translateX(0)';
    }, { threshold: 0.1 });
  });

  onMount(el, () => {
    const c = onEvent(el.querySelector('#skel-copy'), 'click', function() {
      navigator.clipboard.writeText(el.querySelector('pre').innerText).then(() => {
        this.textContent = '¡copiado!';
        setTimeout(() => this.textContent = 'copiar', 2000);
      });
    });
    return () => c();
  });

  return el;
});
