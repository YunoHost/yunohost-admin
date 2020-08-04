<template>
  <b-input-group>
    <b-input
      :id="id" :placeholder="placeholder"
      :state="state" :aria-describedby="feedbackId"
      v-model="value[0]" @update="$emit('input', value)"
    />

    <b-input-group-append>
      <b-input-group-text>{{ separator }}</b-input-group-text>
    </b-input-group-append>

    <b-input-group-append>
      <b-select
        v-model="value[1]" :options="options" @change="$emit('input', value)"
      />
    </b-input-group-append>
  </b-input-group>
</template>

<script>
export default {
  name: 'AdressInputSelect',
  props: {
    // `value` is actually passed thru the `v-model` directive
    value: { type: Array, required: true },
    options: { type: Array, required: true },
    separator: { type: String, default: '@' },
    placeholder: { type: String, default: null },
    id: { type: String, default: null },
    state: { type: null, default: null },
    feedbackId: { type: String, default: null }
  }
}
</script>
