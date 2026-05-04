import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteOrigin = (env.VITE_SITE_ORIGIN || '').trim().replace(/\/$/, '')

  return {
    plugins: [
      react(),
      {
        name: 'inject-site-origin-for-seo',
        transformIndexHtml(html: string) {
          return html.replace(/%SITE_ORIGIN%/g, siteOrigin)
        },
      },
    ],
  }
})
