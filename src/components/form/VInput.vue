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

const parsedType = computed(() => {
    return props.type || 'text';
});

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
        <div class="input-group">
            <slot name="prepend" />
            <input
                :id="parsedId"
                v-model="fieldValue"
                :type="parsedType"
                :name="parsedName"
                :disabled="props.disabled"
                :class="parsedFieldClass"
                :placeholder="parsedPlaceholder"
                v-bind="parsedAttributes"
            />
            <slot name="append" />
        </div>
        <ErrorMessage
            ref="fieldError"
            :name="props.name"
        />
    </div>
</template>
