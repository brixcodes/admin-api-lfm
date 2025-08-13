<template>
  <VSnackbar
    v-model="isVisible"
    :color="color"
    :timeout="timeout"
    location="top right"
    variant="elevated"
    class="notification-toast"
  >
    <div class="d-flex align-center">
      <VIcon :icon="icon" class="me-3" />
      <div>
        <div class="text-subtitle-2 font-weight-medium">{{ title }}</div>
        <div v-if="message" class="text-body-2">{{ message }}</div>
      </div>
    </div>

    <template #actions>
      <VBtn
        icon="ri-close-line"
        variant="text"
        size="small"
        @click="isVisible = false"
      />
    </template>
  </VSnackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timeout?: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  timeout: 5000
})

const emit = defineEmits<Emits>()

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const color = computed(() => {
  switch (props.type) {
    case 'success': return 'success'
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return 'success'
  }
})

const icon = computed(() => {
  switch (props.type) {
    case 'success': return 'ri-check-circle-line'
    case 'error': return 'ri-error-warning-line'
    case 'warning': return 'ri-alert-line'
    case 'info': return 'ri-information-line'
    default: return 'ri-check-circle-line'
  }
})
</script>

<style scoped>
.notification-toast {
  z-index: 9999;
}
</style>
