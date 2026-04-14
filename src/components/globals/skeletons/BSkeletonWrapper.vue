<script setup lang="ts">
withDefaults(defineProps<{ button?: boolean; search?: boolean }>(), {
  button: false,
  search: false,
})

defineSlots<{
  default: any
}>()
</script>

<template>
  <div class="y-skeleton-wrapper">
    <div class="visually-hidden">
      {{ $t('loading') }}
    </div>

    <div v-if="search || button" id="top-bar-skeleton" class="d-flex mb-3">
      <div id="search-skeleton" class="top-bar-group-skeleton">
        <BInputGroup v-if="search" class="pe-none" aria-hidden="true">
          <BInputGroupText>
            <YIcon iname="search" />
          </BInputGroupText>

          <BFormInput :disabled="true" tabindex="-1" />
        </BInputGroup>
      </div>

      <div v-if="button" id="button-skeleton" class="top-bar-group-skeleton">
        <BSkeleton height="36px" class="ms-3-md" />
      </div>
    </div>

    <slot name="default" />
  </div>
</template>

<style scoped lang="scss">
.y-skeleton-wrapper {
  cursor: wait;

  #top-bar-skeleton {
    flex-wrap: wrap-reverse;

    .top-bar-group-skeleton {
      margin-bottom: 1rem;
    }

    #button-skeleton {
      width: 170px;
    }

    @include media-breakpoint-down(sm) {
      .top-bar-group-skeleton {
        flex-direction: column-reverse;
      }
      #button-skeleton {
        width: 100%;
      }
    }

    @include media-breakpoint-down(md) {
      flex-direction: column-reverse;

      #button-skeleton {
        margin-bottom: 0.75rem;

        :deep(> *) {
          margin-bottom: 0.25rem;
        }
      }

      .top-bar-group-skeleton {
        justify-content: space-between;
        flex-wrap: wrap;
      }
    }

    @include media-breakpoint-up(md) {
      #search-skeleton {
        flex-grow: 2;
        max-width: 50%;
      }

      #button-skeleton {
        margin-left: auto;
      }

      :deep(.btn) {
        margin-left: 0.5rem;
      }
    }
  }
}
</style>
