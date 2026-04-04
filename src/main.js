/* eslint-disable */
import { createApp } from 'vue';
import mitt from 'mitt';

// highlight.js
import hljsVuePlugin from '@highlightjs/vue-plugin'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/a11y-dark.css'

hljs.registerLanguage('json', json)

// Styles
import '@/assets/scss/bootstrap-compat.scss';
import 'material-icons/iconfont/material-icons.css';

// Core
import App from './App.vue';
import router from './router';
import vuetify from '@/plugins/vuetify';
import vuetifyCompat from '@/plugins/vuetifyCompat';

// Layouts
import Default from '@/layouts/Default.vue';
import Login from '@/layouts/Login.vue';

const app = createApp(App);
const emitter = mitt();

app.use(router);
app.use(vuetify);
app.use(hljsVuePlugin);
app.use(vuetifyCompat);

app.component('default-layout', Default);
app.component('login-layout', Login);

app.config.globalProperties.$eventHub = {
  $on: emitter.on,
  $off: emitter.off,
  $emit: emitter.emit,
};

app.mount('#app');
