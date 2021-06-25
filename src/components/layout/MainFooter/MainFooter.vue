<template>
  <footer class="main-footer d-flex p-2 px-3 bg-white border-top">
    <div :class="[contained ? 'container' : 'container-fluid']">
      <div class="row">
        <ul class="nav">
          <li v-for="(item, idx) in menuItems" :key="idx" class="nav-item">
            <a class="nav-link" target="__blank" :href="item.to">{{ item.title }}</a>
          </li>
        </ul>
        <span class="copyright ml-auto my-auto mr-2">{{ copyright }}</span>
      </div>
    </div>
  </footer>
</template>

<script>
const defaultMenuItems = [{
  title: 'Home',
  to: 'https://gorse.io/',
}, {
  title: 'GitHub',
  to: 'https://github.com/zhenghaoz/gorse',
}, {
  title: 'Document',
  to: 'https://docs.gorse.io/',
}];

export default {
  name: 'main-footer',
  props: {
    /**
       * The footer menu items.
       */
    menuItems: {
      type: Array,
      default() {
        return defaultMenuItems;
      },
    },
    /**
       * The copyright information.
       */
    copyright: {
      type: String,
      default: 'Copyright © 2021 zhenghaoz',
    },
    /**
       * Whether the footer should be wrapped in a container, or not.
       */
    contained: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
