// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';

const site = process.env.PUBLIC_SITE_URL || 'https://yashelectronics.in';

// Vercel sets VERCEL=1 during deploy builds. Use the Vercel adapter there.
// On Windows locally, @astrojs/vercel symlinks pnpm deps and fails with EPERM
// unless Developer Mode is enabled — use the Node adapter for local builds instead.
const isVercelBuild = process.env.VERCEL === '1';

// https://astro.build/config
export default defineConfig({
  site,
  adapter: isVercelBuild
    ? vercel({ entrypointResolution: 'auto' })
    : node({ mode: 'standalone' }),
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
