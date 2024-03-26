<template>
  <VueShowdown :markdown="label" />
</template>

<script>
export default {
  name: 'MarkdownItem',

  props: {
    id: { type: String, default: null },
    label: { type: String, default: null },
  },
}
</script>
