<template>
  <view-base :queries="queries" @queries-response="formatMigrationsData" ref="view">
    <!-- PENDING MIGRATIONS -->
    <card :title="$t('migrations_pending')" icon="cogs" no-body>
      <template #header-buttons v-if="pending">
        <b-button size="sm" variant="success" @click="runMigrations">
          <icon iname="play" /> {{ $t('run') }}
        </b-button>
      </template>

      <b-card-body v-if="pending === null">
        <span class="text-success">
          <icon iname="check-circle" /> {{ $t('migrations_no_pending') }}
        </span>
      </b-card-body>

      <b-list-group v-else-if="pending" flush>
        <b-list-group-item
          v-for="{ number, description, id, disclaimer } in pending" :key="number"
        >
          <div class="d-flex align-items-center">
            {{ number }}. {{ description }}

            <div class="ml-auto">
              <b-button @click="skipMigration(id)" size="sm" variant="warning">
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
    </card>

    <!-- DONE MIGRATIONS -->
    <card
      :title="$t('migrations_done')" icon="cogs"
      collapsable collapsed no-body
    >
      <b-card-body v-if="done === null">
        <span class="text-success">
          <icon iname="check-circle" /> {{ $t('migrations_no_done') }}
        </span>
      </b-card-body>

      <b-list-group flush v-else-if="done">
        <b-list-group-item v-for="{ number, description } in done" :key="number">
          {{ number }}. {{ description }}
        </b-list-group-item>
      </b-list-group>
    </card>

    <template #skeleton>
      <card-list-skeleton :item-count="3" />
      <b-card no-body>
        <template #header>
          <b-skeleton width="30%" height="36px" class="m-0" />
        </template>
      </b-card>
    </template>
  </view-base>
</template>

<script>
import api from '@/api'

// FIXME not tested with pending migrations (disclaimer and stuff)
export default {
  name: 'ToolMigrations',

  data () {
    return {
      queries: [
        'migrations?pending',
        'migrations?done'
      ],
      pending: undefined,
      done: undefined,
      checked: {}
    }
  },

  methods: {
    formatMigrationsData ({ migrations: pending }, { migrations: done }) {
      this.done = done.length ? done.reverse() : null
      pending.forEach(migration => {
        if (migration.disclaimer) {
          migration.disclaimer = migration.disclaimer.replace('\n', '<br>')
          this.$set(this.checked, migration.id, null)
        }
      })
      // FIXME change to pending
      this.pending = pending.length ? pending.reverse() : null
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
        api.post('migrations/migrate', { accept_disclaimer: true }).then(() => {
          this.$refs.view.fetchQueries()
        })
      }
    },

    async skipMigration (id) {
      const confirmed = await this.$askConfirmation(this.$i18n.t('confirm_migrations_skip'))
      if (!confirmed) return

      api.post('/migrations/migrate', { skip: true, targets: id }).then(() => {
        this.$refs.view.fetchQueries()
      })
    }
  }
}
</script>
