import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on the current mode (development, production)
  // This is the standard Vite way to handle environment variables.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    
    // Corrected define block
    define: {
      // Expose DFX_NETWORK to the application
      'process.env.DFX_NETWORK': JSON.stringify(env.DFX_NETWORK),
      // Expose your canister IDs to the frontend code
      'import.meta.env.VITE_LOGIN_CANISTER_ID': JSON.stringify(env.CANISTER_ID_LOGIN_BACKEND),
      'import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID': JSON.stringify(env.CANISTER_ID_INTERNET_IDENTITY),
      global: 'globalThis',
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@declarations': path.resolve(__dirname, './src/declarations')
      }
    },
    
    optimizeDeps: {
      include: [
        '@dfinity/agent',
        '@dfinity/auth-client',
        '@dfinity/principal',
        '@dfinity/candid'
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    },
    
    server: {
      host: 'localhost',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:4943',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false
        },
      }
    }
  };
});