<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { CONTINENTS } from '../data/continents'
import {
  availableCount,
  continentCounts,
  ROUND_OPTIONS,
  resetSettings,
  setRounds,
  settings,
  setTheme,
  toggleContinent,
} from '../composables/useSettings'

const emit = defineEmits(['close'])

const panel = ref(null)
const closeButton = ref(null)
const error = ref('')
let previousFocus = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

const maxRounds = computed(
  () => [...ROUND_OPTIONS].reverse().find((option) => option <= availableCount.value) ?? 0,
)

const roundsHint = computed(() =>
  maxRounds.value < ROUND_OPTIONS[ROUND_OPTIONS.length - 1]
    ? `Con este filtro hay ${availableCount.value} banderas: el máximo por partida es ${maxRounds.value}.`
    : `${availableCount.value} banderas disponibles. Se eligen al azar para cada partida.`,
)

function isSelected(id) {
  return settings.value.continents.includes(id)
}

function chooseRounds(option) {
  // Las opciones que el mazo no soporta se muestran deshabilitadas.
  setRounds(option)
}

function onContinentClick(event, id) {
  if (isSelected(id) && settings.value.continents.length === 1) {
    event.preventDefault()
    error.value = 'Tiene que quedar al menos un continente activo.'
    return
  }

  if (toggleContinent(id)) error.value = ''
}

function chooseTheme(theme) {
  setTheme(theme)
}

function onReset() {
  resetSettings()
  error.value = ''
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }

  if (event.key !== 'Tab' || !panel.value) return

  const focusables = [...panel.value.querySelectorAll(FOCUSABLE)].filter(
    (element) => element.offsetParent !== null,
  )
  if (focusables.length === 0) return

  const first = focusables[0]
  const last = focusables[focusables.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  previousFocus = document.activeElement
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
  closeButton.value?.focus()
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
  if (previousFocus instanceof HTMLElement) previousFocus.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="settings" @click.self="emit('close')">
      <div
        ref="panel"
        class="settings__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        aria-describedby="settings-desc"
      >
        <header class="settings__head">
          <div>
            <p class="eyebrow">Antes de jugar</p>
            <h2 id="settings-title" class="settings__title">Configuración</h2>
          </div>
          <button
            ref="closeButton"
            type="button"
            class="settings__close"
            aria-label="Cerrar configuración"
            @click="emit('close')"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <p id="settings-desc" class="settings__desc">
          Se guarda en este navegador y se aplica a la próxima partida.
        </p>

        <fieldset class="field">
          <legend class="field__legend">Banderas por partida</legend>
          <div class="segmented">
            <label
              v-for="option in ROUND_OPTIONS"
              :key="option"
              class="segmented__item"
              :class="{
                'is-active': settings.rounds === option,
                'is-disabled': option > availableCount,
              }"
              :title="option > availableCount ? `Necesitás ${option} banderas disponibles` : undefined"
            >
              <input
                type="radio"
                name="rounds"
                :value="option"
                :checked="settings.rounds === option"
                :disabled="option > availableCount"
                @change="chooseRounds(option)"
              />
              <span class="segmented__value">{{ option }}</span>
            </label>
          </div>
          <p class="field__hint">{{ roundsHint }}</p>
        </fieldset>

        <fieldset class="field">
          <legend class="field__legend">Tema visual</legend>
          <button
            type="button"
            class="switch"
            role="switch"
            :aria-checked="settings.theme === 'dark'"
            @click="chooseTheme(settings.theme === 'dark' ? 'light' : 'dark')"
          >
            <span class="switch__icon" aria-hidden="true">
              <svg v-if="settings.theme === 'dark'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            </span>
            <span class="switch__text">
              <span class="switch__title">{{ settings.theme === 'dark' ? 'Modo oscuro' : 'Modo claro' }}</span>
              <span class="switch__hint">Cambia el aspecto de todo el juego</span>
            </span>
            <span class="switch__track" aria-hidden="true"><span class="switch__thumb"></span></span>
          </button>
        </fieldset>

        <fieldset class="field">
          <legend class="field__legend">Filtro por continentes</legend>
          <div class="continents">
            <label
              v-for="continent in CONTINENTS"
              :key="continent.id"
              class="continent"
              :class="{ 'is-on': isSelected(continent.id) }"
            >
              <input
                type="checkbox"
                :checked="isSelected(continent.id)"
                @click="onContinentClick($event, continent.id)"
              />
              <span class="continent__box" aria-hidden="true"></span>
              <span class="continent__name">{{ continent.label }}</span>
              <span class="continent__count">{{ continentCounts[continent.id] }}</span>
            </label>
          </div>
          <p v-if="error" class="field__error" role="alert">{{ error }}</p>
          <p v-else class="field__hint">Al menos un continente activo.</p>
        </fieldset>

        <footer class="settings__foot">
          <span class="settings__available">
            <strong>{{ availableCount }}</strong> banderas disponibles
          </span>
          <div class="settings__actions">
            <button type="button" class="btn btn--ghost" @click="onReset">Restablecer</button>
            <button type="button" class="btn btn--primary" @click="emit('close')">Listo</button>
          </div>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
