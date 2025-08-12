import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from 'rollup-plugin-visualizer';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
    visualizer({
      open: true, // Automatically opens the report in browser
      gzipSize: true, // Shows gzip-size
      brotliSize: true, // Shows brotli-size
      filename: 'bundle-analysis.html' // Output filename
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor modules into separate chunks
          react: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          // Add other large dependencies here
        }
      }
    }
  }


});
