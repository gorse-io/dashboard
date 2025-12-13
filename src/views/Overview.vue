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
    <d-row v-if="!timeseriesUpdate">
      <d-col lg v-for="(stats, idx) in smallStats" :key="idx" class="mb-4">
        <small-stats :id="`small-stats-${idx}`" variation="1" :chart-data="stats.datasets" :label="stats.label"
          :value="stats.value" :percentage="stats.percentage" :increase="stats.increase" :decrease="stats.decrease" />
      </d-col>
    </d-row>

    <d-row>
      <!-- Users Overview -->
      <d-col lg="12" md="12" sm="12" class="mb-4">
        <bo-users-overview :positiveFeedbackTypes="positiveFeedbackTypes" />
      </d-col>
    </d-row>

    <d-row>
      <d-col lg="12" md="12" sm="12" class="mb-4">
        <bo-top-items :recommenders="nonPersonalized" />
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

const timeseriesName = ['num_users', 'num_items', 'num_feedback', 'num_pos_feedbacks', 'num_neg_feedbacks'];

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
      nonPersonalized: ['latest'],
      timeseriesUpdate: false,
      timeseriesData: new Array(timeseriesName.length).fill([]),
      timeseriesValues: new Array(timeseriesName.length).fill('0'),
      timeseriesPercentages: new Array(timeseriesName.length).fill('0'),
      timeseriesIncrease: new Array(timeseriesName.length).fill(true),
      positiveFeedbackTypes: []
    };
  },
  mounted() {
    // load config
    axios({
      method: 'get',
      url: '/api/dashboard/config',
    })
      .then((response) => {
        this.positiveFeedbackTypes = response.data.recommend.data_source.positive_feedback_types;
        this.cacheSize = response.data.database.cache_size;
        this.nonPersonalized = ['latest'];
        response.data.recommend['non-personalized'].forEach((recommender) => {
          this.nonPersonalized.push(`non-personalized/${recommender.name}`);
        });
      });

    // load status
    this.timeseriesUpdate = true;
    const requests = timeseriesName.map(name => axios({
      method: 'get',
      url: `/api/dashboard/timeseries/${name}`,
    }));
    axios.all(requests)
      .then(axios.spread((...responses) => {
        this.timeseriesData = responses.map(response => response.data.map(item => item.Value));
        this.timeseriesValues = this.timeseriesData.map((item) => {
          if (item.length === 0) return '0';
          return item[item.length - 1].toLocaleString();
        });
        this.timeseriesPercentages = this.timeseriesData.map((item) => {
          if (item.length < 2) return '0';
          const last = item[item.length - 1];
          const prev = item[item.length - 2];
          return last - prev;
        });
        this.timeseriesIncrease = this.timeseriesIncrease.map((item, idx) => {
          if (this.timeseriesPercentages[idx] >= 0) return true;
          return false;
        });
        this.timeseriesUpdate = false;
      }));
  },
  computed: {
    smallStats() {
      return [{
        label: 'Users',
        value: this.timeseriesValues[0],
        percentage: this.timeseriesPercentages[0],
        increase: this.timeseriesIncrease[0],
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(0, 184, 216, 0.1)',
          borderColor: 'rgb(0, 184, 216)',
          data: this.timeseriesData[0],
        }],
      }, {
        label: 'Items',
        value: this.timeseriesValues[1],
        percentage: this.timeseriesPercentages[1],
        increase: this.timeseriesIncrease[1],
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(23,198,113,0.1)',
          borderColor: 'rgb(23,198,113)',
          data: this.timeseriesData[1],
        }],
      }, {
        label: 'Feedback',
        value: this.timeseriesValues[2],
        percentage: this.timeseriesPercentages[2],
        increase: this.timeseriesIncrease[2],
        decrease: !this.timeseriesIncrease[2],
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(255,180,0,0.1)',
          borderColor: 'rgb(255,180,0)',
          data: this.timeseriesData[2],
        }],
      }, {
        label: 'Positive Feedback',
        value: this.timeseriesValues[3],
        percentage: this.timeseriesPercentages[3],
        increase: this.timeseriesIncrease[3],
        decrease: !this.timeseriesIncrease[3],
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgba(255,65,105,0.1)',
          borderColor: 'rgb(255,65,105)',
          data: this.timeseriesData[3],
        }],
      }, {
        label: 'Negative Feedback',
        value: this.timeseriesValues[4],
        percentage: this.timeseriesPercentages[4],
        increase: this.timeseriesIncrease[4],
        decrease: !this.timeseriesIncrease[4],
        labels: ['Label', 'Label', 'Label', 'Label', 'Label', 'Label'],
        datasets: [{
          label: 'Today',
          fill: 'start',
          borderWidth: 1.5,
          backgroundColor: 'rgb(0,123,255,0.1)',
          borderColor: 'rgb(0,123,255)',
          data: this.timeseriesData[4],
        }],
      }];
    },
  },
};
</script>
