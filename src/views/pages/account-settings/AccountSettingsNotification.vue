<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const recentDevices = ref([
  {
    type: 'newForYou',
    email: true,
    browser: true,
    app: true,
  },
  {
    type: 'accountActivity',
    email: true,
    browser: true,
    app: true,
  },
  {
    type: 'newBrowserSignIn',
    email: true,
    browser: true,
    app: false,
  },
  {
    type: 'newDeviceLinked',
    email: true,
    browser: false,
    app: false,
  },
])

const selectedNotification = ref('onlyOnline')
</script>

<template>
  <VCard :title="$t('notifications.recentDevices')">
    <VCardText>
      {{ $t('notifications.permissionRequest') }}
      <a href="javascript:void(0)">{{ $t('notifications.requestPermission') }}</a>
    </VCardText>

    <VTable class="text-no-wrap">
      <thead>
        <tr>
          <th scope="col">
            {{ $t('notifications.type') }}
          </th>
          <th scope="col">
            {{ $t('notifications.email') }}
          </th>
          <th scope="col">
            {{ $t('notifications.browser') }}
          </th>
          <th scope="col">
            {{ $t('notifications.app') }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="device in recentDevices"
          :key="device.type"
        >
          <td>
            {{ $t(`notifications.types.${device.type}`) }}
          </td>
          <td>
            <VCheckbox v-model="device.email" />
          </td>
          <td>
            <VCheckbox v-model="device.browser" />
          </td>
          <td>
            <VCheckbox v-model="device.app" />
          </td>
        </tr>
      </tbody>
    </VTable>
    <VDivider />

    <VCardText>
      <VForm @submit.prevent="() => {}">
        <p class="text-base font-weight-medium">
          When should we send you notifications?
        </p>

        <VRow>
          <VCol
            cols="12"
            sm="6"
          >
            <VSelect
              v-model="selectedNotification"
              mandatory
              :items="['Only when I\'m online', 'Anytime']"
            />
          </VCol>
        </VRow>

        <div class="d-flex flex-wrap gap-4 mt-4">
          <VBtn type="submit">
            Save Changes
          </VBtn>
          <VBtn
            color="secondary"
            variant="outlined"
            type="reset"
          >
            Reset
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>
