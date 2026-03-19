// nano-site/app/pages/CounterPage.js
import { defineComponent, html, signal, onMount, onEvent } from '../../packages/nano.min.js';

export const CounterPage = defineComponent('CounterPage', () => {
  const count = signal(0);

  const codeStr = `<span class="t-kw">import</span> { signal, defineComponent, html } <span class="t-kw">from</span> <span class="t-str">'nano.min.js'</span>;

<span class="t-cmt">// 1. Crear el signal — estado atómico</span>
<span class="t-kw">const</span> count = <span class="t-fn">signal</span>(<span class="t-num">0</span>);

<span class="t-kw">export const</span> Counter = <span class="t-fn">defineComponent</span>(<span class="t-str">'Counter'</span>, () => {
  <span class="t-kw">const</span> el = html<span class="t-str">\`
    &lt;<span class="t-tag">div</span> <span class="t-attr">class</span>=<span class="t-str">"counter"</span>&gt;
      &lt;<span class="t-tag">span</span> <span class="t-attr">id</span>=<span class="t-str">"display"</span>&gt;\${count.<span class="t-fn">get</span>()}&lt;/<span class="t-tag">span</span>&gt;
      &lt;<span class="t-tag">button</span> <span class="t-attr">id</span>=<span class="t-str">"dec"</span>&gt;−&lt;/<span class="t-tag">button</span>&gt;
      &lt;<span class="t-tag">button</span> <span class="t-attr">id</span>=<span class="t-str">"inc"</span>&gt;+&lt;/<span class="t-tag">button</span>&gt;
      &lt;<span class="t-tag">button</span> <span class="t-attr">id</span>=<span class="t-str">"rst"</span>&gt;reset&lt;/<span class="t-tag">button</span>&gt;
    &lt;/<span class="t-tag">div</span>&gt;
  \`</span>;

  <span class="t-kw">const</span> display = el.<span class="t-fn">querySelector</span>(<span class="t-str">'#display'</span>);

  <span class="t-cmt">// 2. Suscribirse — actualiza SOLO el span, sin re-renderizar todo</span>
  count.<span class="t-fn">subscribe</span>(v => { display.textContent = v; });

  el.<span class="t-fn">querySelector</span>(<span class="t-str">'#inc'</span>).<span class="t-fn">addEventListener</span>(<span class="t-str">'click'</span>, () =>
    count.<span class="t-fn">set</span>(v => v + <span class="t-num">1</span>)
  );
  el.<span class="t-fn">querySelector</span>(<span class="t-str">'#dec'</span>).<span class="t-fn">addEventListener</span>(<span class="t-str">'click'</span>, () =>
    count.<span class="t-fn">set</span>(v => v - <span class="t-num">1</span>)
  );
  el.<span class="t-fn">querySelector</span>(<span class="t-str">'#rst'</span>).<span class="t-fn">addEventListener</span>(<span class="t-str">'click'</span>, () =>
    count.<span class="t-fn">set</span>(<span class="t-num">0</span>)
  );

  <span class="t-kw">return</span> el;
});`;

  const el = html`
    <div class="page">
      <div class="section-header">
        <span class="section-num">demo_01</span>
        <span class="section-title">signal() — contador reactivo</span>
      </div>

      <p style="font-family:var(--font-sans);font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:32px">
        Un <code style="color:var(--amber)">signal</code> almacena un único valor reactivo.
        Los suscriptores se notifican de forma síncrona en cada cambio.
        La actualización del DOM de abajo es <em style="color:var(--text)">granular</em> — solo cambia el nodo del número, nada más se re-renderiza.
      </p>

      <div class="demo-wrap" id="demo-mount">
        <span class="demo-label">// demo en vivo — interactuá abajo</span>
        <div class="counter-display" id="counter-val">0</div>
        <div class="counter-controls">
          <button class="counter-btn" id="btn-dec">−</button>
          <button class="counter-btn" id="btn-inc">+</button>
        </div>
        <button class="counter-reset" id="btn-rst">reset(0)</button>
      </div>

      <div class="code-wrap">
        <div class="code-bar">
          <div class="code-dots">
            <div class="code-dot"></div><div class="code-dot"></div><div class="code-dot"></div>
          </div>
          <span class="code-filename">Counter.js</span>
          <button class="code-copy" id="copy-btn">copiar</button>
        </div>
        <pre>${codeStr}</pre>
      </div>

      <div style="margin-top:48px;padding:24px;background:var(--surface);border:1px solid var(--border);border-radius:6px">
        <div style="font-size:11px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">// cómo funciona signal() por dentro</div>
        <pre style="font-size:12px;line-height:1.8"><span class="t-fn">signal</span>(init) {
  <span class="t-kw">let</span> value = init;
  <span class="t-kw">const</span> subs = <span class="t-kw">new</span> <span class="t-fn">Set</span>();           <span class="t-cmt">// suscriptores</span>

  <span class="t-kw">return</span> {
    <span class="t-fn">get</span>()    { <span class="t-kw">return</span> value },
    <span class="t-fn">set</span>(upd) {
      <span class="t-kw">const</span> next = <span class="t-kw">typeof</span> upd === <span class="t-str">'function'</span>
        ? <span class="t-fn">upd</span>(value) : upd;
      <span class="t-kw">if</span> (Object.<span class="t-fn">is</span>(value, next)) <span class="t-kw">return</span>; <span class="t-cmt">// sin cambio → sin notificación</span>
      value = next;
      subs.<span class="t-fn">forEach</span>(fn => <span class="t-fn">fn</span>(value));  <span class="t-cmt">// notificar a todos</span>
    },
    <span class="t-fn">subscribe</span>(fn) {
      subs.<span class="t-fn">add</span>(fn);
      <span class="t-kw">return</span> () => subs.<span class="t-fn">delete</span>(fn);   <span class="t-cmt">// retorna cleanup</span>
    }
  }
}</pre>
      </div>
    </div>
  `;

  onMount(el, () => {
    const display = el.querySelector('#counter-val');

    const unsub = count.subscribe(v => {
      display.textContent = v;
      display.classList.add('bump');
      setTimeout(() => display.classList.remove('bump'), 100);
    });

    const c1 = onEvent(el.querySelector('#btn-inc'), 'click', () => count.set(v => v + 1));
    const c2 = onEvent(el.querySelector('#btn-dec'), 'click', () => count.set(v => v - 1));
    const c3 = onEvent(el.querySelector('#btn-rst'), 'click', () => count.set(0));
    const c4 = onEvent(el.querySelector('#copy-btn'), 'click', function() {
      navigator.clipboard.writeText(el.querySelector('pre').innerText).then(() => {
        this.textContent = '¡copiado!';
        setTimeout(() => this.textContent = 'copiar', 2000);
      });
    });

    return () => { unsub(); c1(); c2(); c3(); c4(); };
  });

  return el;
});
