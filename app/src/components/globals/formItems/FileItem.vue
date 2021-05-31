<template>
  <b-button-group class="w-100">
    <b-button @click="clearFiles" variant="danger" v-if="!required && file">
      <icon iname="trash" />
    </b-button>
    <b-form-file
      v-model="file"
      ref="file-input"
      :id="id"
      :required="required"
      v-on="$listeners"
      :placeholder="placeholder"
      :accept="accept"
      @blur="$parent.$emit('touch', name)"
    />
  </b-button-group>
</template>

<script>
export default {
  name: 'FileItem',

  data () {
    return {
      file: null
    }
  },

  props: {
    id: { type: String, default: null },
    value: { type: [File, null], default: null },
    placeholder: { type: String, default: 'Choose a file or drop it here...' },
    accept: { type: String, default: null },
    required: { type: Boolean, default: false },
    name: { type: String, default: null }
  },


  methods: {
    clearFiles () {
      this.$refs['file-input'].reset()
    }
  }
}
</script>
