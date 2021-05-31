<template>
  <b-alert :variant="type" show>
    <icon :iname="type" />
    {{ label }}
  </b-alert>
</template>

<script>
export default {
  name: 'ReadOnlyAlertItem',

  props: {
    id: { type: String, default: null },
    label: { type: String, default: null },
    type: { type: String, default: null }
  }
}
</script>
