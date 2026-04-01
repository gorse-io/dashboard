<template>
  <v-card>
    <v-card-title class="border-b">
      <h6 class="text-h6">{{ title }}</h6>
    </v-card-title>

    <v-card-text class="pa-0">
      <div class="pa-4 border-b">
        <v-select
          v-model="feedbackType"
          :items="types"
          label="Feedback Type"
          density="compact"
          hide-details
          @update:model-value="selectType"
        />
      </div>
    </v-card-text>

    <v-card-text class="pa-0">
      <div v-for="(item, idx) in items" :key="idx" class="pa-3 border-b">
        <div class="d-flex justify-space-between align-center mb-1">
          <span class="text-muted">{{ item.Item.ItemId }}</span>
          <v-chip size="small" variant="outlined">
            {{ item.FeedbackType + (item.Value > 0 ? ' ' + item.Value : '') }}
          </v-chip>
        </div>

        <p class="mb-1 text-muted">
          {{ item.Item.Comment }}
        </p>

        <div class="mb-1">
          <v-chip
            v-for="(label, labelIdx) in item.Item.Categories"
            :key="labelIdx"
            size="small"
            variant="outlined"
            class="mr-1"
          >
            {{ label }}
          </v-chip>
          <span class="font-monospace">
            {{ fold(item.Item.Labels) }}
          </span>
        </div>

        <p class="mb-0 text-caption text-muted">
          {{ item.Timestamp }}
        </p>
      </div>
    </v-card-text>

    <v-card-actions class="border-t">
      <v-btn
        variant="text"
        @click="prevPage"
        :disabled="offset === 0"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn
        variant="text"
        @click="nextPage"
        :disabled="items.length < pageSize"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import utils from '@/utils';

export default {
  name: 'user-feedback',
  props: {
    title: {
      type: String,
      default: '--',
    },
    user_id: {
      type: String,
      default: '',
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    types: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const items = ref([]);
    const offset = ref(0);
    const feedbackType = ref('');

    const fold = utils.fold;

    const selectType = async (value) => {
      if (feedbackType.value !== value) {
        offset.value = 0;
        feedbackType.value = value;
      }

      try {
        const response = await axios({
          method: 'get',
          url: `/api/dashboard/user/${props.user_id}/feedback/${value}`,
          params: {
            offset: offset.value,
            n: props.pageSize,
          },
        });
        items.value = response.data;
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };

    const prevPage = () => {
      offset.value = Math.max(0, offset.value - props.pageSize);
      selectType(feedbackType.value);
    };

    const nextPage = () => {
      offset.value += props.pageSize;
      selectType(feedbackType.value);
    };

    onMounted(() => {
      if (props.types && props.types.length > 0) {
        selectType(props.types[0]);
      }
    });

    return {
      items,
      offset,
      feedbackType,
      fold,
      selectType,
      prevPage,
      nextPage,
    };
  },
};
</script>