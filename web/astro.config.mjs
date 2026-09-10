import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

//
// Astro V4 SPA — server is the source of truth, the Astro app is a thin
// Universal (SSR + SPA shell) renderer that talks to a Node server which in
// turn calls the Rust/SQLite REST boundary. Output `hybrid` keeps every route
// SSR-routable while `/` remains an interactive SPA after login.
//
export default defineConfig({
  output: 'hybrid',
  // `never`: basename routing, so `/` and `/index.xxx` stay literal.
  trailingSlash: 'never',
  treeshake: true,
  // @astrojs/react preset: wires the React + JSX runtime into the build.
  preset: 'astro-react',
  // SPA: the entry-client.ts bundle IS the client entry (imports react/jsx).
  vite: {
    // Vite 5 + @astrojs/react — no preset-specific Vite keys for Astro 4.
  },
});
