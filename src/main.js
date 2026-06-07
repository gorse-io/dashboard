/* eslint-disable */
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

app.use(router);
app.use(ShardsVue);
app.use(hljsVuePlugin);

app.component('default-layout', Default);
app.component('login-layout', Login);
app.config.globalProperties.$eventHub = createEventHub();

app.mount('#app');
