// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const PUBLIC_TURNSTILE_SITE_KEY =
  env.PUBLIC_TURNSTILE_SITE_KEY ?? process.env.PUBLIC_TURNSTILE_SITE_KEY ?? '';

console.log(
  `[astro.config] PUBLIC_TURNSTILE_SITE_KEY: ${
    PUBLIC_TURNSTILE_SITE_KEY ? `set (${PUBLIC_TURNSTILE_SITE_KEY.slice(0, 8)}...)` : 'EMPTY'
  }`
);

// https://astro.build/config
export default defineConfig({
  site: 'https://ivantsukev.com',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [
    tailwind(),
    sitemap(),
  ],
  vite: {
    define: {
      'import.meta.env.PUBLIC_TURNSTILE_SITE_KEY': JSON.stringify(PUBLIC_TURNSTILE_SITE_KEY),
    },
  },
});
