<template>
  <v-app-bar
    color="surface"
    :elevation="stickyTop ? 1 : 0"
    :flat="!stickyTop"
    density="comfortable"
    border
  >
    <template #prepend>
      <v-app-bar-nav-icon class="d-sm-inline d-md-none d-lg-none" @click="toggleSidebar">
        <i class="material-icons">menu</i>
      </v-app-bar-nav-icon>
    </template>

    <v-spacer />

    <v-btn v-if="chat" :to="{ name: 'chat' }" icon variant="text">
      <i class="material-icons">smart_toy</i>
    </v-btn>

    <v-menu v-if="userInfo && userInfo.auth_type.length === 0" v-model="showUserActions" location="bottom end">
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" class="text-none px-3">
          <v-avatar size="32" class="mr-2">
            <img :src="userInfo.picture.length > 0 ? userInfo.picture : getAvatar(userInfo.name)" alt="User Avatar">
          </v-avatar>
          <span class="d-none d-md-inline-block">{{ userInfo.name }}</span>
        </v-btn>
      </template>

      <v-list density="compact">
        <v-list-item href="/logout">
          <template #prepend>
            <i class="material-icons">logout</i>
          </template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <div v-else-if="userInfo" class="d-flex align-center px-3">
      <v-avatar size="32" class="mr-2">
        <img :src="userInfo.picture.length > 0 ? userInfo.picture : getAvatar(userInfo.name)" alt="User Avatar">
      </v-avatar>
      <span class="d-none d-md-inline-block">{{ userInfo.name }}</span>
    </div>
  </v-app-bar>
</template>

<script>
import axios from 'axios';
import multiavatar from '@multiavatar/multiavatar';

export default {
  components: {
  },
  props: {
    /**
       * Whether the main navbar should be sticky, or not.
       */
    stickyTop: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      userInfo: null,
      chat: false,
      showUserActions: false,
    };
  },
  mounted() {
    axios({
      method: 'get',
      url: '/api/dashboard/userinfo',
    }).then((response) => {
      this.userInfo = response.data;
    });
    axios({
      method: 'get',
      url: '/api/dashboard/config',
    }).then((response) => {
      this.chat = response.data.openai.base_url.length > 0;
    });
  },
  methods: {
    toggleSidebar() {
      this.$eventHub.$emit('toggle-sidebar');
    },
    getAvatar(name) {
      const svgCode = multiavatar(name);
      const parser = new DOMParser();
      const svg = parser.parseFromString(svgCode, 'image/svg+xml');
      svg.documentElement.setAttribute('width', '100');
      svg.documentElement.setAttribute('height', '100');
      const encodedSvg = encodeURIComponent(svg.documentElement.outerHTML);
      return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
    },
  },
};
</script>
