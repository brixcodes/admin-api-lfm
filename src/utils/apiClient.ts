import $api from './api'

export type Query = Record<string, any>

function buildQS(query?: Query) {
  if (!query) return ''
  const q = new URLSearchParams()
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (Array.isArray(v)) v.forEach(val => q.append(k, String(val)))
    else q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const apiClient = {
  get: async <T>(url: string, query?: Query): Promise<T> => {
    const { data } = await $api.get<T>(`${url}${buildQS(query)}`)
    return data
  },
  post: async <T, B = any>(url: string, body?: B, query?: Query): Promise<T> => {
    const { data } = await $api.post<T>(`${url}${buildQS(query)}`, body)
    return data
  },
  put: async <T, B = any>(url: string, body?: B, query?: Query): Promise<T> => {
    const { data } = await $api.put<T>(`${url}${buildQS(query)}`, body)
    return data
  },
  patch: async <T, B = any>(url: string, body?: B, query?: Query): Promise<T> => {
    const { data } = await $api.patch<T>(`${url}${buildQS(query)}`, body)
    return data
  },
  delete: async <T>(url: string, query?: Query): Promise<T> => {
    const { data } = await $api.delete<T>(`${url}${buildQS(query)}`)
    return data
  },
}

export default apiClient

