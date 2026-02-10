import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  {
    ignores: [
      'dist',
      '.next',
      'node_modules',
      '**/*debug*',
      'src/components/ui/**/*',
      'tailwind.config.js',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.browser, Telegram: 'readonly' },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: true,
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    plugins: {
      react,
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@stylistic': stylistic,
      import: importPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
      ...react.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/react-in-jsx-scope': 'off',
      'react/jsx-tag-spacing': [
        'error',
        {
          closingSlash: 'never', // </div >
          beforeSelfClosing: 'never', // <App />
          afterOpening: 'never', // < App/>
          beforeClosing: 'never', //  <App />
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: { delimiter: 'semi', requireLast: true },
          singleline: { delimiter: 'semi', requireLast: false },
        },
      ],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      'import/extensions': [
        'warn',
        'never',
        {
          css: 'always',
          scss: 'always',
          less: 'always',
          json: 'always',
          png: 'always',
          // some bullshit with dot-separated naming
          enum: 'always',
          types: 'always',
        },
      ],
    },
  },
  prettier,
);
