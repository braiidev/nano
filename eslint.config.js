// eslint.config.js
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window:    'readonly',
        document:  'readonly',
        Node:      'readonly',
        MutationObserver:     'readonly',
        IntersectionObserver: 'readonly',
        ResizeObserver:       'readonly',
        PopStateEvent:        'readonly',
      },
    },
    rules: {
      'no-unused-vars':  'warn',
      'no-undef':        'error',
      'prefer-const':    'error',
      'no-var':          'error',
      'eqeqeq':          'error',
      'no-console':      'warn',
    },
  },
];
