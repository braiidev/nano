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
