<template>
  <v-container fluid class="main-content-container px-4">
    <!-- Page Header -->
    <v-row class="py-4">
      <v-col cols="12" sm="4" class="text-center text-sm-left mb-0">
        <span class="text-uppercase text-subtitle-2">Overview</span>
        <h3 class="text-h5">Cluster</h3>
      </v-col>
    </v-row>

    <!-- Default Light Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="border-b">Active Nodes</v-card-title>
          <v-table>
            <thead>
              <tr>
                <th class="text-left">Type</th>
                <th class="text-left">Hostname</th>
                <th class="text-left">UUID</th>
                <th class="text-left">Version</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(node, idx) in nodes" :key="idx">
                <td>{{ node.Type }}</td>
                <td>{{ node.Hostname }}</td>
                <td>{{ node.UUID }}</td>
                <td>{{ node.Version }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';

export default {
  name: 'cluster-view',
  setup() {
    const nodes = ref(null);
    let timer = null;

    const fetchNodes = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: '/api/dashboard/cluster',
        });
        nodes.value = response.data;
      } catch (error) {
        console.error('Error fetching cluster nodes:', error);
      }
    };

    onMounted(() => {
      fetchNodes();
      timer = setInterval(fetchNodes, 1000);
    });

    onBeforeUnmount(() => {
      if (timer) {
        clearInterval(timer);
      }
    });

    return {
      nodes,
    };
  },
};
</script>