import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * ESLint flat config (Next.js 16).
 *
 * The previous config imported `eslint-config-next/core-web-vitals` and
 * `eslint-config-next/typescript` from v14, which do not exist in v14 as flat
 * configs -- `npx eslint` died with ERR_MODULE_NOT_FOUND, so the lint gate was
 * dead and CI never ran it.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores(['node_modules/**', '.next/**', 'out/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**']),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'react/no-unescaped-entities': 'off',
      // React 19's new rule fires on the localStorage/session hydration
      // pattern used across this codebase. Kept visible as a warning until
      // those call sites move to useSyncExternalStore / lazy initial state.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
