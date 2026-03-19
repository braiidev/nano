// nano/app/pages/TodoPage.js
import { defineComponent, html, createStore, diff, onMount, onEvent } from '../../core/index.js';

// ── Estado global de todos ────────────────────────────────────────────────────
const store = createStore({
  todos: /** @type {{ id: number, text: string, done: boolean }[]} */ ([]),
});

// ── Renderiza solo la lista (para diff eficiente) ─────────────────────────────
function renderList(todos) {
  if (todos.length === 0) {
    return html`<ul class="todo-list"><li class="empty">Sin tareas — ¡a descansar! 🎉</li></ul>`;
  }

  const items = todos.map(t => {
    const li = html`
      <li class="todo-item ${t.done ? 'done' : ''}" data-key="${t.id}">
        <button class="toggle" data-id="${t.id}" title="Completar">
          ${t.done ? '✓' : '○'}
        </button>
        <span class="todo-text">${t.text}</span>
        <button class="remove" data-id="${t.id}" title="Eliminar">✕</button>
      </li>
    `;
    return li;
  });

  const ul = document.createElement('ul');
  ul.className = 'todo-list';
  items.forEach(li => ul.appendChild(li));
  return ul;
}

// ── Componente principal ──────────────────────────────────────────────────────
export const TodoPage = defineComponent('TodoPage', () => {
  let { todos } = store.get();
  let listEl = renderList(todos);

  const el = html`
    <section class="todo-page">
      <h1>Tareas</h1>
      <div class="add-row">
        <input id="nano-inp" type="text" placeholder="Nueva tarea…" autocomplete="off">
        <button id="nano-add">Agregar</button>
      </div>
      <div class="list-wrap"></div>
      <footer class="todo-footer">
        <span id="nano-count"></span>
        <button id="nano-clear">Limpiar completadas</button>
      </footer>
    </section>
  `;

  const inp   = /** @type {HTMLInputElement} */ (el.querySelector('#nano-inp'));
  const wrap  = el.querySelector('.list-wrap');
  const count = el.querySelector('#nano-count');
  wrap.appendChild(listEl);

  // ── Acciones ───────────────────────────────────────────────────────────────
  function addTodo() {
    const text = inp.value.trim();
    if (!text) return;
    store.set(s => ({
      ...s,
      todos: [...s.todos, { id: Date.now(), text, done: false }],
    }));
    inp.value = '';
    inp.focus();
  }

  function toggleTodo(id) {
    store.set(s => ({
      ...s,
      todos: s.todos.map(t => t.id === id ? { ...t, done: !t.done } : t),
    }));
  }

  function removeTodo(id) {
    store.set(s => ({ ...s, todos: s.todos.filter(t => t.id !== id) }));
  }

  function clearDone() {
    store.set(s => ({ ...s, todos: s.todos.filter(t => !t.done) }));
  }

  // ── Event listeners ────────────────────────────────────────────────────────
  onMount(el, () => {
    const cleanAdd = onEvent(el.querySelector('#nano-add'), 'click', addTodo);
    const cleanKey = onEvent(inp, 'keydown', e => { if (e.key === 'Enter') addTodo(); });
    const cleanClear = onEvent(el.querySelector('#nano-clear'), 'click', clearDone);

    // Delegación en la lista
    const cleanList = onEvent(wrap, 'click', e => {
      const target = /** @type {HTMLElement} */ (e.target);
      const btn = target.closest('button[data-id]');
      if (!btn) return;
      const id = Number(btn.getAttribute('data-id'));
      if (btn.classList.contains('toggle')) toggleTodo(id);
      if (btn.classList.contains('remove')) removeTodo(id);
    });

    return () => { cleanAdd(); cleanKey(); cleanClear(); cleanList(); };
  });

  // ── Reactividad: diff solo la lista ───────────────────────────────────────
  store.subscribe(({ todos: newTodos }) => {
    const newList = renderList(newTodos);
    diff(listEl, newList);
    listEl = newList;

    const pending = newTodos.filter(t => !t.done).length;
    count.textContent = `${pending} pendiente${pending !== 1 ? 's' : ''}`;
  });

  // Render inicial del counter
  const pending = todos.filter(t => !t.done).length;
  count.textContent = `${pending} pendientes`;

  return el;
});
