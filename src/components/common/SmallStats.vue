<template>
  <d-card :class="['stats-small', computedVariationClass, 'card', 'card-small', { 'stats-small--loading': loading }]">
    <d-card-body :class="[computedBodyClass]">
      <div :class="['d-flex', computedInnerWrapperClass]">
        <div :class="['stats-small__data', computedDataFieldClass]">
          <span :class="['stats-small__label', 'text-uppercase', computedLabelClass]">{{ label }}</span>
          <span
            v-if="loading"
            :class="['stats-small__placeholder', 'stats-small__placeholder--value', computedValueClass]"
            aria-hidden="true"
          />
          <h6 v-else :class="['stats-small__value', 'count', computedValueClass]">{{ value }}</h6>
        </div>
        <div :class="['stats-small__data', computedInnerDataFieldClass]">
          <span
            v-if="loading"
            class="stats-small__placeholder stats-small__placeholder--percentage"
            aria-hidden="true"
          />
          <span v-else :class="['stats-small__percentage', `stats-small__percentage--${computedPercentageModifier}`]">{{
            percentage }}</span>
        </div>
      </div>
      <canvas v-show="!loading" :height="computedCanvasHeight" ref="canvas" :class="[computedChartId]" />
    </d-card-body>
  </d-card>
</template>

<script>
import Chart from '../../utils/chart';
import { nanoid } from '../../utils';

export default {
  name: 'd-small-stats',
  props: {
    /**
     * The element ID.
     */
    id: {
      type: String,
      required: true,
    },
    /**
     * The label.
     */
    label: {
      type: String,
      default: 'Label',
    },
    /**
     * The value.
     */
    value: {
      type: [Number, String],
      default: 0,
    },
    /**
     * The percentage number or string.
     */
    percentage: {
      type: [Number, String],
      default: 0,
    },
    /**
     * Whether is a value increase.
     */
    increase: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether is a value decrease.
     */
    decrease: {
      type: Boolean,
      default: false,
    },
    /**
     * The Chart.js options.
     */
    chartOptions: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * The chart dataset.
     */
    chartData: {
      type: Array,
      required: true,
      default() {
        return [];
      },
    },
    /**
     * The chart configuration. This may override every other setting.
     */
    chartConfig: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * The variation.
     */
    variation: {
      type: String,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    loading(isLoading, wasLoading) {
      if (wasLoading && !isLoading) {
        this.$nextTick(this.renderChart);
      }
    },
    chartData: {
      deep: true,
      handler() {
        if (!this.loading) {
          this.$nextTick(this.renderChart);
        }
      },
    },
  },
  computed: {
    computedChartId() {
      return this.id || `stats-small-${nanoid()}`;
    },
    computedPercentageModifier() {
      return this.increase ? 'increase' : 'decrease';
    },
    computedVariationClass() {
      return this.variation ? `stats-small--${this.variation}` : null;
    },
    computedBodyClass() {
      if (this.variation === '1') {
        return 'p-0 d-flex';
      }

      return 'px-0 pb-0';
    },
    computedInnerWrapperClass() {
      if (this.variation === '1') {
        return 'flex-column m-auto';
      }

      return 'px-3';
    },
    computedDataFieldClass() {
      if (this.variation === '1') {
        return 'text-center';
      }

      return null;
    },
    computedLabelClass() {
      if (this.variation === '1') {
        return null;
      }

      return 'mb-1';
    },
    computedValueClass() {
      if (this.variation === '1') {
        return 'my-3';
      }

      return 'm-0';
    },
    computedInnerDataFieldClass() {
      if (this.variation === '1') {
        return null;
      }

      return 'text-right align-items-center';
    },
    computedCanvasHeight() {
      if (this.variation === '1') {
        return 120;
      }

      return 60;
    },
  },
  mounted() {
    if (!this.loading) {
      this.renderChart();
    }
  },
  beforeUnmount() {
    this.destroyChart();
  },
  methods: {
    getChartDataMax() {
      const dataset = this.chartData[0] || {};
      const values = Array.isArray(dataset.data) ? dataset.data : [];
      return values.length ? Math.max(...values) : 0;
    },
    renderChart() {
      if (!this.$refs.canvas) {
        return;
      }

      if (this.chart) {
        this.updateChart();
        return;
      }

      const chartOptions = {
        ...{
          maintainAspectRatio: true,
          responsive: true,
          legend: {
            display: false,
          },
          tooltips: {
            enabled: false,
            custom: false,
          },
          animation: {
            duration: 0,
          },
          hover: {
            animationDuration: 0,
          },
          responsiveAnimationDuration: 0,
          elements: {
            point: {
              radius: 0,
            },
            line: {
              tension: 0.33,
            },
          },
          scales: {
            xAxes: [{
              gridLines: false,
              ticks: {
                display: false,
              },
            }],
            yAxes: [{
              gridLines: false,
              scaleLabel: false,
              ticks: {
                display: false,
                isplay: false,
                // Avoid getting the graph line cut of at the top of the canvas.
                // Chart.js bug link: https://github.com/chartjs/Chart.js/issues/4790
                suggestedMax: this.getChartDataMax() + 1,
              },
            }],
          },
        },
        ...this.chartOptions,
      };

      const chartConfig = {
        ...{
          type: 'line',
          data: {
            ...{ labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5'] },
            ...{
              datasets: this.chartData,
            },
          },
          options: chartOptions,
        },
        ...this.chartConfig,
      };

      this.chart = new Chart(this.$refs.canvas, chartConfig);
    },
    updateChart() {
      this.chart.data.datasets = this.chartData;
      this.chart.options.scales.yAxes[0].ticks.suggestedMax = this.getChartDataMax() + 1;
      this.chart.update(0);
    },
    destroyChart() {
      if (this.chart) {
        this.chart.stop();
        this.chart.destroy();
        this.chart = null;
      }
    },
  },
};
</script>
