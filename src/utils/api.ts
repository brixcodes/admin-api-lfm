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
    const msg = err?.response?.data?.detail || err?.message || 'Erreur réseau'
    return Promise.reject({
      message: msg,
      status: err?.response?.status,
      data: err?.response?.data,
    })
  },
)

export default $api

