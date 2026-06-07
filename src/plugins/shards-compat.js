import {
  Teleport,
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  watch,
} from 'vue';
import { RouterLink } from 'vue-router';
import DatePicker from 'primevue/datepicker';

function splitAttrs(attrs, omittedKeys = []) {
  const forwarded = {};
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class' || key === 'style' || omittedKeys.includes(key)) {
      return;
    }
    forwarded[key] = value;
  });
  return {
    className: attrs.class,
    style: attrs.style,
    forwarded,
  };
}

function toBooleanShow(value) {
  if (value === '') {
    return true;
  }
  if (typeof value === 'string') {
    return value !== 'false';
  }
  return Boolean(value);
}

function isLooseEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((value, index) => isLooseEqual(value, b[index]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    return aKeys.length === bKeys.length && aKeys.every((key) => isLooseEqual(a[key], b[key]));
  }
  return String(a) === String(b);
}

function looseIndexOf(array, value) {
  return array.findIndex((item) => isLooseEqual(item, value));
}

function getSelectOptionValue(option) {
  if (!option) {
    return '';
  }
  return Object.prototype.hasOwnProperty.call(option, '_value') ? option._value : option.value;
}

function applyModelModifiers(rawValue, modifiers = {}) {
  let value = rawValue;
  if (modifiers.trim && typeof value === 'string') {
    value = value.trim();
  }
  if (modifiers.number && typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      value = parsed;
    }
  }
  return value;
}

function resolveTargetId(binding) {
  if (typeof binding.value === 'string' && binding.value.length > 0) {
    return binding.value;
  }
  const modifierKeys = Object.keys(binding.modifiers || {});
  return modifierKeys.length > 0 ? modifierKeys[0] : null;
}

function findToggleTarget(targetId) {
  if (!targetId) {
    return null;
  }
  return document.getElementById(targetId) || document.querySelector(`[data-d-toggle-id="${targetId}"]`);
}

const DToggleDirective = {
  mounted(el, binding) {
    const handler = (event) => {
      const targetId = resolveTargetId(binding);
      const target = findToggleTarget(targetId);
      if (!target) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const accordionName = target.getAttribute('accordion');
      if (accordionName) {
        document.querySelectorAll(`[accordion="${accordionName}"]`).forEach((node) => {
          if (node !== target) {
            node.classList.remove('show');
          }
        });
      }

      const shouldShow = !target.classList.contains('show');
      target.classList.toggle('show', shouldShow);

      const dropdown = el.closest('.dropdown');
      if (dropdown) {
        dropdown.classList.toggle('show', shouldShow);
      }
    };

    el.__dToggleHandler = handler;
    el.addEventListener('click', handler);
  },
  beforeUnmount(el) {
    if (el.__dToggleHandler) {
      el.removeEventListener('click', el.__dToggleHandler);
      delete el.__dToggleHandler;
    }
  },
};

