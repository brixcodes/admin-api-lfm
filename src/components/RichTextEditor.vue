<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

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

// Variable pour éviter les boucles de mise à jour
let isUpdating = false

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
  if (tag === 'p')
    document.execCommand('formatBlock', false, 'div')
  else
    document.execCommand('formatBlock', false, tag)

  editorRef.value?.focus()
}

const toggleHtmlView = () => {
  showHtml.value = !showHtml.value
}

const clearContent = () => {
  if (window.confirm('Êtes-vous sûr de vouloir effacer tout le contenu ?')) {
    updateValue('')
    if (editorRef.value)
      editorRef.value.innerHTML = ''
  }
}

// Gestion des événements améliorée pour éviter les problèmes de curseur
const onInput = () => {
  if (isUpdating || !editorRef.value)
    return

  // Simplement mettre à jour la valeur sans toucher au curseur
  // Le navigateur gère naturellement la position du curseur
  updateValue(editorRef.value.innerHTML)
}

const onPaste = (event: ClipboardEvent) => {
  event.preventDefault()

  const text = event.clipboardData?.getData('text/plain') || ''

  // Insérer le texte proprement sans perturber le curseur
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

// Fonction pour sauvegarder la position du curseur
const saveCursorPosition = () => {
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount || !editorRef.value)
    return null

  const range = selection.getRangeAt(0)
  const preCaretRange = range.cloneRange()

  preCaretRange.selectNodeContents(editorRef.value)
  preCaretRange.setEnd(range.endContainer, range.endOffset)

  return {
    start: preCaretRange.toString().length,
    end: preCaretRange.toString().length + range.toString().length,
  }
}

