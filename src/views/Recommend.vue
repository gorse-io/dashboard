<template>
  <d-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <d-row no-gutters class="page-header py-4">
      <d-col col sm="4" class="text-center text-sm-left mb-4 mb-sm-0">
        <span class="text-uppercase page-subtitle">User ID:</span>
        <h3 class="page-title">{{ user_id }}</h3>
      </d-col>
    </d-row>

    <d-row>
      <d-col lg="6" md="12" sm="12" class="mb-4">
        <bo-top-items :title="'Positive Feedback'" :items="feedback" :pageSize="defaultN"/>
      </d-col>

      <d-col lg="6" md="12" sm="12" class="mb-4">

        <bo-top-items :title="'Recommend'" :items="recommends" :pageSize="defaultN"/>


      </d-col>
    </d-row>
  </d-container>
</template>

<script>
const axios = require('axios');

import TopItems from '@/components/common/TopItems.vue';

export default {
  components: {
    boTopItems: TopItems,
  },
  data() {
    return {
      cacheSize: 100,
      defaultN: 10,
      user_id: null,
      feedback: [],
      recommends: [],
      feedbackTypes: [],
    };
  },
  created() {
    this.user_id = this.$route.params.user_id;
  },
  mounted() {
    // load config
    axios.get('/api/dashboard/config')
      .then((response) => {
        this.cacheSize = response.data.Database.CacheSize
        this.feedbackTypes = response.data.Database.PositiveFeedbackType
        this.defaultN = response.data.Server.DefaultN
        var feedbackItems = []
        this.feedbackTypes.forEach((feedbackType) => {
          axios.get('/api/dashboard/user/' + this.user_id + '/feedback/' + feedbackType +'/')
            .then((response) => {
              response.data.forEach((feedback) => {
                feedback.Item.Timestamp = feedback.Timestamp
                feedbackItems.push(feedback.Item)
              })
            });
        })
        this.feedback = feedbackItems
      });  
    axios.get('/api/dashboard/recommend/' + this.user_id, {
        params: {
          n: this.cacheSize
        }
      })
      .then((response) => {
        this.recommends = response.data
      });
  }
}
</script>
