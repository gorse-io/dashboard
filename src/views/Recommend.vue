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
        <bo-user-feedback :title="'Feedback'" :user_id="user_id" :types="feedbackTypes" />
      </d-col>

      <d-col lg="6" md="12" sm="12" class="mb-4">
        <bo-user-recommend :user_id="user_id" :recommenders="recommenders" />
      </d-col>
    </d-row>
  </d-container>
</template>

<script>
import axios from 'axios';
import UserFeedback from '@/components/common/UserFeedback.vue';
import UserRecommend from '@/components/common/UserRecommend.vue';

export default {
  components: {
    boUserFeedback: UserFeedback,
    boUserRecommend: UserRecommend,
  },
  data() {
    return {
      cacheSize: 100,
      user_id: null,
      feedback: [],
      recommends: [],
      feedbackTypes: [],
      recommenders: [''],
    };
  },
  created() {
    this.user_id = this.$route.params.user_id;
  },
  mounted() {
    // load config
    axios({
      method: 'get',
      url: '/api/dashboard/config',
    })
      .then((response) => {
        this.cacheSize = response.data.recommend.cache_size;

        // List all feedback types
        this.feedbackTypes = [''].concat(response.data.recommend.data_source.positive_feedback_types).concat(
          response.data.recommend.data_source.read_feedback_types);

        // List all recommenders
        let recommenders = ['', 'latest', 'popular'];
        response.data.recommend['non-personalized'].forEach((r) => {
          recommenders.push(`non-personalized/${r.name}`);
        });
        response.data.recommend['item-to-item'].forEach((r) => {
          recommenders.push(`item-to-item/${r.name}`);
        });
        response.data.recommend['user-to-user'].forEach((r) => {
          recommenders.push(`user-to-user/${r.name}`);
        });
        response.data.recommend['external'].forEach((r) => {
          recommenders.push(`external/${r.name}`);
        });
        this.recommenders = recommenders;
      });
  },
};
</script>
