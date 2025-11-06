import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Read version from package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Inject app version as global constant
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  },

  // Base path for GitHub Pages (https://username.github.io/repo-name/)
  base: '/islamqa/',

  // Build output goes to dist/ for web deployment
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    // Optimize for production (using default esbuild minifier)
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'search': ['fuse.js']
        }
      }
    }
  },

  // Path aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, './src/assets'),
      '@components': resolve(__dirname, './src/components'),
      '@views': resolve(__dirname, './src/views'),
      '@services': resolve(__dirname, './src/services'),
      '@stores': resolve(__dirname, './src/stores'),
      '@utils': resolve(__dirname, './src/utils')
    }
  },

  // Development server configuration
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: true
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'fuse.js']
  }
})
