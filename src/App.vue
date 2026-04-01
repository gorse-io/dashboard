<template>
  <v-app>
    <component :is="layout">
      <router-view/>
    </component>
  </v-app>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  setup() {
    const route = useRoute();

    const layout = computed(() => {
      return `${route.meta.layout || 'default'}-layout`;
    });

    return {
      layout
    };
  }
};
</script>

<style>
/* Global styles */
.main-content-container {
  min-height: calc(100vh - 120px);
}
</style>