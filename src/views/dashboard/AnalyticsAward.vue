<script setup lang="ts">
import { ref, onMounted } from 'vue'
import wavingHand from '@images/misc/hello.png'

const welcome = {
  title: 'Bienvenue sur le tableau de bord ',
  message: `Bienvenue sur la plateforme LAFAOM-MAO.`,
  actionLabel: 'En savoir plus',
  link: '/apropos',
}

const user = ref({
  prenom: '',
  nom: '',
  role: { nom: '' },
  email: '',
})

onMounted(async () => {
  const token = localStorage.getItem('authToken')
  if (!token) return
  try {
    const response = await fetch(`http://localhost:8000/users/me?token=${token}`, {
      headers: {
        accept: 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json()
      user.value = data
    }
  } catch (error) {
    console.error('Erreur lors de la récupération utilisateur', error)
  }
})
</script>

<template>
  <VCard class="position-relative overflow-hidden">
    <VCardText>
      <div class="mb-2">
        <h5 class="text-h5">{{ welcome.title }}</h5>
        <div class="text-body-1 mb-3" style="white-space: pre-line;">{{ welcome.message }}</div>

        <!-- Affichage du nom complet + rôle comme dans ton exemple avatar/menu -->
        <h4 class="text-h4 text-primary">
          {{ user.prenom }} {{ user.nom }}
        </h4>
        <div class="text-body-1 mb-2">
          {{ user.role?.nom }}
        </div>

        <VBtn :to="welcome.link" color="primary" size="small">{{ welcome.actionLabel }}</VBtn>
      </div>
    </VCardText>

    <VImg :src="wavingHand" class="welcome-icon" />
  </VCard>
</template>

<style lang="scss" scoped>
.v-card .welcome-icon {
  position: absolute;
  width: 6rem;
  bottom: 1.25rem;
  right: 1.25rem;
  opacity: 0.8;
}
</style>
