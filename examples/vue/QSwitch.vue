<script setup>
import { ref, useAttrs } from 'vue';

const props = defineProps({
  checked: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md', validator: value => ['md', 'sm'].includes(value) }
});
const emit = defineEmits(['update:checked', 'change']);
const attrs = useAttrs();
const motion = ref(null);

function handleClick(event) {
  if (props.disabled || attrs['aria-disabled'] === true || attrs['aria-disabled'] === 'true') return;
  const next = !props.checked;
  motion.value = event.detail > 0 ? (next ? 'on' : 'off') : null;
  emit('update:checked', next);
  emit('change', next);
}
</script>

<template>
  <button
    type="button"
    role="switch"
    class="q-switch"
    :class="{ 'q-switch--sm': size === 'sm' }"
    :aria-checked="checked"
    :disabled="disabled"
    :data-switch-motion="motion || undefined"
    @click="handleClick"
    @pointerenter="motion = null"
  >
    <span class="q-switch__thumb" data-switch-thumb="">
      <span class="q-switch__visual" data-switch-visual="" aria-hidden="true" />
    </span>
  </button>
</template>
