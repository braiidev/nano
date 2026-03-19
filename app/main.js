// nano/app/main.js
// ─────────────────────────────────────────────
// Punto de entrada de la aplicación
// ─────────────────────────────────────────────
import { mount, Router } from '../core/index.js';
import { NavBar }        from './components/NavBar.js';
import { TodoPage }      from './pages/TodoPage.js';
import { AboutPage }     from './pages/AboutPage.js';

// 1. Monta la barra de navegación (persiste entre rutas)
mount(NavBar, '#nav');

// 2. Inicializa el router con las rutas de la app
new Router(
  [
    { path: '/',       component: TodoPage,  title: 'Nano · Tareas' },
    { path: '/about',  component: AboutPage, title: 'Nano · Acerca' },
  ],
  { outlet: '#root' }
);