// Fonction pour restaurer la position du curseur
const restoreCursorPosition = (position: { start: number; end: number } | null) => {
  if (!position || !editorRef.value)
    return

  const selection = window.getSelection()
  if (!selection)
    return

  try {
    const range = document.createRange()
    let charIndex = 0
    const nodeStack = [editorRef.value]
    let node: Node | undefined
    let foundStart = false
    let foundEnd = false

    while (!foundEnd && (node = nodeStack.pop())) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharIndex = charIndex + (node.textContent?.length || 0)

        if (!foundStart && position.start >= charIndex && position.start <= nextCharIndex) {
          range.setStart(node, position.start - charIndex)
          foundStart = true
        }

        if (foundStart && position.end >= charIndex && position.end <= nextCharIndex) {
          range.setEnd(node, position.end - charIndex)
          foundEnd = true
        }

        charIndex = nextCharIndex
      }
      else {
        for (let i = node.childNodes.length - 1; i >= 0; i--)
          nodeStack.push(node.childNodes[i])
      }
    }

    if (foundStart) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }
  catch (e) {
    // En cas d'erreur, placer le curseur à la fin
    const range = document.createRange()

    range.selectNodeContents(editorRef.value)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

// Watcher pour synchroniser l'éditeur en préservant le curseur
// Initialiser le contenu seulement une fois
watch(() => props.modelValue, newValue => {
  if (isUpdating || !editorRef.value)
    return

  // Ne mettre à jour que si l'éditeur est vide (initialisation)
  if (editorRef.value.innerHTML === '' && newValue) {
    isUpdating = true
    editorRef.value.innerHTML = newValue
    nextTick(() => {
      isUpdating = false
    })
  }
}, { immediate: true })
</script>

<template>
  <div class="rich-text-editor">
    <!-- Barre d'outils -->
    <VCard variant="outlined" class="toolbar-card mb-2">
      <VCardText class="pa-2">
        <div class="d-flex flex-wrap gap-1">
          <!-- Formatage de base -->
          <VBtnGroup variant="outlined" density="compact">
            <VBtn size="small" icon="ri-bold" :color="isActive('bold') ? 'primary' : 'default'" title="Gras"
              @click="toggleFormat('bold')" />
            <VBtn size="small" icon="ri-italic" :color="isActive('italic') ? 'primary' : 'default'" title="Italique"
              @click="toggleFormat('italic')" />
            <VBtn size="small" icon="ri-underline" :color="isActive('underline') ? 'primary' : 'default'"
              title="Souligné" @click="toggleFormat('underline')" />
          </VBtnGroup>

          <VDivider vertical class="mx-1" />

          <!-- Titres -->
          <VSelect v-model="selectedHeading" :items="headingOptions" variant="outlined" density="compact"
            style="inline-size: 120px;" hide-details @update:model-value="applyHeading" />

          <VDivider vertical class="mx-1" />

          <!-- Listes -->
          <VBtnGroup variant="outlined" density="compact">
            <VBtn size="small" icon="ri-list-unordered" :color="isActive('insertUnorderedList') ? 'primary' : 'default'"
              title="Liste à puces" @click="toggleFormat('insertUnorderedList')" />
            <VBtn size="small" icon="ri-list-ordered" :color="isActive('insertOrderedList') ? 'primary' : 'default'"
              title="Liste numérotée" @click="toggleFormat('insertOrderedList')" />
          </VBtnGroup>

          <VDivider vertical class="mx-1" />

          <!-- Alignement -->
          <VBtnGroup variant="outlined" density="compact">
            <VBtn size="small" icon="ri-align-left" :color="isActive('justifyLeft') ? 'primary' : 'default'"
              title="Aligner à gauche" @click="toggleFormat('justifyLeft')" />
            <VBtn size="small" icon="ri-align-center" :color="isActive('justifyCenter') ? 'primary' : 'default'"
              title="Centrer" @click="toggleFormat('justifyCenter')" />
            <VBtn size="small" icon="ri-align-right" :color="isActive('justifyRight') ? 'primary' : 'default'"
              title="Aligner à droite" @click="toggleFormat('justifyRight')" />
          </VBtnGroup>

          <VDivider vertical class="mx-1" />

          <!-- Actions -->
          <VBtnGroup variant="outlined" density="compact">
            <VBtn size="small" icon="ri-code-view" :color="showHtml ? 'primary' : 'default'" title="Voir le HTML"
              @click="toggleHtmlView" />
            <VBtn size="small" icon="ri-delete-bin-line" title="Effacer tout" @click="clearContent" />
          </VBtnGroup>
        </div>
      </VCardText>
    </VCard>

    <!-- Éditeur -->
    <VCard variant="outlined" class="editor-card">
      <div v-show="!showHtml" ref="editorRef" class="rich-editor" contenteditable="true" @input="onInput"
        @paste="onPaste" @keydown="onKeydown" v-html="modelValue" />

      <VTextarea v-show="showHtml" :model-value="modelValue" variant="plain" rows="15" class="html-editor"
        placeholder="Code HTML..." hide-details @update:model-value="updateValue" />
    </VCard>

    <!-- Aperçu -->
    <VCard v-if="showPreview" variant="outlined" class="mt-2">
      <VCardTitle class="text-subtitle-1 pa-3 pb-2">
        <VIcon icon="ri-eye-line" class="me-2" />
        Aperçu
      </VCardTitle>
      <VCardText class="pa-3">
        <div class="preview-content" v-html="modelValue" />
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.rich-text-editor {
  inline-size: 100%;
}

.toolbar-card {
  border-radius: 8px 8px 0 0;
  border-block-end: none;
}

.editor-card {
  border-radius: 0 0 8px 8px;
  min-block-size: 300px;
}

.rich-editor {
  padding: 16px;
  font-family: inherit;
  line-height: 1.6;
  min-block-size: 300px;
  outline: none;
}

.rich-editor:focus {
  outline: none;
}

.html-editor {
  font-family: "Courier New", monospace;
  font-size: 14px;
}

.preview-content {
  line-height: 1.6;
}

/* Styles pour le contenu de l'éditeur */
.rich-editor h1,
.preview-content h1 {
  color: rgb(var(--v-theme-primary));
  font-size: 2rem;
  font-weight: bold;
  margin-block: 1rem;
  margin-inline: 0;
}

.rich-editor h2,
.preview-content h2 {
  color: rgb(var(--v-theme-primary));
  font-size: 1.5rem;
  font-weight: bold;
  margin-block: 0.8rem;
  margin-inline: 0;
}

.rich-editor h3,
.preview-content h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-block: 0.6rem;
  margin-inline: 0;
}

.rich-editor p,
.preview-content p {
  margin-block: 0.5rem;
  margin-inline: 0;
}

.rich-editor ul,
.rich-editor ol,
.preview-content ul,
.preview-content ol {
  margin-block: 0.5rem;
  margin-inline: 0;
  padding-inline-start: 2rem;
}

.rich-editor img,
.preview-content img {
  border-radius: 8px;
  block-size: auto;
  margin-block: 0.5rem;
  margin-inline: 0;
  max-inline-size: 100%;
}

.rich-editor a,
.preview-content a {
  color: rgb(var(--v-theme-primary));
  text-decoration: underline;
}

.rich-editor blockquote,
.preview-content blockquote {
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border-inline-start: 4px solid rgb(var(--v-theme-primary));
  font-style: italic;
  margin-block: 1rem;
  margin-inline: 0;
  padding-inline-start: 1rem;
}
</style>
