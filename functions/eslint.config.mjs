import tseslint from 'typescript-eslint';
import eslintPluginTS from '@typescript-eslint/eslint-plugin';
import eslintParserTS from '@typescript-eslint/parser';
import eslintPluginImport from 'eslint-plugin-import';

export default tseslint.config([
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: eslintParserTS,
      parserOptions: {
        project: './tsconfig.json',  // <== crucial for type info
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTS,
      import: eslintPluginImport,
    },
    rules: {
      semi: ['warn', 'always'],
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',  // <== type-aware rule
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-shadow': ['error', { hoist: 'all' }],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/triple-slash-reference': 'error',
      '@typescript-eslint/unified-signatures': 'warn',

      'comma-dangle': 'warn',
      'constructor-super': 'error',
      eqeqeq: ['warn', 'always'],
      'import/no-unassigned-import': 'warn',
      'no-cond-assign': 'error',
      'no-console': 'off',
      'no-duplicate-case': 'error',
      'no-duplicate-imports': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-empty-function': 'off', // overridden by @typescript-eslint/no-empty-function
      'no-invalid-this': 'error',
      'no-new-wrappers': 'error',
      'no-param-reassign': 'error',
      'no-redeclare': 'error',
      'no-sequences': 'error',
      'no-shadow': 'off', // overridden by @typescript-eslint/no-shadow
      'no-throw-literal': 'error',
      'no-unsafe-finally': 'error',
      'no-unused-labels': 'error',
      'no-var': 'warn',
      'no-void': 'error',
      'prefer-const': 'warn',
    },
  },
]);
