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
  <d-card class="card-small">

    <!-- Card Header -->
    <d-card-header class="border-bottom">
      <h6 class="m-0">Positive Feedback
      </h6>
      <div class="block-handle"></div>

        <!-- View Full Report -->


    </d-card-header>
  

    <d-card-body class="p-0">

      <!-- Top Referrals List Group -->
      <d-list-group flush class="list-group-small">
        <d-list-group-item v-for="(fb, idx) in page_feedback" :key="idx" class="d-flex px-3">
          <span class="text-semibold text-fiord-blue">{{ fb.ItemId }}</span>
          <span class="ml-auto text-right text-semibold text-reagent-gray">{{ }}</span>
        </d-list-group-item>
      </d-list-group>

    </d-card-body>

    <d-card-footer class="border-top">

    </d-card-footer>

  </d-card>
      </d-col>

      <d-col lg="6" md="12" sm="12" class="mb-4">
  <d-card class="card-small">

    <!-- Card Header -->
    <d-card-header class="border-bottom">
      <h6 class="m-0">Recommendation</h6>
      <div class="block-handle"></div>
    </d-card-header>

    <d-card-body class="p-0">

      <!-- Top Referrals List Group -->
      <d-list-group flush class="list-group-small">
        <d-list-group-item v-for="(item, idx) in recommends" :key="idx" class="d-flex px-3">
          <span class="text-semibold text-fiord-blue">{{ item }}</span>
          <span class="ml-auto text-right text-semibold text-reagent-gray">{{ item.value }}</span>
        </d-list-group-item>
      </d-list-group>

    </d-card-body>

    <d-card-footer class="border-top">
    </d-card-footer>

  </d-card>
      </d-col>
    </d-row>
  </d-container>
</template>

<script>
const axios = require('axios');
export default {
  data() {
    return {
      user_id: null,
      feedback: null,
      recommends: null,
      page_feedback: null,
      page_feedback_no: 0,
    };
  },
  created() {
    this.user_id = this.$route.params.user_id;
  },
  mounted() {
    axios.get('http://127.0.0.1:8088/user/' + this.user_id + '/feedback/star/')
      .then((response) => {
        console.log(response.data)
        this.feedback = response.data
        this.page_feedback = this.feedback.slice(0, 10)
      });
    axios.get('http://127.0.0.1:8088/recommend/' + this.user_id)
      .then((response) => {
        this.recommends = response.data
      });
  }
}
</script>
