<script setup lang="ts">
import api from '@/api'
import { toEntries } from '@/helpers/commons'
import { distanceToNow, readableDate } from '@/helpers/filters/date'
import { humanSize } from '@/helpers/filters/human'
import type { BackupList } from '@/types/core/api'

defineProps<{
  id: string
}>()

const archives = await api
  .get<BackupList>({ uri: 'backups?with_info', initial: true })
  .then((data) => {
    return toEntries(data.archives)
      .map(([name, archive]) => ({ ...archive, name }))
      .reverse()
  })
</script>

<template>
  <div>
    <TopBar
      :button="{
        text: $t('backup_new'),
        icon: 'plus',
        to: { name: 'backup-create' },
      }"
    />

    <YAlert
      v-if="!archives.length"
      alert
      icon="exclamation-triangle"
      variant="warning"
    >
      {{ $t('items_verbose_count', { items: $t('items.backups', 0) }, 0) }}
    </YAlert>

    <BListGroup v-else>
      <YListItem
        v-for="{ name, created_at, path, size } in archives"
        :key="name"
        :to="{ name: 'backup-info', params: { name, id } }"
        :title="readableDate(created_at)"
        :label="distanceToNow(created_at)"
        :sublabel="`${name} (${humanSize(size)})`"
        :description="path"
      />
    </BListGroup>
  </div>
</template>
