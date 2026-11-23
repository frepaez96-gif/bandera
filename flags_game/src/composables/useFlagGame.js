import { computed, ref } from 'vue'
import { availableCountries, settings } from './useSettings'

export const OPTIONS_PER_QUESTION = 4
/** Pausa tras responder para poder leer el resultado; Enter/Espacio o el botón la saltan. */
export const AUTO_ADVANCE_DELAY = 1400
const BEST_SCORE_KEY = 'guess-the-flag:best-score'
const LEGACY_ROUNDS = 10

/** Fisher-Yates: devuelve una copia mezclada sin tocar el arreglo original. */
function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Récords por cantidad de rondas (`{ "10": 9, "20": 17 }`): el récord de una partida
 * corta no se compara con el de una larga. El formato viejo (un número suelto) se
 * interpreta como récord de 10 rondas.
 */
function readBestScores() {
  try {
    const raw = localStorage.getItem(BEST_SCORE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw)
    if (Number.isInteger(parsed) && parsed >= 0) return { [LEGACY_ROUNDS]: parsed }
    if (!parsed || typeof parsed !== 'object') return {}

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([rounds, score]) =>
          Number.isInteger(Number(rounds)) && Number(rounds) > 0 && Number.isInteger(score) && score >= 0,
      ),
    )
  } catch {
    return {}
  }
}

function writeBestScores(value) {
  try {
    localStorage.setItem(BEST_SCORE_KEY, JSON.stringify(value))
  } catch {
    // Almacenamiento no disponible (modo privado): el juego sigue funcionando.
  }
}

/**
 * Una ronda = una bandera + 4 opciones de nombre.
 * Los distractores se eligen del mismo mazo filtrado, así nunca hay dos opciones iguales.
 */
function createQuestion(country, pool) {
  const distractors = shuffle(pool.filter((candidate) => candidate.code !== country.code)).slice(
    0,
    OPTIONS_PER_QUESTION - 1,
  )

  return {
    code: country.code,
    name: country.name,
    image: `${import.meta.env.BASE_URL}flags/${country.code}.svg`,
    answer: country.name,
    options: shuffle([...distractors.map((candidate) => candidate.name), country.name]),
    picked: null,
  }
}

export function useFlagGame() {
  const status = ref('idle') // 'idle' | 'playing' | 'finished'
  const questions = ref([])
  const currentIndex = ref(0)
  const bestScores = ref(readBestScores())
  const isNewRecord = ref(false)
  let advanceTimer = null

  /** Rondas configuradas, limitadas por las banderas que sobreviven al filtro. */
  const totalRounds = computed(() =>
    Math.min(settings.value.rounds, availableCountries.value.length),
  )

  const bestScore = computed(() => bestScores.value[String(totalRounds.value)] ?? 0)

  function cancelAdvance() {
    if (advanceTimer !== null) {
      clearTimeout(advanceTimer)
      advanceTimer = null
    }
  }

  function scheduleAdvance() {
    cancelAdvance()
    advanceTimer = setTimeout(() => {
      advanceTimer = null
      next()
    }, AUTO_ADVANCE_DELAY)
  }

  const current = computed(() => questions.value[currentIndex.value] ?? null)
  const score = computed(
    () => questions.value.filter((question) => question.picked === question.answer).length,
  )
  const isAnswered = computed(() => current.value !== null && current.value.picked !== null)
  const isLastQuestion = computed(() => currentIndex.value === totalRounds.value - 1)
  const progress = computed(() =>
    totalRounds.value === 0
      ? 0
      : Math.round(((currentIndex.value + (isAnswered.value ? 1 : 0)) / totalRounds.value) * 100),
  )

  function start() {
    cancelAdvance()
    const pool = availableCountries.value
    const rounds = Math.min(settings.value.rounds, pool.length)
    questions.value = shuffle(pool)
      .slice(0, rounds)
      .map((country) => createQuestion(country, pool))
    currentIndex.value = 0
    isNewRecord.value = false
    status.value = rounds > 0 ? 'playing' : 'idle'
  }

  function answer(option) {
    if (status.value !== 'playing' || !current.value || current.value.picked !== null) return
    if (!current.value.options.includes(option)) return
    current.value.picked = option
    scheduleAdvance()
  }

  function next() {
    cancelAdvance()
    if (status.value !== 'playing' || !isAnswered.value) return

    if (currentIndex.value < totalRounds.value - 1) {
      currentIndex.value += 1
      return
    }

    status.value = 'finished'
    if (score.value > bestScore.value) {
      bestScores.value = { ...bestScores.value, [String(totalRounds.value)]: score.value }
      writeBestScores(bestScores.value)
      isNewRecord.value = true
    }
  }

  /** Vuelve a la pantalla inicial y descarta la partida en curso. */
  function reset() {
    cancelAdvance()
    status.value = 'idle'
    questions.value = []
    currentIndex.value = 0
    isNewRecord.value = false
  }

  return {
    // estado
    status,
    questions,
    currentIndex,
    current,
    score,
    bestScore,
    isAnswered,
    isLastQuestion,
    progress,
    isNewRecord,
    totalRounds,
    // acciones
    start,
    answer,
    next,
    reset,
  }
}
