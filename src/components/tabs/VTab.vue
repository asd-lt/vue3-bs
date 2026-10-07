<script setup>
import { computed, inject, onMounted, onUnmounted, provide, ref, shallowRef } from 'vue';

const props = defineProps({
    label: {
        type: String,
        required: true,
    },
});

const pane = ref(null);
const tabsState = inject('tabs-state', null);
const parentTabErrors = inject('tab-errors', null);

// Without a VTabs above it a pane has no nav to hide behind, so it stays visible.
const isActive = computed(() => !tabsState || tabsState.isActive(props.label));

// Whoever sits in this pane and can hold an error — a field's ErrorMessage, or a pane of a
// nested VTabs — hands over the error state it already computes.
const fieldErrors = shallowRef([]);
const hasError = computed(() => fieldErrors.value.some((errored) => errored.value));

function registerField(errored) {
    fieldErrors.value = [...fieldErrors.value, errored];
}

function unregisterField(errored) {
    fieldErrors.value = fieldErrors.value.filter((registered) => registered !== errored);
}

provide('tab-errors', { registerField, unregisterField });

if (parentTabErrors) {
    onMounted(() => parentTabErrors.registerField(hasError));
    onUnmounted(() => parentTabErrors.unregisterField(hasError));
}

if (tabsState) {
    onMounted(() =>
        tabsState.registerTab({
            tab: props,
            pane: pane.value,
            get errored() {
                return hasError.value;
            },
        }),
    );
    onUnmounted(() => tabsState.unregisterTab(props));
}
</script>
<template>
    <div
        ref="pane"
        class="tab-pane"
        :class="{ active: isActive }"
        role="tabpanel"
    >
        <slot />
    </div>
</template>
