<template>
  <v-navigation-drawer
    v-model="sidebarVisible"
    :rail="false"
    :permanent="$vuetify.display.mdAndUp"
    :temporary="!$vuetify.display.mdAndUp"
    width="250"
    class="main-sidebar"
  >
    <!-- Logo -->
    <v-list-item class="pa-2 border-b">
      <router-link to="/" class="text-decoration-none d-flex align-center">
        <v-img src="@/assets/images/gorse.png" width="25" class="mr-2" />
        <span v-if="!hideLogoText" class="text-body-1 font-weight-medium">Gorse Dashboard</span>
      </router-link>
    </v-list-item>

    <!-- Navigation Items -->
    <v-list density="compact" nav>
      <template v-for="(item, navItemIdx) in items" :key="navItemIdx">
        <!-- Item with children -->
        <v-list-group v-if="item.items && item.items.length" :value="`snc-${navItemIdx}`">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :prepend-icon="item.htmlBefore ? undefined : undefined"
              :title="item.title"
            >
              <template v-slot:prepend v-if="item.htmlBefore">
                <div v-html="item.htmlBefore" class="mr-2"></div>
              </template>
            </v-list-item>
          </template>
          <v-list-item
            v-for="(subItem, subItemIdx) in item.items"
            :key="subItemIdx"
            :to="subItem.to"
            :href="subItem.href"
            :title="subItem.title"
          />
        </v-list-group>

        <!-- Item without children -->
        <v-list-item
          v-else
          :to="item.to"
          :href="item.href"
          :title="item.title"
          :prepend-icon="undefined"
        >
          <template v-slot:prepend v-if="item.htmlBefore">
            <div v-html="item.htmlBefore" class="mr-2"></div>
          </template>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { getCurrentInstance } from 'vue';

export default {
  name: 'main-sidebar',
  props: {
    hideLogoText: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      sidebarVisible: true,
    };
  },
  created() {
    const instance = getCurrentInstance();
    const eventHub = instance.appContext.config.globalProperties.$eventHub;
    eventHub.$on('toggle-sidebar', this.handleToggleSidebar);
  },
  beforeUnmount() {
    const instance = getCurrentInstance();
    const eventHub = instance.appContext.config.globalProperties.$eventHub;
    eventHub.$off('toggle-sidebar', this.handleToggleSidebar);
  },
  methods: {
    handleToggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible;
    },
  },
};
</script>

<style scoped>
.main-sidebar {
  height: 100vh !important;
}
</style>