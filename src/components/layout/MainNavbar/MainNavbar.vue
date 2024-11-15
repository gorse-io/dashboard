<template>
  <div :class="['main-navbar', 'bg-white', stickyTop ? 'sticky-top' : '']">
    <d-navbar type="light" class="align-items-stretch flex-md-nowrap p-0">
      <div class="main-navbar__search w-100 d-none d-md-flex d-lg-flex">
      </div>
      <d-navbar-nav class="border-left flex-row align-right">
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
const axios = require('axios');

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
    };
  },
  mounted() {
    axios.get('/api/dashboard/userinfo').then((response) => {
      this.userInfo = response.data;
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
