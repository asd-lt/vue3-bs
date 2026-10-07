<script setup>
import { computed, inject, onMounted, onUnmounted } from 'vue';

const formErrors = inject('form-errors', {});
const tabErrors = inject('tab-errors', null);

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
});

const hasError = computed(() => {
    return (
        formErrors?.value?.errors &&
        formErrors?.value?.errors[props.name] &&
        formErrors.value.errors[props.name].length
    );
});

// A tab pane can be closed when the form reports an error, hiding this message, so the pane
// collects its fields' error state to mark its nav link instead.
if (tabErrors) {
    onMounted(() => tabErrors.registerField(hasError));
    onUnmounted(() => tabErrors.unregisterField(hasError));
}

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
