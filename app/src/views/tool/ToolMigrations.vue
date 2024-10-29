<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

import api from '@/api'
import { useAutoModal } from '@/composables/useAutoModal'
import type { Obj } from '@/types/commons'
import type { MigrationList } from '@/types/core/api'

// FIXME not tested with pending migrations (disclaimer and stuff)
const { t } = useI18n()
const modalConfirm = useAutoModal()

const { pending, done, checked } = await api
  .fetchAll<
    [MigrationList, MigrationList]
  >([{ uri: 'migrations?pending' }, { uri: 'migrations?done' }])
  .then(([{ migrations: pending }, { migrations: done }]) => {
    const checked = {} as Obj<boolean | undefined>
    return {
      pending: pending.length
        ? reactive(
            pending
              .map((migration) => {
                if (migration.disclaimer) {
                  migration.disclaimer =
                    migration.disclaimer.replaceAll('\n', '<br>') ?? null
                  checked[migration.id] = false
                }
                return migration
              })
              .reverse(),
          )
        : null,
      done: done.length ? done.reverse() : null,
      checked: reactive(checked),
    }
  })

function runMigrations() {
  // Check that every migration's disclaimer has been checked.
  if (Object.values(checked).every((value) => value === true)) {
    api
      .put({ uri: 'migrations?accept_disclaimer', humanKey: 'migrations.run' })
      .then(() => api.refetch())
  }
}

async function skipMigration(id: string) {
  const confirmed = await modalConfirm(t('confirm_migrations_skip'))
  if (!confirmed) return
  api
    .put({
      uri: '/migrations/' + id,
      data: { skip: '', targets: id },
      humanKey: 'migration.skip',
    })
    .then(() => api.refetch())
}
</script>

<template>
  <div>
    <!-- PENDING MIGRATIONS -->
    <YCard :title="$t('migrations_pending')" icon="cogs" no-body>
      <template v-if="pending" #header-buttons>
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
              <BButton
                size="sm"
                variant="warning"
                class="d-flex align-items-center ms-2"
                @click="skipMigration(id)"
              >
                <YIcon iname="close" /> {{ $t('skip') }}
              </BButton>
            </div>
          </div>

          <template v-if="disclaimer">
            <hr />
            <VueShowdown :markdown="disclaimer" />

            <BFormCheckbox
              :id="'checkbox-' + number"
              v-model="checked[id]"
              :name="'checkbox-' + number"
              :aria-describedby="'checkbox-feedback-' + number"
            >
              {{ $t('migrations_disclaimer_check_message') }}
            </BFormCheckbox>
            <BFormInvalidFeedback
              v-if="checked[id] === false"
              :id="'checkbox-feedback-' + number"
              :state="false"
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
      collapsible
      collapsed
      no-body
    >
      <BCardBody v-if="done === null">
        <span class="text-success">
          <YIcon iname="check-circle" /> {{ $t('migrations_no_done') }}
        </span>
      </BCardBody>

      <BListGroup v-else-if="done" flush>
        <BListGroupItem v-for="{ number, description } in done" :key="number">
          {{ number }}. {{ description }}
        </BListGroupItem>
      </BListGroup>
    </YCard>
  </div>
</template>
