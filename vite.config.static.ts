import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Static build configuration for deployment without Express server
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@db": path.resolve(import.meta.dirname, "db"),
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query': ['@tanstack/react-query'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    },
    target: 'es2020'
  },
  define: {
    // Ensure environment variables are available in static build
    __DEV__: false,
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  // Optimize for static deployment
  base: './',
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
});