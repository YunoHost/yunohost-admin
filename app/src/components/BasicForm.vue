<template>
  <b-card :header="header" header-tag="h2" class="basic-form">
    <b-form :id="id" @submit="$emit('submit', $event)">
      <slot />
    </b-form>

    <template v-slot:footer>
      <slot name="buttons">
        <b-button type="submit" :form="id" variant="success">
          {{ submit ? submit : $t('save') }}
        </b-button>
      </slot>
    </template>
  </b-card>
</template>

<script>
export default {
  name: 'BasicForm',

  props: {
    header: { type: String, required: true },
    id: { type: String, default: 'ynh-form' },
    submit: { type: String, default: null }
  }
}
</script>

<style lang="scss">
.basic-form .card-footer {
  display: flex;
  justify-content: flex-end;

  & > *:not(:first-child) {
    margin-left: .5rem;
  }
}
</style>
