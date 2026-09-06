import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Vercel only runs files under /api as serverless functions once deployed
// (or via `vercel dev`). Plain `vite`/`vite dev` has no idea they exist, so
// without this, any fetch to /api/* 404s with an empty body locally.
// This middleware runs those handlers directly inside the Vite dev server.
function vercelApiDevMiddleware() {
  return {
    name: 'vercel-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next()

        const routeName = req.url.split('?')[0].replace(/^\/api\//, '')
        const modulePath = path.join(__dirname, 'api', `${routeName}.js`)

        let handlerModule
        try {
          handlerModule = await server.ssrLoadModule(modulePath)
        } catch {
          return next()
        }

        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const rawBody = Buffer.concat(chunks).toString()
        req.body = rawBody ? JSON.parse(rawBody) : {}

        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
          return res
        }

        try {
          await handlerModule.default(req, res)
        } catch (err) {
          if (!res.headersSent) {
            res.status(500).json({ error: err.message || 'Internal server error' })
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite only exposes VITE_-prefixed vars via import.meta.env to client code.
  // The admin API handler reads unprefixed vars (e.g. SUPABASE_SERVICE_ROLE_KEY)
  // via process.env, so bridge everything from .env.local into process.env too.
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), vercelApiDevMiddleware()],
  }
})
