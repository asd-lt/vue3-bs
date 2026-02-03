<script setup>
import {
    computed, inject, ref, onMounted
} from 'vue';
import ErrorMessage from './ErrorMessage.vue';
import { baseProps, baseComputed } from './base-input';

const fieldError = ref(null);
const files = ref([]);
const inputFile = ref(null);
const formData = inject('form-data');
const formErrors = inject('form-errors');
const emit = defineEmits(['update:modelValue', 'change']);

const props = defineProps(baseProps({
    multiple: Boolean,
}));

const {
    parsedId,
    isLabelEnabled,
    parsedLabel,
    parsedPlaceholder,
    fieldValue,
    parsedName,
    parsedWrapperClass,
} = baseComputed(props, formData, emit);

onMounted(() => {
    if (Array.isArray(fieldValue.value)) {
        fieldValue.value.forEach((file) => {
            files.value.push(file);
        });
    } else if (fieldValue.value) {
        files.value.push(fieldValue.value);
    }
});

function clearErrors() {
    if (formErrors.value && formErrors.value.errors && formErrors.value.errors[props.name]) {
        delete formErrors.value.errors[props.name];
    }
}

const parsedFieldClass = computed(() => {
    const fieldClass = ['form-control'];

    if (fieldError.value && fieldError.value.hasError) {
        fieldClass.push('is-invalid');
    }

    return fieldClass;
});

function fileSelected(event) {
    clearErrors();

    if (!files.value) {
        files.value = [];
    }

    for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        file.src = URL.createObjectURL(file);
        files.value.push(file);
    }

    fieldValue.value = files;

    emit('change', files.value);
}

function selectFile() {
    inputFile.value.click();
}

function removeFile(index) {
    clearErrors();

    if (files.value) {
        files.value.splice(index, 1);
        const filesObj = new DataTransfer();

        for (let i = 0; i < inputFile.value.files.length; i++) {
            if (i !== index) {
                filesObj.items.add(inputFile.value.files[i]);
            }
        }

        inputFile.value.files = filesObj.files;
        if (filesObj.files.length) {
            fieldValue.value = filesObj.files;
        } else {
            fieldValue.value = null;
        }
    }
}
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
        <div class="d-flex">
            <input
                :id="parsedId"
                ref="inputFile"
                :name="parsedName"
                :disabled="props.disabled"
                :multiple="props.multiple"
                type="file"
                style="display: none;"
                :class="parsedFieldClass"
                @change="fileSelected"
            />
            <button
                v-if="!files || !files.length"
                class="btn btn-secondary"
                type="button"
                @click="selectFile"
            >
                {{ parsedPlaceholder }}
            </button>
            <template v-else>
                <slot
                    :files="files"
                    :remove-file="removeFile"
                    :select-file="selectFile"
                >
                    <div
                        v-for="(file, index) in files"
                        :key="`file-${index}-${file.name}`"
                        class="badge bg-secondary mr-1"
                    >
                        {{ file.name }}
                        <span
                            class="cursor-pointer"
                            @click="removeFile(index)"
                        >
                            &nbsp;&times;
                        </span>
                    </div>
                    <span
                        v-if="props.multiple"
                        class="badge bg-secondary"
                        @click="selectFile"
                    >
                        +
                    </span>
                </slot>
            </template>
        </div>
        <ErrorMessage
            ref="fieldError"
            :name="props.name"
        />
    </div>
</template>
