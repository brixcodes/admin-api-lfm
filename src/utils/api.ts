import axios from 'axios'
import { authService } from './auth'

const baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://lafaom-mao.vertex-cam.com')

export const $api = axios.create({
  baseURL,
  headers: { 'Accept': 'application/json' },
  withCredentials: false,
})

// Attach token automatically
$api.interceptors.request.use(config => {
  const token = authService.getToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Basic error normalization
$api.interceptors.response.use(
  res => res,
  err => {
    const status = err?.response?.status
    const msg = err?.response?.data?.detail || err?.message || 'Erreur réseau'
    const normalized = {
      message: msg,
      status,
      data: err?.response?.data,
    }

    // Light 401 handling to keep app state coherent
    try {
      if (status === 401) {
        const hadToken = !!authService.getToken()
        if (hadToken) {
          localStorage.removeItem('authToken')
          // Optionally redirect to login on auth loss
          const current = window.location.pathname
          if (!current.includes('/login')) {
            // Preserve intended route for after login
            localStorage.setItem('redirectAfterLogin', current)
            window.location.assign('/login')
          }
        }
      }
    } catch {}

    return Promise.reject(normalized)
  },
)

export default $api

