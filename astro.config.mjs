// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

const site = process.env.PUBLIC_SITE_URL || 'https://yashelectronics.in';

// https://astro.build/config
export default defineConfig({
  site,
  adapter: vercel({ entrypointResolution: 'auto' }),
  output: 'server',
  i18n: {
    defaultLocale: 'gu',
    locales: ['gu', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) => !page.includes('/api/') && !page.includes('/admin') && !page.includes('/account'),
    }),
  ],
  prefetch: {
    defaultStrategy: 'hover',
  },
  image: {
    domains: ['res.cloudinary.com'],
  },
});
