// nano-site/app/pages/SignalsPage.js
import { defineComponent, html, signal, computed, onMount, onEvent } from '../../packages/nano.min.js';

export const SignalsPage = defineComponent('SignalsPage', () => {
  const firstName = signal('Ada');
  const lastName  = signal('Lovelace');
  const year      = signal(new Date().getFullYear());
  const fullName  = computed(() => `${firstName.get()} ${lastName.get()}`, [firstName, lastName]);
  const age       = computed(() => year.get() - 1815, [year]);

  const codeStr = `<span class="t-kw">import</span> { signal, computed } <span class="t-kw">from</span> <span class="t-str">'nano.min.js'</span>;

<span class="t-cmt">// Signals atómicos</span>
<span class="t-kw">const</span> firstName = <span class="t-fn">signal</span>(<span class="t-str">'Ada'</span>);
<span class="t-kw">const</span> lastName  = <span class="t-fn">signal</span>(<span class="t-str">'Lovelace'</span>);
<span class="t-kw">const</span> year      = <span class="t-fn">signal</span>(<span class="t-num">2025</span>);

<span class="t-cmt">// Computed — se recalcula cuando cambia cualquier dependencia</span>
<span class="t-kw">const</span> fullName = <span class="t-fn">computed</span>(
  () => <span class="t-str">\`\${firstName.<span class="t-fn">get</span>()} \${lastName.<span class="t-fn">get</span>()}\`</span>,
  [firstName, lastName]   <span class="t-cmt">// dependencias</span>
);

<span class="t-kw">const</span> age = <span class="t-fn">computed</span>(
  () => year.<span class="t-fn">get</span>() - <span class="t-num">1815</span>,
  [year]
);

<span class="t-cmt">// Computed es de solo lectura</span>
fullName.<span class="t-fn">get</span>();   <span class="t-cmt">// ✓  'Ada Lovelace'</span>
fullName.<span class="t-fn">set</span>();   <span class="t-cmt">// ✗  lanza '[nano] computed is read-only'</span>

<span class="t-cmt">// Suscribirse a cambios</span>
<span class="t-kw">const</span> cancelar = fullName.<span class="t-fn">subscribe</span>(nombre => {
  document.<span class="t-fn">getElementById</span>(<span class="t-str">'display'</span>).textContent = nombre;
});

<span class="t-cmt">// Limpiar al desmontar</span>
<span class="t-fn">onMount</span>(el, () => cancelar);`;

  const el = html`
    <div class="page">
      <div class="section-header">
        <span class="section-num">demo_02</span>
        <span class="section-title">signal() + computed() — grafo reactivo</span>
      </div>

      <p style="font-family:var(--font-sans);font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:32px">
        Editá los campos. Los valores <code style="color:var(--amber)">computed()</code> se actualizan al instante —
        son signals derivados que vuelven a ejecutar su función cuando cambia alguna dependencia.
        Todo sincrónico, sin scheduler necesario.
      </p>

      <div class="demo-wrap">
        <span class="demo-label">// grafo de signals en vivo — escribí para actualizar</span>
        <div class="signal-demo">
          <div class="signal-row">
            <span class="signal-label">nombre</span>
            <input class="signal-input" id="inp-first" value="Ada" autocomplete="off">
            <span style="font-size:11px;color:var(--muted);padding:0 8px">→</span>
            <span class="signal-val" id="out-first">Ada</span>
          </div>
          <div class="signal-row">
            <span class="signal-label">apellido</span>
            <input class="signal-input" id="inp-last" value="Lovelace" autocomplete="off">
            <span style="font-size:11px;color:var(--muted);padding:0 8px">→</span>
            <span class="signal-val" id="out-last">Lovelace</span>
          </div>
          <div class="signal-row" style="background:rgba(57,255,110,0.03)">
            <span class="signal-label" style="color:var(--blue)">nombreCompleto <span style="font-size:9px">[computed]</span></span>
            <span style="flex:1;font-size:11px;color:var(--muted);font-style:italic">valor derivado, solo lectura</span>
            <span class="signal-val" id="out-full" style="color:var(--blue)">Ada Lovelace</span>
          </div>
          <div class="signal-row">
            <span class="signal-label">año actual</span>
            <input class="signal-input" id="inp-year" type="number" min="1816" max="2100" autocomplete="off">
            <span style="font-size:11px;color:var(--muted);padding:0 8px">→</span>
            <span class="signal-val" id="out-year"></span>
          </div>
          <div class="signal-row" style="background:rgba(57,255,110,0.03)">
            <span class="signal-label" style="color:var(--blue)">edad <span style="font-size:9px">[computed]</span></span>
            <span style="flex:1;font-size:11px;color:var(--muted);font-style:italic">año − 1815</span>
            <span class="signal-val" id="out-age" style="color:var(--blue)"></span>
          </div>
        </div>
      </div>

      <div class="code-wrap">
        <div class="code-bar">
          <div class="code-dots">
            <div class="code-dot"></div><div class="code-dot"></div><div class="code-dot"></div>
          </div>
          <span class="code-filename">signals-demo.js</span>
          <button class="code-copy" id="sig-copy">copiar</button>
        </div>
        <pre>${codeStr}</pre>
      </div>
    </div>
  `;

  onMount(el, () => {
    // Inicializar inputs y outputs con valores actuales
    el.querySelector('#inp-year').value  = year.get();
    el.querySelector('#out-year').textContent = year.get();
    el.querySelector('#out-age').textContent  = age.get();

    const u1 = firstName.subscribe(v => flash(el.querySelector('#out-first'), v));
    const u2 = lastName.subscribe(v => flash(el.querySelector('#out-last'), v));
    const u3 = fullName.subscribe(v => flash(el.querySelector('#out-full'), v));
    const u4 = year.subscribe(v => flash(el.querySelector('#out-year'), v));
    const u5 = age.subscribe(v => flash(el.querySelector('#out-age'), v));

    const c1 = onEvent(el.querySelector('#inp-first'), 'input', e => firstName.set(e.target.value));
    const c2 = onEvent(el.querySelector('#inp-last'),  'input', e => lastName.set(e.target.value));
    const c3 = onEvent(el.querySelector('#inp-year'),  'input', e => year.set(Number(e.target.value)));
    const c4 = onEvent(el.querySelector('#sig-copy'), 'click', function() {
      navigator.clipboard.writeText(el.querySelector('pre').innerText).then(() => {
        this.textContent = '¡copiado!';
        setTimeout(() => this.textContent = 'copiar', 2000);
      });
    });

    return () => { u1();u2();u3();u4();u5(); c1();c2();c3();c4(); };
  });

  return el;
});

function flash(el, val) {
  el.textContent = val;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 300);
}
