<template>
  <d-card class="card-small h-100">
    <!-- Card Header -->
    <d-card-header class="border-bottom">
      <h6 class="m-0">{{ title }}</h6>
      <div class="block-handle" />
    </d-card-header>

    <d-card-body class="pt-0">
      <d-row class="border-bottom py-2 bg-light">

        <d-col col sm="6" class="d-flex mb-2 mb-sm-0">
          <d-input-group size="sm" class="date-range d-flex justify-content-right">
            <d-datepicker
              v-model="dateRange.from"
              :highlighted="{ from: dateRange.from, to: dateRange.to || new Date() }"
              placeholder="Start Date"
              typeable
              small />
            <d-datepicker
              v-model="dateRange.to"
              :highlighted="{ from: dateRange.from, to: dateRange.to || new Date() }"
              placeholder="End Date"
              typeable
              small />
            <template #append>
              <d-input-group-text>
                <i class="material-icons">&#xE916;</i>
              </d-input-group-text>
            </template>
          </d-input-group>
        </d-col>

        <d-col col sm="6">
          <d-input-group size="sm" class="d-flex btn-white ml-auto mr-auto ml-sm-auto mr-sm-0 mt-3 mt-sm-0">
            <d-select @change="changeTimeseries" :value="timeseries">
              <option v-for="(timeseriesOption, idx) in timeseriesOptions" :key="idx" :value="timeseriesOption">{{
                timeseriesOption.title }}</option>
            </d-select>
          </d-input-group>
        </d-col>

      </d-row>
      <!-- Legend & Chart -->
      <div ref="legend" />
      <div class="recommendation-performance__chart">
        <canvas ref="canvas" />
      </div>
    </d-card-body>
  </d-card>
</template>

