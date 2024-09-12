<template>
  <div>
    <BListGroup>
      <BListGroupItem
        :to="{ name: 'backup-list', params: { id: 'local' } }"
        class="d-flex justify-content-between align-items-center pe-0"
      >
        <div>
          <h5 class="fw-bold">
            {{ $t('local_archives') }}
            <small class="text-secondary">local</small>
          </h5>
          <p class="m-0">/home/yunohost.backup/</p>
        </div>
        <YIcon iname="chevron-right" class="lg fs-sm ms-auto" />
      </BListGroupItem>
    </BListGroup>
  </div>
</template>
