<template>
  <v-footer class="main-footer d-flex pa-2 px-3 bg-white border-t">
    <v-container :fluid="!contained" class="pa-0">
      <v-row no-gutters align="center">
        <v-col>
          <v-btn
            v-for="(item, idx) in menuItems"
            :key="idx"
            :href="item.to"
            target="_blank"
            variant="text"
            size="small"
          >
            {{ item.title }}
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <span class="copyright text-body-2">{{ copyright }}</span>
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
    menuItems: {
      type: Array,
      default() {
        return defaultMenuItems;
      },
    },
    copyright: {
      type: String,
      default: `Copyright © ${new Date().getFullYear()} zhenghaoz`,
    },
    contained: {
      type: Boolean,
      default: false,
    },
  },
};
</script>