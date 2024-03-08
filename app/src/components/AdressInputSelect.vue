<template>
  <BInputGroup v-bind="$attrs">
    <InputItem
      :id="id"
      :value="value.localPart"
      :placeholder="placeholder"
      :state="state"
      :aria-describedby="id + 'local-part-desc'"
      @input="onInput('localPart', $event)"
      @blur="$parent.$emit('touch')"
    />

    <BInputGroupAppend>
      <BInputGroupText>{{ value.separator }}</BInputGroupText>
    </BInputGroupAppend>

    <BInputGroupAppend>
      <SelectItem
        :value="value.domain"
        :choices="choices"
        :aria-describedby="id + 'domain-desc'"
        @input="onInput('domain', $event)"
        @blur="$parent.$emit('touch')"
      />
    </BInputGroupAppend>

    <span
      class="sr-only"
      :id="id + 'local-part-desc'"
      v-t="'address.local_part_description.' + type"
    />
    <span
      class="sr-only"
      :id="id + 'domain-desc'"
      v-t="'address.domain_description.' + type"
    />
  </BInputGroup>
</template>

<script>
export default {
  compatConfig: { MODE: 3 },
  name: 'AdressInputSelect',

  inheritAttrs: false,

  props: {
    // `value` is actually passed thru the `v-model` directive
    value: { type: Object, required: true },
    choices: { type: Array, required: true },
    placeholder: { type: String, default: null },
    id: { type: String, default: null },
    state: { type: null, default: null },
    type: { type: String, default: 'email' },
  },

  methods: {
    onInput(key, value) {
      this.$emit('input', {
        ...this.value,
        [key]: value,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.input-group-append ~ .input-group-append {
  flex-basis: 40%;
}
select {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
