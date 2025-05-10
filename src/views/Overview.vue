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
          :value="stats.value" :percentage="stats.percentage" :increase="stats.increase" :decrease="stats.decrease" />
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
    }
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
  computed: {
    smallStats() {
      return [{
        label: 'Posts',
        value: '2,390',
        percentage: '4.7%',
        increase: true,
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(0, 184, 216, 0.1)',
          borderColor: 'rgb(0, 184, 216)',
          data: [1, 2, 1, 3, 5, 4, 7],
        }],
      }, {
        label: 'Pages',
        value: '182',
        percentage: '12.4',
        increase: true,
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(23,198,113,0.1)',
          borderColor: 'rgb(23,198,113)',
          data: [1, 2, 3, 3, 3, 4, 4],
        }],
      }, {
        label: 'Comments',
        value: '8,147',
        percentage: '3.8%',
        increase: false,
        decrease: true,
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(255,180,0,0.1)',
          borderColor: 'rgb(255,180,0)',
          data: [2, 3, 3, 3, 4, 3, 3],
        }],
      }, {
        label: 'New Customers',
        value: '29',
        percentage: '2.71%',
        increase: false,
        decrease: true,
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(255,65,105,0.1)',
          borderColor: 'rgb(255,65,105)',
          data: [1, 7, 1, 3, 1, 4, 8],
        }],
      }, {
        label: 'Subscribers',
        value: '17,281',
        percentage: '2.4%',
        increase: false,
        decrease: true,
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgb(0,123,255,0.1)',
          borderColor: 'rgb(0,123,255)',
          data: [3, 2, 3, 2, 4, 5, 4],
        }],
      }];
    },
  },
};
</script>
