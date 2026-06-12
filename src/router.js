import axios from 'axios';
import { createRouter, createWebHistory } from 'vue-router';

import Tasks from './views/Tasks.vue';
import Overview from './views/Overview.vue';
import Errors from './views/Errors.vue';
import Chat from './views/Chat.vue';
import Cluster from './views/Cluster.vue';
import Users from './views/Users.vue';
import Items from './views/Items.vue';
import Recommend from './views/Recommend.vue';
import Item from './views/Item.vue';
import User from './views/User.vue';
import Settings from './views/Settings.vue';
import Advance from './views/Advance.vue';
import ImportItems from './views/ImportItems.vue';
import ImportUsers from './views/ImportUsers.vue';
import ImportFeedback from './views/ImportFeedback.vue';
import RecFlow from './views/RecFlow.vue';
import { getLoginStatus, setLoginStatus } from './utils/auth';

async function verifyLoginStatus() {
  try {
    await axios.get('/api/dashboard/userinfo', {
      skipAuthRedirect: true,
    });
    setLoginStatus(true);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      setLoginStatus(false);
      return false;
    }
    return null;
  }
}

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  linkActiveClass: 'active',
  linkExactActiveClass: 'exact-active',
  scrollBehavior() {
    return { left: 0, top: 0 };
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
      path: '/recommend/:user_id',
      name: 'recommend',
      component: Recommend,
    },
    {
      path: '/item/:item_id',
      name: 'item',
      component: Item,
    },
    {
      path: '/user/:user_id',
      name: 'user',
      component: User,
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
      path: '/chat',
      name: 'chat',
      component: Chat,
    },
    {
      path: '/recflow',
      name: 'recflow',
      component: RecFlow,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/errors',
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if (to.name === 'login') {
    if (getLoginStatus() === true) {
      const isLoggedIn = await verifyLoginStatus();
      if (isLoggedIn === true) {
        next(to.query.redirect || '/overview');
        return;
      }
    }
    next();
    return;
  }

  const loginStatus = getLoginStatus();
  if (loginStatus === true) {
    const isLoggedIn = await verifyLoginStatus();
    if (isLoggedIn === false) {
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }
    next();
    return;
  }

  if (loginStatus === false) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  const isLoggedIn = await verifyLoginStatus();
  if (isLoggedIn === false) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
