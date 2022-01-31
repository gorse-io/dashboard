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
        <bo-top-items :title="'Positive Feedback'" :items="feedback"/>
      </d-col>

      <d-col lg="6" md="12" sm="12" class="mb-4">

        <bo-user-recommend :user_id = "user_id"/>


      </d-col>
    </d-row>
  </d-container>
</template>

<script>
import TopItems from '@/components/common/TopItemsCard.vue';
import UserRecommend from '@/components/common/UserRecommend.vue';

const axios = require('axios');

export default {
  components: {
    boTopItems: TopItems,
    boUserRecommend: UserRecommend,
  },
  data() {
    return {
      cacheSize: 100,
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
        this.cacheSize = response.data.Database.CacheSize;
        this.feedbackTypes = response.data.Database.PositiveFeedbackType;
        const requests = [];
        this.feedbackTypes.forEach((feedbackType) => {
          requests.push(axios.get(`/api/dashboard/user/${this.user_id}/feedback/${feedbackType}/`));
        });
        axios.all(requests).then(axios.spread((...responses) => {
          const feedbackItems = [];
          responses.forEach((response) => {
            response.data.forEach((feedback) => {
              feedback.Item.Timestamp = feedback.Timestamp;
              feedbackItems.push(feedback.Item);
            });
          })
          this.feedback = feedbackItems.sort((a, b) => (a.Timestamp < b.Timestamp) ? 1 : -1);
        }))
      });
  },
};
</script>
