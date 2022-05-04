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
            >{{ format(query(item.key)) }}</span
          >
        </d-list-group-item>
      </d-list-group>
    </d-card-body>
    <d-card-footer> </d-card-footer>
  </d-card>
</template>

<script>
import moment from 'moment';

const axios = require('axios');
const jsonPath = require('jsonpath');

export default {
  name: 'users-by-device',
  props: {
    title: {
      type: String,
      default: 'System Status',
    },
  },
  data() {
    return {
      items: [
        { icon: 'label', name: 'Master Version', key: '$.BinaryVersion' },
        { icon: 'dns', name: 'Number of Workers', key: '$.NumWorkers' },
        { icon: 'dns', name: 'Number of Servers', key: '$.NumServers' },
        { icon: 'tag', name: 'Number of User Labels', key: '$.NumUserLabels' },
        { icon: 'tag', name: 'Number of Item Labels', key: '$.NumItemLabels' },
        { icon: 'trending_up', name: 'Popular Items Update Time', key: '$.PopularItemsUpdateTime' },
        { icon: 'trending_up', name: 'Latest Items Update Time', key: '$.LatestItemsUpdateTime' },
        { icon: 'group_work', name: 'Matching Model Fit Time', key: '$.MatchingModelFitTime' },
        { icon: 'group_work', name: 'Matching Model Precision@10', key: '$.MatchingModelScore.Precision' },
        { icon: 'group_work', name: 'Matching Model Recall@10', key: '$.MatchingModelScore.Recall' },
        { icon: 'group_work', name: 'Matching Model NDCG@10', key: '$.MatchingModelScore.NDCG' },
        { icon: 'ads_click', name: 'Ranking Model Fit Time', key: '$.RankingModelFitTime' },
        { icon: 'ads_click', name: 'Ranking Model Precision', key: '$.RankingModelScore.Precision' },
        { icon: 'ads_click', name: 'Ranking Model Recall', key: '$.RankingModelScore.Recall' },
        { icon: 'ads_click', name: 'Ranking Model AUC', key: '$.RankingModelScore.AUC' },
        { icon: 'travel_explore', name: 'User Neighbor Index Recall', key: '$.UserNeighborIndexRecall' },
        { icon: 'travel_explore', name: 'Item Neighbor Index Recall', key: '$.ItemNeighborIndexRecall' },
        { icon: 'travel_explore', name: 'Matching Index Recall', key: '$.MatchingIndexRecall' },
      ],
      status: {},
    };
  },
  mounted() {
    axios.get('/api/dashboard/stats').then((res) => {
      this.status = res.data;
    });
  },
  methods: {
    query(path) {
      if (!(typeof path === 'string') || !path.startsWith('$')) {
        return '';
      }
      return jsonPath.query(this.status, path)[0];
    },
    format(data) {
      if (typeof data === 'number') {
        return data;
      }
      if (data === '') {
        return '';
      }
      const date = moment(String(data));
      if (date.isValid()) {
        return date.format('YYYY/MM/DD HH:mm');
      }
      return data;
    },
  },
};
</script>
