import { computed, readonly, ref, watch, watchEffect } from 'vue'
import countries from '../data/countries.json'
import { CONTINENTS, CONTINENT_IDS } from '../data/continents'

/** Opciones exactas de cantidad de banderas por partida. */
export const ROUND_OPTIONS = [10, 20, 30, 40]
export const MIN_ROUNDS = ROUND_OPTIONS[0]

const THEMES = ['dark', 'light']
const STORAGE_KEY = 'guess-the-flag:settings'

/** Países con continente asignado: son los únicos que pueden aparecer en una ronda. */
export const playableCountries = countries.filter((country) => Boolean(country.continent))
export const playableCount = playableCountries.length

function preferredTheme() {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

function defaultSettings() {
  return {
    rounds: MIN_ROUNDS,
    theme: preferredTheme(),
    continents: [...CONTINENT_IDS],
  }
}

function readSettings() {
  const fallback = defaultSettings()

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!parsed || typeof parsed !== 'object') return fallback

    const continents = Array.isArray(parsed.continents)
      ? CONTINENT_IDS.filter((id) => parsed.continents.includes(id))
      : fallback.continents

    return {
      rounds: ROUND_OPTIONS.includes(parsed.rounds) ? parsed.rounds : fallback.rounds,
      theme: THEMES.includes(parsed.theme) ? parsed.theme : fallback.theme,
      // Sin continentes válidos se vuelve al mazo completo: nunca se arranca sin banderas.
      continents: continents.length > 0 ? continents : fallback.continents,
    }
  } catch {
    return fallback
  }
}

function persist(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Almacenamiento no disponible (modo privado): los ajustes duran la sesión.
  }
}

const state = ref(readSettings())

export const settings = readonly(state)

export const availableCountries = computed(() => {
  const selected = state.value.continents
  return playableCountries.filter((country) => selected.includes(country.continent))
})

export const availableCount = computed(() => availableCountries.value.length)

/** Cantidad de banderas por continente, para mostrarla en el panel. */
export const continentCounts = computed(() =>
  Object.fromEntries(
    CONTINENTS.map((continent) => [
      continent.id,
      playableCountries.filter((country) => country.continent === continent.id).length,
    ]),
  ),
)

/** Mayor cantidad de rondas que el mazo filtrado puede sostener. */
function largestRoundOption(count) {
  return [...ROUND_OPTIONS].reverse().find((option) => option <= count) ?? MIN_ROUNDS
}

/** Mantiene la configuración válida cuando el filtro de continentes reduce el mazo. */
function clampRounds() {
  if (state.value.rounds > availableCount.value) {
    state.value.rounds = largestRoundOption(availableCount.value)
  }
}

clampRounds()

export function setRounds(rounds) {
  if (!ROUND_OPTIONS.includes(rounds) || rounds > availableCount.value) return false
  state.value.rounds = rounds
  return true
}

export function setTheme(theme) {
  if (!THEMES.includes(theme)) return false
  state.value.theme = theme
  return true
}

export function toggleTheme() {
  state.value.theme = state.value.theme === 'dark' ? 'light' : 'dark'
}

/**
 * Alterna un continente. Devuelve `false` cuando el intento dejaría el filtro vacío:
 * el último continente activo no se puede destildar.
 */
export function toggleContinent(id) {
  if (!CONTINENT_IDS.includes(id)) return false

  const selected = state.value.continents
  if (selected.includes(id)) {
    if (selected.length === 1) return false
    state.value.continents = selected.filter((continentId) => continentId !== id)
  } else {
    state.value.continents = CONTINENT_IDS.filter(
      (continentId) => continentId === id || selected.includes(continentId),
    )
  }

  clampRounds()
  return true
}

export function resetSettings() {
  state.value = defaultSettings()
}

watch(state, persist, { deep: true })

watchEffect(() => {
  const { theme } = state.value
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#080d1a' : '#eef2fb')
})
