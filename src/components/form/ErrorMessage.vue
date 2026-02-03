<script setup>

import { computed, inject } from 'vue';

const formErrors = inject('form-errors', {});

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
});

const hasError = computed(() => {
    return formErrors?.value?.errors && formErrors?.value?.errors[props.name] && formErrors.value.errors[props.name].length;
});

const parsedErrorMessage = computed(() => {
    return formErrors?.value?.errors[props.name][0];
});

defineExpose({ hasError });

</script>
<template>
    <div
        v-if="hasError"
        class="invalid-feedback"
    >
        {{ parsedErrorMessage }}
    </div>
</template>
<style scoped>
.invalid-feedback {
    display: block !important;
}
</style>
