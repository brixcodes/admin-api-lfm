<script setup lang="ts">
interface Props {
  chips?: number
}

const props = withDefaults(defineProps<Props>(), {
  chips: 6
})
</script>

<template>
  <div class="pa-4">
    <!-- Search field skeleton -->
    <VSkeletonLoader 
      type="text" 
      width="100%" 
      height="56"
      class="mb-4" 
    />
    
    <!-- Permission chips skeleton -->
    <div class="d-flex flex-wrap gap-2">
      <VSkeletonLoader 
        v-for="i in props.chips" 
        :key="i"
        type="chip" 
        :width="Math.floor(Math.random() * 80) + 100"
        class="mb-2" 
      />
    </div>
    
    <!-- Loading text -->
    <div class="text-center mt-4">
      <VSkeletonLoader 
        type="text" 
        width="200"
        class="mx-auto" 
      />
    </div>
  </div>
</template>
