import Vue from 'vue';
import Router from 'vue-router';

import Overview from './views/Overview.vue';
import Errors from './views/Errors.vue';
import Cluster from './views/Cluster.vue';
import Users from './views/Users.vue';
import Items from './views/Items.vue';
import Recommend from './views/Recommend.vue';
import Settings from './views/Settings.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active',
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
  routes: [
    {
      path: '/',
      redirect: '/overview',
    },
    {
      path: '/overview',
      name: 'overview',
      component: Overview,
    },
    {
      path: '/errors',
      name: 'errors',
      component: Errors,
    },
    {
      path: '/users',
      name: 'users',
      component: Users,
    },
    {
      path: '/cluster',
      name: 'cluster',
      component: Cluster,
    },
    {
      path: '/items',
      name: 'items',
      component: Items,
    },
    {
      path: '/config',
      name: 'config',
      component: Settings,
    },
    {
      path: '/recommend',
      name: 'recommend',
      component: Recommend,
    },
    {
      path: '*',
      redirect: '/errors',
    },
  ],
});
