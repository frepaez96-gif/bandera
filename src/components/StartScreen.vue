<script setup>
defineProps({
  bestScore: { type: Number, default: 0 },
  totalRounds: { type: Number, required: true },
  countryCount: { type: Number, required: true },
})

defineEmits(['start'])
</script>

<template>
  <section class="screen start">
    <div class="start__flags" aria-hidden="true">
      <img src="/flags/br.svg" alt="" class="start__flag start__flag--1" />
      <img src="/flags/jp.svg" alt="" class="start__flag start__flag--2" />
      <img src="/flags/ke.svg" alt="" class="start__flag start__flag--3" />
    </div>

    <p class="eyebrow">{{ countryCount }} banderas · {{ totalRounds }} rondas</p>
    <h1 class="title">Adivina la Bandera</h1>
    <p class="lead">
      Te mostramos una bandera y cuatro países. Solo uno es el correcto. Aciertes o falles, pasas a la
      siguiente: al final ves tu puntuación.
    </p>

    <ul class="rules">
      <li><span aria-hidden="true">1</span> {{ totalRounds }} banderas, una por una</li>
      <li><span aria-hidden="true">2</span> 4 opciones por bandera</li>
      <li><span aria-hidden="true">3</span> Si fallas, te mostramos la respuesta correcta</li>
    </ul>

    <button type="button" class="btn btn--primary btn--lg" @click="$emit('start')">Empezar</button>

    <p v-if="bestScore > 0" class="best">
      Mejor puntuación: <strong>{{ bestScore }}/{{ totalRounds }}</strong>
    </p>
    <p v-else class="best best--muted">Todavía no hay una puntuación guardada.</p>
  </section>
</template>
