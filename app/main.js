// nano-site/app/main.js
import { mount, Router } from '../packages/nano.min.js';
import { NavBar }        from './components/NavBar.js';
import { HomePage }      from './pages/HomePage.js';
import { CounterPage }   from './pages/CounterPage.js';
import { SignalsPage }   from './pages/SignalsPage.js';
import { TodoPage }      from './pages/TodoPage.js';
import { AboutPage }     from './pages/AboutPage.js';
import { updateMeta }    from './seo.js';

// ── Custom cursor ──────────────────────────────────────────────────────────────
const cursor = document.createElement('div');
cursor.id = 'cursor';
document.body.appendChild(cursor);
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});
document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
document.addEventListener('mouseenter', () => cursor.style.opacity = '0.85');

// ── NavBar ─────────────────────────────────────────────────────────────────────
mount(NavBar, '#nav');

// ── Router ─────────────────────────────────────────────────────────────────────
const router = new Router(
  [
    { path: '/',        component: HomePage,    title: 'nano — micro-framework reactivo en Vanilla JS puro' },
    { path: '/counter', component: CounterPage, title: 'Contador reactivo con signal() — nano demos' },
    { path: '/signals', component: SignalsPage, title: 'Grafo reactivo con computed() — nano demos' },
    { path: '/todo',    component: TodoPage,    title: 'Lista de tareas con createStore() — nano demos' },
    { path: '/about',   component: AboutPage,   title: 'Referencia completa de la API — nano' },
  ],
  { outlet: '#root', basePath: 'auto' }
);

// Actualizar metadatos SEO en cada navegación
updateMeta(router.cleanPath());
router.onNavigate(path => updateMeta(path));
