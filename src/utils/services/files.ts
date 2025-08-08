import $api from '../api';

export interface UploadResult { url: string; path: string; filename?: string }

export const FilesApi = {
  // Upload d’un fichier
  async upload(form: FormData) {
    const { data } = await $api.post<UploadResult>('/files/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // Upload multiple
  async uploadMultiple(forms: FormData) {
    const { data } = await $api.post<UploadResult[]>('/files/upload-multiple', forms, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // Liste par type (document, image, audio, video)
  async list(file_type: 'document' | 'image' | 'audio' | 'video' = 'document') {
    const { data } = await $api.get<any[]>('/files/list', { params: { file_type } })
    return data
  },

  // Supprimer par URL complète + type
  async deleteByUrl(file_url: string, file_type: 'document' | 'image' | 'audio' | 'video') {
    const { data } = await $api.delete<string>('/files/delete', { params: { file_url, file_type } as any })
    return data
  },

  // Supprimer par filename + type
  async deleteByFilename(filename: string, file_type: 'document' | 'image' | 'audio' | 'video') {
    const { data } = await $api.delete<string>('/files/delete-by-filename', { params: { filename, file_type } as any })
    return data
  },

  // Supprimer plusieurs par URLs + type
  async deleteMultipleByUrls(file_urls: string[], file_type: 'document' | 'image' | 'audio' | 'video') {
    const { data } = await $api.delete<string[]>('/files/delete-multiple', { params: { file_urls, file_type } as any })
    return data
  },
}

