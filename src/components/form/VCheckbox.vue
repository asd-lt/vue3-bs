<script setup>
import { inject, computed, ref } from 'vue';
import ErrorMessage from './ErrorMessage.vue';
import { baseComputed, baseProps } from './base-input';

const fieldError = ref(null);
const formData = inject('form-data');
const formProps = inject('form-props');
const emit = defineEmits(['update:modelValue', 'change']);

const props = defineProps(
    baseProps({
        switch: {
            type: Boolean,
            default: false,
        },
        trueValue: {
            default: 1,
        },
        falseValue: {
            default: 0,
        },
    }),
);

const { parsedId, isLabelEnabled, parsedLabel, fieldValue, parsedName } = baseComputed(
    props,
    formData,
    formProps,
    emit,
);

const mainClass = computed(() => {
    const parsedMainClass = ['form-check'];

    if (props.switch) {
        parsedMainClass.push('form-switch');
    }

    return parsedMainClass;
});

const parsedFieldClass = computed(() => {
    const fieldClass = ['form-check-input'];

    if (fieldError.value && fieldError.value.hasError) {
        fieldClass.push('is-invalid');
    }

    return fieldClass;
});
</script>
<template>
    <div :class="mainClass">
        <input
            v-model="fieldValue"
            type="hidden"
            :name="parsedName"
        />
        <input
            :id="parsedId"
            v-model="fieldValue"
            :class="parsedFieldClass"
            type="checkbox"
            :disabled="props.disabled"
            :true-value="props.trueValue"
            :false-value="props.falseValue"
            :title="parsedLabel"
        />
        <label
            v-if="isLabelEnabled"
            class="form-check-label"
            :for="parsedId"
        >
            <slot>
                {{ parsedLabel }}
            </slot>
        </label>
        <ErrorMessage
            ref="fieldError"
            :name="props.name"
        />
    </div>
</template>
