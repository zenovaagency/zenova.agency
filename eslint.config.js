import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

// eslint-plugin-react-refresh is deliberately gone. It exists for Vite's React
// Fast Refresh, and its only-export-components rule is actively wrong under the
// Next App Router, where a route file exporting `metadata`,
// `generateMetadata` or `generateStaticParams` next to its default component is
// the required pattern, not a mistake. Next ships its own Fast Refresh.

export default tseslint.config(
  // `.next` holds Next's generated route types, which are build output, not
  // source — linting them produced ~600 errors from code nobody wrote.
  { ignores: ['.next', 'out', 'node_modules', '_legacy'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
);
