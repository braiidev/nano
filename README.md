# nano ⚡

Micro-framework reactivo en Vanilla JS puro. Sin dependencias. Sin build step.

## Inicio rápido

```bash
npx serve .
# abre http://localhost:3000
```

## Estructura

```
nano/
├── core/
│   ├── index.js        ← barrel: importa todo desde aquí
│   ├── component.js    ← html``, defineComponent, mount
│   ├── state.js        ← signal, createStore, computed
│   ├── vdom.js         ← diff (virtual DOM)
│   ├── router.js       ← Router, navigate
│   └── lifecycle.js    ← onMount, onVisible, onResize, onEvent
├── app/
│   ├── components/
│   ├── pages/
│   ├── styles.css
│   └── main.js
├── index.html
├── jsconfig.json
└── eslint.config.js
```

## API

### Componentes

```js
import { html, defineComponent, mount } from './core/index.js';

export const Button = defineComponent('Button', ({ label, onClick }) => {
  const el = html`<button class="btn">${label}</button>`;
  el.addEventListener('click', onClick);
  return el;
});

mount(Button, '#root');
```

### Estado reactivo

```js
import { signal, createStore, computed } from './core/index.js';

// Signal — valor atómico
const count = signal(0);
count.subscribe(v => console.log(v));
count.set(v => v + 1);

// Store — objeto estructurado
const store = createStore({ user: null, loading: false });
store.set({ loading: true });
store.subscribe(state => render(state));

// Computed — derivado reactivo (read-only)
const double = computed(() => count.get() * 2, [count]);
```

### Virtual DOM diff

```js
import { diff } from './core/index.js';

store.subscribe(state => {
  const newTree = MyList(state.items);
  diff(currentTree, newTree);
  currentTree = newTree;
});
```

### Router

```js
import { Router, navigate } from './core/index.js';

new Router([
  { path: '/',         component: Home },
  { path: '/user/:id', component: UserPage },
], { outlet: '#root' });

// Links en HTML:
// <a href="/user/42" data-link>Ver usuario</a>

// Navegar desde JS:
navigate('/dashboard');
```

### Ciclo de vida

```js
import { onMount, onVisible, onResize, onEvent } from './core/index.js';

onMount(el, () => {
  const unsub = store.subscribe(render);
  const unlisten = onEvent(window, 'keydown', handleKey);
  return () => { unsub(); unlisten(); }; // cleanup al desmontar
});

onVisible(card, () => card.classList.add('visible'), { threshold: 0.2 });
```

### Keys en listas

Añade `data-key` a los ítems para reconciliación eficiente:

```js
const items = todos.map(t =>
  html`<li data-key="${t.id}">${t.text}</li>`
);
```

---

**Tamaño del core:** ~200 líneas · **Deps:** 0 · **Build:** ninguno
