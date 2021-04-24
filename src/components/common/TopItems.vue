<template>
  <d-card class="card-small">

    <!-- Card Header -->
    <d-card-header class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle"></div>
    </d-card-header>

    <d-card-body class="p-0">

      <!-- Top Referrals List Group -->
      <div v-for="(item, idx) in items" :key="idx" class="blog-comments__item d-flex p-3">

        <!-- Content -->
        <div class="blog-comments__content">

          <!-- Content - Title -->
          <div class="blog-comments__meta text-muted">
            {{ item.ItemId }}
          </div>

          <!-- Content - Body -->
          <p class="m-0 my-1 mb-2 text-muted text-semibold">{{ item.Comment }}</p>

          <!-- Content - Actions -->
          <div class="blog-comments__actions">
            <d-badge outline theme="primary" v-for="(label, idx) in item.Labels" :key="idx">
              {{ label }}
            </d-badge>
          </div>
        </div>

      </div>

    </d-card-body>

    <d-card-footer class="border-top">
    </d-card-footer>

  </d-card>
</template>

<script>
const axios = require('axios');
export default {
  name: 'ao-top-referrals',
  props: {
    /**
       * The component's title.
       */
    title: {
      type: String,
      default: '--',
    },
    /**
       * The referral datasets.
       */
    items: {
      type: Array,
      default() {
        return [];
      },
    },
  }
};
</script>
