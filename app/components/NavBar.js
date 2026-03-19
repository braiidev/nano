// nano-site/app/components/NavBar.js
import { defineComponent, html, onMount, onEvent, currentPath, navigate } from '../../packages/nano.min.js';

export const NavBar = defineComponent('NavBar', () => {
  const el = html`
    <nav class="navbar">
      <span class="nav-logo" data-nav="/">nano</span>
      <ul class="nav-links">
        <li><a href="/"         data-link class="nav-a">inicio</a></li>
        <li><a href="/counter"  data-link class="nav-a">contador</a></li>
        <li><a href="/signals"  data-link class="nav-a">signals</a></li>
        <li><a href="/todo"     data-link class="nav-a">tareas</a></li>
        <li><a href="/about"    data-link class="nav-a">api</a></li>
      </ul>
    </nav>
  `;

  function setActive() {
    const cp = currentPath();
    el.querySelectorAll('.nav-a').forEach(a => {
      const href = a.getAttribute('href');
      const isActive = href === '/' ? cp === '/' : cp.startsWith(href);
      a.classList.toggle('active', isActive);
    });
  }

  onMount(el, () => {
    setActive();
    const c1 = onEvent(window, 'popstate', setActive);
    const c2 = onEvent(document, 'click', () => setTimeout(setActive, 0));
    const c3 = onEvent(el.querySelector('.nav-logo'), 'click', () => navigate('/'));
    return () => { c1(); c2(); c3(); };
  });

  return el;
});
