import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Load environment variables
const DFX_NETWORK = process.env.DFX_NETWORK || 'local';
const LOCAL_REPLICA_HOST = 'http://127.0.0.1:4943';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      DFX_NETWORK: JSON.stringify(DFX_NETWORK),
      VITE_LOGIN_CANISTER_ID: JSON.stringify(process.env.CANISTER_ID_LOGIN_BACKEND),
      VITE_INTERNET_IDENTITY_CANISTER_ID: JSON.stringify(process.env.CANISTER_ID_INTERNET_IDENTITY),
    },
    global: 'globalThis',
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Add this for declarations
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
      // Proxy all /api calls to local replica
      '/api': {
        target: LOCAL_REPLICA_HOST,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      },
      // Add this for Internet Identity local development
      '/internet-identity': {
        target: `${LOCAL_REPLICA_HOST}/internet-identity`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/internet-identity/, ''),
        secure: false
      }
    }
  }
});