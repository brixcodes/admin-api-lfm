<script setup lang="ts">
import { useUserProfile } from '@/composables/useUserProfile'
import { useAuth } from '@/utils/auth'
import avatar1 from '@images/avatars/avatar-1.png'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const { user, isLoading, error, fetchUserProfile, clearUserProfile } = useUserProfile()
const { logout, isLoading: isLoggingOut } = useAuth()
const router = useRouter()

// État pour la boîte de dialogue de confirmation
const showLogoutDialog = ref(false)

// Fonction pour afficher la confirmation de déconnexion
const confirmLogout = () => {
  showLogoutDialog.value = true
}

// Fonction de déconnexion
const handleLogout = async () => {
  showLogoutDialog.value = false

  try {
    await logout()
    // Nettoyer les données utilisateur du composable
    clearUserProfile()
    // Rediriger vers la page de connexion
    await router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    // Redirection forcée vers la page de connexion même en cas d'erreur
    await router.push('/login')
  }
}

// Charger les données utilisateur au montage
onMounted(async () => {
  await fetchUserProfile()
})
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
    bordered
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <VImg :src="avatar1" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <VImg :src="avatar1" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              <span v-if="isLoading">{{ t('common.loading') }}...</span>
              <span v-else-if="error">{{ t('common.error') }}</span>
              <span v-else>{{ user?.prenom }} {{ user?.nom }}</span>
            </VListItemTitle>
            <VListItemSubtitle>
              <span v-if="!isLoading && !error">{{ user?.role?.nom }}</span>
            </VListItemSubtitle>
          </VListItem>
          <VDivider class="my-2" />

          <!-- 👉 Profile -->
          <VListItem to="/profil">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-user-line"
                size="22"
              />
            </template>

            <VListItemTitle>{{ $t('userProfile.profile') }}</VListItemTitle>
          </VListItem>

          <!-- 👉 Settings -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-settings-4-line"
                size="22"
              />
            </template>

            <VListItemTitle>{{ $t('userProfile.settings') }}</VListItemTitle>
          </VListItem>

          <!-- 👉 Pricing -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-money-dollar-circle-line"
                size="22"
              />
            </template>

            <VListItemTitle>{{ $t('userProfile.pricing') }}</VListItemTitle>
          </VListItem>

          <!-- 👉 FAQ -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-question-line"
                size="22"
              />
            </template>

            <VListItemTitle>{{ $t('userProfile.faq') }}</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem
            @click="confirmLogout"
            :disabled="isLoggingOut"
          >
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-logout-box-r-line"
                size="22"
              />
            </template>

            <VListItemTitle>
              {{ isLoggingOut ? $t('common.loading') : $t('userProfile.logout') }}
            </VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>

  <!-- 👉 Logout Confirmation Dialog -->
  <VDialog
    v-model="showLogoutDialog"
    max-width="400"
  >
    <VCard>
      <VCardTitle class="text-h6">
        {{ $t('userProfile.confirmLogout') }}
      </VCardTitle>

      <VCardText>
        {{ $t('userProfile.logoutMessage') }}
      </VCardText>

      <VCardActions>
        <VSpacer />

        <VBtn
          color="grey"
          variant="outlined"
          @click="showLogoutDialog = false"
          :disabled="isLoggingOut"
        >
          {{ $t('common.cancel') }}
        </VBtn>

        <VBtn
          color="error"
          @click="handleLogout"
          :loading="isLoggingOut"
          :disabled="isLoggingOut"
        >
          {{ $t('userProfile.logout') }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
