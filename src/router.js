import Vue from 'vue';
import Router from 'vue-router';

import Tasks from './views/Tasks.vue';
import Overview from './views/Overview.vue';
import Errors from './views/Errors.vue';
import Cluster from './views/Cluster.vue';
import Users from './views/Users.vue';
import Items from './views/Items.vue';
import Recommend from './views/Recommend.vue';
import ItemNeighbors from './views/ItemNeighbors.vue';
import UserNeighbors from './views/UserNeighbors.vue';
import Settings from './views/Settings.vue';
import Advance from './views/Advance.vue';
import ImportItems from './views/ImportItems.vue';
import ImportUsers from './views/ImportUsers.vue';
import ImportFeedback from './views/ImportFeedback.vue';

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
      path: '/tasks',
      name: 'tasks',
      component: Tasks,
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
      path: '/item_neighbors',
      name: 'item_neighbors',
      component: ItemNeighbors,
    },
    {
      path: '/user_neighbors',
      name: 'user_neighbors',
      component: UserNeighbors,
    },
    {
      path: '/advance',
      name: 'advance',
      component: Advance,
    },
    {
      path: '/import/items',
      name: 'import_items',
      component: ImportItems,
    },
    {
      path: '/import/users',
      name: 'import_users',
      component: ImportUsers,
    },
    {
      path: '/import/feedback',
      name: 'import_feedback',
      component: ImportFeedback,
    },
    {
      path: '/login',
      name: 'login',
      meta: { layout: 'login' },
    },
    {
      path: '*',
      redirect: '/errors',
    },
  ],
});
