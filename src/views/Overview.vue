<template>
  <d-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <d-row no-gutters class="page-header py-4">
      <d-col col sm="4" class="text-center text-sm-left mb-4 mb-sm-0">
        <span class="text-uppercase page-subtitle">Dashboard</span>
        <h3 class="page-title">Overview</h3>
      </d-col>
    </d-row>

    <!-- Small Stats Blocks -->
    <d-row>
      <d-col lg v-for="(stats, idx) in smallStats" :key="idx" class="mb-4">
        <small-stats :id="`small-stats-${idx}`" variation="1" :chart-data="stats.datasets" :label="stats.label"
          :value="stats.value" :tip="stats.tip" :increase="stats.increase" :decrease="stats.decrease" />
      </d-col>
    </d-row>

    <d-row>
      <!-- Users Overview -->
      <d-col lg="12" md="12" sm="12" class="mb-4">
        <bo-users-overview />
      </d-col>
    </d-row>

    <d-row>
      <d-col lg="8" md="12" sm="12" class="mb-4">
        <bo-top-items :recommenders="nonPersonalized" />
      </d-col>

      <d-col lg="4" md="12" sm="12" class="mb-4">
        <bo-users-by-device />
      </d-col>
    </d-row>
  </d-container>
</template>

<script>
import axios from 'axios';
import SmallStats from '@/components/common/SmallStats.vue';
import CategorizedItems from '@/components/common/CategorizedItems.vue';
import UsersOverview from '@/components/statistics/UsersOverview.vue';
import UsersByDevice from '@/components/statistics/UsersByDeviceLite.vue';

const numeral = require('numeral');

export default {
  components: {
    SmallStats,
    boUsersOverview: UsersOverview,
    boUsersByDevice: UsersByDevice,
    boTopItems: CategorizedItems,
  },
  data() {
    return {
      cacheSize: 100,
      nonPersonalized: ['popular', 'latest'],
      smallStats:
        [{
          label: 'Users',
          value: '--',
          tip: '',
        }, {
          label: 'Items',
          value: '--',
          tip: '',
        }, {
          label: 'Total Positive',
          value: '--',
          tip: '',
        }, {
          label: 'Valid Positive',
          value: '--',
          tip: 'A positive feedback is valid only if this user has both positive feedback and negative feedback',
        }, {
          label: 'Valid Negative',
          value: '--',
          tip: 'A negative feedback is valid only if this user has both positive feedback and negative feedback',
        }],
      popularItems: [],
      latestItems: [],
    };
  },
  mounted() {
    // load config
    axios({
      method: 'get',
      url: '/api/dashboard/config',
    })
      .then((response) => {
        this.cacheSize = response.data.database.cache_size;
        this.nonPersonalized = ['popular', 'latest'];
        response.data.recommend['non-personalized'].forEach((recommender) => {
          this.nonPersonalized.push(recommender.name);
        });
      });

    // load status
    axios({
      method: 'get',
      url: '/api/dashboard/stats',
    })
      .then((response) => {
        this.smallStats[0].value = numeral(response.data.NumUsers).format('0,0');
        this.smallStats[1].value = numeral(response.data.NumItems).format('0,0');
        this.smallStats[2].value = numeral(response.data.NumTotalPosFeedback).format('0,0');
        this.smallStats[3].value = numeral(response.data.NumValidPosFeedback).format('0,0');
        this.smallStats[4].value = numeral(response.data.NumValidNegFeedback).format('0,0');
      });
  },
};
</script>
