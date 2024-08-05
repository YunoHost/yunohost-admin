<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'
import { useInitialQueries } from '@/composables/useInitialQueries'

// FIXME not tested with pending migrations (disclaimer and stuff)
const { t } = useI18n()
const modalConfirm = useAutoModal()
const { loading, refetch } = useInitialQueries(
  [{ uri: 'migrations?pending' }, { uri: 'migrations?done' }],
  { onQueriesResponse },
)

const pending = ref()
const done = ref()
const checked = reactive({})

function onQueriesResponse(
  { migrations: pending_ }: any,
  { migrations: done_ }: any,
) {
  done.value = done_.length ? done_.reverse() : null
  pending_.forEach((migration) => {
    if (migration.disclaimer) {
      migration.disclaimer = migration.disclaimer.replaceAll('\n', '<br>')
      checked[migration.id] = null
    }
  })
  // FIXME change to pending
  pending.value = pending_.length ? pending_.reverse() : null
}

function runMigrations() {
  // Display an error on migration's disclaimer that aren't checked.
  for (const [id, value] of Object.entries(checked)) {
    if (value !== true) {
      checked[id] = false
    }
  }
  // Check that every migration's disclaimer has been checked.
  if (Object.values(checked).every((value) => value === true)) {
    api
      .put({ uri: 'migrations?accept_disclaimer', humanKey: 'migrations.run' })
      .then(() => refetch(false))
  }
}

async function skipMigration(id) {
  const confirmed = await modalConfirm(t('confirm_migrations_skip'))
  if (!confirmed) return
  api
    .put({
      uri: '/migrations/' + id,
      data: { skip: '', targets: id },
      humanKey: 'migration.skip',
    })
    .then(() => refetch(false))
}
</script>

<template>
  <ViewBase :loading="loading">
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

            <div class="ms-auto">
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
