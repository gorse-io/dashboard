import {
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue';
import { RouterLink } from 'vue-router';
import {
  VAlert,
  VAppBar,
  VBtn,
  VBtnGroup,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VCheckbox,
  VChip,
  VCol,
  VContainer,
  VDialog,
  VForm,
  VList,
  VListItem,
  VMessages,
  VProgressLinear,
  VRow,
  VSelect,
  VSheet,
  VTextField,
  VTextarea,
  VToolbarItems,
} from 'vuetify/components';

const normalizeTheme = (theme) => {
  const map = {
    danger: 'error',
    error: 'error',
    warning: 'warning',
    success: 'success',
    primary: 'primary',
    secondary: 'secondary',
    info: 'info',
    light: 'surface-variant',
    dark: 'surface',
    white: undefined,
  };

  return map[theme] || theme;
};

const normalizeModelValue = (rawValue, modifiers = {}) => {
  let nextValue = rawValue;
  if (modifiers.trim && typeof nextValue === 'string') {
    nextValue = nextValue.trim();
  }
  if (modifiers.number) {
    const converted = Number(nextValue);
    nextValue = Number.isNaN(converted) ? nextValue : converted;
  }
  return nextValue;
};

const getInputValue = (props) => {
  if (props.modelValue !== undefined) {
    return props.modelValue;
  }
  if (props.value !== undefined) {
    return props.value;
  }
  return '';
};

const isTruthy = (value) => (
  value === ''
  || value === true
  || value === 'true'
  || value === 1
  || value === '1'
);

const withDefaultClass = (attrs, className) => ({
  ...attrs,
  class: [className, attrs.class],
});

const flattenSlotText = (nodes = []) => nodes
  .flatMap((node) => {
    if (node === null || node === undefined || typeof node === 'boolean') {
      return [];
    }
    if (typeof node === 'string' || typeof node === 'number') {
      return [String(node)];
    }
    if (Array.isArray(node.children)) {
      return flattenSlotText(node.children);
    }
    if (typeof node.children === 'string' || typeof node.children === 'number') {
      return [String(node.children)];
    }
    return [];
  })
  .join('')
  .trim();

const extractSelectItems = (nodes = []) => nodes.flatMap((node) => {
  if (!node || typeof node === 'string' || typeof node === 'number') {
    return [];
  }

  if (typeof node.type === 'symbol' && Array.isArray(node.children)) {
    return extractSelectItems(node.children);
  }

  if (node.type !== 'option') {
    if (Array.isArray(node.children)) {
      return extractSelectItems(node.children);
    }
    return [];
  }

  const title = Array.isArray(node.children)
    ? flattenSlotText(node.children)
    : String(node.children ?? '');
  const value = node.props?.value ?? title;
  const disabled = node.props?.disabled === true || node.props?.disabled === '';

  return [{
    title,
    value,
    props: { disabled },
  }];
});

const DContainer = defineComponent({
  name: 'DContainer',
  props: {
    fluid: {
      type: [Boolean, String],
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    return () => h(VContainer, {
      ...attrs,
      fluid: isTruthy(props.fluid),
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DRow = defineComponent({
  name: 'DRow',
  props: {
    noGutters: {
      type: [Boolean, String],
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    return () => h(VRow, {
      ...attrs,
      noGutters: isTruthy(props.noGutters),
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DCol = defineComponent({
  name: 'DCol',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    col: {
      type: [Boolean, String],
      default: false,
    },
    cols: {
      type: [String, Number],
      default: undefined,
    },
    sm: {
      type: [String, Number, Boolean],
      default: undefined,
    },
    md: {
      type: [String, Number, Boolean],
      default: undefined,
    },
    lg: {
      type: [String, Number, Boolean],
      default: undefined,
    },
    xl: {
      type: [String, Number, Boolean],
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const cols = props.cols !== undefined
        ? props.cols
        : (isTruthy(props.col) ? true : undefined);

      return h(VCol, {
        ...attrs,
        tag: props.tag,
        cols,
        sm: props.sm,
        md: props.md,
        lg: props.lg,
        xl: props.xl,
        class: [attrs.class],
      }, slots.default ? slots.default() : []);
    };
  },
});

const DCard = defineComponent({
  name: 'DCard',
  setup(_, { slots, attrs }) {
    return () => h(VCard, {
      ...attrs,
      class: ['card', attrs.class],
      variant: 'flat',
    }, slots);
  },
});

const DCardHeader = defineComponent({
  name: 'DCardHeader',
  setup(_, { slots, attrs }) {
    return () => h(VCardTitle, {
      ...attrs,
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DCardBody = defineComponent({
  name: 'DCardBody',
  setup(_, { slots, attrs }) {
    return () => h(VCardText, {
      ...attrs,
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DCardFooter = defineComponent({
  name: 'DCardFooter',
  setup(_, { slots, attrs }) {
    return () => h(VCardActions, {
      ...attrs,
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DButton = defineComponent({
  name: 'DButton',
  props: {
    theme: {
      type: String,
      default: undefined,
    },
    outline: {
      type: [Boolean, String],
      default: false,
    },
    pill: {
      type: [Boolean, String],
      default: false,
    },
    size: {
      type: String,
      default: undefined,
    },
    type: {
      type: String,
      default: 'button',
    },
  },
  setup(props, { slots, attrs }) {
    return () => h(VBtn, {
      ...attrs,
      type: props.type,
      color: normalizeTheme(props.theme),
      variant: isTruthy(props.outline) ? 'outlined' : 'flat',
      rounded: isTruthy(props.pill) ? 'pill' : undefined,
      size: props.size === 'small' ? 'small' : props.size,
      class: [attrs.class],
    }, slots);
  },
});

const DButtonGroup = defineComponent({
  name: 'DButtonGroup',
  setup(_, { slots, attrs }) {
    return () => h(VBtnGroup, {
      ...attrs,
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DBadge = defineComponent({
  name: 'DBadge',
  props: {
    theme: {
      type: String,
      default: 'secondary',
    },
    outline: {
      type: [Boolean, String],
      default: false,
    },
    pill: {
      type: [Boolean, String],
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    return () => h(VChip, {
      ...attrs,
      color: normalizeTheme(props.theme),
      variant: isTruthy(props.outline) ? 'outlined' : 'tonal',
      rounded: isTruthy(props.pill) ? 'pill' : undefined,
      size: 'small',
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DInputGroup = defineComponent({
  name: 'DInputGroup',
  props: {
    prepend: {
      type: String,
      default: undefined,
    },
    size: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const children = [];
      if (props.prepend !== undefined) {
        children.push(
          h(VChip, {
            size: 'small',
            variant: 'outlined',
            class: 'mr-2',
          }, {
            default: () => props.prepend,
          }),
        );
      }
      if (slots.default) {
        children.push(...slots.default());
      }
      return h(VSheet, {
        ...attrs,
        color: 'transparent',
        elevation: 0,
        rounded: false,
        class: ['d-flex align-center flex-wrap', attrs.class],
      }, children);
    };
  },
});

const DInputGroupAddon = defineComponent({
  name: 'DInputGroupAddon',
  props: {
    append: {
      type: [Boolean, String],
      default: false,
    },
    prepend: {
      type: [Boolean, String],
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    return () => h(VSheet, {
      ...attrs,
      color: 'transparent',
      elevation: 0,
      rounded: false,
      class: [
        'd-flex align-center',
        isTruthy(props.append) ? 'ml-2' : 'mr-2',
        attrs.class,
      ],
    }, slots.default ? slots.default() : []);
  },
});

const DInputGroupText = defineComponent({
  name: 'DInputGroupText',
  props: {
    placement: {
      type: String,
      default: 'prepend',
    },
  },
  setup(props, { slots, attrs }) {
    return () => h(VChip, {
      ...attrs,
      size: 'small',
      variant: 'outlined',
      class: [props.placement === 'append' ? 'ml-2' : 'mr-2', attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DSelect = defineComponent({
  name: 'DSelect',
  props: {
    modelValue: {
      type: [String, Number, Boolean, Object],
      default: undefined,
    },
    value: {
      type: [String, Number, Boolean, Object],
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'input', 'change'],
  setup(props, { slots, attrs, emit }) {
    const handleUpdate = (nextValue) => {
      emit('update:modelValue', nextValue);
      emit('input', nextValue);
      emit('change', nextValue);
    };

    return () => {
      const slotNodes = slots.default ? slots.default() : [];
      const items = extractSelectItems(slotNodes);

      return h(VSelect, {
        ...attrs,
        modelValue: getInputValue(props),
        items,
        itemTitle: 'title',
        itemValue: 'value',
        hideDetails: attrs.hideDetails ?? 'auto',
        density: attrs.density ?? 'comfortable',
        class: [attrs.class],
        'onUpdate:modelValue': handleUpdate,
      });
    };
  },
});

const createTextInputComponent = () => defineComponent({
  props: {
    modelValue: {
      type: [String, Number],
      default: undefined,
    },
    modelModifiers: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: [String, Number],
      default: undefined,
    },
    type: {
      type: String,
      default: 'text',
    },
    state: {
      type: String,
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'input', 'change', 'keyup'],
  setup(props, { attrs, emit }) {
    const handleUpdate = (nextRawValue) => {
      const nextValue = normalizeModelValue(nextRawValue, props.modelModifiers);
      emit('update:modelValue', nextValue);
      emit('input', nextValue);
    };

    const handleChange = (event) => {
      const nextValue = normalizeModelValue(event?.target?.value, props.modelModifiers);
      emit('change', nextValue);
    };

    const handleKeyup = (event) => {
      emit('keyup', event);
    };

    return () => h(VTextField, {
      ...attrs,
      type: props.type,
      modelValue: getInputValue(props),
      error: props.state === 'invalid',
      hideDetails: attrs.hideDetails ?? 'auto',
      density: attrs.density ?? 'comfortable',
      class: [attrs.class],
      'onUpdate:modelValue': handleUpdate,
      onChange: handleChange,
      onKeyup: handleKeyup,
    });
  },
});

const DInput = createTextInputComponent();
const DFormInput = createTextInputComponent();

const DFormTextarea = defineComponent({
  name: 'DFormTextarea',
  props: {
    modelValue: {
      type: String,
      default: undefined,
    },
    value: {
      type: String,
      default: undefined,
    },
    rows: {
      type: [Number, String],
      default: 3,
    },
    maxRows: {
      type: [Number, String],
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'input'],
  setup(props, { attrs, emit }) {
    const handleInput = (nextValue) => {
      emit('update:modelValue', nextValue);
      emit('input', nextValue);
    };

    return () => h(VTextarea, {
      ...attrs,
      modelValue: getInputValue(props),
      rows: props.rows,
      maxRows: props.maxRows,
      autoGrow: props.maxRows !== undefined,
      hideDetails: attrs.hideDetails ?? 'auto',
      density: attrs.density ?? 'comfortable',
      class: [attrs.class],
      'onUpdate:modelValue': handleInput,
    });
  },
});

const DForm = defineComponent({
  name: 'DForm',
  emits: ['submit'],
  setup(_, { slots, attrs, emit }) {
    const handleSubmit = (event) => {
      emit('submit', event);
    };

    return () => h(VForm, {
      ...attrs,
      onSubmit: handleSubmit,
    }, slots.default ? slots.default() : []);
  },
});

const DFormRow = defineComponent({
  name: 'DFormRow',
  setup(_, { slots, attrs }) {
    return () => h(VRow, {
      ...attrs,
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DFormInvalidFeedback = defineComponent({
  name: 'DFormInvalidFeedback',
  setup(_, { slots, attrs }) {
    return () => h(VMessages, {
      ...attrs,
      active: true,
      color: 'error',
      messages: [flattenSlotText(slots.default ? slots.default() : [])],
      class: [attrs.class],
    });
  },
});

const DAlert = defineComponent({
  name: 'DAlert',
  props: {
    theme: {
      type: String,
      default: 'primary',
    },
    show: {
      type: [Boolean, Number],
      default: false,
    },
    dismissible: {
      type: [Boolean, String],
      default: false,
    },
  },
  emits: ['alert-dismissed', 'alert-dismiss-countdown'],
  setup(props, { slots, attrs, emit }) {
    const visible = ref(false);
    let timerId = null;

    const stopCountdown = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    };

    const hide = () => {
      if (visible.value) {
        visible.value = false;
        emit('alert-dismissed');
      }
      emit('alert-dismiss-countdown', 0);
      stopCountdown();
    };

    const startCountdown = (seconds) => {
      stopCountdown();
      if (!seconds || seconds <= 0) {
        hide();
        return;
      }

      let current = seconds;
      visible.value = true;
      emit('alert-dismiss-countdown', current);

      timerId = setInterval(() => {
        current -= 1;
        emit('alert-dismiss-countdown', Math.max(current, 0));
        if (current <= 0) {
          hide();
        }
      }, 1000);
    };

    watch(() => props.show, (value) => {
      if (typeof value === 'number') {
        startCountdown(value);
        return;
      }

      stopCountdown();
      visible.value = !!value;
    }, { immediate: true });

    onBeforeUnmount(() => {
      stopCountdown();
    });

    return () => {
      if (!visible.value) {
        return null;
      }

      return h(VAlert, {
        ...attrs,
        type: normalizeTheme(props.theme),
        variant: 'tonal',
        closable: isTruthy(props.dismissible),
        class: [attrs.class],
        'onClick:close': hide,
      }, slots.default ? slots.default() : []);
    };
  },
});

const DModal = defineComponent({
  name: 'DModal',
  props: {
    size: {
      type: String,
      default: undefined,
    },
  },
  emits: ['close'],
  setup(props, { slots, attrs, emit }) {
    const onUpdate = (value) => {
      if (!value) {
        emit('close');
      }
    };

    return () => h(VDialog, {
      ...attrs,
      modelValue: true,
      maxWidth: props.size === 'lg' ? 1100 : 640,
      'onUpdate:modelValue': onUpdate,
    }, {
      default: () => h(VCard, {
        class: ['card', attrs.class],
        variant: 'flat',
      }, slots.default ? slots.default() : []),
    });
  },
});

const DModalHeader = defineComponent({
  name: 'DModalHeader',
  setup(_, { slots, attrs }) {
    return () => h(VCardTitle, {
      ...attrs,
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DModalTitle = defineComponent({
  name: 'DModalTitle',
  setup(_, { slots, attrs }) {
    return () => h('h5', {
      ...attrs,
      class: ['m-0', attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DModalBody = defineComponent({
  name: 'DModalBody',
  setup(_, { slots, attrs }) {
    return () => h(VCardText, {
      ...attrs,
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DCheckbox = defineComponent({
  name: 'DCheckbox',
  props: {
    modelValue: {
      type: [Boolean, Array],
      default: undefined,
    },
    value: {
      type: [String, Number, Boolean],
      default: true,
    },
    checked: {
      type: [Boolean, String],
      default: undefined,
    },
    disabled: {
      type: [Boolean, String],
      default: false,
    },
  },
  emits: ['update:modelValue', 'input', 'change'],
  setup(props, { slots, attrs, emit }) {
    const checked = () => {
      if (Array.isArray(props.modelValue)) {
        return props.modelValue.includes(props.value);
      }
      if (props.modelValue !== undefined) {
        return !!props.modelValue;
      }
      if (props.checked !== undefined) {
        return isTruthy(props.checked);
      }
      return false;
    };

    const onChange = (nextRawValue) => {
      const isChecked = !!nextRawValue;
      if (Array.isArray(props.modelValue)) {
        const nextValue = [...props.modelValue];
        const currentIndex = nextValue.indexOf(props.value);
        if (isChecked && currentIndex === -1) {
          nextValue.push(props.value);
        }
        if (!isChecked && currentIndex !== -1) {
          nextValue.splice(currentIndex, 1);
        }
        emit('update:modelValue', nextValue);
        emit('input', nextValue);
        emit('change', nextValue);
        return;
      }

      emit('update:modelValue', isChecked);
      emit('input', isChecked);
      emit('change', isChecked);
    };

    return () => h(VCheckbox, {
      ...attrs,
      modelValue: props.modelValue !== undefined ? props.modelValue : checked(),
      value: props.value,
      disabled: isTruthy(props.disabled),
      hideDetails: attrs.hideDetails ?? 'auto',
      density: attrs.density ?? 'comfortable',
      class: [attrs.class],
      label: slots.default ? flattenSlotText(slots.default()) : attrs.label,
      'onUpdate:modelValue': onChange,
    });
  },
});

const DListGroup = defineComponent({
  name: 'DListGroup',
  props: {
    flush: {
      type: [Boolean, String],
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    return () => h(VList, {
      ...attrs,
      density: attrs.density ?? 'comfortable',
      class: [isTruthy(props.flush) ? 'pa-0' : null, attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DListGroupItem = defineComponent({
  name: 'DListGroupItem',
  setup(_, { slots, attrs }) {
    return () => h(VListItem, {
      ...attrs,
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DNavbar = defineComponent({
  name: 'DNavbar',
  setup(_, { slots, attrs }) {
    return () => h(VAppBar, {
      ...attrs,
      flat: true,
      elevation: 0,
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DNavbarNav = defineComponent({
  name: 'DNavbarNav',
  setup(_, { slots, attrs }) {
    return () => h(VToolbarItems, {
      ...attrs,
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DNav = defineComponent({
  name: 'DNav',
  setup(_, { slots, attrs }) {
    return () => h(VList, {
      ...attrs,
      density: attrs.density ?? 'comfortable',
      class: [attrs.class],
    }, slots.default ? slots.default() : []);
  },
});

const DLink = defineComponent({
  name: 'DLink',
  props: {
    to: {
      type: [String, Object],
      default: undefined,
    },
    href: {
      type: String,
      default: undefined,
    },
  },
  emits: ['click'],
  setup(props, { slots, attrs, emit }) {
    const handleClick = (event) => {
      emit('click', event);
    };

    return () => {
      if (props.to !== undefined) {
        return h(RouterLink, {
          ...attrs,
          to: props.to,
          class: [attrs.class],
          onClick: handleClick,
        }, slots.default ? slots.default() : []);
      }

      return h('a', {
        ...attrs,
        href: props.href || '#',
        class: [attrs.class],
        onClick: handleClick,
      }, slots.default ? slots.default() : []);
    };
  },
});

const DCollapse = defineComponent({
  name: 'DCollapse',
  props: {
    open: {
      type: [Boolean, String],
      default: false,
    },
  },
  setup(props, { slots, attrs }) {
    return () => h('div', {
      ...attrs,
      class: ['collapse', isTruthy(props.open) ? 'show' : null, attrs.class],
      style: isTruthy(props.open) ? attrs.style : { ...(attrs.style || {}), display: 'none' },
    }, slots.default ? slots.default() : []);
  },
});

const DDropdownItem = defineComponent({
  name: 'DDropdownItem',
  props: {
    to: {
      type: [String, Object],
      default: undefined,
    },
    href: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const common = {
        ...attrs,
        class: [attrs.class],
      };

      if (props.to !== undefined) {
        return h(VListItem, {
          ...common,
          to: props.to,
        }, slots.default ? slots.default() : []);
      }

      return h(VListItem, {
        ...common,
        href: props.href || '#',
      }, slots.default ? slots.default() : []);
    };
  },
});

const DProgress = defineComponent({
  name: 'DProgress',
  props: {
    value: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    theme: {
      type: String,
      default: 'primary',
    },
  },
  setup(props, { attrs }) {
    return () => {
      const safeMax = props.max > 0 ? props.max : 1;
      const progress = Math.max(0, Math.min(100, (props.value / safeMax) * 100));

      return h(VProgressLinear, {
        ...attrs,
        modelValue: progress,
        color: normalizeTheme(props.theme),
        rounded: true,
        height: 10,
      });
    };
  },
});

const DDatepicker = defineComponent({
  name: 'DDatepicker',
  props: {
    modelValue: {
      type: [Date, String],
      default: undefined,
    },
    value: {
      type: [Date, String],
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'input', 'change'],
  setup(props, { attrs, emit }) {
    const toInputDate = (val) => {
      if (!val) {
        return '';
      }

      if (val instanceof Date && !Number.isNaN(val.getTime())) {
        return val.toISOString().slice(0, 10);
      }

      if (typeof val === 'string') {
        return val.slice(0, 10);
      }

      return '';
    };

    const parseDate = (val) => {
      if (!val) {
        return null;
      }
      const parsed = new Date(`${val}T00:00:00`);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const handleInput = (value) => {
      const parsedDate = parseDate(value);
      emit('update:modelValue', parsedDate);
      emit('input', parsedDate);
      emit('change', parsedDate);
    };

    return () => h(VTextField, {
      ...attrs,
      type: 'date',
      modelValue: toInputDate(getInputValue(props)),
      hideDetails: attrs.hideDetails ?? 'auto',
      density: attrs.density ?? 'comfortable',
      class: [attrs.class],
      'onUpdate:modelValue': handleInput,
    });
  },
});

const components = {
  'd-alert': DAlert,
  'd-badge': DBadge,
  'd-button': DButton,
  'd-button-group': DButtonGroup,
  'd-card': DCard,
  'd-card-body': DCardBody,
  'd-card-footer': DCardFooter,
  'd-card-header': DCardHeader,
  'd-checkbox': DCheckbox,
  'd-col': DCol,
  'd-collapse': DCollapse,
  'd-container': DContainer,
  'd-datepicker': DDatepicker,
  'd-dropdown-item': DDropdownItem,
  'd-form': DForm,
  'd-form-input': DFormInput,
  'd-form-invalid-feedback': DFormInvalidFeedback,
  'd-form-row': DFormRow,
  'd-form-textarea': DFormTextarea,
  'd-input': DInput,
  'd-input-group': DInputGroup,
  'd-input-group-addon': DInputGroupAddon,
  'd-input-group-text': DInputGroupText,
  'd-link': DLink,
  'd-list-group': DListGroup,
  'd-list-group-item': DListGroupItem,
  'd-modal': DModal,
  'd-modal-body': DModalBody,
  'd-modal-header': DModalHeader,
  'd-modal-title': DModalTitle,
  'd-nav': DNav,
  'd-navbar': DNavbar,
  'd-navbar-nav': DNavbarNav,
  'd-progress': DProgress,
  'd-row': DRow,
  'd-select': DSelect,
};

export default {
  install(app) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component);
    });
  },
};
