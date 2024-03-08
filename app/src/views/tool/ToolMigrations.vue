<template>
  <ViewBase :queries="queries" @queries-response="onQueriesResponse" ref="view">
    <!-- PENDING MIGRATIONS -->
    <YCard :title="$t('migrations_pending')" icon="cogs" no-body>
      <template #header-buttons v-if="pending">
        <BButton size="sm" variant="success" @click="runMigrations">
          <YIcon iname="play" /> {{ $t('run') }}
        </BButton>
      </template>

      <BCardBody v-if="pending === null">
        <span class="text-success">
          <YIcon iname="check-circle" /> {{ $t('migrations_no_pending') }}
        </span>
      </BCardBody>

      <BListGroup v-else-if="pending" flush>
        <BListGroupItem
          v-for="{ number, description, id, disclaimer } in pending"
          :key="number"
        >
          <div class="d-flex align-items-center">
            {{ number }}. {{ description }}

            <div class="ml-auto">
              <BButton @click="skipMigration(id)" size="sm" variant="warning">
                <YIcon iname="close" /> {{ $t('skip') }}
              </BButton>
            </div>
          </div>

          <template v-if="disclaimer">
            <hr />
            <p v-html="disclaimer" />

            <BFormCheckbox
              :id="'checkbox-' + number"
              :name="'checkbox-' + number"
              :aria-describedby="'checkbox-feedback-' + number"
              v-model="checked[id]"
            >
              {{ $t('migrations_disclaimer_check_message') }}
            </BFormCheckbox>

            <BFormInvalidFeedback
              v-if="checked[id] === false"
              :state="false"
              :id="'checkbox-feedback-' + number"
            >
              {{ $t('migrations_disclaimer_not_checked') }}
            </BFormInvalidFeedback>
          </template>
        </BListGroupItem>
      </BListGroup>
    </YCard>

    <!-- DONE MIGRATIONS -->
    <YCard
      :title="$t('migrations_done')"
      icon="cogs"
      collapsable
      collapsed
      no-body
    >
      <BCardBody v-if="done === null">
        <span class="text-success">
          <YIcon iname="check-circle" /> {{ $t('migrations_no_done') }}
        </span>
      </BCardBody>

      <BListGroup flush v-else-if="done">
        <BListGroupItem v-for="{ number, description } in done" :key="number">
          {{ number }}. {{ description }}
        </BListGroupItem>
      </BListGroup>
    </YCard>

    <template #skeleton>
      <CardListSkeleton :item-count="3" />
      <BCard no-body>
        <template #header>
          <BSkeleton width="30%" height="36px" class="m-0" />
        </template>
      </BCard>
    </template>
  </ViewBase>
</template>

<script>
import api from '@/api'

// FIXME not tested with pending migrations (disclaimer and stuff)
export default {
  compatConfig: { MODE: 3 },
  name: 'ToolMigrations',

  data() {
    return {
      queries: [
        ['GET', 'migrations?pending'],
        ['GET', 'migrations?done'],
      ],
      pending: undefined,
      done: undefined,
      checked: {},
    }
  },

  methods: {
    onQueriesResponse({ migrations: pending }, { migrations: done }) {
      this.done = done.length ? done.reverse() : null
      pending.forEach((migration) => {
        if (migration.disclaimer) {
          migration.disclaimer = migration.disclaimer.replaceAll('\n', '<br>')
          this.$set(this.checked, migration.id, null)
        }
      })
      // FIXME change to pending
      this.pending = pending.length ? pending.reverse() : null
    },

    runMigrations() {
      // Display an error on migration's disclaimer that aren't checked.
      for (const [id, value] of Object.entries(this.checked)) {
        if (value !== true) {
          this.checked[id] = false
        }
      }
      // Check that every migration's disclaimer has been checked.
      if (Object.values(this.checked).every((value) => value === true)) {
        api
          .put('migrations?accept_disclaimer', {}, 'migrations.run')
          .then(() => {
            this.$refs.view.fetchQueries()
          })
      }
    },

    async skipMigration(id) {
      const confirmed = await this.$askConfirmation(
        this.$i18n.t('confirm_migrations_skip'),
      )
      if (!confirmed) return
      api
        .put('/migrations/' + id, { skip: '', targets: id }, 'migration.skip')
        .then(() => {
          this.$refs.view.fetchQueries()
        })
    },
  },
}
</script>
