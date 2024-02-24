<template>
  <BCard no-body>
    <BCardHeader header-tag="nav">
      <BNav card-header fill pills>
        <BNavItem
          v-for="route in routes" :key="route.text"
          :to="route.to" exact exact-active-class="active"
        >
          <Icon v-if="route.icon" :iname="route.icon" />
          {{ route.text }}
        </BNavItem>
      </BNav>
    </BCardHeader>

    <!-- Bind extra props to the child view and forward child events to parent -->
    <RouterView v-bind="$attrs" v-on="$listeners">
      <template #tab-top>
        <slot name="tab-top" />
      </template>
      <template #tab-before>
        <slot name="tab-before" />
      </template>
      <template #tab-after>
        <slot name="tab-after" />
      </template>
    </RouterView>
  </BCard>
</template>

<script>
export default {
  name: 'RoutableTabs',

  // Thanks to `v-bind="$attrs"` and `inheritAttrs: false`, this component can forward
  // arbitrary attributes (props) directly to its children.
  inheritAttrs: false,

  props: {
    routes: { type: Array, required: true }
  }
}
</script>
