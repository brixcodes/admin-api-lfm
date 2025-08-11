import { ref } from 'vue'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timeout?: number
  show: boolean
}

const notifications = ref<Notification[]>([])

export function useNotifications() {
  
  const addNotification = (notification: Omit<Notification, 'id' | 'show'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    const newNotification: Notification = {
      id,
      show: true,
      timeout: 5000,
      ...notification,
    }
    
    notifications.value.push(newNotification)
    
    // Auto-remove après timeout
    if (newNotification.timeout && newNotification.timeout > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.timeout)
    }
    
    return id
  }
  
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearAll = () => {
    notifications.value = []
  }
  
  // Méthodes de convenance
  const success = (title: string, message?: string, timeout?: number) => {
    return addNotification({ type: 'success', title, message, timeout })
  }
  
  const error = (title: string, message?: string, timeout?: number) => {
    return addNotification({ type: 'error', title, message, timeout })
  }
  
  const warning = (title: string, message?: string, timeout?: number) => {
    return addNotification({ type: 'warning', title, message, timeout })
  }
  
  const info = (title: string, message?: string, timeout?: number) => {
    return addNotification({ type: 'info', title, message, timeout })
  }
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  }
}

// Instance globale pour partager entre composants
const globalNotifications = useNotifications()

export const useGlobalNotifications = () => globalNotifications
