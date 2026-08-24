<script setup>
import { computed, provide, reactive, ref } from 'vue';
import { get, set } from '../../utils/object-utils';

const emit = defineEmits(['response', 'responseError', 'loading', 'update:modelValue']);

const props = defineProps({
    action: {
        type: [String],
        default: '/',
    },
    method: {
        type: [String, Boolean],
        default: 'POST',
    },
    modelValue: {
        type: [Object],
        default: () => {
            return reactive({});
        },
    },
    additionalFields: {
        type: [Array],
        default: () => {
            return ['id'];
        },
    },
    onSubmit: {
        type: [Function],
        default: null,
    },
    enctype: {
        type: String,
        default: null,
    },
});

const refForm = ref(null);

const isLoading = ref(false);

const formData = computed({
    get: () => {
        return props.modelValue;
    },
    set: (value) => {
        emit('update:modelValue', value);
    },
});

provide('form-props', props);
provide('form-data', formData);

const formErrors = reactive({});
provide('form-errors', formErrors);

const formHasError = computed(() => {
    return Boolean(
        formErrors.value && formErrors.value.errors && Object.keys(formErrors.value.errors).length,
    );
});

const formClass = computed(() => {
    const parsedFormClass = [];

    if (isLoading.value) {
        parsedFormClass.push('is-loading');
    }

    if (formHasError.value) {
        parsedFormClass.push('needs-validation');
    }

    return parsedFormClass;
});

function startLoading() {
    isLoading.value = true;
    emit('loading', true);
}

function stopLoading() {
    isLoading.value = false;
    emit('loading', false);
}

function prepareSubmitData() {
    const submitData = new FormData(refForm.value);

    if (props.method) {
        submitData.append('_method', props.method);
    }

    if (props.additionalFields) {
        props.additionalFields.forEach((field) => {
            const value = get(formData.value, field);

            // FormData.append stringifies, so a missing field would submit as "undefined".
            if (value !== undefined && value !== null) {
                submitData.append(field, value);
            }
        });
    }

    if (props.enctype) {
        return submitData;
    }

    const jsonData = {};
    for (const [key, value] of submitData.entries()) {
        set(jsonData, key, value);
    }

    return jsonData;
}

function setErrors(errors) {
    if (errors) {
        formErrors.value = { errors };
    } else {
        formErrors.value = {};
    }
}

function setError(field, errorMessage) {
    if (field) {
        if (!formErrors.value || !formErrors.value.errors) {
            formErrors.value = { errors: {} };
        }

        if (errorMessage) {
            formErrors.value.errors[field] = [errorMessage];
        } else {
            delete formErrors.value.errors[field];
        }
    }
}

function submitForm(callback) {
    startLoading();
    setErrors(null);

    return axios
        .post(props.action, prepareSubmitData())
        .then(
            (response) => {
                emit('response', response.data);
                if (callback) callback(response.data);
            },
            (error) => {
                setErrors(error?.response?.data?.errors);

                emit('responseError', error?.response?.data);
                if (callback) callback(error?.response?.data?.errors);
            },
        )
        .finally(() => {
            stopLoading();
        });
}

function onFormSubmit(event) {
    event.preventDefault();

    if (props.onSubmit) {
        props.onSubmit(prepareSubmitData());
    } else {
        submitForm();
    }
}

function setData(data) {
    formData.value = data;
}

function setField(field, value) {
    formData.value[field] = value;
}

defineExpose({
    setData,
    formData,
    formHasError,
    submitForm,
    setErrors,
    setError,
    setField,
});
</script>
<template>
    <form
        ref="refForm"
        :class="formClass"
        :action="props.action"
        @submit="onFormSubmit"
    >
        <slot
            :submit-form="onFormSubmit"
            :form-data="formData"
        />
    </form>
</template>
