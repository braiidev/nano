// nano/core/vdom.js
// ─────────────────────────────────────────────
// Virtual DOM diff/patch de Nano
// ─────────────────────────────────────────────

/**
 * Compara dos árboles DOM y aplica los cambios mínimos al DOM real.
 * Algoritmo O(n) de un solo pase — suficiente para la mayoría de UIs.
 *
 * @param {Node} oldNode - Nodo existente en el DOM
 * @param {Node} newNode - Nuevo nodo generado por el render
 * @returns {void}
 *
 * @example
 * const newTree = MyComponent({ ...updatedProps });
 * diff(container.firstElementChild, newTree);
 */
export function diff(oldNode, newNode) {
  // Tipos distintos o tag distinto → reemplazar completo
  if (
    !oldNode ||
    !newNode ||
    oldNode.nodeType !== newNode.nodeType ||
    (oldNode.nodeType === Node.ELEMENT_NODE &&
      /** @type {Element} */ (oldNode).tagName !==
        /** @type {Element} */ (newNode).tagName)
  ) {
    oldNode?.parentNode?.replaceChild(newNode, oldNode);
    return;
  }

  // Nodo de texto
  if (newNode.nodeType === Node.TEXT_NODE) {
    if (oldNode.textContent !== newNode.textContent) {
      oldNode.textContent = newNode.textContent;
    }
    return;
  }

  // Nodo elemento: sincronizar atributos
  _patchAttrs(
    /** @type {Element} */ (oldNode),
    /** @type {Element} */ (newNode)
  );

  // Reconciliar hijos
  _patchChildren(
    /** @type {Element} */ (oldNode),
    /** @type {Element} */ (newNode)
  );
}

/**
 * Sincroniza los atributos entre dos elementos.
 * @param {Element} oldEl
 * @param {Element} newEl
 */
function _patchAttrs(oldEl, newEl) {
  // Añadir / actualizar
  for (const { name, value } of newEl.attributes) {
    if (oldEl.getAttribute(name) !== value) {
      oldEl.setAttribute(name, value);
    }
  }
  // Eliminar atributos que ya no existen
  for (const { name } of [...oldEl.attributes]) {
    if (!newEl.hasAttribute(name)) {
      oldEl.removeAttribute(name);
    }
  }
}

/**
 * Reconcilia los nodos hijos de dos elementos.
 * Soporta keys mediante el atributo `data-key` para listas estables.
 * @param {Element} oldEl
 * @param {Element} newEl
 */
function _patchChildren(oldEl, newEl) {
  const newChildren = [...newEl.childNodes];
  const oldChildren = [...oldEl.childNodes];

  // ── Modo keyed: si los hijos tienen data-key ──────────────────────────
  const hasKeys =
    newChildren.length > 0 &&
    newChildren[0] instanceof Element &&
    newChildren[0].hasAttribute('data-key');

  if (hasKeys) {
    _patchKeyed(oldEl, oldChildren, newChildren);
    return;
  }

  // ── Modo simple: índice por índice ────────────────────────────────────
  const max = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < max; i++) {
    const oldChild = oldChildren[i];
    const newChild = newChildren[i];

    if (!oldChild) {
      oldEl.appendChild(newChild);
    } else if (!newChild) {
      oldChild.remove();
    } else {
      diff(oldChild, newChild);
    }
  }
}

/**
 * Reconciliación por key (para listas con data-key).
 * Minimiza re-creaciones y preserva el orden correcto.
 *
 * @param {Element} parent
 * @param {ChildNode[]} oldChildren
 * @param {ChildNode[]} newChildren
 */
function _patchKeyed(parent, oldChildren, newChildren) {
  /** @type {Map<string, Element>} */
  const oldMap = new Map();

  for (const child of oldChildren) {
    if (child instanceof Element && child.hasAttribute('data-key')) {
      oldMap.set(child.getAttribute('data-key'), child);
    }
  }

  // Reordenar / actualizar / crear
  for (const newChild of newChildren) {
    if (!(newChild instanceof Element)) continue;
    const key = newChild.getAttribute('data-key');
    const oldChild = oldMap.get(key);

    if (oldChild) {
      diff(oldChild, newChild);
      parent.appendChild(oldChild); // mueve al orden correcto
      oldMap.delete(key);
    } else {
      parent.appendChild(newChild); // nuevo nodo
    }
  }

  // Eliminar los que ya no están
  for (const removed of oldMap.values()) {
    removed.remove();
  }
}
