<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters>
      <!-- Main Sidebar -->
      <main-sidebar :items="sidebarItems" />

      <v-col class="main-content offset-lg-2 offset-md-3 pa-0" cols="12" lg="10" md="9" sm="12">
        <!-- Main Navbar -->
        <main-navbar />

        <!-- Content -->
        <slot />

        <!-- Main Footer -->
        <main-footer />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import getSidebarItems from '@/data/sidebar-nav-items';

// Main layout components
import MainNavbar from '@/components/layout/MainNavbar/MainNavbar.vue';
import MainSidebar from '@/components/layout/MainSidebar/MainSidebar.vue';
import MainFooter from '@/components/layout/MainFooter/MainFooter.vue';

export default {
  name: 'default-layout',
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

<style scoped>
.main-content {
  min-height: 100vh;
}
</style>