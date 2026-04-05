<template>
  <v-card class="card-small">
    <!-- Card Header -->
    <v-card-title class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle"></div>
    </v-card-title>

    <v-card-text class="pa-0">
      <!-- Top Referrals List Group -->
      <v-list class="list-group-small">
        <v-list-item
          v-for="(item, idx) in items"
          :key="idx"
          class="d-flex px-3"
        >
          <span class="text-semibold text-fiord-blue"><i class="material-icons me-1">{{ item.icon }}</i>{{ item.name }}</span>
          <span class="ms-auto text-end text-semibold text-reagent-gray"
            >{{ format(query(item.key)) }}</span
          >
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions> </v-card-actions>
  </v-card>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import jsonPath from 'jsonpath';

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
        { icon: 'group_work', name: 'Matching Model Fit Time', key: '$.MatchingModelFitTime' },
        { icon: 'group_work', name: 'Matching Model Precision@10', key: '$.MatchingModelScore.Precision' },
        { icon: 'group_work', name: 'Matching Model Recall@10', key: '$.MatchingModelScore.Recall' },
        { icon: 'group_work', name: 'Matching Model NDCG@10', key: '$.MatchingModelScore.NDCG' },
        { icon: 'ads_click', name: 'Ranking Model Fit Time', key: '$.RankingModelFitTime' },
        { icon: 'ads_click', name: 'Ranking Model Precision', key: '$.RankingModelScore.Precision' },
        { icon: 'ads_click', name: 'Ranking Model Recall', key: '$.RankingModelScore.Recall' },
        { icon: 'ads_click', name: 'Ranking Model AUC', key: '$.RankingModelScore.AUC' },
      ],
      status: {},
    };
  },
  mounted() {
    axios({
      method: 'get',
      url: '/api/dashboard/stats',
    }).then((res) => {
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
