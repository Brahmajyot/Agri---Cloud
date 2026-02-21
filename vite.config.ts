import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Split large vendor chunks so browsers can cache them separately
    rollupOptions: {
      output: {
        manualChunks: {
          // Clerk auth SDK is large — keep it in its own chunk
          clerk: ['@clerk/clerk-react'],
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI icons — lucide can be heavy
          lucide: ['lucide-react'],
        },
      },
    },
    // Increase chunk warning threshold slightly (default 500kB)
    chunkSizeWarningLimit: 700,
  },
})
