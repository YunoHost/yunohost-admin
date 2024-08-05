<script setup lang="ts">
import { ref } from 'vue'

import { useInitialQueries } from '@/composables/useInitialQueries'
import { distanceToNow, readableDate } from '@/helpers/filters/date'
import { humanSize } from '@/helpers/filters/human'

const props = defineProps<{
  id: string
}>()

const { loading } = useInitialQueries([{ uri: 'backups?with_info' }], {
  onQueriesResponse,
})
const archives = ref<any[] | null>(null)

function onQueriesResponse(data: any) {
  const archives_ = Object.entries(data.archives)
  if (archives_.length) {
    archives.value = archives_
      .map(([name, infos]) => {
        infos.name = name
        return infos
      })
      .reverse()
  } else {
    archives.value = null
  }
}
</script>

<template>
  <ViewBase :loading="loading" skeleton="ListGroupSkeleton">
    <template #top>
      <TopBar
        :button="{
          text: $t('backup_new'),
          icon: 'plus',
          to: { name: 'backup-create' },
        }"
      />
    </template>

    <BAlert v-if="!archives" :modelValue="!archives" variant="warning">
      <YIcon iname="exclamation-triangle" />
      {{ $t('items_verbose_count', { items: $t('items.backups', 0) }, 0) }}
    </BAlert>

    <BListGroup v-else>
      <BListGroupItem
        v-for="{ name, created_at, path, size } in archives"
        :key="name"
        :to="{ name: 'backup-info', params: { name, id } }"
        :title="readableDate(created_at)"
        class="d-flex justify-content-between align-items-center pe-0"
      >
        <div>
          <h5 class="fw-bold">
            {{ distanceToNow(created_at) }}
            <small class="text-secondary"
              >{{ name }} ({{ humanSize(size) }})</small
            >
          </h5>
          <p class="mb-0">
            {{ path }}
          </p>
        </div>
        <YIcon iname="chevron-right" class="lg fs-sm ms-auto" />
      </BListGroupItem>
    </BListGroup>
  </ViewBase>
</template>
