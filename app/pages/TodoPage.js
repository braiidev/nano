// nano-site/app/pages/TodoPage.js
import { defineComponent, html, createStore, onMount, onEvent } from '../../packages/nano.min.js';

const store = createStore({ items: [] });

function renderItems(items) {
  if (items.length === 0) {
    return html`<ul class="todo-list-demo"><li class="todo-empty-demo">nada por aquí — agregá algo arriba</li></ul>`;
  }
  const ul = document.createElement('ul');
  ul.className = 'todo-list-demo';
  items.forEach(item => {
    const li = html`
      <li class="todo-item-demo ${item.done ? 'done' : ''}" data-key="${item.id}">
        <button class="todo-toggle" data-toggle="${item.id}">${item.done ? '✓' : ''}</button>
        <span class="todo-txt">${item.text}</span>
        <button class="todo-del" data-del="${item.id}">✕</button>
      </li>
    `;
    ul.appendChild(li);
  });
  return ul;
}

export const TodoPage = defineComponent('TodoPage', () => {
  let listEl = renderItems(store.get().items);

  const codeStr = `<span class="t-kw">import</span> { createStore, diff } <span class="t-kw">from</span> <span class="t-str">'nano.min.js'</span>;

<span class="t-cmt">// createStore — estado estructurado, inmutable internamente</span>
<span class="t-kw">const</span> store = <span class="t-fn">createStore</span>({ items: [] });

<span class="t-cmt">// Mutar con objeto parcial o con una función</span>
store.<span class="t-fn">set</span>(s => ({
  ...s,
  items: [...s.items, { id: <span class="t-fn">Date</span>.<span class="t-fn">now</span>(), text: <span class="t-str">'nueva tarea'</span>, done: <span class="t-kw">false</span> }],
}));

<span class="t-cmt">// diff() actualiza solo lo que cambió en el DOM real</span>
<span class="t-kw">let</span> listEl = <span class="t-fn">renderItems</span>(store.<span class="t-fn">get</span>().items);

store.<span class="t-fn">subscribe</span>(({ items }) => {
  <span class="t-kw">const</span> newList = <span class="t-fn">renderItems</span>(items);
  listEl.<span class="t-fn">replaceWith</span>(newList); <span class="t-cmt">// o diff(listEl, newList)</span>
  listEl = newList;
});`;

  const el = html`
    <div class="page">
      <div class="section-header">
        <span class="section-num">demo_03</span>
        <span class="section-title">createStore() + diff() — lista de tareas</span>
      </div>

      <p style="font-family:var(--font-sans);font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:32px">
        <code style="color:var(--amber)">createStore</code> almacena estado estructurado y notifica suscriptores en cada cambio.
        <code style="color:var(--amber)">diff()</code> recorre dos árboles DOM y parchea solo lo que cambió —
        los ítems con clave (<code style="color:var(--blue)">data-key</code>) se reordenan en lugar de recrearse.
      </p>

      <div class="demo-wrap">
        <span class="demo-label">// demo en vivo — agregá y completá tareas</span>
        <div class="todo-demo-wrap">
          <div class="todo-input-row">
            <input class="todo-input" id="todo-inp" placeholder="¿qué hay que hacer?" autocomplete="off">
            <button class="todo-add" id="todo-add">agregar</button>
          </div>
          <div id="list-wrap"></div>
        </div>
      </div>

      <div class="code-wrap">
        <div class="code-bar">
          <div class="code-dots">
            <div class="code-dot"></div><div class="code-dot"></div><div class="code-dot"></div>
          </div>
          <span class="code-filename">TodoList.js</span>
          <button class="code-copy" id="todo-copy">copiar</button>
        </div>
        <pre>${codeStr}</pre>
      </div>

      <div style="margin-top:48px;padding:24px;background:var(--surface);border:1px solid var(--border);border-radius:6px">
        <div style="font-size:11px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">// algoritmo diff en ~25 líneas</div>
        <pre style="font-size:12px;line-height:1.8"><span class="t-fn">diff</span>(nodoViejo, nodoNuevo) {
  <span class="t-cmt">// Tag distinto → reemplazar completo</span>
  <span class="t-kw">if</span> (nodoViejo.tagName !== nodoNuevo.tagName) {
    nodoViejo.parentNode.<span class="t-fn">replaceChild</span>(nodoNuevo, nodoViejo); <span class="t-kw">return</span>;
  }
  <span class="t-cmt">// Nodo de texto → actualizar contenido</span>
  <span class="t-kw">if</span> (nodoNuevo.nodeType === Node.TEXT_NODE) {
    nodoViejo.textContent = nodoNuevo.textContent; <span class="t-kw">return</span>;
  }
  <span class="t-cmt">// Elemento → parchear atributos y recurrir en hijos</span>
  <span class="t-fn">patchAttrs</span>(nodoViejo, nodoNuevo);

  <span class="t-cmt">// Hijos con clave → reordenar en vez de recrear</span>
  <span class="t-kw">if</span> (hijos.<span class="t-fn">tienenClave</span>()) {
    <span class="t-fn">patchKeyed</span>(nodoViejo, nodoNuevo); <span class="t-kw">return</span>;
  }
  <span class="t-cmt">// Hijos simples → índice a índice</span>
  hijos.<span class="t-fn">forEach</span>((viejo, i) => <span class="t-fn">diff</span>(viejo, hijosNuevos[i]));
}</pre>
      </div>
    </div>
  `;

  el.querySelector('#list-wrap').appendChild(listEl);

  onMount(el, () => {
    const inp = el.querySelector('#todo-inp');

    function agregar() {
      const text = inp.value.trim();
      if (!text) return;
      store.set(s => ({
        ...s,
        items: [...s.items, { id: Date.now(), text, done: false }],
      }));
      inp.value = '';
      inp.focus();
    }

    const c1 = onEvent(el.querySelector('#todo-add'), 'click', agregar);
    const c2 = onEvent(inp, 'keydown', e => { if (e.key === 'Enter') agregar(); });

    const c3 = onEvent(el.querySelector('#list-wrap'), 'click', e => {
      const toggle = e.target.closest('[data-toggle]');
      const del    = e.target.closest('[data-del]');
      if (toggle) {
        const id = Number(toggle.dataset.toggle);
        store.set(s => ({ ...s, items: s.items.map(i => i.id === id ? { ...i, done: !i.done } : i) }));
      }
      if (del) {
        const id = Number(del.dataset.del);
        store.set(s => ({ ...s, items: s.items.filter(i => i.id !== id) }));
      }
    });

    const unsub = store.subscribe(({ items }) => {
      const newList = renderItems(items);
      listEl.replaceWith(newList);
      listEl = newList;
    });

    const c4 = onEvent(el.querySelector('#todo-copy'), 'click', function() {
      navigator.clipboard.writeText(el.querySelector('pre').innerText).then(() => {
        this.textContent = '¡copiado!';
        setTimeout(() => this.textContent = 'copiar', 2000);
      });
    });

    return () => { c1(); c2(); c3(); c4(); unsub(); };
  });

  return el;
});
