<script setup lang="ts">
</script>

<template>
  <VRow>
    <VCol cols="12" md="6">
      <VCard>
        <VCardItem>
          <template #prepend>
            <VAvatar color="primary" variant="tonal" size="40"><VIcon icon="ri-folder-3-line"/></VAvatar>
          </template>
          <VCardTitle>Navigation</VCardTitle>
          <template #append>
            <VBtn icon="ri-arrow-right-line" variant="text" />
          </template>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12" md="6">
      <VCard>
        <VCardItem>
          <template #prepend>
            <VAvatar color="secondary" variant="tonal" size="40"><VIcon icon="ri-user-3-line"/></VAvatar>
          </template>
          <VCardTitle>Users</VCardTitle>
          <template #append>
            <VBtn icon="ri-arrow-right-line" variant="text" />
          </template>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>

