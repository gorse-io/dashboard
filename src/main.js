/* eslint-disable */
import axios from 'axios';
import { createApp } from 'vue';
import ShardsVue from '@gorse/shards-vue';

// highlight.js
import hljsVuePlugin from '@highlightjs/vue-plugin'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/a11y-dark.css'

hljs.registerLanguage('json', json)

// Styles
import 'bootstrap/dist/css/bootstrap.css';
import '@/scss/shards-dashboards.scss';
import '@/assets/scss/date-range.scss';
import 'material-icons/iconfont/material-icons.css';

// Core
import App from './App.vue';
import router from './router';
import { clearLoginStatus } from './utils/auth';
import { applyTheme, getPreferredTheme } from './utils/theme';

// Layouts
import Default from '@/layouts/Default.vue';
import Login from '@/layouts/Login.vue';

function createEventHub() {
  const listeners = Object.create(null);

  return {
    $on(event, callback) {
      listeners[event] = listeners[event] || new Set();
      listeners[event].add(callback);
    },
    $off(event, callback) {
      if (!listeners[event]) {
        return;
      }

      if (callback) {
        listeners[event].delete(callback);
      } else {
        listeners[event].clear();
      }
    },
    $emit(event, ...args) {
      if (!listeners[event]) {
        return;
      }

      listeners[event].forEach(callback => callback(...args));
    },
  };
}

const app = createApp(App);

applyTheme(getPreferredTheme());

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !(error.config && error.config.skipAuthRedirect)) {
      clearLoginStatus();
      if (router.currentRoute.value.name !== 'login') {
        router.push({
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath },
        }).catch(() => {});
      }
      return new Promise(() => {});
    }
    return Promise.reject(error);
  },
);

app.use(router);
app.use(ShardsVue);
app.use(hljsVuePlugin);

app.component('default-layout', Default);
app.component('login-layout', Login);
app.config.globalProperties.$eventHub = createEventHub();

router.isReady().then(() => {
  app.mount('#app');
});
