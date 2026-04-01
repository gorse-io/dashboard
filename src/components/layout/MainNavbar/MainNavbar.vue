<template>
  <v-app-bar
    :class="['main-navbar', stickyTop ? 'position-sticky' : '']"
    color="white"
    flat
    height="60"
  >
    <v-spacer />
    <v-btn
      v-if="chat"
      icon
      :to="{ name: 'chat' }"
    >
      <v-icon>mdi-robot</v-icon>
    </v-btn>

    <v-menu v-if="userInfo != null" location="bottom end">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" class="ml-2">
          <v-avatar size="32" class="mr-2">
            <v-img
              :src="userInfo.picture.length > 0 ? userInfo.picture : getAvatar(userInfo.name)"
              alt="User Avatar"
            />
          </v-avatar>
          <span class="d-none d-md-inline">{{ userInfo.name }}</span>
          <v-icon v-if="userInfo.auth_type.length === 0">mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list v-if="userInfo.auth_type.length === 0">
        <v-list-item href="/logout">
          <template v-slot:prepend>
            <v-icon color="error">mdi-logout</v-icon>
          </template>
          <v-list-item-title class="text-error">Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import axios from 'axios';
import multiavatar from '@multiavatar/multiavatar';

export default {
  name: 'main-navbar',
  props: {
    stickyTop: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      userInfo: null,
      chat: false,
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

<style scoped>
.main-navbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>