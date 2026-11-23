<script setup>
import { computed } from 'vue'

const props = defineProps({
  questions: { type: Array, required: true },
  score: { type: Number, required: true },
  totalRounds: { type: Number, required: true },
  bestScore: { type: Number, required: true },
  isNewRecord: { type: Boolean, default: false },
})

defineEmits(['restart', 'home'])

const verdict = computed(() => {
  if (props.score === props.totalRounds) return { title: '¡Perfecto!', text: 'Acertaste todas las banderas.' }
  const ratio = props.score / props.totalRounds
  if (ratio >= 0.8) return { title: 'Casi perfecto', text: 'Te faltó muy poco para el pleno.' }
  if (ratio >= 0.6) return { title: 'Buen trabajo', text: 'Tienes buen ojo para los países.' }
  if (ratio >= 0.3) return { title: 'Vas por buen camino', text: 'Otra ronda y subes la marca.' }
  return { title: 'A seguir practicando', text: 'Cada partida suma banderas nuevas.' }
})
</script>

<template>
  <section class="screen result">
    <p class="eyebrow">Resultado final</p>
    <p class="result__score">
      <strong>{{ score }}</strong><span>/{{ totalRounds }}</span>
    </p>
    <h2 class="result__title">{{ verdict.title }}</h2>
    <p class="lead">{{ verdict.text }}</p>

    <p v-if="isNewRecord" class="badge">Nuevo récord personal</p>
    <p v-else class="best">Mejor puntuación: <strong>{{ bestScore }}/{{ totalRounds }}</strong></p>

    <ul class="recap">
      <li
        v-for="(question, index) in questions"
        :key="question.code"
        class="recap__item"
        :class="question.picked === question.answer ? 'recap__item--ok' : 'recap__item--bad'"
      >
        <span class="recap__index">{{ index + 1 }}</span>
        <img :src="question.image" alt="" class="recap__flag" loading="lazy" />
        <span class="recap__name">
          {{ question.answer }}
          <small v-if="question.picked !== question.answer">Elegiste: {{ question.picked }}</small>
        </span>
        <span class="recap__mark" aria-hidden="true">
          {{ question.picked === question.answer ? '✓' : '✕' }}
        </span>
      </li>
    </ul>

    <div class="result__actions">
      <button type="button" class="btn btn--primary btn--lg" @click="$emit('restart')">
        Jugar de nuevo
      </button>
      <button type="button" class="btn btn--ghost" @click="$emit('home')">Inicio</button>
    </div>
  </section>
</template>
