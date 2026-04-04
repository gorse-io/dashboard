<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="page-header py-4" no-gutters>
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-4 mb-sm-0">
        <span class="text-uppercase page-subtitle">User ID:</span>
        <h3 class="page-title">{{ user_id }}</h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6" class="mb-4">
        <bo-user-feedback :title="'Feedback'" :user_id="user_id" :types="feedbackTypes" />
      </v-col>

      <v-col cols="12" lg="6" class="mb-4">
        <bo-user-recommend :user_id="user_id" :recommenders="recommenders" />
      </v-col>
    </v-row>
  </v-container>
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
        this.feedbackTypes = [''].concat(response.data.recommend.data_source.positive_feedback_types).concat(response.data.recommend.data_source.read_feedback_types);

        // List all recommenders
        const recommenders = ['', 'latest', 'collaborative'];
        if (response.data.recommend['non-personalized']) {
          response.data.recommend['non-personalized'].forEach((r) => {
            recommenders.push(`non-personalized/${r.name}`);
          });
        }
        if (response.data.recommend['item-to-item']) {
          response.data.recommend['item-to-item'].forEach((r) => {
            recommenders.push(`item-to-item/${r.name}`);
          });
        }
        if (response.data.recommend['user-to-user']) {
          response.data.recommend['user-to-user'].forEach((r) => {
            recommenders.push(`user-to-user/${r.name}`);
          });
        }
        if (response.data.recommend.external) {
          response.data.recommend.external.forEach((r) => {
            recommenders.push(`external/${r.name}`);
          });
        }
        this.recommenders = recommenders;
      });
  },
};
</script>
