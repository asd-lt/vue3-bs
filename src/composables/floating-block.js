import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

/**
 * Pins a dropdown to its field with `position: fixed`, measured off the field's place on screen.
 *
 * Positioned absolutely inside the field, the block was clipped by any ancestor that clips its
 * overflow — a modal `<dialog>` does by default — and a field near the bottom of one opened its
 * results out of sight. A fixed block escapes that clipping, while a teleported one would land
 * outside a modal dialog, under the top layer and inert. Being fixed, it has to be moved again
 * whenever anything around the field scrolls, the window resizes or the block itself changes size —
 * results arriving, a calendar turning to a month of more weeks — for as long as it is open.
 */
export function useFloatingBlock(anchor, block, isVisible, { matchWidth = false } = {}) {
    const style = ref({});
    let resizeObserver = null;

    function place() {
        if (!anchor.value || !block.value) {
            return;
        }

        const field = anchor.value.getBoundingClientRect();
        const height = block.value.getBoundingClientRect().height;
        const spaceBelow = window.innerHeight - field.bottom;
        const opensAbove = spaceBelow < height && field.top > spaceBelow;

        // Anchored by the edge facing the field, so results that arrive or shrink after it opens
        // grow and shrink away from the field rather than over it.
        style.value = {
            ...(opensAbove
                ? { bottom: `${window.innerHeight - field.top}px` }
                : { top: `${field.bottom}px` }),
            left: `${field.left}px`,
            ...(matchWidth ? { width: `${field.width}px` } : {}),
        };
    }

    function follow() {
        window.addEventListener('scroll', place, true);
        window.addEventListener('resize', place);

        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(place);
            resizeObserver.observe(block.value);
        }
    }

    function unfollow() {
        window.removeEventListener('scroll', place, true);
        window.removeEventListener('resize', place);
        resizeObserver?.disconnect();
        resizeObserver = null;
    }

    watch(isVisible, async (visible) => {
        if (!visible) {
            unfollow();
            return;
        }

        // The block is measured, so it has to be displayed first.
        await nextTick();

        if (isVisible.value) {
            place();
            follow();
        }
    });

    onBeforeUnmount(unfollow);

    return style;
}
