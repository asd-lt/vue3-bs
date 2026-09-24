<script setup>
defineEmits(['clear']);
</script>
<template>
    <!-- Stops the click so the field it sits in does not open its dropdown or calendar. -->
    <button
        type="button"
        class="form-select-clear"
        aria-label="Clear"
        @click.stop="$emit('clear')"
    >
        &times;
    </button>
</template>
<style lang="scss">
.form-select--clearable {
    position: relative;

    &:hover .form-select-clear {
        display: flex;
    }
}

// Sits over the chevron with the field's own background, so hovering swaps one for the other.
.form-select-clear {
    position: absolute;
    top: 0;
    right: 0.5rem;
    bottom: 0;
    display: none;
    align-items: center;
    padding: 0 0.375rem;
    border: 0;
    background-color: #fff;
    color: inherit;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
}
</style>
