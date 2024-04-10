import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import babelParser from "@babel/eslint-parser";
import typescriptEs from "@typescript-eslint";
import parser from "@typescript-eslint/parser";

export default [
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      parser: babelParser,
      globals: {
        Atomics: 'readonly',
        SharedArrayBugger: 'readonly',
        ...globals.browser,
        ...globals.es2021,
        ...globals.node
      }
    },
    rules: {
      indent: ['error', 2, { 'SwitchCase': 1 }],
      linebreak-style: ['error', 'unix'],
      quotes: ['error', 'single'],
      comma-dangle: ['error', 'always-multiline'],
      semi: ['error', 'always'],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/no-var-requires': 0,
    },
    plugins: {
      typescriptEs: typescriptEs
    },
    languageOptions: {
      parser: parser,
      project: './tsconfig.json',
    }
  },
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
];