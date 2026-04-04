<template>
  <main-sidebar :items="sidebarItems" />
  <main-navbar />

  <v-main>
    <slot />
  </v-main>

  <main-footer />
</template>

<script>
import getSidebarItems from '@/data/sidebar-nav-items';

// Main layout components
import MainNavbar from '@/components/layout/MainNavbar/MainNavbar.vue';
import MainSidebar from '@/components/layout/MainSidebar/MainSidebar.vue';
import MainFooter from '@/components/layout/MainFooter/MainFooter.vue';

export default {
  name: 'analytics',
  components: {
    MainNavbar,
    MainSidebar,
    MainFooter,
  },
  data() {
    return {
      sidebarItems: getSidebarItems(),
    };
  },
};
</script>

