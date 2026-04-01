<template>
  <v-card>
    <v-card-title class="border-b">
      <h6 class="text-h6">{{ title }}</h6>
    </v-card-title>

    <v-list density="compact">
      <v-list-item
        v-for="(item, idx) in items"
        :key="idx"
        class="px-3"
      >
        <template v-slot:prepend>
          <v-icon class="mr-2">{{ getIcon(item.icon) }}</v-icon>
        </template>
        <v-list-item-title>{{ item.name }}</v-list-item-title>
        <template v-slot:append>
          <span class="text-muted">{{ format(query(item.key)) }}</span>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import moment from 'moment';
import jsonpath from 'jsonpath';

export default {
  name: 'users-by-device',
  props: {
    title: {
      type: String,
      default: 'System Status',
    },
  },
  setup() {
    const items = ref([
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
    ]);

    const status = ref({});

    const getIcon = (iconName) => {
      const iconMap = {
        'label': 'mdi-label',
        'dns': 'mdi-server',
        'tag': 'mdi-tag',
        'group_work': 'mdi-group-work',
        'ads_click': 'mdi-cursor-default-click',
      };
      return iconMap[iconName] || 'mdi-information';
    };

    const query = (path) => {
      if (!(typeof path === 'string') || !path.startsWith('$')) {
        return '';
      }
      try {
        return jsonpath.query(status.value, path)[0];
      } catch (e) {
        return '';
      }
    };

    const format = (data) => {
      if (typeof data === 'number') {
        return data;
      }
      if (data === '' || data === undefined || data === null) {
        return '';
      }
      const date = moment(String(data));
      if (date.isValid()) {
        return date.format('YYYY/MM/DD HH:mm');
      }
      return data;
    };

    onMounted(async () => {
      try {
        const response = await axios({
          method: 'get',
          url: '/api/dashboard/stats',
        });
        status.value = response.data;
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    });

    return {
      items,
      status,
      getIcon,
      query,
      format,
    };
  },
};
</script>