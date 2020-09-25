<template>
  <div class="tool-log">
    <!-- PENDING MIGRATIONS -->
    <b-card no-body>
      <b-card-header class="d-flex align-items-center">
        <h2>
          <icon iname="cogs" /> {{ $t('migrations_pending') }}
        </h2>

        <div class="ml-auto" v-if="pending && pending.length">
          <b-button size="sm" variant="success" @click="runMigrations">
            <icon iname="play" /> {{ $t('run') }}
          </b-button>
        </div>
      </b-card-header>

      <b-card-body v-if="pending && !pending.length">
        <span class="text-success">
          <icon iname="check-circle" /> {{ $t('migrations_no_pending') }}
        </span>
      </b-card-body>

      <b-list-group flush v-else-if="pending">
        <b-list-group-item
          v-for="{ number, description, id, disclaimer } in pending" :key="number"
        >
          <div class="d-flex align-items-center">
            {{ number }}. {{ description }}

            <div class="ml-auto" v-if="pending && pending.length">
              <b-button
                @click="skipId = id" v-b-modal.skip-modal
                size="sm" variant="warning"
              >
                <icon iname="close" /> {{ $t('skip') }}
              </b-button>
            </div>
          </div>

          <template v-if="disclaimer">
            <hr>
            <p v-html="disclaimer" />

            <b-form-checkbox
              :id="'checkbox-' + number" :name="'checkbox-' + number"
              :aria-describedby="'checkbox-feedback-' + number"
              v-model="checked[id]"
            >
              {{ $t('migrations_disclaimer_check_message') }}
            </b-form-checkbox>

            <b-form-invalid-feedback
              v-if="checked[id] === false" :state="false"
              :id="'checkbox-feedback-' + number"
            >
              {{ $t('migrations_disclaimer_not_checked') }}
            </b-form-invalid-feedback>
          </template>
        </b-list-group-item>
      </b-list-group>
    </b-card>

    <!-- DONE MIGRATIONS -->
    <b-card no-body>
      <b-card-header class="d-flex align-items-center">
        <h2><icon iname="cogs" /> {{ $t('migrations_done') }}</h2>

        <div class="ml-auto">
          <b-button v-b-toggle.collapse-done size="sm" variant="outline-secondary">
            <icon iname="chevron-right" /><span class="sr-only">{{ $t('words.collapse') }}</span>
          </b-button>
        </div>
      </b-card-header>

      <b-collapse id="collapse-done">
        <b-card-body v-if="done && !done.length">
          <span class="text-success">
            <icon iname="check-circle" /> {{ $t('migrations_no_done') }}
          </span>
        </b-card-body>

        <b-list-group flush v-else-if="done">
          <b-list-group-item
            v-for="{ number, description } in done" :key="number"
          >
            {{ number }}. {{ description }}
          </b-list-group-item>
        </b-list-group>
      </b-collapse>
    </b-card>

    <!-- SKIP MIGRATION CONFIRMATION MODAL -->
    <b-modal
      id="skip-modal" centered
      body-bg-variant="warning"
      @ok="skipMigration" hide-header
    >
      {{ $t('confirm_migrations_skip') }}
    </b-modal>
  </div>
</template>

<script>
import api from '@/helpers/api'

// FIXME not tested with pending migrations (disclaimer and stuff)

export default {
  name: 'ToolMigrations',

  props: {
  },

  data () {
    return {
      pending: undefined,
      done: undefined,
      skipId: undefined,
      checked: {}
    }
  },

  methods: {
    fetchData () {
      api.getAll([
        'migrations?pending',
        'migrations?done'
      ]).then(([{ migrations: pending }, { migrations: done }]) => {
        this.done = done.reverse()
        pending.forEach(migration => {
          if (migration.disclaimer) {
            migration.disclaimer = migration.disclaimer.replace('\n', '<br>')
            this.$set(this.checked, migration.id, null)
          }
        })
        // FIXME change to pending
        this.pending = pending.reverse()
      })
    },

    runMigrations () {
      // Display an error on migration's disclaimer that aren't checked.
      for (const [id, value] of Object.entries(this.checked)) {
        if (value !== true) {
          this.checked[id] = false
        }
      }
      // Check that every migration's disclaimer has been checked.
      if (Object.values(this.checked).every(value => value === true)) {
        api.post('migrations/migrate', { accept_disclaimer: true }).then(this.fetchData)
      }
    },

    skipMigration () {
      api.post('/migrations/migrate', { skip: true, targets: this.skipId }).then(this.fetchData)
    }
  },

  created () {
    this.fetchData()
  }
}
</script>