<script>
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
      default() {
        return [];
      },
    },
    chartData: {
      type: Object,
      default() {
        return {
          labels: [],
          datasets: [{
            label: 'Current Duration',
            fill: 'start',
            data: [],
            backgroundColor: 'rgba(0,123,255,0.1)',
            borderColor: 'rgba(0,123,255,1)',
            pointBackgroundColor: '#ffffff',
            pointHoverBackgroundColor: 'rgb(0,123,255)',
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 3,
          }, /* , {
            label: 'Past Duration',
            fill: 'start',
            data: [],
            backgroundColor: 'rgba(255,65,105,0.1)',
            borderColor: 'rgba(255,65,105,1)',
            pointBackgroundColor: '#ffffff',
            pointHoverBackgroundColor: 'rgba(255,65,105,1)',
            borderDash: [3, 3],
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 2,
            pointBorderColor: 'rgba(255,65,105,1)',
          } */],
        };
      },
    },
  },
  data() {
    const defaultEnd = moment();
    const defaultBegin = defaultEnd.clone().subtract(7, 'days');

    return {
      dateRange: {
        from: defaultBegin.toDate(),
        to: defaultEnd.toDate(),
      },
      timeseries: {
        name: 'positive_feedback_ratio',
        title: 'Positive Feedback Ratio - All',
        label: 'All',
      },
      chartInstance: null,
      plotRequestId: 0,
      plotAbortController: null,
      localChartData: null,
    };
  },
  watch: {
    'dateRange.from': 'changeDateRange',
    'dateRange.to': 'changeDateRange',
  },
  mounted() {
    this.plot(this.timeseries.name, this.timeseries.label);
  },
  beforeUnmount() {
    if (this.plotAbortController) {
      this.plotAbortController.abort();
      this.plotAbortController = null;
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  },
  computed: {
    timeseriesOptions() {
      const options = [
        {
          name: 'positive_feedback_ratio',
          title: 'Positive Feedback Ratio - All',
          label: 'All',
        },
      ];
      if (this.positiveFeedbackTypes.length > 0) {
        this.positiveFeedbackTypes.forEach((type) => {
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
    },
  },
  methods: {
    getSelectedDateRange() {
      const end = this.dateRange.to ? moment(this.dateRange.to).endOf('day') : moment().endOf('day');
      const begin = this.dateRange.from
        ? moment(this.dateRange.from).startOf('day')
        : end.clone().subtract(7, 'days').startOf('day');

      if (!begin.isValid() || !end.isValid() || begin.isAfter(end)) {
        return null;
      }

      return { begin, end };
    },
    getXAxisTickLimit(pointCount) {
      const chartElement = this.$refs.canvas && this.$refs.canvas.parentElement;
      const width = chartElement ? chartElement.clientWidth : window.innerWidth;

      if (pointCount <= 0) {
        return 1;
      }
      if (pointCount <= 7) {
        return pointCount;
      }
      if (width < 576) {
        return Math.min(pointCount, 5);
      }
      if (width < 992) {
        return Math.min(pointCount, 7);
      }
      return Math.min(pointCount, 10);
    },
    plot(name, label) {
      const dateRange = this.getSelectedDateRange();
      if (!dateRange) {
        return;
      }

      this.plotRequestId += 1;
      const requestId = this.plotRequestId;

      if (this.plotAbortController) {
        this.plotAbortController.abort();
      }
      this.plotAbortController = new AbortController();

      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }

      const params = new URLSearchParams({
        begin: dateRange.begin.toISOString(),
        end: dateRange.end.toISOString(),
      });
      axios({
        method: 'get',
        url: `/api/dashboard/timeseries/${name}?${params.toString()}`,
        signal: this.plotAbortController.signal,
      })
        .then((response) => {
          if (requestId !== this.plotRequestId) {
            return;
          }

          const values = response.data.map((item) => Number(item.Value));
          const xTickLimit = this.getXAxisTickLimit(response.data.length);

          this.localChartData = {
            ...this.chartData,
            labels: response.data.map((item) => moment(item.Timestamp).format('MMM DD HH:mm')),
            datasets: this.chartData.datasets.map((dataset, index) => (index === 0 ? {
              ...dataset,
              data: values.map((value) => value.toFixed(5)),
              label,
            } : dataset)),
          };

          const chartOptions = {
            ...{
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                position: 'top',
              },
              elements: {
                line: {
                  // A higher value makes the line look skewed at this ratio.
                  tension: 0.3,
                },
                point: {
                  radius: 0,
                },
              },
              scales: {
                xAxes: [{
                  gridLines: false,
                  ticks: {
                    autoSkip: true,
                    maxTicksLimit: xTickLimit,
                    maxRotation: 0,
                    minRotation: 0,
                  },
                }],
                yAxes: [{
                  ticks: {
                    suggestedMax: values.length ? Math.max(...values) : 0,
                    callback(tick) {
                      if (tick === 0) {
                        return tick;
                      }
                      // Format the amounts using Ks for thousands.
                      return tick > 999 ? `${(tick / 1000).toFixed(1)}K` : tick;
                    },
                  },
                }],
              },
              hover: {
                mode: 'nearest',
                intersect: false,
              },
              tooltips: {
                custom: false,
                mode: 'nearest',
                intersect: false,
              },
            },
            ...this.chartOptions,
          };

          const BlogUsersOverview = new Chart(this.$refs.canvas, {
            type: 'LineWithLine',
            data: this.localChartData,
            options: chartOptions,
          });

          this.chartInstance = BlogUsersOverview;

          // They can still be triggered on hover.
          const buoMeta = BlogUsersOverview.getDatasetMeta(0);
          if (buoMeta && buoMeta.data && buoMeta.data.length > 0) {
            buoMeta.data[0]._model.radius = 0;
            buoMeta.data[buoMeta.data.length - 1]._model.radius = 0;
          }

          // Render the chart.
          BlogUsersOverview.render();
        })
        // Ignore all errors to avoid breaking the dashboard UI, including
        // cancellations caused by switching timeseries quickly.
        .catch(() => null);
    },
    changeTimeseries(value) {
      this.timeseries = value;
      this.plot(value.name, value.label);
    },
    changeDateRange() {
      this.plot(this.timeseries.name, this.timeseries.label);
    },
  },
};
</script>

<style lang="scss">
.recommendation-performance__chart {
  position: relative;
  width: 100%;
  height: 17rem;
  min-height: 17rem;
  margin-top: 0.75rem;

  canvas {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
  }
}

@media (max-width: 575.98px) {
  .recommendation-performance__chart {
    height: 19rem;
    min-height: 19rem;
  }
}
</style>
