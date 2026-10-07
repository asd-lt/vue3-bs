<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
    label: {
        type: String,
        required: true,
    },
});

const pane = ref(null);
const tabsState = inject('tabs-state', null);

// Without a VTabs above it a pane has no nav to hide behind, so it stays visible.
const isActive = computed(() => !tabsState || tabsState.isActive(props.label));

if (tabsState) {
    onMounted(() => tabsState.registerTab(props, pane.value));
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
