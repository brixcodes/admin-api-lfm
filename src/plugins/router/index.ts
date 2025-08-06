import { requireAuth } from '@/utils/authGuard'
import type { App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Middleware de protection des routes
router.beforeEach(requireAuth)

export default function (app: App) {
  app.use(router)
}

export { router }
