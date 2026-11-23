<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  question: { type: Object, required: true },
  currentIndex: { type: Number, required: true },
  totalRounds: { type: Number, required: true },
  score: { type: Number, required: true },
  progress: { type: Number, required: true },
  isAnswered: { type: Boolean, required: true },
  isLastQuestion: { type: Boolean, required: true },
})

const emit = defineEmits(['answer', 'next'])

const loaded = ref(false)

watch(
  () => props.question.code,
  () => {
    loaded.value = false
  },
)

function optionClass(option) {
  if (!props.isAnswered) return {}

  return {
    'option--correct': option === props.question.answer,
    'option--wrong': option === props.question.picked && option !== props.question.answer,
    'option--dim': option !== props.question.answer && option !== props.question.picked,
  }
}

function choose(option) {
  if (props.isAnswered) return
  emit('answer', option)
}

function onKeydown(event) {
  if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return

  if (!props.isAnswered) {
    const index = Number(event.key) - 1
    if (Number.isInteger(index) && index >= 0 && index < props.question.options.length) {
      event.preventDefault()
      choose(props.question.options[index])
    }
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    emit('next')
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section class="screen game">
    <header class="hud">
      <span class="hud__label">
        Bandera <strong>{{ currentIndex + 1 }}</strong> de {{ totalRounds }}
      </span>
      <span class="hud__label">Aciertos <strong>{{ score }}</strong></span>
    </header>

    <div
      class="bar"
      role="progressbar"
      aria-label="Progreso de la partida"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="bar__fill" :style="{ width: `${progress}%` }"></div>
    </div>

    <figure class="flag-card">
      <img
        :src="question.image"
        :alt="'Bandera del país a adivinar'"
        class="flag-card__img"
        :class="{ 'is-loaded': loaded }"
        @load="loaded = true"
      />
      <figcaption class="flag-card__caption">
        <template v-if="isAnswered">
          <span v-if="question.picked === question.answer">¡Correcto! Era {{ question.answer }}.</span>
          <span v-else>La bandera correcta era <strong>{{ question.answer }}</strong>.</span>
        </template>
        <template v-else>¿De qué país es esta bandera?</template>
      </figcaption>
    </figure>

    <div class="options">
      <button
        v-for="(option, index) in question.options"
        :key="option"
        type="button"
        class="option"
        :class="optionClass(option)"
        :disabled="isAnswered"
        @click="choose(option)"
      >
        <span class="option__key">{{ index + 1 }}</span>
        <span class="option__label">{{ option }}</span>
        <span v-if="isAnswered && option === question.answer" class="option__icon" aria-hidden="true">✓</span>
        <span
          v-else-if="isAnswered && option === question.picked"
          class="option__icon"
          aria-hidden="true"
        >✕</span>
      </button>
    </div>

    <footer class="game__footer" aria-live="polite">
      <p v-if="!isAnswered" class="hint">Elige una opción o pulsa 1, 2, 3 o 4.</p>
      <button v-else type="button" class="btn btn--primary" @click="$emit('next')">
        {{ isLastQuestion ? 'Ver resultado' : 'Siguiente bandera' }}
      </button>
    </footer>
  </section>
</template>
