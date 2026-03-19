# nano ⚡

Micro-framework reactivo en Vanilla JS puro. Sin dependencias. Sin build step.

## Uso en tu app

### Remoto
```js
import { html, defineComponent, mount } from 'https://raw.githubusercontent.com/braiidev/nano/refs/heads/main/packages/nano.min.js';
```

### Git clone
```git
git clone https://github.com/braiidev/nano.git
```

```js
import { html, defineComponent, mount } from '../packages/core/index.js';
import { signal, createStore }          from '../packages/core/index.js';
import { Router, navigate }             from '../packages/core/index.js';
import { onMount, onVisible }           from '../packages/core/index.js';
```

## API completa → ver `core/index.js`

| Export | Módulo | Descripción |
|--------|--------|-------------|
| `html` | component | Tagged template → HTMLElement |
| `defineComponent` | component | Registra un componente |
| `mount` | component | Monta componente en el DOM |
| `signal` | state | Estado atómico reactivo |
| `createStore` | state | Estado estructurado reactivo |
| `computed` | state | Valor derivado de signals |
| `diff` | vdom | Diffing mínimo del DOM |
| `Router` | router | Client-side router con basePath |
| `navigate` | router | Navegar sin instancia del Router |
| `onMount` | lifecycle | Callback al entrar al DOM |
| `onVisible` | lifecycle | Callback al entrar al viewport |
| `onResize` | lifecycle | Callback al cambiar tamaño |
| `onEvent` | lifecycle | addEventListener con cleanup |
| `storage` | storage | Wrapper sobre localStorage |


### Componentes

```js
import { html, defineComponent, mount } from './packages/core/index.js';

export const Button = defineComponent('Button', ({ label, onClick }) => {
  const el = html`<button class="btn">${label}</button>`;
  el.addEventListener('click', onClick);
  return el;
});

mount(Button, '#root');
```

### Estado reactivo

```js
import { signal, createStore, computed } from './packages/core/index.js';

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
import { diff } from './packages/core/index.js';

store.subscribe(state => {
  const newTree = MyList(state.items);
  diff(currentTree, newTree);
  currentTree = newTree;
});
```

### Router

```js
import { Router, navigate } from './packages/core/index.js';

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
import { onMount, onVisible, onResize, onEvent } from './packages/core/index.js';

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