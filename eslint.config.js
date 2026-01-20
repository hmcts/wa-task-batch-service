const {
  defineConfig,
  globalIgnores,
} = require('eslint/config');

const globals = require('globals');
const babelParser = require('@babel/eslint-parser');
const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const js = require('@eslint/js');

const {
  FlatCompat,
} = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([{
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      'Atomics': 'readonly',
      'SharedArrayBuffer': 'readonly',
    },

    parser: babelParser,
    'ecmaVersion': 12,
    'sourceType': 'module',
    parserOptions: {},
  },

  extends: compat.extends('eslint:recommended'),

  'rules': {
    'indent': ['error', 2, {
      'SwitchCase': 1,
    }],

    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
  },
}, {
  files: ['src/test/E2E/**/*.js'],

  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      Feature: 'readonly',
      Scenario: 'readonly',
      actor: 'readonly',
    },
  },
}, {
  files: ['**/*.ts', '**/*.tsx'],

  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      'Atomics': 'readonly',
      'SharedArrayBuffer': 'readonly',
    },

    parser: tsParser,
    'ecmaVersion': 12,
    'sourceType': 'module',

    parserOptions: {
      'project': './tsconfig.json',
    },
  },

  extends: compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ),

  plugins: {
    '@typescript-eslint': typescriptEslint,
  },

  'rules': {
    'indent': ['error', 2, {
      'SwitchCase': 1,
    }],

    'linebreak-style': ['error', 'unix'],

    'quotes': ['error', 'single', {
      'avoidEscape': true,
    }],

    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/no-var-requires': 0,
  },
}, globalIgnores([
  'dist/*',
  'coverage/*',
  '**/*.d.ts',
  'src/main/public/',
  'src/main/types/',
  '**/jest.*config.js',
])]);
