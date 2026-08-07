// @ts-check
import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  globalIgnores(['dist/**', 'eslint.config.mjs']),

  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  {
    name: 'kit/defaults',
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['vite.config.ts']
        },
        tsconfigRootDir: import.meta.dirname
      },
      // The plugin authoring API and the host runtime both run in the browser.
      globals: globals.browser
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ]
    }
  },

  {
    // Vite runs these in Node: the plugin build preset and the host dev server
    // plugin, which is also the only place allowed to touch the filesystem.
    name: 'kit/node',
    files: ['src/vite/**/*.ts', 'src/host/vite.ts', 'vite.config.ts'],
    languageOptions: { globals: globals.node }
  }
)
