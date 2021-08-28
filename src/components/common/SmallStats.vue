<template>
    <d-card :class="['stats-small', computedVariationClass, 'card', 'card-small']">
        <d-card-body :class="[computedBodyClass]">
            <div :class="['d-flex', computedInnerWrapperClass]">
                <div :class="['stats-small__data', computedDataFieldClass]">
                    <span :id="id" :class="['stats-small__label', 'text-uppercase', computedLabelClass]">{{ label }}</span>
                    <h6 :class="['stats-small__value', 'count', computedValueClass]">{{ value }}</h6>
                    <d-tooltip :target="'#' + id">
                        {{ tip }}
                    </d-tooltip>
                </div>
            </div>
        </d-card-body>
    </d-card>
</template>

<script>

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
    tip: {
      type: String,
      default: '',
    },
    /**
     * The variation.
     */
    variation: {
      type: String,
      default: null,
    },
  },
  computed: {
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
  },
};
</script>
