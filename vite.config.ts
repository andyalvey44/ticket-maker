import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * In production the file in `api/` is a serverless function. During `npm run
 * dev` there is no serverless runtime, so the same handler is mounted here —
 * one implementation, the same behaviour in both places.
 */
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server: ViteDevServer) {
      // `/app` is served by app.html, both here and on the host.
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/app' || req.url === '/app/') req.url = '/app.html'
        next()
      })

      server.middlewares.use('/api/shows', async (req, res, next) => {
        try {
          const module = await server.ssrLoadModule('/api/shows.ts')
          await module.default(req, res)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApi()],
  build: {
    rollupOptions: {
      // Two pages: the public front door, and the tool itself.
      input: { home: 'index.html', app: 'app.html' },
    },
  },
})
