<template>
  <v-card class="stats-small">
    <v-card-text :class="computedBodyClass">
      <div :class="['d-flex', computedInnerWrapperClass]">
        <div :class="['stats-small__data', computedDataFieldClass]">
          <span class="text-uppercase text-caption">{{ label }}</span>
          <h6 class="text-h6">{{ value }}</h6>
        </div>
        <div :class="['stats-small__data', computedInnerDataFieldClass]">
          <span :class="['stats-small__percentage', `stats-small__percentage--${computedPercentageModifier}`]">{{
            percentage }}</span>
        </div>
      </div>
      <canvas :height="computedCanvasHeight" ref="canvasRef"></canvas>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Chart from '../../utils/chart';

export default {
  name: 'd-small-stats',
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: 'Label',
    },
    value: {
      type: [Number, String],
      default: 0,
    },
    percentage: {
      type: [Number, String],
      default: 0,
    },
    increase: {
      type: Boolean,
      default: true,
    },
    decrease: {
      type: Boolean,
      default: false,
    },
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
    chartData: {
      type: Array,
      required: true,
      default: () => [],
    },
    chartConfig: {
      type: Object,
      default: null,
    },
    variation: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const canvasRef = ref(null);
    const chartInstance = ref(null);

    const computedPercentageModifier = computed(() => {
      return props.increase ? 'increase' : 'decrease';
    });

    const computedBodyClass = computed(() => {
      if (props.variation === '1') {
        return 'pa-0 d-flex';
      }
      return 'px-0 pb-0';
    });

    const computedInnerWrapperClass = computed(() => {
      if (props.variation === '1') {
        return 'flex-column ma-auto';
      }
      return 'px-3';
    });

    const computedDataFieldClass = computed(() => {
      if (props.variation === '1') {
        return 'text-center';
      }
      return null;
    });

    const computedInnerDataFieldClass = computed(() => {
      if (props.variation === '1') {
        return null;
      }
      return 'text-right align-center';
    });

    const computedCanvasHeight = computed(() => {
      if (props.variation === '1') {
        return 120;
      }
      return 60;
    });

    onMounted(() => {
      if (!canvasRef.value || !props.chartData[0]?.data?.length) return;

      const chartOptions = {
        maintainAspectRatio: true,
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        elements: {
          point: {
            radius: 0,
          },
          line: {
            tension: 0.33,
          },
        },
        scales: {
          x: {
            display: false,
            grid: {
              display: false,
            },
          },
          y: {
            display: false,
            grid: {
              display: false,
            },
            suggestedMax: Math.max(...props.chartData[0].data) + 1,
          },
        },
        ...props.chartOptions,
      };

      const chartConfig = {
        type: 'line',
        data: {
          labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5'],
          datasets: props.chartData,
        },
        options: chartOptions,
        ...props.chartConfig,
      };

      chartInstance.value = new Chart(canvasRef.value, chartConfig);
    });

    return {
      canvasRef,
      computedPercentageModifier,
      computedBodyClass,
      computedInnerWrapperClass,
      computedDataFieldClass,
      computedInnerDataFieldClass,
      computedCanvasHeight,
    };
  },
};
</script>

<style scoped>
.stats-small__percentage--increase {
  color: #17c964;
}

.stats-small__percentage--decrease {
  color: #ff5252;
}
</style>