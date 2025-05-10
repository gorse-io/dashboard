<template>
  <div :class="['main-navbar', 'bg-white', stickyTop ? 'sticky-top' : '']">
    <d-navbar type="light" class="align-items-stretch flex-md-nowrap p-0">
      <div class="main-navbar__search w-100 d-none d-md-flex d-lg-flex">
      </div>
      <d-navbar-nav class="border-left flex-row align-right">
        <li v-if="chat" class="nav-item border-right dropdown notifications">
          <a class="nav-link nav-link-icon text-center" v-d-toggle.notifications>
            <div class="nav-link-icon__wrapper">
              <router-link :to="{ name: 'chat' }">
                <i class="material-icons">smart_toy</i>
              </router-link>
            </div>
          </a>
        </li>
        <li v-if="userInfo != null" class="nav-item dropdown">
          <a class="nav-link text-nowrap px-3" :class="{ 'dropdown-toggle': userInfo.auth_type.length === 0 }"
            v-d-toggle.user-actions>
            <img class="user-avatar rounded-circle mr-2"
              :src="userInfo.picture.length > 0 ? userInfo.picture : `https://api.multiavatar.com/${userInfo.name}.png`"
              alt="User Avatar">
            <span class="d-none d-md-inline-block">{{ userInfo.name }}</span>
          </a>
          <d-collapse v-if="userInfo.auth_type.length === 0" id="user-actions"
            class="dropdown-menu dropdown-menu-small">
            <d-dropdown-item href="#" class="text-danger">
              <a style="text-decoration: none; color: inherit;" href="/logout">
                <i class="material-icons text-danger">&#xE879;</i> Logout</a>
            </d-dropdown-item>
          </d-collapse>
        </li>
      </d-navbar-nav>
    </d-navbar>
  </div>
</template>

<script>
import axios from 'axios';

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
    };
  },
  mounted() {
    axios({
      method: 'get',
      url: '/api/dashboard/userinfo',
    }).then((response) => {
      this.userInfo = response.data;
      console.log(response.data);
    });
    axios({
      method: 'get',
      url: '/api/dashboard/config',
    }).then((response) => {
      this.chat = response.data.openai.base_url.length > 0;
    });
  },
};
</script>

<style lang="scss">
.main-navbar {
  .dropdown-menu {
    display: block;
  }
}
</style>
