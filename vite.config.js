import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [vue()],
      root: 'playground',
      server: {
        host: true
      },
      resolve: {
        alias: {
          'vue3-bs': resolve(__dirname, 'src/index.js')
        }
      },
      // Ensure sass/bootstrap works in playground
      css: {
        preprocessorOptions: {
          scss: {
            quietDeps: true
          }
        }
      }
    }
  } else {
    return {
      plugins: [vue()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.js'),
          name: 'Vue3Bs',
          fileName: (format) => `vue3-bs.${format}.js`
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue'
            }
          }
        }
      }
    }
  }
})
