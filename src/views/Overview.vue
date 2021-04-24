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
        <small-stats :id="`small-stats-${idx}`" variation="1" :chart-data="stats.datasets" :label="stats.label" :value="stats.value" :percentage="stats.percentage" :increase="stats.increase" :decrease="stats.decrease" />
      </d-col>
    </d-row>

    <!-- <d-row> -->
      <!-- Users Overview -->
      <!-- <d-col lg="8" md="6" sm="12" class="mb-4">
        <bo-users-overview />
      </d-col> -->

      <!-- Users by Device (lite) -->
      <!-- <d-col lg="4" md="6" sm="12" class="mb-4">
        <bo-users-by-device />
      </d-col>
    </d-row> -->

    <d-row>
      <d-col lg="6" md="12" sm="12" class="mb-4">
        <bo-top-items :title="'Popular Items'" :items="popularItems"/>
      </d-col>

      <d-col lg="6" md="12" sm="12" class="mb-4">
        <bo-top-items :title="'Latest Items'" :items="latestItems"/>
      </d-col>
    </d-row>
  </d-container>
</template>

<script>
const axios = require('axios');
const numeral = require("numeral");

import SmallStats from '@/components/common/SmallStats.vue';
import TopItems from '@/components/common/TopItems.vue';
import UsersOverview from '@/components/statistics/UsersOverview.vue';
import UsersByDevice from '@/components/statistics/UsersByDeviceLite.vue';

export default {
  components: {
    SmallStats,
    boUsersOverview: UsersOverview,
    boUsersByDevice: UsersByDevice,
    boTopItems: TopItems,
  },
  data() {
    return {
      smallStats: 
       [{
        label: 'Users',
        value: '--',
      }, {
        label: 'Items',
        value: '--',
      }, {
        label: 'Positive',
        value: '--',
      }, {
        label: 'PR Model',
        value: '--',
      }, {
        label: 'CTR Model',
        value: '--',
      }],
      popularItems: [],
      latestItems: []
    };
  },
  mounted() {
    // load status
    axios.get('http://127.0.0.1:8088/dashboard/stats')
    .then((response) => {
      this.smallStats[0].value = numeral(response.data.NumUsers).format("0,0")
      this.smallStats[1].value = numeral(response.data.NumItems).format("0,0")
      this.smallStats[2].value = numeral(response.data.NumPosFeedback).format("0,0")
      if (response.data.PRModel != "") {
        this.smallStats[3].value = response.data.PRModel.toUpperCase()
      }
      if (response.data.CTRModel != "") {
        this.smallStats[4].value = response.data.CTRModel
      }
    });  
    // load latest items
    axios.get('http://127.0.0.1:8088/dashboard/latest')
      .then((response) => {
        this.latestItems = response.data
      });  
    // load popular items
    axios.get('http://127.0.0.1:8088/dashboard/popular')
      .then((response) => {
        this.popularItems = response.data
      });  
  },
};
</script>
