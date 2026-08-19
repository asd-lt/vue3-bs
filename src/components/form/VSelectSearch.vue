<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue';
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

const emit = defineEmits(['update:modelValue', 'select', 'change']);

const fieldError = ref(null);
const formData = inject('form-data', undefined);
const formProps = inject('form-props');

const props = defineProps(
    baseProps({
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
        customFilter: {
            default: null,
            type: [Function],
        },
    }),
);

const {
    parsedId,
    isLabelEnabled,
    parsedLabel,
    parsedPlaceholder,
    fieldValue,
    parsedName,
    parsedWrapperClass,
} = baseComputed(props, formData, formProps, emit);

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

    return (
        (selectedItem.value && selectedItem.value[props.keyName]) || fieldValue.value || '&nbsp;'
    );
});

function filterResults(query) {
    return searchResults.value.filter((item) => {
        return query ? item[props.keyName].toLowerCase().includes(query.toLowerCase()) : true;
    });
}

const searchValues = computed(() => {
    if (props.customFilter) {
        return props.customFilter(searchResults.value, searchString.value);
    }

    if (!props.isStatic) {
        return searchResults.value;
    }

    return filterResults(searchString.value);
});

const selectedItems = computed(() => {
    if (Array.isArray(selectedItem.value)) {
        return selectedItem.value;
    }

    return selectedItem.value ? [selectedItem.value] : [];
});

const fieldValueList = computed(() => {
    return Array.isArray(fieldValue.value) ? fieldValue.value : [];
});

const isCreateVisible = computed(() => {
    if (props.create === false) {
        return false;
    }

    if (!searchString.value || searchString.value.length === 0 || searchValues.value.length > 0) {
        return false;
    }

    // A created item is not on the server yet, so searching for it again finds nothing. Without
    // this the create row would come back and clicking it would toggle the item off again.
    return !selectedItems.value.some((item) => item[props.keyName] === searchString.value);
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

        if (
            !Array.isArray(searchResults.value) ||
            (!response?.data?.links?.prev && !response?.data?.prev_page_url)
        ) {
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

function selectItem(item, isEmitEnabled = true) {
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
        if (isEmitEnabled) {
            emit('select', fieldValue.value, selectedItem);
        }

        if (refSearchField.value) {
            refSearchField.value.focus();
        }
    } else {
        if (
            fieldValue.value !== item[props.keyId] ||
            !selectedItem.value ||
            selectedItem.value[props.keyId] !== item[props.keyId]
        ) {
            selectedItem.value = item;
            fieldValue.value = item[props.keyId];
            if (isEmitEnabled) {
                emit('select', fieldValue.value, selectedItem);
            }
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
    // Selecting a row can re-render the list and remove the very element that was clicked, for
    // example the create row once its item exists. That click reaches the document with a
    // detached target, which is not a click outside the field and must not close it.
    if (e.target && e.target.isConnected === false) {
        return;
    }

    if (isSearchBlockVisible.value && !refSearchPlaceholder.value.contains(e.target)) {
        hideSearch();
    }
}

function onScrollEnd() {
    if (nextUrl.value) {
        callUrl(nextUrl.value);
    }
}

/**
 * Resolves the objects behind the selected ids, keeping the ones already known.
 *
 * Every search replaces `searchResults`, and a created item never exists there at all, so
 * looking selections up in the results alone would drop everything the latest query did not
 * return. Known items win, the results only fill in the ones we have not seen yet.
 */
function resolveSelectedItems(ids) {
    const known = selectedItems.value;

    return ids
        .map((id) => {
            return (
                known.find((item) => item[props.keyId] === id) ||
                searchResults.value.find((item) => item[props.keyId] === id) ||
                null
            );
        })
        .filter(Boolean);
}

function preselectValue() {
    if (!isFieldValueEmpty.value) {
        if (props.multiple) {
            const ids = Array.isArray(fieldValue.value) ? fieldValue.value : [fieldValue.value];
            selectedItem.value = resolveSelectedItems(ids);
        } else {
            const item = findItemById(fieldValue.value);

            if (item) {
                selectItem(item, false);
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

watch(
    () => fieldValue.value,
    async (newValue, oldValue) => {
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
            if (props.multiple) {
                selectedItem.value = resolveSelectedItems(Array.isArray(newValue) ? newValue : []);
            } else {
                selectItem(findItemById(newValue) || {});
            }
        }
    },
    { immediate: false },
);

defineExpose({
    toggleSearch,
    queryResults,
});
</script>
<template>
    <div :class="parsedWrapperClass" class="position-relative">
        <!--
            A multiple select holds an array, and a single input would submit it as one
            comma-joined string, so each value gets its own indexed input. VForm expands those
            names back into an array. Nothing is submitted while the selection is empty, which
            is what a native multiple select does too.
        -->
        <template v-if="props.multiple">
            <input
                v-for="(value, index) in fieldValueList"
                :id="index === 0 ? parsedId : null"
                :key="`${parsedName}-${index}-${value}`"
                type="hidden"
                :name="`${parsedName}.${index}`"
                :value="value"
            />
        </template>
        <input v-else :id="parsedId" v-model="fieldValue" type="hidden" :name="parsedName" />
        <label v-if="isLabelEnabled" class="form-label" :for="parsedId">
            {{ parsedLabel }}
        </label>
        <div ref="refSearchPlaceholder" :class="parsedFieldClass" @click="toggleSearch">
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
                        <span class="px-1 ms-1 cursor-pointer" @click="selectItem(item)">
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
                    />
                </li>
                <li
                    v-for="(item, index) in searchValues"
                    :key="`select-item-${index}-${item[props.keyId]}`"
                    class="list-group-item list-group-item-action"
                    :class="{ active: isSelected(item) }"
                    @click="selectItem(item)"
                >
                    <slot :item="item">
                        {{ item[props.keyName] }}
                    </slot>
                </li>
                <li
                    v-if="!searchValues.length"
                    class="list-group-item list-group-item-action text-muted disabled"
                >
                    <slot name="no-results"> ... </slot>
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

        <ErrorMessage ref="fieldError" :name="props.name" />
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
