<script setup>
import {
    computed, inject, ref
} from 'vue';
import ErrorMessage from './ErrorMessage.vue';
import { baseProps, baseComputed } from './base-input';

const fieldError = ref(null);
const formData = inject('form-data');

const props = defineProps(baseProps({
    type: String,
}));

const {
    parsedId,
    isLabelEnabled,
    parsedLabel,
    parsedPlaceholder,
    fieldValue,
    parsedName,
    parsedWrapperClass,
    parsedAttributes,
} = baseComputed(props, formData);

const parsedFieldClass = computed(() => {
    const fieldClass = ['form-control'];

    if (fieldError.value && fieldError.value.hasError) {
        fieldClass.push('is-invalid');
    }

    return fieldClass;
});

</script>
<template>
    <div :class="parsedWrapperClass">
        <label
            v-if="isLabelEnabled"
            class="form-label"
            :for="parsedId"
        >
            {{ parsedLabel }}
        </label>
        <textarea
            :id="parsedId"
            v-model="fieldValue"
            :name="parsedName"
            :disabled="props.disabled"
            :class="parsedFieldClass"
            :placeholder="parsedPlaceholder"
            v-bind="parsedAttributes"
        />
        <ErrorMessage
            ref="fieldError"
            :name="props.name"
        />
    </div>
</template>
