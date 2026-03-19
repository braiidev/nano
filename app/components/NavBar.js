// nano/app/components/NavBar.js
import { defineComponent, html } from '../../core/index.js';

export const NavBar = defineComponent('NavBar', () => {
  return html`
    <nav class="navbar">
      <span class="nano-logo">nano</span>
      <ul class="nav-links">
        <li><a href="/" data-link>Tareas</a></li>
        <li><a href="/about" data-link>Acerca</a></li>
      </ul>
    </nav>
  `;
});
