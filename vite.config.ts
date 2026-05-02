import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Tell esbuild to target modern browsers — skips unnecessary transforms
    esbuild: {
      target: 'esnext',
    },
    // Pre-bundle heavy deps so they don't get re-processed on every cold start
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
        'firebase/analytics',
        'motion/react',
        'sonner',
        'lucide-react',
        'clsx',
        'tailwind-merge',
      ],
      // @google/genai is lazy-imported — exclude from eager pre-bundling
      exclude: ['@google/genai'],
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      // Pre-transform these files the moment the dev server starts,
      // so the first browser request doesn't pay the compilation cost
      warmup: {
        clientFiles: [
          './src/main.tsx',
          './src/App.tsx',
          './src/components/Header.tsx',
          './src/components/Footer.tsx',
          './src/contexts/AuthContext.tsx',
          './src/contexts/CartContext.tsx',
          './src/pages/Home.tsx',
          './src/pages/Shop.tsx',
        ],
      },
    },
  };
});
