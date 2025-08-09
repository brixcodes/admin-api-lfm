<script setup lang="ts">
import { computed } from 'vue'
import type { Role } from '@/utils/types/models'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ roles: Role[]; loading?: boolean }>()
const { t } = useI18n()

const totalRoles = computed(() => props.roles.length)
const withUsers = computed(() => props.roles.filter(r => (r as any).user_count && (r as any).user_count! > 0).length)
const withoutUsers = computed(() => totalRoles.value - withUsers.value)
const totalUsers = computed(() => props.roles.reduce((acc, r: any) => acc + (r.user_count || 0), 0))

const cards = computed(() => [
  { title: t('system.roles.stats.total_roles'), value: totalRoles.value.toLocaleString(), subtitle: t('system.roles.stats.last_week'), icon: 'ri-shield-keyhole-line', color: 'secondary' },
  { title: t('system.roles.stats.with_users'), value: withUsers.value.toLocaleString(), subtitle: t('system.roles.stats.last_week'), icon: 'ri-user-follow-line', color: 'success' },
  { title: t('system.roles.stats.total_users'), value: totalUsers.value.toLocaleString(), subtitle: t('system.roles.stats.last_week'), icon: 'ri-user-3-line', color: 'info' },
  { title: t('system.roles.stats.without_users'), value: withoutUsers.value.toLocaleString(), subtitle: t('system.roles.stats.last_week'), icon: 'ri-user-shared-line', color: 'warning' },
])
</script>

<template>
  <VRow class="match-height">
    <VCol v-for="c in cards" :key="c.title" cols="12" sm="6" md="3">
      <VCard :loading="loading">
        <VCardItem>
          <div class="d-flex align-center justify-space-between w-100">
            <div>
              <div class="text-subtitle-2 text-medium-emphasis">{{ c.title }}</div>
              <div class="text-h5 font-weight-semibold mt-1">{{ c.value }}</div>
              <div class="text-caption text-disabled">{{ c.subtitle }}</div>
            </div>
            <VAvatar size="40" :color="c.color" variant="tonal">
              <VIcon :icon="c.icon" />
            </VAvatar>
          </div>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>

