<template>
  <b-card no-body>
    <b-card-header header-tag="nav">
      <b-nav card-header fill pills>
        <b-nav-item
          v-for="route in routes" :key="route.text"
          :to="route.to" exact exact-active-class="active"
        >
          <icon v-if="route.icon" :iname="route.icon" />
          {{ route.text }}
        </b-nav-item>
      </b-nav>
    </b-card-header>

    <!-- Bind extra props to the child view and forward child events to parent -->
    <router-view v-bind="$attrs" v-on="$listeners">
      <template #tab-top>
        <slot name="tab-top" />
      </template>
      <template #tab-before>
        <slot name="tab-before" />
      </template>
      <template #tab-after>
        <slot name="tab-after" />
      </template>
    </router-view>
  </b-card>
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
