// nano/core/storage.js
// ─────────────────────────────────────────────
// Wrapper tipado sobre localStorage para Nano
// ─────────────────────────────────────────────

/**
 * @template T
 * @param {string} key
 * @param {T} fallback - valor por defecto si la key no existe
 * @returns {T}
 */
function get(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 */
function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[nano/storage] No se pudo guardar:', key, e);
  }
}

/** @param {string} key */
function remove(key) {
  localStorage.removeItem(key);
}

export const storage = { get, set, remove };
