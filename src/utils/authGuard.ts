import { authService } from './auth'

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

/**
 * Vérifier si une route est publique
 */
function isPublicRoute(path: string): boolean {
  return publicRoutes.includes(path)
}

/**
 * Vérifier si l'utilisateur est authentifié
 */
function isAuthenticated(): boolean {
  return authService.isAuthenticated()
}

/**
 * Middleware d'authentification pour Vue Router
 */
export function requireAuth(to: any, from: any, next: any) {
  // Si c'est une route publique
  if (isPublicRoute(to.path)) {
    // Si l'utilisateur est connecté et essaie d'accéder à login/register, le rediriger vers le dashboard
    if (isAuthenticated() && (to.path === '/login' || to.path === '/register')) {
      next('/dashboard')
      return
    }
    // Sinon, permettre l'accès
    next()
    return
  }

  // Si c'est une route protégée et l'utilisateur n'est pas connecté
  if (!isAuthenticated()) {
    // Stocker la route demandée pour redirection après connexion
    localStorage.setItem('redirectAfterLogin', to.fullPath)
    // Rediriger vers la page de connexion
    next('/login')
    return
  }

  // Si l'utilisateur est connecté et la route est protégée, permettre l'accès
  next()
}

/**
 * Obtenir la route de redirection après connexion
 */
export function getRedirectAfterLogin(): string {
  const redirectPath = localStorage.getItem('redirectAfterLogin')
  localStorage.removeItem('redirectAfterLogin')
  return redirectPath || '/dashboard'
}

/**
 * Valider le token et rediriger si invalide (optionnel)
 */
export async function validateTokenAndRedirect(router: any) {
  if (isAuthenticated()) {
    const isValid = await authService.validateToken()
    if (!isValid) {
      await authService.logout()
      router.push('/login')
    }
  }
} 
