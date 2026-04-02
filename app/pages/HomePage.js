// nano-site/app/pages/HomePage.js
import { defineComponent, html, onMount, onEvent } from '../../packages/nano.min.js';
import { navigate } from '../../packages/nano.min.js';

const FEATURES = [
  { icon: '⚡', name: 'signal()', desc: 'Estado atómico reactivo. Sin proxies, sin magia. Solo un valor y un Set de suscriptores.' },
  { icon: '🧩', name: 'defineComponent()', desc: 'Funciones puras que retornan nodos DOM reales usando tagged template literals.' },
  { icon: '🌲', name: 'diff()', desc: 'Diffing del DOM virtual en O(n) con reconciliación de listas por clave.' },
  { icon: '🛣️', name: 'Router', desc: 'Router con History API, params dinámicos y detección automática de basePath.' },
  { icon: '🔄', name: 'onMount()', desc: 'Ciclo de vida basado en MutationObserver. El cleanup corre automáticamente al desmontar.' },
  { icon: '💾', name: 'storage', desc: 'Wrapper tipado sobre localStorage. JSON de entrada, JSON de salida. Nunca falla.' },
];

function CodeBlock({ filename, code }) {
  const el = html`
    <div class="code-wrap">
      <div class="code-bar">
        <div class="code-dots">
          <div class="code-dot"></div>
          <div class="code-dot"></div>
          <div class="code-dot"></div>
        </div>
        <span class="code-filename">${filename}</span>
        <button class="code-copy">copiar</button>
      </div>
      <pre>${code}</pre>
    </div>
  `;
  el.querySelector('.code-copy').addEventListener('click', function() {
    const raw = el.querySelector('pre').innerText;
    navigator.clipboard.writeText(raw).then(() => {
      this.textContent = '¡copiado!';
      setTimeout(() => this.textContent = 'copiar', 2000);
    });
  });
  return el;
}

export const HomePage = defineComponent('HomePage', () => {
  const installCode = `<span class="t-cmt">// CDN — un solo import, sin npm, sin build</span>
<span class="t-kw">import</span> { html, signal, defineComponent, Router }
  <span class="t-kw">from</span> <span class="t-str">'https://braiidev.github.io/nano/packages/nano.min.js'</span>;

<span class="t-cmt">// O ruta relativa dentro del mismo repo</span>
<span class="t-kw">import</span> { html, signal } <span class="t-kw">from</span> <span class="t-str">'../../packages/nano.min.js'</span>;`;

  const quickCode = `<span class="t-kw">const</span> <span class="t-fn">count</span> = <span class="t-fn">signal</span>(<span class="t-num">0</span>);

<span class="t-kw">const</span> Counter = <span class="t-fn">defineComponent</span>(<span class="t-str">'Counter'</span>, () => {
  <span class="t-kw">const</span> el = html<span class="t-str">\`
    &lt;<span class="t-tag">div</span>&gt;
      &lt;<span class="t-tag">span</span> <span class="t-attr">id</span>=<span class="t-str">"n"</span>&gt;\${count.<span class="t-fn">get</span>()}&lt;/<span class="t-tag">span</span>&gt;
      &lt;<span class="t-tag">button</span> <span class="t-attr">id</span>=<span class="t-str">"inc"</span>&gt;+&lt;/<span class="t-tag">button</span>&gt;
    &lt;/<span class="t-tag">div</span>&gt;
  \`</span>;

  count.<span class="t-fn">subscribe</span>(v => el.<span class="t-fn">querySelector</span>(<span class="t-str">'#n'</span>).textContent = v);
  el.<span class="t-fn">querySelector</span>(<span class="t-str">'#inc'</span>).<span class="t-fn">addEventListener</span>(<span class="t-str">'click'</span>,
    () => count.<span class="t-fn">set</span>(v => v + <span class="t-num">1</span>)
  );
  <span class="t-kw">return</span> el;
});

<span class="t-fn">mount</span>(Counter, <span class="t-str">'#root'</span>);`;

  const el = html`
    <div class="page">
      <section class="hero">
        <p class="hero-eyebrow">// micro-framework en vanilla js</p>
        <h1 class="hero-title">nano</h1>
        <p class="hero-sub">
          Componentes reactivos, signals, diffing del DOM virtual y un router client-side —
          todo en un solo módulo ES de 6.9 KB. Sin build step. Sin dependencias. Solo la plataforma web.
        </p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-val">6.9<span style="font-size:16px;color:var(--muted)">KB</span></span>
            <span class="stat-label">minificado</span>
          </div>
          <div class="stat">
            <span class="stat-val">0</span>
            <span class="stat-label">dependencias</span>
          </div>
          <div class="stat">
            <span class="stat-val">0</span>
            <span class="stat-label">pasos de build</span>
          </div>
          <div class="stat">
            <span class="stat-val">ES2022</span>
            <span class="stat-label">módulos nativos</span>
          </div>
        </div>
        <div class="hero-cta">
          <button class="btn btn-primary" id="cta-counter">→ ver demo contador</button>
          <button class="btn btn-ghost"   id="cta-api">ver api</button>
        </div>
      </section>

      <section>
        <div class="section-header">
          <span class="section-num">01</span>
          <span class="section-title">instalación</span>
        </div>
        <div id="install-code"></div>
      </section>

      <section style="margin-top:64px">
        <div class="section-header">
          <span class="section-num">02</span>
          <span class="section-title">inicio rápido</span>
        </div>
        <div id="quick-code"></div>
      </section>

      <section style="margin-top:64px">
        <div class="section-header">
          <span class="section-num">03</span>
          <span class="section-title">qué incluye</span>
        </div>
        <div class="features" id="features-grid"></div>
      </section>
    </div>
  `;

  el.querySelector('#install-code').appendChild(CodeBlock({ filename: 'app/main.js', code: installCode }));
  el.querySelector('#quick-code').appendChild(CodeBlock({ filename: 'app/Counter.js', code: quickCode }));

  const grid = el.querySelector('#features-grid');
  FEATURES.forEach(f => {
    const card = html`
      <div class="feature">
        <span class="feature-icon">${f.icon}</span>
        <div class="feature-name">${f.name}</div>
        <p class="feature-desc">${f.desc}</p>
      </div>
    `;
    grid.appendChild(card);
  });

  onMount(el, () => {
    const c1 = onEvent(el.querySelector('#cta-counter'), 'click', () => navigate('/counter'));
    const c2 = onEvent(el.querySelector('#cta-api'),     'click', () => navigate('/about'));
    return () => { c1(); c2(); };
  });

  return el;
});
