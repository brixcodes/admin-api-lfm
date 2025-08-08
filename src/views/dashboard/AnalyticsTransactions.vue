<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const statistics = [
  {
    title: {
      fr: 'Apprenants',
      en: 'Students'
    },
    stats: '132',
    icon: 'ri-user-3-line',
    color: 'primary',
  },
  {
    title: {
      fr: 'Projets',
      en: 'Projects'
    },
    stats: '47',
    icon: 'ri-folder-line',
    color: 'warning',
  },
  {
    title: {
      fr: 'Articles',
      en: 'Articles'
    },
    stats: '89',
    icon: 'ri-article-line',
    color: 'success',
  },
  {
    title: {
      fr: 'Missions actives',
      en: 'Active Missions'
    },
    stats: '12',
    icon: 'ri-earth-line',
    color: 'info',
  },
]

const moreList = [
  { 
    title: {
      fr: 'Partager',
      en: 'Share'
    },
    value: 'Share'
  },
  {
    title: {
      fr: 'Rafraîchir',
      en: 'Refresh'
    },
    value: 'Refresh'
  },
  {
    title: {
      fr: 'Mettre à jour',
      en: 'Update'
    },
    value: 'Update'
  },
]
</script>

<template>
  <VCard :title="t('dashboard.statistics.title')">
    <template #subtitle>
      <p class="text-body-1 mb-0">
        <span class="d-inline-block font-weight-medium text-high-emphasis">
          {{ t('dashboard.statistics.subtitle') }}
        </span>
      </p>
    </template>

    <template #append>
      <MoreBtn :menu-list="moreList" />
    </template>

    <VCardText class="pt-10">
      <VRow>
        <VCol
          v-for="item in statistics"
          :key="item.title[locale]"
          cols="12"
          sm="6"
          md="3"
        >
          <div class="d-flex align-center gap-x-3">
            <VAvatar
              :color="item.color"
              rounded
              size="40"
              class="elevation-2"
            >
              <VIcon
                size="24"
                :icon="item.icon"
              />
            </VAvatar>

            <div class="d-flex flex-column">
              <div class="text-body-1">
                {{ item.title[locale] }}
              </div>
              <h5 class="text-h5">
                {{ item.stats }}
              </h5>
            </div>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
