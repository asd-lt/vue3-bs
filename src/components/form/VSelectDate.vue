<script setup>
import {
    computed, inject, ref
} from 'vue';
import vClickOutside from '../../directives/click-outside';
import ErrorMessage from './ErrorMessage.vue';
import VCalendar from './_VCalendar.vue';
import { baseProps, baseComputed } from './base-input';

const isCalendarBlockVisible = ref(false);
const refPlaceholder = ref(false);

const fieldError = ref(null);
const formData = inject('form-data');
const emit = defineEmits(['update:modelValue', 'change']);

const props = defineProps(baseProps());

const {
    parsedId,
    isLabelEnabled,
    parsedLabel,
    parsedPlaceholder,
    fieldValue,
    parsedName,
    parsedWrapperClass,
} = baseComputed(props, formData, emit);

const parsedFieldClass = computed(() => {
    const fieldClass = ['form-select'];

    if (fieldError.value && fieldError.value.hasError) {
        fieldClass.push('is-invalid');
    }

    if (!fieldValue.value) {
        fieldClass.push('text-placeholder');
    }

    return fieldClass;
});

const parsedValue = computed(() => {
    if (!fieldValue.value) {
        return parsedPlaceholder.value;
    }
    return fieldValue.value;
});
function showCalendar() {
    isCalendarBlockVisible.value = true;
}
function hideCalendar() {
    isCalendarBlockVisible.value = false;
}

function toggleCalendar() {
    if (isCalendarBlockVisible.value) {
        hideCalendar();
    } else {
        showCalendar();
    }
}

function clickOutside(e) {
    if (isCalendarBlockVisible.value && !refPlaceholder.value.contains(e.target)) {
        hideCalendar();
    }
}

function formatDate(date) {
    if (!date) {
        return '';
    }
    const d = new Date(date);
    return d.toLocaleDateString('lt-LT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

function onDateSelect(date) {
    fieldValue.value = formatDate(date);
    hideCalendar();
}
</script>
<template>
    <div :class="parsedWrapperClass">
        <input
            :id="parsedId"
            v-model="fieldValue"
            type="hidden"
            :name="parsedName"
        />
        <label
            v-if="isLabelEnabled"
            class="form-label"
            :for="parsedId"
        >
            {{ parsedLabel }}
        </label>
        <div
            ref="refPlaceholder"
            :class="parsedFieldClass"
            @click="toggleCalendar"
        >
            {{ parsedValue || '&nbsp;' }}
        </div>
        <div
            v-click-outside="clickOutside"
            class="calendar-block shadow-sm"
            :class="{ 'calendar-block--visible': isCalendarBlockVisible }"
        >
            <VCalendar
                :date="fieldValue"
                @selected="onDateSelect"
            />
        </div>

        <ErrorMessage
            ref="fieldError"
            :name="props.name"
        />
    </div>
</template>
<style lang="scss">
.calendar-block {
    position: absolute;
    overflow-x: hidden;
    overflow-y: hidden;
    display: none;
    border-radius: 6px;
    padding: 5px 10px;
    background-color: #FFF;
    z-index: 1;

    &--visible {
        display: block;
    }
}
</style>
