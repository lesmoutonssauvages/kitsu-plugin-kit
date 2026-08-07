import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))

const external = (id: string): boolean =>
  id === 'virtual:kitsu-plugins-dev' ||
  id.startsWith('node:') ||
  [
    'vue',
    'vue-router',
    'vue-i18n',
    'vuex',
    'vite',
    '@vitejs/plugin-vue',
    'fs',
    'path',
    'module',
    'url'
  ].includes(id)

export default defineConfig({
  plugins: [vue()],
  build: {
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2023',
    lib: {
      formats: ['es'],
      entry: {
        index: resolve(root, 'src/index.ts'),
        'vite/index': resolve(root, 'src/vite/index.ts'),
        'host/index': resolve(root, 'src/host/index.ts'),
        'host/vite': resolve(root, 'src/host/vite.ts')
      },
      fileName: (_format, entryName) => `${entryName}.js`
    },
    rollupOptions: { external }
  }
})
