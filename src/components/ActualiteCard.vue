<script setup lang="ts">
import { computed } from 'vue'
import type { Actualite } from '@/composables/useActualites'

interface Props {
  actualite: Actualite
  featured?: boolean
  variant?: 'elevated' | 'outlined' | 'text' | 'tonal' | 'plain'
  size?: 'small' | 'medium' | 'large'
  showActions?: boolean
}

interface Emits {
  (e: 'click', actualite: Actualite): void
  (e: 'edit', actualite: Actualite): void
  (e: 'delete', actualite: Actualite): void
  (e: 'share', actualite: Actualite): void
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
  variant: 'outlined',
  size: 'medium',
  showActions: true,
})

defineEmits<Emits>()

// Computed pour les tailles
const imageHeight = computed(() => {
  if (props.featured)
    return 200

  return props.size === 'large' ? 200 : props.size === 'small' ? 140 : 180
})

const placeholderIconSize = computed(() => {
  return props.size === 'large' ? 64 : props.size === 'small' ? 32 : 48
})

const metaIconSize = computed(() => {
  return props.size === 'large' ? 16 : 14
})

const contentPadding = computed(() => {
  return props.size === 'large' ? 'pa-4' : 'pa-3'
})

const actionsPadding = computed(() => {
  return props.size === 'large' ? 'pa-4 pt-0' : 'pa-3 pt-0'
})

const titleClass = computed(() => {
  const base = 'font-weight-bold mb-2 text-high-emphasis line-clamp-2'

  return props.size === 'large' ? `text-h6 ${base}` : `text-subtitle-1 ${base}`
})

const descriptionClass = computed(() => {
  return 'text-body-2 text-medium-emphasis mb-3 line-clamp-3'
})

// Méthodes
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getCategorieColor = (categorie: string) => {
  const colors: Record<string, string> = {
    Formation: 'primary',
    Partenariat: 'success',
    Événement: 'warning',
    Témoignage: 'info',
    Projet: 'secondary',
    Certification: 'error',
    Communication: 'purple',
  }

  return colors[categorie] || 'default'
}

const getImageUrl = (actualite: Actualite) => {
  return actualite.image_url || `https://picsum.photos/400/250?random=${actualite.id}`
}
</script>

<template>
  <VCard class="actualite-card h-100" :variant="variant" hover @click="$emit('click', actualite)">
    <div class="position-relative">
      <VImg :src="getImageUrl(actualite)" :height="imageHeight" cover class="card-image">
        <template #placeholder>
          <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
            <VIcon icon="ri-image-line" :size="placeholderIconSize" class="text-disabled" />
          </div>
        </template>
      </VImg>

      <!-- Badge catégorie -->
      <VChip :color="getCategorieColor(actualite.categorie)" size="small" class="category-badge-small">
        {{ actualite.categorie }}
      </VChip>

      <!-- Badge featured si applicable -->
      <VChip v-if="featured" color="primary" size="small" class="featured-badge" prepend-icon="ri-star-fill">
        À la une
      </VChip>

      <!-- Actions -->
      <div class="card-actions">
        <VBtn icon size="small" variant="elevated" color="primary" @click.stop="$emit('edit', actualite)">
          <VIcon icon="ri-edit-line" />
        </VBtn>
        <VBtn icon size="small" variant="elevated" color="error" @click.stop="$emit('delete', actualite)">
          <VIcon icon="ri-delete-bin-line" />
        </VBtn>
      </div>
    </div>

    <VCardText :class="contentPadding">
      <div class="d-flex align-center mb-2">
        <VIcon icon="ri-calendar-line" :size="metaIconSize" class="me-1 text-disabled" />
        <span class="text-caption text-disabled">{{ formatDate(actualite.date_publication) }}</span>
        <VSpacer />
      </div>

      <h4 :class="titleClass">
        {{ actualite.titre }}
      </h4>

      <p :class="descriptionClass">
        {{ actualite.chapeau }}
      </p>
    </VCardText>

    <VCardActions v-if="showActions" :class="actionsPadding">
      <VBtn variant="text" color="primary" size="small" append-icon="ri-arrow-right-line" class="text-none"
        @click.stop="$emit('click', actualite)">
        Lire la suite
      </VBtn>
      <VSpacer />
      <VBtn icon variant="text" size="small" color="grey" @click.stop="$emit('share', actualite)">
        <VIcon icon="ri-share-line" />
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<style scoped>
.actualite-card {
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.actualite-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 10%);
  transform: translateY(-2px);
}

.card-image {
  border-radius: 12px 12px 0 0;
}

.category-badge-small {
  position: absolute;
  z-index: 2;
  inset-block-start: 8px;
  inset-inline-end: 8px;
}

.featured-badge {
  position: absolute;
  z-index: 2;
  inset-block-start: 12px;
  inset-inline-start: 12px;
}

.card-actions {
  position: absolute;
  display: flex;
  gap: 8px;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  opacity: 0;
  transform: translate(-50%, -50%);
  transition: opacity 0.3s ease;
}

.actualite-card:hover .card-actions {
  opacity: 1;
}

.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.line-clamp-3 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

/* Responsive */
@media (max-width: 960px) {
  .card-actions {
    opacity: 1;
    /* Toujours visible sur mobile */
  }
}
</style>
