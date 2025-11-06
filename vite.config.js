import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  // Build output goes to www/ for Cordova
  build: {
    outDir: 'www',
    emptyOutDir: false, // Don't delete cordova.js and other Cordova files
    rollupOptions: {
      output: {
        // Don't hash filenames for easier Cordova integration
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
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
    // Allow access from device for testing
    cors: true
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'fuse.js']
  }
})
