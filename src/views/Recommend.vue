<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="py-4">
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase text-subtitle-2">User ID:</span>
        <h3 class="text-h5">{{ user_id }}</h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col lg="6" md="12" sm="12" class="mb-4">
        <bo-user-feedback title="Feedback" :user_id="user_id" :types="feedbackTypes" />
      </v-col>

      <v-col lg="6" md="12" sm="12" class="mb-4">
        <bo-user-recommend :user_id="user_id" :recommenders="recommenders" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import UserFeedback from '@/components/common/UserFeedback.vue';
import UserRecommend from '@/components/common/UserRecommend.vue';

export default {
  name: 'recommend-view',
  components: {
    boUserFeedback: UserFeedback,
    boUserRecommend: UserRecommend,
  },
  setup() {
    const route = useRoute();
    const user_id = ref(route.params.user_id);
    const feedbackTypes = ref([]);
    const recommenders = ref(['']);

    onMounted(async () => {
      try {
        const response = await axios({
          method: 'get',
          url: '/api/dashboard/config',
        });

        // List all feedback types
        const types = [''];
        if (response.data.recommend.data_source.positive_feedback_types) {
          types.push(...response.data.recommend.data_source.positive_feedback_types);
        }
        if (response.data.recommend.data_source.read_feedback_types) {
          types.push(...response.data.recommend.data_source.read_feedback_types);
        }
        feedbackTypes.value = types;

        // List all recommenders
        const recs = ['', 'latest', 'collaborative'];
        if (response.data.recommend['non-personalized']) {
          response.data.recommend['non-personalized'].forEach((r) => {
            recs.push(`non-personalized/${r.name}`);
          });
        }
        if (response.data.recommend['item-to-item']) {
          response.data.recommend['item-to-item'].forEach((r) => {
            recs.push(`item-to-item/${r.name}`);
          });
        }
        if (response.data.recommend['user-to-user']) {
          response.data.recommend['user-to-user'].forEach((r) => {
            recs.push(`user-to-user/${r.name}`);
          });
        }
        if (response.data.recommend.external) {
          response.data.recommend.external.forEach((r) => {
            recs.push(`external/${r.name}`);
          });
        }
        recommenders.value = recs;
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    });

    return {
      user_id,
      feedbackTypes,
      recommenders,
    };
  },
};
</script>