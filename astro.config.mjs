// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://ivantsukev.com',
  adapter: cloudflare(),
  integrations: [
    tailwind(),
    sitemap(),
  ],
});
