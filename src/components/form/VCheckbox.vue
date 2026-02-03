<script setup>
import { inject, computed } from 'vue';
import { baseComputed, baseProps } from './base-input';

const props = defineProps(baseProps({
    switch: {
        type: Boolean,
        default: false,
    },
}));

const formData = inject('form-data');

const {
    parsedId,
    isLabelEnabled,
    parsedLabel,
    fieldValue,
    parsedName,
} = baseComputed(props, formData);

const mainClass = computed(() => {
    const parsedMainClass = ['form-check'];

    if (props.switch) {
        parsedMainClass.push('form-switch');
    }

    return parsedMainClass;
});
</script>
<template>
    <div :class="mainClass">
        <input
            v-model="fieldValue"
            type="hidden"
            :name="parsedName"
        >
        <input
            :id="parsedId"
            v-model="fieldValue"
            class="form-check-input"
            type="checkbox"
            :disabled="props.disabled"
            :true-value="1"
            :false-value="0"
            :title="parsedLabel"
        >
        <label
            v-if="isLabelEnabled"
            class="form-check-label"
            :for="parsedId"
        >
            {{ parsedLabel }}
        </label>
    </div>
</template>
