<template>
  <BInputGroup v-bind="$attrs">
    <InputItem
      :id="id"
      :modelValue="modelValue.localPart"
      :placeholder="placeholder"
      :state="state"
      :aria-describedby="id + 'local-part-desc'"
      @update:modelValue="onInput('localPart', $event)"
    />

    <BInputGroupAppend>
      <BInputGroupText>{{ modelValue.separator }}</BInputGroupText>
    </BInputGroupAppend>

    <BInputGroupAppend>
      <SelectItem
        :modelValue="modelValue.domain"
        :choices="choices"
        :aria-describedby="id + 'domain-desc'"
        @update:modelValue="onInput('domain', $event)"
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
  name: 'AdressInputSelect',

  inheritAttrs: false,

  props: {
    modelValue: { type: Object, required: true },
    choices: { type: Array, required: true },
    placeholder: { type: String, default: null },
    id: { type: String, default: null },
    state: { type: null, default: null },
    type: { type: String, default: 'email' },
  },

  methods: {
    onInput(key, modelValue) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        [key]: modelValue,
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
