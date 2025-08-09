<script setup lang="ts">
interface Props {
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  rows: 5
})
</script>

<template>
  <div class="pa-4">
    <div v-for="i in props.rows" :key="i" class="d-flex align-center py-3 border-b">
      <!-- Avatar skeleton -->
      <VSkeletonLoader 
        type="avatar" 
        size="38"
        class="me-3" 
      />
      
      <!-- User info skeleton -->
      <div class="flex-grow-1">
        <VSkeletonLoader 
          type="text" 
          width="180" 
          class="mb-1" 
        />
        <VSkeletonLoader 
          type="text" 
          width="220" 
          height="14"
        />
      </div>
      
      <!-- Role chip skeleton -->
      <VSkeletonLoader 
        type="chip" 
        width="80"
        class="me-3" 
      />
      
      <!-- Permissions chip skeleton -->
      <VSkeletonLoader 
        type="chip" 
        width="100"
        class="me-3" 
      />
      
      <!-- Status chip skeleton -->
      <VSkeletonLoader 
        type="chip" 
        width="60"
        class="me-3" 
      />
      
      <!-- Date skeleton -->
      <VSkeletonLoader 
        type="text" 
        width="80"
        class="me-3" 
      />
      
      <!-- Actions skeleton -->
      <div class="d-flex gap-1">
        <VSkeletonLoader 
          type="button" 
          width="32"
          height="32"
        />
        <VSkeletonLoader 
          type="button" 
          width="32"
          height="32"
        />
        <VSkeletonLoader 
          type="button" 
          width="32"
          height="32"
        />
        <VSkeletonLoader 
          type="button" 
          width="32"
          height="32"
        />
        <VSkeletonLoader 
          type="button" 
          width="32"
          height="32"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
