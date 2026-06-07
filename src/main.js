/* eslint-disable */
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import ShardsCompat from '@/plugins/shards-compat';

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

// Layouts
import Default from '@/layouts/Default.vue';
import Login from '@/layouts/Login.vue';

const app = createApp(App);

app.use(PrimeVue, {
  unstyled: true,
});
app.use(ShardsCompat);
app.use(hljsVuePlugin);
app.use(router);

app.component('default-layout', Default);
app.component('login-layout', Login);

app.mount('#app');
