<template>
  <d-card class="card-small">
    <!-- Card Header -->
    <d-card-header class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle"></div>
    </d-card-header>

    <d-card-body class="p-0">
      <!-- Top Referrals List Group -->
      <d-list-group flush class="list-group-small">
        <d-list-group-item
          v-for="(item, idx) in items"
          :key="idx"
          class="d-flex px-3"
        >
          <span class="text-semibold text-fiord-blue"><i class="material-icons mr-1">{{ item.icon }}</i>{{ item.name }}</span>
          <span class="ml-auto text-right text-semibold text-reagent-gray"
            >{{ query(item.key) }}</span
          >
        </d-list-group-item>
      </d-list-group>
    </d-card-body>
    <d-card-footer> </d-card-footer>
  </d-card>
</template>

<script>
const axios = require("axios");
const jsonPath = require('jsonpath');

export default {
  name: "users-by-device",
  props: {
    title: {
      type: String,
      default: "System Status",
    },
  },
  data() {
    return {
      items: [
        { icon: "dns", name: "Number of Workers", key: '$.NumWorkers' },
        { icon: "dns", name: "Number of Servers", key: '$.NumServers' },
        { icon: "tag", name: "Number of User Labels", key: '$.NumUserLabels' },
        { icon: "tag", name: "Number of Item Labels", key: '$.NumItemLabels' },
        { icon: "group_work", name: "Collaborative Filtering Prediction Precision@10", key: '$.RankingScore.Precision' },
        { icon: "group_work", name: "Collaborative Filtering Prediction Recall@10", key: '$.RankingScore.Recall' },
        { icon: "group_work", name: "Collaborative Filtering Prediction NDCG@10", key: '$.RankingScore.NDCG' },
        { icon: "ads_click", name: "Click-through Rate Prediction Precision", key: '$.ClickScore.Precision' },
        { icon: "ads_click", name: "Click-through Rate Prediction Recall", key: '$.ClickScore.Recall' },
        { icon: "ads_click", name: "Click-through Rate Prediction AUC", key: '$.ClickScore.AUC' },
      ],
      status: {}
    };
  },
  mounted() {
    axios.get(`/api/dashboard/stats`).then((res) => {
      this.status = res.data;
    });
  },
  methods: {
    query(path) {
      if (!(typeof path === 'string') || !path.startsWith('$')) {
        return ''
      }
      return jsonPath.query(this.status, path)[0]
    }
  }
};
</script>

