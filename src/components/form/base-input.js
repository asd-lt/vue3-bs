import { computed } from 'vue';
import { get, set } from '../../utils/object-utils';

export function baseProps(props = {}) {
    return {
        name: String,
        label: {
            default: null,
            type: [Boolean, String],
        },
        placeholder: {
            default: null,
            type: [Boolean, String],
        },
        modelValue: {
            default: null,
            required: false,
        },
        value: {
            default: null,
            type: [Boolean, String],
        },
        required: {
            default: false,
            type: [Boolean],
        },
        disabled: {
            default: false,
            type: [Boolean],
        },
        autocompleteOff: {
            default: false,
            type: Boolean,
        },
        ...props,
    };
}

export function baseComputed(props, formData, emit) {
    const parsedId = computed(() => {
        return `field-${props.name}`;
    });

    const isLabelEnabled = computed(() => {
        return props.label !== false;
    });

    const parsedLabel = computed(() => {
        return props.label;
    });

    const parsedPlaceholder = computed(() => {
        if (props.placeholder === false) {
            return null;
        }

        return props.placeholder;
    });

    const fieldValue = computed({
        get() {
            if (formData) {
                return get(formData.value, props.name, props.value);
            }

            return props.modelValue || props.value;
        },
        // setter
        set(value) {
            if (formData) {
                set(formData.value, props.name, value);
            }

            if (emit) {
                emit('update:modelValue', value);
                emit('change', value);
            }
        },
    });

    const parsedName = computed(() => {
        const parts = props.name.split('.');
        let fieldName = parts[0];
        Object.keys(parts).forEach((index) => {
            if (index > 0) {
                fieldName += `[${parts[index]}]`;
            }
        });

        return fieldName;
    });

    const parsedWrapperClass = computed(() => {
        const wrapperClass = [];

        if (props.required) {
            wrapperClass.push('required');
        }

        if (props.disabled) {
            wrapperClass.push('disabled');
        }

        return wrapperClass;
    });

    const parsedAttributes = computed(() => {
        const attributes = {};

        if (props.autocompleteOff) {
            attributes.autocomplete = 'off'; // Prevents browser from auto-filling
            attributes['data-1p-ignore'] = true; // Prevents 1Password from auto-filling
        }

        return attributes;
    });

    return {
        parsedId,
        isLabelEnabled,
        parsedLabel,
        parsedPlaceholder,
        fieldValue,
        parsedName,
        parsedWrapperClass,
        parsedAttributes,
    };
}