const DContainer = defineComponent({
  name: 'DContainer',
  inheritAttrs: false,
  props: {
    fluid: {
      type: Boolean,
      default: false,
    },
    tag: {
      type: String,
      default: 'div',
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h(
        props.tag,
        {
          ...forwarded,
          class: [props.fluid ? 'container-fluid' : 'container', className],
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const DRow = defineComponent({
  name: 'DRow',
  inheritAttrs: false,
  props: {
    noGutters: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h(
        'div',
        {
          ...forwarded,
          class: ['row', props.noGutters ? 'no-gutters' : null, className],
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

function breakpointClass(prefix, value) {
  if (value === undefined || value === null || value === false) {
    return null;
  }
  if (value === true || value === '') {
    return `col-${prefix}`;
  }
  return `col-${prefix}-${value}`;
}

const DCol = defineComponent({
  name: 'DCol',
  inheritAttrs: false,
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    col: {
      type: Boolean,
      default: false,
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
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h(
        props.tag,
        {
          ...forwarded,
          class: [
            props.col ? 'col' : null,
            breakpointClass('sm', props.sm),
            breakpointClass('md', props.md),
            breakpointClass('lg', props.lg),
            breakpointClass('xl', props.xl),
            className,
          ],
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

function createSimpleTagComponent(name, tag, baseClass, props = {}) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props,
    setup(componentProps, { attrs, slots }) {
      return () => {
        const { className, style, forwarded } = splitAttrs(attrs);
        return h(
          tag,
          {
            ...forwarded,
            class: [baseClass, className],
            style,
          },
          slots.default ? slots.default() : undefined,
        );
      };
    },
  });
}

const DNav = createSimpleTagComponent('DNav', 'ul', 'nav');
const DNavbarNav = createSimpleTagComponent('DNavbarNav', 'ul', 'navbar-nav');
const DCard = createSimpleTagComponent('DCard', 'div', 'card');
const DCardHeader = createSimpleTagComponent('DCardHeader', 'div', 'card-header');
const DCardBody = createSimpleTagComponent('DCardBody', 'div', 'card-body');
const DCardFooter = createSimpleTagComponent('DCardFooter', 'div', 'card-footer');
const DButtonGroup = createSimpleTagComponent('DButtonGroup', 'div', 'btn-group');
const DFormRow = createSimpleTagComponent('DFormRow', 'div', 'form-row');
const DInputGroupText = createSimpleTagComponent('DInputGroupText', 'span', 'input-group-text');
const DModalHeader = createSimpleTagComponent('DModalHeader', 'div', 'modal-header');
const DModalTitle = createSimpleTagComponent('DModalTitle', 'h5', 'modal-title');
const DModalBody = createSimpleTagComponent('DModalBody', 'div', 'modal-body');
const DCollapse = createSimpleTagComponent('DCollapse', 'div', 'collapse');

const DNavbar = defineComponent({
  name: 'DNavbar',
  inheritAttrs: false,
  props: {
    type: {
      type: String,
      default: 'light',
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h(
        'nav',
        {
          ...forwarded,
          class: ['navbar', props.type === 'dark' ? 'navbar-dark' : 'navbar-light', className],
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const DListGroup = defineComponent({
  name: 'DListGroup',
  inheritAttrs: false,
  props: {
    flush: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h(
        'ul',
        {
          ...forwarded,
          class: ['list-group', props.flush ? 'list-group-flush' : null, className],
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const DListGroupItem = createSimpleTagComponent('DListGroupItem', 'li', 'list-group-item');

const DForm = defineComponent({
  name: 'DForm',
  inheritAttrs: false,
  props: {
    validated: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h(
        'form',
        {
          ...forwarded,
          class: [props.validated ? 'was-validated' : null, className],
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const DFormInvalidFeedback = defineComponent({
  name: 'DFormInvalidFeedback',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h(
        'div',
        {
          ...forwarded,
          class: ['invalid-feedback', 'd-block', className],
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const DInputGroup = defineComponent({
  name: 'DInputGroup',
  inheritAttrs: false,
  props: {
    prepend: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      const children = [];

      if (props.prepend || slots.prepend) {
        const prependChildren = [];
        if (props.prepend) {
          prependChildren.push(h('span', { class: 'input-group-text' }, props.prepend));
        }
        if (slots.prepend) {
          prependChildren.push(...slots.prepend());
        }
        children.push(h('div', { class: 'input-group-prepend' }, prependChildren));
      }

      if (slots.default) {
        children.push(...slots.default());
      }

      if (slots.append) {
        children.push(h('div', { class: 'input-group-append' }, slots.append()));
      }

      return h(
        'div',
        {
          ...forwarded,
          class: ['input-group', props.size ? `input-group-${props.size}` : null, className],
          style,
        },
        children,
      );
    };
  },
});

const DInputGroupAddon = defineComponent({
  name: 'DInputGroupAddon',
  inheritAttrs: false,
  props: {
    append: {
      type: Boolean,
      default: false,
    },
    prepend: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      const addonClass = props.prepend ? 'input-group-prepend' : 'input-group-append';
      return h(
        'div',
        {
          ...forwarded,
          class: [addonClass, className],
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const DButton = defineComponent({
  name: 'DButton',
  inheritAttrs: false,
  props: {
    theme: {
      type: String,
      default: 'secondary',
    },
    outline: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: '',
    },
    pill: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'button',
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      const themeClass = props.theme === 'white'
        ? 'btn-white'
        : props.outline
          ? `btn-outline-${props.theme}`
          : `btn-${props.theme}`;

      return h(
        'button',
        {
          ...forwarded,
          type: forwarded.type || props.type,
          class: [
            'btn',
            themeClass,
            props.size === 'small' || props.size === 'sm' ? 'btn-sm' : null,
            props.pill ? 'rounded-pill' : null,
            className,
          ],
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const DBadge = defineComponent({
  name: 'DBadge',
  inheritAttrs: false,
  props: {
    theme: {
      type: String,
      default: 'primary',
    },
    outline: {
      type: Boolean,
      default: false,
    },
    pill: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h(
        'span',
        {
          ...forwarded,
          class: [
            'badge',
            props.outline ? `badge-outline-${props.theme}` : `badge-${props.theme}`,
            props.pill ? 'badge-pill' : null,
            className,
          ],
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const DInput = defineComponent({
  name: 'DInput',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number],
      default: undefined,
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
      default: '',
    },
    modelModifiers: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue', 'input', 'change', 'keyup', 'keydown', 'blur', 'focus'],
  setup(props, { attrs, emit }) {
    const innerValue = computed(() => (props.modelValue !== undefined ? props.modelValue : props.value));

    const emitInputValue = (rawValue) => {
      const value = applyModelModifiers(rawValue, props.modelModifiers);
      emit('update:modelValue', value);
      emit('input', value);
      return value;
    };

    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h('input', {
        ...forwarded,
        type: props.type,
        class: [
          'form-control',
          props.state === 'invalid' ? 'is-invalid' : null,
          props.state === 'valid' ? 'is-valid' : null,
          className,
        ],
        style,
        value: innerValue.value ?? '',
        onInput: (event) => {
          emitInputValue(event.target.value);
        },
        onChange: (event) => {
          const value = applyModelModifiers(event.target.value, props.modelModifiers);
          emit('change', value);
        },
        onKeyup: (event) => emit('keyup', event),
        onKeydown: (event) => emit('keydown', event),
        onBlur: (event) => emit('blur', event),
        onFocus: (event) => emit('focus', event),
      });
    };
  },
});

const DFormInput = DInput;

const DFormTextarea = defineComponent({
  name: 'DFormTextarea',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number],
      default: undefined,
    },
    value: {
      type: [String, Number],
      default: undefined,
    },
    rows: {
      type: [String, Number],
      default: undefined,
    },
    maxRows: {
      type: [String, Number],
      default: undefined,
    },
    modelModifiers: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue', 'input', 'change'],
  setup(props, { attrs, slots, emit }) {
    const innerValue = computed(() => (props.modelValue !== undefined ? props.modelValue : props.value));

    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h(
        'textarea',
        {
          ...forwarded,
          class: ['form-control', className],
          style,
          rows: props.rows,
          value: innerValue.value ?? '',
          onInput: (event) => {
            const value = applyModelModifiers(event.target.value, props.modelModifiers);
            emit('update:modelValue', value);
            emit('input', value);
          },
          onChange: (event) => {
            const value = applyModelModifiers(event.target.value, props.modelModifiers);
            emit('change', value);
          },
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const DSelect = defineComponent({
  name: 'DSelect',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Boolean, Object],
      default: undefined,
    },
    value: {
      type: [String, Number, Boolean, Object],
      default: undefined,
    },
    modelModifiers: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue', 'input', 'change'],
  setup(props, { attrs, slots, emit }) {
    const selectRef = ref(null);
    const selectedValue = computed(() => (props.modelValue !== undefined ? props.modelValue : props.value));

    const syncSelectedOption = () => {
      const selectEl = selectRef.value;
      if (!selectEl || !selectEl.options) {
        return;
      }

      let found = false;
      for (let i = 0; i < selectEl.options.length; i += 1) {
        const option = selectEl.options[i];
        const optionValue = getSelectOptionValue(option);
        const selected = isLooseEqual(optionValue, selectedValue.value);
        option.selected = selected;
        if (selected) {
          found = true;
        }
      }

      if (!found && selectedValue.value == null && selectEl.options.length > 0) {
        selectEl.options[0].selected = true;
      }
    };

    onMounted(() => nextTick(syncSelectedOption));
    onUpdated(() => nextTick(syncSelectedOption));
    watch(selectedValue, () => nextTick(syncSelectedOption), { deep: true });

    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h(
        'select',
        {
          ...forwarded,
          ref: selectRef,
          class: ['custom-select', className],
          style,
          onChange: (event) => {
            const option = event.target.options[event.target.selectedIndex];
            const rawValue = getSelectOptionValue(option);
            const value = applyModelModifiers(rawValue, props.modelModifiers);
            emit('update:modelValue', value);
            emit('input', value);
            emit('change', value);
          },
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const DDatepicker = defineComponent({
  name: 'DDatepicker',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Date, String, Number, Object],
      default: undefined,
    },
    value: {
      type: [Date, String, Number, Object],
      default: undefined,
    },
    typeable: {
      type: Boolean,
      default: true,
    },
    small: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue', 'input', 'change'],
  setup(props, { attrs, emit }) {
    const innerValue = computed(() => (props.modelValue !== undefined ? props.modelValue : props.value));

    return () => {
      const { className, style, forwarded } = splitAttrs(attrs, ['highlighted']);
      return h(DatePicker, {
        ...forwarded,
        class: [className],
        style,
        modelValue: innerValue.value,
        manualInput: props.typeable,
        placeholder: props.placeholder,
        inputClass: ['form-control', props.small ? 'form-control-sm' : null],
        unstyled: true,
        'onUpdate:modelValue': (value) => {
          emit('update:modelValue', value);
          emit('input', value);
          emit('change', value);
        },
      });
    };
  },
});

const DCheckbox = defineComponent({
  name: 'DCheckbox',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Array, Boolean, String, Number],
      default: undefined,
    },
    value: {
      type: [String, Number, Boolean, Object],
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
  setup(props, { attrs, slots, emit }) {
    const isChecked = computed(() => {
      if (Array.isArray(props.modelValue)) {
        return looseIndexOf(props.modelValue, props.value) !== -1;
      }
      if (props.modelValue !== undefined) {
        return Boolean(props.modelValue);
      }
      if (props.checked !== undefined) {
        return toBooleanShow(props.checked);
      }
      return false;
    });

    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h(
        'label',
        {
          class: ['d-inline-flex', 'align-items-center', 'mb-2', className],
          style,
        },
        [
          h('input', {
            ...forwarded,
            type: 'checkbox',
            class: ['mr-2'],
            checked: isChecked.value,
            disabled: toBooleanShow(props.disabled),
            value: props.value,
            onChange: (event) => {
              let nextValue;
              if (Array.isArray(props.modelValue)) {
                nextValue = [...props.modelValue];
                const index = looseIndexOf(nextValue, props.value);
                if (event.target.checked && index === -1) {
                  nextValue.push(props.value);
                }
                if (!event.target.checked && index !== -1) {
                  nextValue.splice(index, 1);
                }
              } else {
                nextValue = event.target.checked;
              }
              emit('update:modelValue', nextValue);
              emit('input', nextValue);
              emit('change', nextValue);
            },
          }),
          slots.default ? h('span', slots.default()) : null,
        ],
      );
    };
  },
});

const DProgress = defineComponent({
  name: 'DProgress',
  inheritAttrs: false,
  props: {
    value: {
      type: [Number, String],
      default: 0,
    },
    max: {
      type: [Number, String],
      default: 100,
    },
    theme: {
      type: String,
      default: 'primary',
    },
  },
  setup(props, { attrs }) {
    const percentage = computed(() => {
      const max = Number(props.max);
      const value = Number(props.value);
      if (!max || Number.isNaN(max) || Number.isNaN(value)) {
        return 0;
      }
      return Math.max(0, Math.min(100, (value / max) * 100));
    });

    const themeClass = computed(() => {
      if (props.theme === 'warning') return 'bg-warning';
      if (props.theme === 'success') return 'bg-success';
      if (props.theme === 'danger') return 'bg-danger';
      if (props.theme === 'info') return 'bg-info';
      return '';
    });

    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      return h('div', {
        ...forwarded,
        class: ['progress', className],
        style,
      }, [
        h('div', {
          class: ['progress-bar', themeClass.value],
          role: 'progressbar',
          style: { width: `${percentage.value}%` },
          'aria-valuenow': Number(props.value) || 0,
          'aria-valuemin': 0,
          'aria-valuemax': Number(props.max) || 100,
        }),
      ]);
    };
  },
});

const DAlert = defineComponent({
  name: 'DAlert',
  inheritAttrs: false,
  props: {
    show: {
      type: [Boolean, Number, String],
      default: false,
    },
    theme: {
      type: String,
      default: 'success',
    },
    dismissible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['alert-dismissed', 'alert-dismiss-countdown'],
  setup(props, { attrs, slots, emit }) {
    const visible = ref(false);
    const countdown = ref(0);
    const timer = ref(null);

    const clearTimer = () => {
      if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
      }
    };

    const dismiss = () => {
      clearTimer();
      visible.value = false;
      countdown.value = 0;
      emit('alert-dismiss-countdown', 0);
      emit('alert-dismissed');
    };

    const startCountdown = (initial) => {
      countdown.value = initial;
      visible.value = initial > 0;
      emit('alert-dismiss-countdown', countdown.value);

      if (!visible.value) {
        return;
      }

      if (timer.value) {
        return;
      }

      timer.value = setInterval(() => {
        countdown.value -= 1;
        emit('alert-dismiss-countdown', Math.max(countdown.value, 0));
        if (countdown.value <= 0) {
          dismiss();
        }
      }, 1000);
    };

    watch(
      () => props.show,
      (value) => {
        if (typeof value === 'number' || (typeof value === 'string' && value !== '' && !Number.isNaN(Number(value)))) {
          const parsed = typeof value === 'number' ? value : Number(value);
          if (parsed <= 0) {
            dismiss();
            return;
          }

          visible.value = true;
          if (countdown.value !== parsed) {
            countdown.value = parsed;
          }
          startCountdown(parsed);
          return;
        }

        clearTimer();
        visible.value = toBooleanShow(value);
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      clearTimer();
    });

    return () => {
      if (!visible.value) {
        return null;
      }

      const { className, style, forwarded } = splitAttrs(attrs);
      return h('div', {
        ...forwarded,
        class: ['alert', `alert-${props.theme}`, props.dismissible ? 'alert-dismissible' : null, className],
        style,
        role: 'alert',
      }, [
        slots.default ? slots.default() : null,
        props.dismissible
          ? h('button', {
              type: 'button',
              class: 'close',
              'aria-label': 'Close',
              onClick: dismiss,
            }, [h('span', { 'aria-hidden': 'true' }, '×')])
          : null,
      ]);
    };
  },
});

const DModal = defineComponent({
  name: 'DModal',
  inheritAttrs: false,
  props: {
    centered: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: '',
    },
  },
  emits: ['close'],
  setup(props, { attrs, slots, emit }) {
    const close = () => {
      emit('close');
    };

    const onEsc = (event) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    onMounted(() => {
      document.body.classList.add('modal-open');
      window.addEventListener('keydown', onEsc);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', onEsc);
      document.body.classList.remove('modal-open');
    });

    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      const sizeClass = props.size === 'lg' ? 'modal-lg' : props.size === 'sm' ? 'modal-sm' : null;

      return h(Teleport, { to: 'body' }, [
        h('div', { class: 'modal-backdrop fade show' }),
        h(
          'div',
          {
            class: ['modal', 'fade', 'show'],
            style: { display: 'block' },
            tabindex: '-1',
            role: 'dialog',
            onClick: (event) => {
              if (event.target === event.currentTarget) {
                close();
              }
            },
          },
          [
            h(
              'div',
              {
                ...forwarded,
                class: ['modal-dialog', props.centered ? 'modal-dialog-centered' : null, sizeClass],
                role: 'document',
                onClick: (event) => event.stopPropagation(),
              },
              [
                h(
                  'div',
                  {
                    class: ['modal-content', className],
                    style,
                  },
                  slots.default ? slots.default() : undefined,
                ),
              ],
            ),
          ],
        ),
      ]);
    };
  },
});

const DLink = defineComponent({
  name: 'DLink',
  inheritAttrs: false,
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
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      if (props.to !== undefined) {
        return h(
          RouterLink,
          {
            ...forwarded,
            to: props.to,
            class: className,
            style,
          },
          slots.default,
        );
      }

      return h(
        'a',
        {
          ...forwarded,
          href: props.href || '#',
          class: className,
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const DDropdownItem = defineComponent({
  name: 'DDropdownItem',
  inheritAttrs: false,
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
  setup(props, { attrs, slots }) {
    return () => {
      const { className, style, forwarded } = splitAttrs(attrs);
      const mergedClass = ['dropdown-item', className];

      if (props.to !== undefined) {
        return h(
          RouterLink,
          {
            ...forwarded,
            to: props.to,
            class: mergedClass,
            style,
          },
          slots.default,
        );
      }

      return h(
        'a',
        {
          ...forwarded,
          href: props.href || '#',
          class: mergedClass,
          style,
        },
        slots.default ? slots.default() : undefined,
      );
    };
  },
});

const components = {
  'd-container': DContainer,
  'd-row': DRow,
  'd-col': DCol,
  'd-nav': DNav,
  'd-navbar': DNavbar,
  'd-navbar-nav': DNavbarNav,
  'd-link': DLink,
  'd-collapse': DCollapse,
  'd-dropdown-item': DDropdownItem,
  'd-card': DCard,
  'd-card-header': DCardHeader,
  'd-card-body': DCardBody,
  'd-card-footer': DCardFooter,
  'd-list-group': DListGroup,
  'd-list-group-item': DListGroupItem,
  'd-button': DButton,
  'd-button-group': DButtonGroup,
  'd-badge': DBadge,
  'd-form': DForm,
  'd-form-row': DFormRow,
  'd-form-input': DFormInput,
  'd-form-textarea': DFormTextarea,
  'd-form-invalid-feedback': DFormInvalidFeedback,
  'd-input': DInput,
  'd-input-group': DInputGroup,
  'd-input-group-addon': DInputGroupAddon,
  'd-input-group-text': DInputGroupText,
  'd-select': DSelect,
  'd-datepicker': DDatepicker,
  'd-checkbox': DCheckbox,
  'd-alert': DAlert,
  'd-progress': DProgress,
  'd-modal': DModal,
  'd-modal-header': DModalHeader,
  'd-modal-title': DModalTitle,
  'd-modal-body': DModalBody,
};

export default {
  install(app) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component);
    });

    app.directive('d-toggle', DToggleDirective);
  },
};
