<script setup>
import {
    computed, inject, onMounted, reactive, ref, watch
} from 'vue';
import vClickOutside from '../../directives/click-outside';
import vScrollEnd from '../../directives/scroll-end';
import ErrorMessage from './ErrorMessage.vue';
import { baseProps, baseComputed } from './base-input';

const refSearchView = ref(null);
const refSearchField = ref(null);
const refSearchPlaceholder = ref(false);
const isSearchBlockVisible = ref(false);
const searchString = ref(null);
const searchResults = ref([]);
const selectedItem = reactive({});
const isLoading = ref(false);
const nextUrl = ref(null);

const emit = defineEmits([
    'update:modelValue',
    'select',
]);

const fieldError = ref(null);
const formData = inject('form-data', undefined);

const props = defineProps(baseProps({
    keyId: {
        default: 'id',
        type: [String],
    },
    keyName: {
        default: 'name',
        type: [String],
    },
    url: {
        default: null,
        type: [String],
    },
    isStatic: {
        default: false,
        type: [Boolean],
    },
    options: {
        default: [],
        type: [Array],
    },
    create: {
        default: false,
        type: [Boolean, Function],
    },
    noSearch: {
        default: false,
        type: [Boolean],
    },
    multiple: {
        default: false,
        type: [Boolean],
    },
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

const isFieldValueEmpty = computed(() => {
    if (props.multiple && Array.isArray(fieldValue.value)) {
        return fieldValue.value.length === 0;
    }

    return fieldValue.value === null || fieldValue.value === undefined || fieldValue.value === '';
});

const isSearchInputAvailable = computed(() => {
    return !props.noSearch;
});

const parsedFieldClass = computed(() => {
    const fieldClass = ['form-select'];

    if (fieldError.value && fieldError.value.hasError) {
        fieldClass.push('is-invalid');
    }

    if (isFieldValueEmpty.value) {
        fieldClass.push('text-placeholder');
    }

    return fieldClass;
});

const parsedValue = computed(() => {
    if (isFieldValueEmpty.value) {
        return parsedPlaceholder.value;
    }

    if (props.multiple) {
        if (Array.isArray(selectedItem.value) && selectedItem.value.length > 0) {
            return selectedItem.value.map((i) => i[props.keyName]).join(', ');
        }

        return '';
    }

    return (selectedItem.value && selectedItem.value[props.keyName]) || fieldValue.value || '&nbsp;';
});

function filterResults(query) {
    return searchResults.value.filter((item) => {
        return query ? item[props.keyName].toLowerCase().includes(query.toLowerCase()) : true;
    });
}

const searchValues = computed(() => {
    return filterResults(searchString.value);
});

const isCreateVisible = computed(() => {
    if (props.create === false) {
        return false;
    }

    return searchString.value && searchString.value.length > 0 && searchValues.value.length === 0;
});

function callUrl(url, params = {}) {
    if (isLoading.value) {
        return Promise.resolve([]);
    }

    isLoading.value = true;

    return axios.get(url, { params }).then((response) => {
        isLoading.value = false;

        nextUrl.value = response?.data?.links?.next || response?.data?.next_page_url;

        if (props.isStatic && params?.filter?.search) {
            searchResults.value = response?.data?.data || [];
            return filterResults(params.filter.search);
        }

        if (!Array.isArray(searchResults.value) || (!response?.data?.links?.prev && !response?.data?.prev_page_url)) {
            searchResults.value = [];
        }

        (response?.data?.data || []).forEach((item) => {
            searchResults.value.push(item);
        });

        return response?.data?.data || [];
    });
}

function queryResults(query = null) {
    if (props.isStatic && searchResults.value.length) {
        return filterResults(query);
    }

    const params = {
        filter: {},
    };

    if (!props.noSearch) {
        params.filter.search = query || searchString.value || '';
    }

    if (!isFieldValueEmpty.value) {
        params.filter['priority-sort'] = props.multiple ? fieldValue.value : [fieldValue.value];
    }

    return callUrl(props.url, params);
}

function hideSearch() {
    isSearchBlockVisible.value = false;
    searchString.value = null;
}

function isSelected(item) {
    if (props.multiple) {
        return Array.isArray(fieldValue.value) && fieldValue.value.includes(item[props.keyId]);
    }

    return fieldValue.value === item[props.keyId];
}

function selectItem(item) {
    if (props.multiple) {
        const values = Array.isArray(fieldValue.value) ? [...fieldValue.value] : [];
        let items = Array.isArray(selectedItem.value) ? [...selectedItem.value] : [];

        const itemId = item[props.keyId];
        const index = values.indexOf(itemId);

        if (index === -1) {
            values.push(itemId);
            items.push(item);
        } else {
            values.splice(index, 1);
            items = items.filter((i) => i[props.keyId] !== itemId);
        }

        fieldValue.value = values;
        selectedItem.value = items;
        emit('select', fieldValue.value, selectedItem);

        if (refSearchField.value) {
            refSearchField.value.focus();
        }
    } else {
        if (
            fieldValue.value !== item[props.keyId]
            || !selectedItem.value
            || selectedItem.value[props.keyId] !== item[props.keyId]
        ) {
            selectedItem.value = item;
            fieldValue.value = item[props.keyId];
            emit('select', fieldValue.value, selectedItem);
        }

        hideSearch();
    }
}
function createAction() {
    let item = null;
    if (typeof props.create === 'function') {
        item = props.create(searchString.value);
    } else if (props.create !== false) {
        item = {
            [props.keyId]: searchString.value,
            [props.keyName]: searchString.value,
        };
    }

    if (item) {
        searchResults.value.push(item);
        selectItem(item);
    }
}

function findItemById(id) {
    const results = searchResults.value.filter((item) => {
        return item[props.keyId] === id;
    });

    return results.length ? results[0] : null;
}

function showSearch() {
    isSearchBlockVisible.value = true;

    if (props.noSearch) {
        return;
    }

    setTimeout(() => {
        refSearchView.value.scrollTop = 0;
        refSearchField.value.focus();
    }, 50);
}

function toggleSearch() {
    if (isSearchBlockVisible.value) {
        hideSearch();
    } else {
        showSearch();
    }
}

function clickOutside(e) {
    if (isSearchBlockVisible.value && !refSearchPlaceholder.value.contains(e.target)) {
        hideSearch();
    }
}

function onScrollEnd() {
    if (nextUrl.value) {
        callUrl(nextUrl.value);
    }
}

function preselectValue() {
    if (!isFieldValueEmpty.value) {
        if (props.multiple) {
            const ids = Array.isArray(fieldValue.value) ? fieldValue.value : [fieldValue.value];
            const items = searchResults.value.filter((item) => ids.includes(item[props.keyId]));
            selectedItem.value = items;
        } else {
            const item = findItemById(fieldValue.value);

            if (item) {
                selectItem(item);
            }
        }
    }
}

let debouncer = null;

function onSearch() {
    if (props.url) {
        if (debouncer) {
            clearTimeout(debouncer);
        }

        debouncer = setTimeout(() => {
            queryResults(searchString.value);
        }, 300);
    } else {
        filterResults(searchString.value);
    }
}

onMounted(() => {
    if (props.url) {
        queryResults().then(() => {
            preselectValue();
        });
    } else if (Array.isArray(props.options)) {
        searchResults.value = props.options;
        preselectValue();
    }
});

watch(() => fieldValue.value, async(newValue, oldValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        if (props.multiple) {
            const ids = Array.isArray(newValue) ? newValue : [];
            const items = searchResults.value.filter((item) => ids.includes(item[props.keyId]));
            selectedItem.value = items;
        } else {
            selectItem(findItemById(newValue) || {});
        }
    }
}, { immediate: false });

</script>
<template>
    <div
        :class="parsedWrapperClass"
        class="position-relative"
    >
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
            ref="refSearchPlaceholder"
            :class="parsedFieldClass"
            @click="toggleSearch"
        >
            <slot
                name="selected-item"
                :field-value="fieldValue"
                :selected-item="selectedItem.value"
                :parsed-value="parsedValue"
            >
                <template v-if="!isFieldValueEmpty && props.multiple">
                    <span
                        v-for="item in selectedItem.value"
                        :key="props.name + '-' + item[props.keyId]"
                        class="badge bg-dark me-1"
                    >
                        {{ item[props.keyName] }}
                        <span
                            class="px-1 ms-1 cursor-pointer"
                            @click="selectItem(item)"
                        >
                            &times;
                        </span>
                    </span>
                </template>
                <template v-else>
                    {{ parsedValue }}
                </template>
            </slot>
        </div>
        <div
            ref="refSearchView"
            v-click-outside="clickOutside"
            v-scroll-end="onScrollEnd"
            class="search-block shadow-sm"
            :class="{ 'search-block--visible': isSearchBlockVisible }"
        >
            <ul class="list-group bg-light">
                <li
                    v-if="isSearchInputAvailable"
                    class="search-box list-group-item px-2 bg-light"
                    aria-current="true"
                >
                    <input
                        ref="refSearchField"
                        v-model="searchString"
                        type="text"
                        class="form-control search-input"
                        placeholder="Search ..."
                        @input="onSearch"
                    >
                </li>
                <li
                    v-for="(item, index) in searchValues"
                    :key="`select-item-${index}-${item[props.keyId]}`"
                    class="list-group-item list-group-item-action"
                    :class="{ active: isSelected(item) }"
                    @click="selectItem(item)"
                >
                    <slot
                        :item="item"
                    >
                        {{ item[props.keyName] }}
                    </slot>
                </li>
                <li
                    v-if="!searchValues.length"
                    class="list-group-item list-group-item-action text-muted disabled"
                >
                    <slot name="no-results">
                        ...
                    </slot>
                </li>
                <li
                    v-if="isCreateVisible"
                    class="list-group-item list-group-item-create"
                    @click="createAction"
                >
                    {{ searchString }}
                </li>
            </ul>
        </div>

        <ErrorMessage
            ref="fieldError"
            :name="props.name"
        />
    </div>
</template>
<style lang="scss" scoped>
.search-block {
    width: 100%;
    position: absolute;
    max-height: 200px;
    overflow-x: hidden;
    overflow-y: auto;
    display: none;
    border-radius: 6px;
    z-index: 10;

    &--visible {
        display: block;
    }
}

.search-box {
    position: sticky;
    top: 0;
    z-index: 10;
}

.list-group-item-create {
    cursor: pointer;
}
</style>
