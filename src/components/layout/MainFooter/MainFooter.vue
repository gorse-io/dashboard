<template>
  <v-footer color="surface" border>
    <v-container :fluid="!contained">
      <v-row align="center" no-gutters>
        <v-col cols="12" md="auto" class="d-flex flex-wrap">
          <v-btn
            v-for="(item, idx) in menuItems"
            :key="idx"
            variant="text"
            density="comfortable"
            class="text-none px-2"
            target="_blank"
            :href="item.to"
          >
            {{ item.title }}
          </v-btn>
        </v-col>

        <v-spacer />

        <v-col cols="12" md="auto" class="text-md-right text-medium-emphasis py-1 py-md-0">
          {{ copyright }}
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
const defaultMenuItems = [{
  title: 'Home',
  to: 'https://gorse.io/',
}, {
  title: 'GitHub',
  to: 'https://github.com/gorse-io/gorse',
}, {
  title: 'Document',
  to: 'https://gorse.io/docs',
}, {
  title: 'API',
  to: '/apidocs/',
}];

export default {
  name: 'main-footer',
  props: {
    /**
       * The footer menu items.
       */
    menuItems: {
      type: Array,
      default() {
        return defaultMenuItems;
      },
    },
    /**
       * The copyright information.
       */
    copyright: {
      type: String,
      default: `Copyright © ${new Date().getFullYear()} zhenghaoz`,
    },
    /**
       * Whether the footer should be wrapped in a container, or not.
       */
    contained: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
