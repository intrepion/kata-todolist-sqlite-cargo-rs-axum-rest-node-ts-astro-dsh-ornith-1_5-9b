import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // The Astro V4 SPA preset (`preset: 'astro-react'`) drives the SPA entry via
  // `astro.config.mjs`. This file supplies the React + JSX Vite plugin and
  // makes the Vite dev server usable as a Node server for the Universal build.
  plugins: [
    react({
      injectStyles: true,
    }),
    // Astro V4 SPA: a Node server runs `vite-node` in a child so fetch, Web
    // Sockets and other Node APIs are available to the Universal build.
    {
      name: 'astro-4-spa-node-server',
      configureServer(server) {
        server.config.nodeIntegration = true;
      },
    },
  ],
});
