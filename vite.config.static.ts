import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Static site build configuration for Supabase-only deployment
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    })
  ],
  root: 'client',
  build: {
    outDir: '../dist-static',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'client/index-static.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@components': path.resolve(__dirname, 'client/src/components'),
      '@lib': path.resolve(__dirname, 'client/src/lib'),
      '@pages': path.resolve(__dirname, 'client/src/pages'),
      '@hooks': path.resolve(__dirname, 'client/src/hooks'),
      '@contexts': path.resolve(__dirname, 'client/src/contexts'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
      '@db': path.resolve(__dirname, 'db')
    }
  },
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'react',
      'react-dom',
      'wouter'
    ]
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    '__DEV__': false
  },
  esbuild: {
    jsx: 'automatic',
    jsxFactory: undefined,
    jsxFragment: undefined,
    jsxInject: undefined
  }
});