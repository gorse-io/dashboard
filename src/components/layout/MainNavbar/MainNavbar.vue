<template>
  <div :class="['main-navbar', 'bg-white', stickyTop ? 'sticky-top' : '']">
    <d-navbar type="light" class="align-items-stretch flex-md-nowrap p-0">
      <div class="main-navbar__search w-100 d-none d-md-flex d-lg-flex" />
      <d-navbar-nav class="border-left flex-row align-right">
        <li class="nav-item border-right theme-toggle">
          <button
            type="button"
            class="nav-link nav-link-icon text-center theme-toggle__button"
            :aria-label="themeToggleLabel"
            :title="themeToggleLabel"
            @click="toggleTheme"
          >
            <div class="nav-link-icon__wrapper">
              <i class="material-icons">{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</i>
            </div>
          </button>
        </li>
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
          <a
            class="nav-link text-nowrap px-3"
            :class="{ 'dropdown-toggle': userInfo.auth_type.length === 0 }"
            v-d-toggle.user-actions>
            <img
              class="user-avatar rounded-circle mr-2"
              :src="userInfo.picture.length > 0 ? userInfo.picture : getAvatar(userInfo.name)"
              alt="User Avatar">
            <span class="d-none d-md-inline-block">{{ userInfo.name }}</span>
          </a>
          <d-collapse
            v-if="userInfo.auth_type.length === 0"
            id="user-actions"
            class="dropdown-menu dropdown-menu-small">
            <d-dropdown-item href="#" class="text-danger">
              <a style="text-decoration: none; color: inherit;" href="/logout">
                <i class="material-icons text-danger">&#xE879;</i> Logout</a>
            </d-dropdown-item>
          </d-collapse>
        </li>
      </d-navbar-nav>
      <navbar-toggle />
    </d-navbar>
  </div>
</template>

<script>
import axios from 'axios';
import multiavatar from '@multiavatar/multiavatar';
import {
  applyTheme,
  DARK_THEME,
  getPreferredTheme,
  getStoredTheme,
  LIGHT_THEME,
  setTheme,
  THEME_STORAGE_KEY,
} from '@/utils/theme';
import NavbarToggle from './NavbarToggle.vue';

export default {
  components: {
    NavbarToggle,
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
      theme: getPreferredTheme(),
      themeMediaQuery: null,
    };
  },
  computed: {
    isDarkMode() {
      return this.theme === DARK_THEME;
    },
    themeToggleLabel() {
      return this.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
    },
  },
  mounted() {
    this.theme = applyTheme(getPreferredTheme());

    if (window.matchMedia) {
      this.themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (this.themeMediaQuery.addEventListener) {
        this.themeMediaQuery.addEventListener('change', this.handleSystemThemeChange);
      } else if (this.themeMediaQuery.addListener) {
        this.themeMediaQuery.addListener(this.handleSystemThemeChange);
      }
    }
    window.addEventListener('storage', this.handleStorageChange);

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
  beforeUnmount() {
    if (this.themeMediaQuery) {
      if (this.themeMediaQuery.removeEventListener) {
        this.themeMediaQuery.removeEventListener('change', this.handleSystemThemeChange);
      } else if (this.themeMediaQuery.removeListener) {
        this.themeMediaQuery.removeListener(this.handleSystemThemeChange);
      }
    }
    window.removeEventListener('storage', this.handleStorageChange);
  },
  methods: {
    toggleTheme() {
      this.theme = setTheme(this.isDarkMode ? LIGHT_THEME : DARK_THEME);
    },
    handleSystemThemeChange(event) {
      if (getStoredTheme()) {
        return;
      }
      this.theme = applyTheme(event.matches ? DARK_THEME : LIGHT_THEME);
    },
    handleStorageChange(event) {
      if (event.key === THEME_STORAGE_KEY) {
        this.theme = applyTheme(getPreferredTheme());
      }
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

<style lang="scss">
.main-navbar {
  .dropdown-menu {
    display: block;
  }

  .theme-toggle__button {
    background: transparent;
    border: 0;
    cursor: pointer;
    height: 100%;
    padding: 0;
  }

  .theme-toggle__button:focus {
    outline: none;
  }
}
</style>
