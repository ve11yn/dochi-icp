import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on the current mode (development, production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
    ],

    // Corrected resolve.alias block
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@declarations': path.resolve(__dirname, '../declarations'),
        // Explicitly point to the DFINITY packages to solve resolution errors
        '@dfinity/agent': path.resolve(__dirname, 'node_modules/@dfinity/agent'),
        '@dfinity/auth-client': path.resolve(__dirname, 'node_modules/@dfinity/auth-client'),
        '@dfinity/candid': path.resolve(__dirname, 'node_modules/@dfinity/candid'),
        '@dfinity/principal': path.resolve(__dirname, 'node_modules/@dfinity/principal'),
      }
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react',
              'react-router-dom',
              'react-dom',
              '@dfinity/agent',
              '@dfinity/auth-client',
              '@dfinity/candid',
              '@dfinity/principal',
            ],
          },
        },
      },
    },

    define: {
      // Expose DFX_NETWORK to the application
      'process.env.DFX_NETWORK': JSON.stringify(env.DFX_NETWORK),
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Expose all canister IDs to the frontend code
      'process.env.CANISTER_ID_LOGIN_BACKEND': JSON.stringify(env.CANISTER_ID_LOGIN_BACKEND),
      'process.env.CANISTER_ID_INTERNET_IDENTITY': JSON.stringify(env.CANISTER_ID_INTERNET_IDENTITY),
      'process.env.CANISTER_ID_CALENDAR_BACKEND': JSON.stringify(env.CANISTER_ID_CALENDAR_BACKEND),
      'process.env.CANISTER_ID_FOCUS_BACKEND': JSON.stringify(env.CANISTER_ID_FOCUS_BACKEND),
      'process.env.CANISTER_ID_TODO_BACKEND': JSON.stringify(env.CANISTER_ID_TODO_BACKEND),
      'process.env.CANISTER_ID_DOCHI_BACKEND': JSON.stringify(env.CANISTER_ID_DOCHI_BACKEND),
      global: 'globalThis',
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
          secure: false
        },
      }
    }
  };
});