<template>
  <div class="rich-text-editor">
    <!-- Barre d'outils -->
    <VCard variant="outlined" class="toolbar-card mb-2">
      <VCardText class="pa-2">
        <div class="d-flex flex-wrap gap-1">
          <!-- Formatage de base -->
          <VBtnGroup variant="outlined" density="compact">
            <VBtn
              size="small"
              icon="ri-bold"
              :color="isActive('bold') ? 'primary' : 'default'"
              @click="toggleFormat('bold')"
              title="Gras"
            />
            <VBtn
              size="small"
              icon="ri-italic"
              :color="isActive('italic') ? 'primary' : 'default'"
              @click="toggleFormat('italic')"
              title="Italique"
            />
            <VBtn
              size="small"
              icon="ri-underline"
              :color="isActive('underline') ? 'primary' : 'default'"
              @click="toggleFormat('underline')"
              title="Souligné"
            />
          </VBtnGroup>

          <VDivider vertical class="mx-1" />

          <!-- Titres -->
          <VSelect
            v-model="selectedHeading"
            :items="headingOptions"
            variant="outlined"
            density="compact"
            style="width: 120px"
            hide-details
            @update:model-value="applyHeading"
          />

          <VDivider vertical class="mx-1" />

          <!-- Listes -->
          <VBtnGroup variant="outlined" density="compact">
            <VBtn
              size="small"
              icon="ri-list-unordered"
              :color="isActive('insertUnorderedList') ? 'primary' : 'default'"
              @click="toggleFormat('insertUnorderedList')"
              title="Liste à puces"
            />
            <VBtn
              size="small"
              icon="ri-list-ordered"
              :color="isActive('insertOrderedList') ? 'primary' : 'default'"
              @click="toggleFormat('insertOrderedList')"
              title="Liste numérotée"
            />
          </VBtnGroup>

          <VDivider vertical class="mx-1" />

          <!-- Actions -->
          <VBtnGroup variant="outlined" density="compact">
            <VBtn
              size="small"
              icon="ri-code-view"
              :color="showHtml ? 'primary' : 'default'"
              @click="toggleHtmlView"
              title="Voir le HTML"
            />
            <VBtn
              size="small"
              icon="ri-delete-bin-line"
              @click="clearContent"
              title="Effacer tout"
            />
          </VBtnGroup>
        </div>
      </VCardText>
    </VCard>

    <!-- Éditeur -->
    <VCard variant="outlined" class="editor-card">
      <div
        v-show="!showHtml"
        ref="editorRef"
        class="rich-editor"
        contenteditable="true"
        @input="onInput"
        @paste="onPaste"
        @keydown="onKeydown"
      />
      
      <VTextarea
        v-show="showHtml"
        :model-value="modelValue"
        @update:model-value="updateValue"
        variant="plain"
        rows="15"
        class="html-editor"
        placeholder="Code HTML..."
        hide-details
      />
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  modelValue: string
  showPreview?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  showPreview: false,
})

const emit = defineEmits<Emits>()

// Refs
const editorRef = ref<HTMLElement>()
const showHtml = ref(false)

// Options pour les titres
const headingOptions = [
  { title: 'Paragraphe', value: 'p' },
  { title: 'Titre 1', value: 'h1' },
  { title: 'Titre 2', value: 'h2' },
  { title: 'Titre 3', value: 'h3' },
  { title: 'Titre 4', value: 'h4' },
  { title: 'Titre 5', value: 'h5' },
  { title: 'Titre 6', value: 'h6' },
]

const selectedHeading = ref('p')

// Méthodes utilitaires
const updateValue = (value: string) => {
  emit('update:modelValue', value)
}

// Méthodes de formatage
const toggleFormat = (command: string) => {
  document.execCommand(command, false)
  editorRef.value?.focus()
}

const isActive = (command: string): boolean => {
  return document.queryCommandState(command)
}

const applyHeading = (tag: string) => {
  if (tag === 'p') {
    document.execCommand('formatBlock', false, 'div')
  } else {
    document.execCommand('formatBlock', false, tag)
  }
  editorRef.value?.focus()
}

const toggleHtmlView = () => {
  showHtml.value = !showHtml.value
}

const clearContent = () => {
  if (window.confirm('Êtes-vous sûr de vouloir effacer tout le contenu ?')) {
    if (editorRef.value) {
      editorRef.value.innerHTML = ''
    }
    updateValue('')
  }
}

// Gestion des événements - approche simple
const onInput = () => {
  if (editorRef.value) {
    updateValue(editorRef.value.innerHTML)
  }
}

const onPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const text = event.clipboardData?.getData('text/plain') || ''
  
  // Insérer le texte à la position du curseur
  const selection = window.getSelection()
  if (selection?.rangeCount) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(document.createTextNode(text))
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
    
    // Déclencher la mise à jour
    onInput()
  }
}

const onKeydown = (event: KeyboardEvent) => {
  // Raccourcis clavier
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        toggleFormat('bold')
        break
      case 'i':
        event.preventDefault()
        toggleFormat('italic')
        break
      case 'u':
        event.preventDefault()
        toggleFormat('underline')
        break
    }
  }
}

// Initialiser le contenu une seule fois
onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
  }
})
</script>

<style scoped>
.rich-text-editor {
  width: 100%;
}

.toolbar-card {
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.editor-card {
  border-radius: 0 0 8px 8px;
  min-height: 300px;
}

.rich-editor {
  min-height: 300px;
  padding: 16px;
  outline: none;
  line-height: 1.6;
  font-family: inherit;
}

.rich-editor:focus {
  outline: none;
}

.html-editor {
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

/* Styles pour le contenu de l'éditeur */
.rich-editor h1 {
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0;
  color: rgb(var(--v-theme-primary));
}

.rich-editor h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.8rem 0;
  color: rgb(var(--v-theme-primary));
}

.rich-editor h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.6rem 0;
}

.rich-editor p {
  margin: 0.5rem 0;
}

.rich-editor ul,
.rich-editor ol {
  margin: 0.5rem 0;
  padding-left: 2rem;
}
</style>
