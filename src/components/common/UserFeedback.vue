<template>
  <d-card class="card-small">
    <!-- Card Header -->
    <d-card-header class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle"></div>
    </d-card-header>

    <d-card-body class="p-0">
      <div class="card-body border-bottom">
        <d-select v-model="feedbackType" @change="selectType">
          <option v-for="feedbackType in types" :key="feedbackType" :value="feedbackType">
            {{ feedbackType }}
          </option>
        </d-select>
      </div>
    </d-card-body>

    <d-card-body class="p-0">
      <!-- Top Referrals List Group -->
      <div v-for="(item, idx) in items" :key="idx" class="blog-comments__item d-flex p-3">
        <!-- Content -->
        <div class="blog-comments__content">
          <!-- Content - Title -->
          <div class="blog-comments__meta text-muted">
            {{ item.Item.ItemId }}
            <d-badge outline pill theme="secondary" class="float-right">
              {{ item.FeedbackType + (item.Value > 0 ? ' ' + item.Value : '') }}
            </d-badge>
          </div>

          <!-- Content - Body -->
          <p class="m-0 my-1 mb-2 text-muted text-semibold">
            {{ item.Item.Comment }}
          </p>

          <!-- Content - Actions -->
          <div class="blog-comments__actions">
            <d-badge outline v-for="(label, idx) in item.Item.Categories" :key="idx">
              {{ label }}
            </d-badge>
            <span
              style="font-family: Consolas, Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace, serif">
              {{ fold(item.Item.Labels) }}
            </span>
          </div>

          <p class="m-0 my-0 mb-0 text-muted text-semibold" style="font-size: 80%">
            {{ item.Timestamp }}
          </p>
        </div>
      </div>
    </d-card-body>

    <d-card-footer class="border-top">
      <d-button-group class="mb-3">
        <d-button class="btn-white" @click="prevPage" v-if="this.offset !== 0"><i
            class="material-icons">arrow_back_ios</i></d-button>
        <d-button class="btn-white" @click="nextPage" v-if="this.items.length == this.pageSize"><i
            class="material-icons">arrow_forward_ios</i></d-button>
      </d-button-group>
    </d-card-footer>
  </d-card>
</template>

<script>
import axios from 'axios';
import utils from '@/utils';

export default {
  name: 'ao-top-referrals',
  props: {
    title: {
      type: String,
      default: '--',
    },
    user_id: {
      default: '',
    },
    pageSize: {
      default: 10,
    },
    items: {
      type: Array,
      default() {
        return [];
      },
    },
    types: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      offset: 0,
      feedbackType: '',
    };
  },
  methods: {
    prevPage() {
      this.offset = this.offset - this.pageSize;
      this.selectType(this.feedbackType);
    },
    nextPage() {
      this.offset += this.pageSize;
      this.selectType(this.feedbackType);
    },
    fold: utils.fold,
    selectType(value) {
      if (this.feedbackType !== value) {
        this.offset = 0;
        this.feedbackType = value;
      }
      axios({
        method: 'get',
        url: `/api/dashboard/user/${this.user_id}/feedback/${value}`,
        params: {
          offset: this.offset,
          n: this.pageSize,
        },
      }).then((response) => {
        this.items = response.data;
      });
    },
  },
  mounted() {
    this.selectType(this.feedbackType);
  },
};
</script>
