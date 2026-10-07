<script setup>
import { computed, provide, ref, shallowRef, watch } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: null,
    },
});

const emit = defineEmits(['update:modelValue']);

const tabs = shallowRef([]);
const selectedLabel = ref(props.modelValue);

// A selection matching no pane — nothing picked yet, or the picked pane has gone away — shows
// the first pane rather than an empty tab-content.
const activeLabel = computed(() => {
    const selected = tabs.value.find(({ tab }) => tab.label === selectedLabel.value);

    return selected ? selected.tab.label : (tabs.value[0]?.tab.label ?? null);
});

watch(
    () => props.modelValue,
    (label) => {
        selectedLabel.value = label;
    },
);

function selectTab(label) {
    selectedLabel.value = label;
    emit('update:modelValue', label);
}

// Settling on a pane only reports back an empty selection. Reporting one the consumer made
// would throw away their pick whenever its pane registers late, behind a v-if or a fetch.
watch(activeLabel, (label) => {
    if (selectedLabel.value === null) {
        emit('update:modelValue', label);
    }
});

function isActive(label) {
    return label === activeLabel.value;
}

// A pane registers its own props, so a label changed later renames its nav link; its element,
// so a pane re-added at runtime lands back in document order instead of at the end; and a live
// `errored`, because a closed pane cannot show the message it holds and its link reports for it.
function registerTab(entry) {
    const following = tabs.value.findIndex(
        (registered) =>
            entry.pane.compareDocumentPosition(registered.pane) & Node.DOCUMENT_POSITION_FOLLOWING,
    );

    const registered = [...tabs.value];
    registered.splice(following === -1 ? registered.length : following, 0, entry);
    tabs.value = registered;
}

function unregisterTab(tab) {
    tabs.value = tabs.value.filter((registered) => registered.tab !== tab);
}

provide('tabs-state', { isActive, registerTab, unregisterTab });
</script>
<template>
    <div>
        <ul
            class="nav nav-tabs"
            role="tablist"
        >
            <li
                v-for="{ tab, errored } in tabs"
                :key="tab.label"
                class="nav-item"
                role="presentation"
            >
                <button
                    class="nav-link"
                    :class="{ active: isActive(tab.label), 'text-danger': errored }"
                    type="button"
                    role="tab"
                    :aria-selected="isActive(tab.label)"
                    @click="selectTab(tab.label)"
                >
                    {{ tab.label }}
                </button>
            </li>
        </ul>
        <div class="tab-content">
            <slot />
        </div>
    </div>
</template>
