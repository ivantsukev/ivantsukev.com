// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://ivantsukev.com',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  redirects: {
    '/за-мен': { status: 301, destination: '/about/' },
  },
  integrations: [
    tailwind(),
    sitemap(),
  ],
});
