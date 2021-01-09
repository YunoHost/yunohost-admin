<template>
  <div class="selectize-base">
    <b-input-group>
      <b-input-group-prepend is-text>
        <icon iname="search-plus" />
        <span class="ml-1">{{ label }}</span>
      </b-input-group-prepend>
      <b-form-input
        :class="visible ? null : 'collapsed'"
        aria-controls="collapse" :aria-expanded="visible ? 'true' : 'false'"
        @focus="onInputFocus" @blur="onInputBlur" @keydown="onInputKeydown"
        v-model="search" ref="input"
      />
    </b-input-group>

    <b-collapse ref="collapse" v-model="visible">
      <b-list-group tabindex="-1" @mouseover="onChoiceListOver" v-if="visible">
        <b-list-group-item
          v-for="(item, index) in filteredChoices" :key="item"
          tabindex="-1" :active="index === focusedIndex" ref="choiceList"
          @mousedown.prevent @mouseup.prevent="onSelect(item)"
        >
          {{ item | filter(format) }}
        </b-list-group-item>
      </b-list-group>
    </b-collapse>
  </div>
</template>

<script>
// FIXME add accessibility to ChoiceList

export default {
  name: 'BaseSelectize',

  props: {
    choices: { type: Array, required: true },
    label: { type: String, default: null },
    // FIXME find a better way to pass filters
    format: { type: Function, default: null }
  },

  data: () => ({
    visible: false,
    search: '',
    focusedIndex: 0
  }),

  computed: {
    filteredChoices () {
      const search = this.search.toLowerCase()
      return this.choices.filter(item => {
        return item.toLowerCase().includes(search)
      }).sort()
    }
  },

  methods: {
    onInputFocus ({ relatedTarget }) {
      this.visible = true
      this.focusedIndex = 0
      // timeout needed else scrollIntoView won't work
      if (!this.$refs.choiceList) return
      setTimeout(() => {
        this.$refs.choiceList[0].scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' })
      }, 50)
    },

    onInputBlur ({ relatedTarget }) {
      if (!this.$refs.collapse.$el.contains(relatedTarget)) {
        this.visible = false
      }
    },

    onInputKeydown (e) {
      const { key } = e
      const choicesLen = this.filteredChoices.length
      if (choicesLen < 1) return

      if (key === 'ArrowDown') {
        e.preventDefault()
        if (this.focusedIndex <= choicesLen) {
          this.focusedIndex++
        }
      } else if (key === 'ArrowUp') {
        e.preventDefault()
        if (this.focusedIndex > 0) {
          this.focusedIndex--
        }
      } else if (key === 'Enter') {
        this.onSelect(this.filteredChoices[this.focusedIndex])
        this.focusedIndex = 0
      } else {
        this.focusedIndex = 0
      }
      const elemToFocus = this.$refs.choiceList[this.focusedIndex]
      if (elemToFocus) {
        elemToFocus.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' })
      }
    },

    onChoiceListOver ({ target }) {
      const index = this.$refs.choiceList.indexOf(target)
      if (index > -1) {
        this.focusedIndex = index
      }
    },

    onSelect (item) {
      this.$emit('selected', { item, index: this.choices.indexOf(item) })
    }
  },

  filters: {
    filter: function (text, func) {
      if (func) return func(text)
      else return text
    }
  }
}
</script>

<style lang="scss" scoped>
.collapse {
  position: relative;
  width: 100%;
}
// disable collapse animation
.collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}

.list-group {
  margin-top: .5rem;
  max-height: 10rem;
  overflow-y: auto;
  position: absolute;
  z-index: 10;
  width: 100%;
}

.list-group-item {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 2rem;
  line-height: 1.75rem;
  cursor: pointer;
}
</style>
