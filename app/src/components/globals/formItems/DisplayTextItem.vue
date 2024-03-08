<template>
  <div>
    <p v-text="label" />
  </div>
</template>

<script>
export default {
  compatConfig: { MODE: 3 },
  name: 'DisplayTextItem',

  props: {
    id: { type: String, default: null },
    label: { type: String, default: null },
  },
}
</script>
