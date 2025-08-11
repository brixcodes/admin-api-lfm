<template>
  <VSnackbar v-model="show" :color="color" :timeout="timeout" location="top right" variant="elevated"
    class="notification-toast">
    <div class="d-flex align-center">
      <VIcon :icon="icon" class="me-3" size="20" />
      <div class="flex-grow-1">
        <div class="text-subtitle-2 font-weight-medium">
          {{ title }}
        </div>
        <div v-if="message" class="text-body-2 opacity-90">
          {{ message }}
        </div>
      </div>
      <VBtn icon variant="text" size="small" @click="show = false">
        <VIcon icon="ri-close-line" />
      </VBtn>
    </div>
  </VSnackbar>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Props {
  modelValue: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timeout?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  timeout: 5000,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const show = ref(props.modelValue)

// Computed pour les couleurs et icônes
const color = computed(() => {
  switch (props.type) {
    case 'success': return 'success'
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return 'info'
  }
})

const icon = computed(() => {
  switch (props.type) {
    case 'success': return 'ri-check-circle-line'
    case 'error': return 'ri-error-warning-line'
    case 'warning': return 'ri-alert-line'
    case 'info': return 'ri-information-line'
    default: return 'ri-information-line'
  }
})

// Watchers
watch(() => props.modelValue, (newValue) => {
  show.value = newValue
})

watch(show, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>

<style scoped>
.notification-toast {
  z-index: 9999;
}

.notification-toast :deep(.v-snackbar__wrapper) {
  max-inline-size: 500px;
  min-inline-size: 300px;
}

.notification-toast :deep(.v-snackbar__content) {
  padding: 16px;
}
</style>
