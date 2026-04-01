<template>
  <v-card class="h-100">
    <v-card-title class="border-b">
      <h6 class="text-h6">{{ title }}</h6>
    </v-card-title>

    <v-card-text class="pa-0">
      <v-row class="border-b py-2 bg-light">
        <v-col cols="12" sm="6" class="d-flex mb-2 mb-sm-0">
          <v-select
            v-model="timeseries"
            :items="timeseriesOptions"
            item-title="title"
            item-value="name"
            density="compact"
            hide-details
            label="Metric"
            @update:model-value="changeTimeseries"
          />
        </v-col>
      </v-row>

      <canvas height="80" ref="canvasRef" style="max-width: 100% !important"></canvas>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import axios from 'axios';
import moment from 'moment';
import Chart from '../../utils/chart';

export default {
  name: 'users-overview',
  props: {
    title: {
      type: String,
      default: 'Recommendation Performance',
    },
    positiveFeedbackTypes: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const canvasRef = ref(null);
    const chartInstance = ref(null);
    const plotRequestId = ref(0);
    const plotAbortController = ref(null);

    const timeseries = ref({
      name: 'positive_feedback_ratio',
      title: 'Positive Feedback Ratio - All',
      label: 'All',
    });

    const chartData = ref({
      labels: [],
      datasets: [{
        label: 'Current Duration',
        fill: true,
        data: [],
        backgroundColor: 'rgba(0,123,255,0.1)',
        borderColor: 'rgba(0,123,255,1)',
        pointBackgroundColor: '#ffffff',
        pointHoverBackgroundColor: 'rgb(0,123,255)',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
      }],
    });

    const timeseriesOptions = computed(() => {
      const options = [
        {
          name: 'positive_feedback_ratio',
          title: 'Positive Feedback Ratio - All',
          label: 'All',
        },
      ];

      if (props.positiveFeedbackTypes && props.positiveFeedbackTypes.length > 0) {
        props.positiveFeedbackTypes.forEach((type) => {
          options.push({
            name: `positive_feedback_ratio_${type}`,
            title: `Positive Feedback Ratio - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            label: type.charAt(0).toUpperCase() + type.slice(1),
          });
        });
      }

      options.push({
        name: 'cf_ndcg',
        title: 'Collaborative Filtering - NDCG',
        label: 'NDCG',
      });
      options.push({
        name: 'cf_precision',
        title: 'Collaborative Filtering - Precision',
        label: 'Precision',
      });
      options.push({
        name: 'cf_recall',
        title: 'Collaborative Filtering - Recall',
        label: 'Recall',
      });
      options.push({
        name: 'ctr_auc',
        title: 'Click-Through Rate - AUC',
        label: 'AUC',
      });
      options.push({
        name: 'ctr_precision',
        title: 'Click-Through Rate - Precision',
        label: 'Precision',
      });
      options.push({
        name: 'ctr_recall',
        title: 'Click-Through Rate - Recall',
        label: 'Recall',
      });

      return options;
    });

    const plot = async (name, label) => {
      plotRequestId.value += 1;
      const requestId = plotRequestId.value;

      if (plotAbortController.value) {
        plotAbortController.value.abort();
      }
      plotAbortController.value = new AbortController();

      if (chartInstance.value) {
        chartInstance.value.destroy();
        chartInstance.value = null;
      }

      const currentEnd = moment();
      const currentBegin = currentEnd.clone().subtract(7, 'days');

      try {
        const response = await axios({
          method: 'get',
          url: `/api/dashboard/timeseries/${name}?begin=${currentBegin.toISOString()}&end=${currentEnd.toISOString()}`,
          signal: plotAbortController.value.signal,
        });

        if (requestId !== plotRequestId.value) {
          return;
        }

        chartData.value.labels = response.data.map(item => moment(item.Timestamp).format('MMM DD HH:mm'));
        chartData.value.datasets[0].data = response.data.map(item => Number(item.Value).toFixed(5));
        chartData.value.datasets[0].label = label;

        const chartOptions = {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'nearest',
              intersect: false,
            },
          },
          elements: {
            line: {
              tension: 0.3,
            },
            point: {
              radius: 0,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                callback(tick, index) {
                  return index % 7 !== 0 ? '' : this.getLabelForValue(tick);
                },
              },
            },
            y: {
              ticks: {
                suggestedMax: Math.max(...chartData.value.datasets[0].data),
                callback(tick) {
                  if (tick === 0) {
                    return tick;
                  }
                  return tick > 999 ? `${(tick / 1000).toFixed(1)}K` : tick;
                },
              },
            },
          },
          interaction: {
            mode: 'nearest',
            intersect: false,
          },
        };

        if (canvasRef.value) {
          chartInstance.value = new Chart(canvasRef.value, {
            type: 'line',
            data: chartData.value,
            options: chartOptions,
          });
        }
      } catch (error) {
        if (error && (error.name === 'CanceledError' || error.name === 'AbortError')) {
          // Ignore cancellations
        }
      }
    };

    const changeTimeseries = (name) => {
      const selected = timeseriesOptions.value.find(opt => opt.name === name);
      if (selected) {
        timeseries.value = selected;
        plot(selected.name, selected.label);
      }
    };

    onMounted(() => {
      plot(timeseries.value.name, timeseries.value.label);
    });

    onBeforeUnmount(() => {
      if (plotAbortController.value) {
        plotAbortController.value.abort();
      }
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }
    });

    watch(() => props.positiveFeedbackTypes, () => {
      // Re-plot when positiveFeedbackTypes changes
      plot(timeseries.value.name, timeseries.value.label);
    });

    return {
      canvasRef,
      timeseries,
      timeseriesOptions,
      changeTimeseries,
    };
  },
};
</script>