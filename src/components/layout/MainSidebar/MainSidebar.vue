<template>
  <v-navigation-drawer
    v-model="drawer"
    :temporary="isMobile"
    :permanent="!isMobile"
    location="left"
    width="260"
    color="surface"
    border
  >
    <v-toolbar density="comfortable" color="surface" flat>
      <v-toolbar-title class="text-subtitle-1 font-weight-medium d-flex align-center">
        <v-avatar size="24" class="mr-2">
          <img src="@/assets/images/gorse.png" alt="Gorse Dashboard">
        </v-avatar>
        <span v-if="!hideLogoText">Gorse Dashboard</span>
      </v-toolbar-title>

      <template #append>
        <v-btn v-if="isMobile" variant="text" icon @click="toggleDrawer">
          <i class="material-icons">chevron_left</i>
        </v-btn>
      </template>
    </v-toolbar>

    <v-divider />

    <v-list nav density="comfortable">
      <template v-for="(item, navItemIdx) in items" :key="navItemIdx">
        <v-list-item
          v-if="!(item.items && item.items.length)"
          :to="item.to"
          rounded="lg"
          color="primary"
        >
          <template #prepend>
            <i v-if="extractIcon(item.htmlBefore)" class="material-icons">{{ extractIcon(item.htmlBefore) }}</i>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>

        <v-list-group
          v-else
          :model-value="isNavOpen(navItemIdx)"
          @update:modelValue="setNavOpen(navItemIdx, $event)"
        >
          <template #activator="{ props }">
            <v-list-item v-bind="props" rounded="lg" color="primary">
              <template #prepend>
                <i v-if="extractIcon(item.htmlBefore)" class="material-icons">{{ extractIcon(item.htmlBefore) }}</i>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </template>

          <v-list-item
            v-for="(subItem, subItemIdx) in item.items"
            :key="subItemIdx"
            :href="subItem.href"
            :to="subItem.to"
            rounded="lg"
            color="primary"
          >
            <v-list-item-title>{{ subItem.title }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'main-sidebar',
  props: {
    /**
      * Whether to hide the logo text, or not.
      */
    hideLogoText: {
      type: Boolean,
      default: false,
    },
    /**
     * The menu items.
     */
    items: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      drawer: true,
      isMobile: false,
      openNavItems: {},
    };
  },
  created() {
    this.$eventHub.$on('toggle-sidebar', this.handleToggleSidebar);
  },
  mounted() {
    this.syncViewport();
    window.addEventListener('resize', this.syncViewport);
  },
  beforeUnmount() {
    this.$eventHub.$off('toggle-sidebar', this.handleToggleSidebar);
    window.removeEventListener('resize', this.syncViewport);
  },
  watch: {
    $route() {
      if (this.isMobile) {
        this.drawer = false;
      }
    },
  },
  methods: {
    extractIcon(html) {
      if (!html) {
        return '';
      }
      const matched = html.match(/<i[^>]*>([^<]+)<\/i>/i);
      return matched ? matched[1].trim() : '';
    },
    isNavOpen(index) {
      return !!this.openNavItems[index];
    },
    setNavOpen(index, isOpen) {
      this.openNavItems = {
        ...this.openNavItems,
        [index]: isOpen,
      };
    },
    syncViewport() {
      const mobile = window.innerWidth < 768;
      if (mobile !== this.isMobile) {
        this.isMobile = mobile;
        this.drawer = !mobile;
      }
    },
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    handleToggleSidebar() {
      this.drawer = !this.drawer;
    },
  },
};
</script>
