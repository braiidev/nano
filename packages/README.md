# nano ⚡

Micro-framework reactivo en Vanilla JS puro. Sin dependencias. Sin build step.

## Uso en tu app

```js
import { html, defineComponent, mount } from '../../nano/core/index.js';
import { signal, createStore }          from '../../nano/core/index.js';
import { Router, navigate }             from '../../nano/core/index.js';
import { onMount, onVisible }           from '../../nano/core/index.js';
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
