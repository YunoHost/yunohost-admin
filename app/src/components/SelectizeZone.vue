<template lang="html">
  <div class="selectize-zone">
    <div id="selected-items" v-if="selected.length > 0">
      <b-button-group size="sm" v-for="(item, index) in selected" :key="index">
        <b-button
          :variant="itemVariant" :to="itemRoute ? {name: itemRoute, params: {name: item}} : null"
          @blur="onItemButtonBlur" class="item-btn"
        >
          <icon :iname="itemIcon" /> {{ item }}
        </b-button>
        <b-button
          class="remove-btn" variant="warning"
          @click="removeFromSelected(index)" @blur="onItemDeleteBlur"
        >
          <icon :title="$t('delete')" iname="minus" />
        </b-button>
      </b-button-group>
    </div>

    <b-input-group>
      <b-input-group-prepend is-text>
        <label class="sr-only" for="selectize">{{ ariaLabel }}</label>
        <icon :iname="searchIcon" v-if="searchIcon" />
      </b-input-group-prepend>
      <b-form-input
        id="selectize" :class="visible ? null : 'collapsed'"
        aria-controls="collapse" :aria-expanded="visible ? 'true' : 'false'"
        @focus="onInputFocus" @blur="onInputBlur" @keydown="onInputKeydown"
        v-model="search" ref="input"
      />
    </b-input-group>

    <b-collapse id="collapse" ref="collapse" v-model="visible">
      <b-list-group tabindex="-1" @mouseover="onChoiceListOver">
        <b-list-group-item
          v-for="(choice, index) in filteredChoices" :key="index"
          tabindex="-1" :active="focusedIndex === index" ref="choiceList"
          @mousedown.prevent @mouseup.prevent="addToSelected(index)"
        >
          {{ choice }}
        </b-list-group-item>
      </b-list-group>
    </b-collapse>
  </div>
</template>

<script>
// FIXME add accessibility to ChoiceList

export default {
  name: 'SelectizeZone',

  props: {
    selected: { type: Array, required: true },
    choices: { type: Array, required: true },
    searchIcon: { type: String, default: 'search' },
    itemIcon: { type: String, default: null },
    itemRoute: { type: String, default: null },
    itemVariant: { type: String, default: 'secondary' },
    ariaLabel: { type: String, required: true }
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
      })
    }
  },

  methods: {
    addToSelected (choiceIndex) {
      const [item] = this.choices.splice(choiceIndex, 1)
      this.selected.push(item)
      this.focusedIndex = 0
    },

    removeFromSelected (selectedIndex) {
      const [item] = this.selected.splice(selectedIndex, 1)
      this.choices.push(item)
    },

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
      const choices = this.filteredChoices
      if (choices.length < 1) return

      if (key === 'ArrowDown') {
        e.preventDefault()
        if (this.focusedIndex < choices.length - 1) {
          this.focusedIndex++
        }
      } else if (key === 'ArrowUp') {
        e.preventDefault()
        if (this.focusedIndex > 0) {
          this.focusedIndex--
        }
      } else if (key === 'Enter') {
        this.addToSelected(choices.indexOf(choices[this.focusedIndex]))
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

    onItemButtonBlur ({ target, relatedTarget }) {
      if (target.nextElementSibling === relatedTarget) {
        relatedTarget.classList.add('display')
      }
    },

    onItemDeleteBlur ({ target }) {
      target.classList.remove('display')
    }
  }
}
</script>

<style lang="scss" scoped>
#selected-items {
  margin-bottom: .75rem;
  display: flex;
  flex-wrap: wrap;

  .btn-group {
    margin-right: .5rem;
    margin-bottom: .5rem;

    &:hover {
      .remove-btn  {
        display: inline-block;
      }

      .item-btn {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    .item-btn {
      border-top-right-radius: $border-radius;
      border-bottom-right-radius: $border-radius;

      &:focus, &:hover {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;

        & ~ .remove-btn {
          display: inline-block;
        }
      }

      .icon {
        margin-right: .25rem;
      }
    }

    .remove-btn {
      display: none;

      &.display {
        display: inline-block;
      }
    }
  }
}

.fa-minus {
  position: relative;
  top: 1px;
}

// Collapsed list
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
