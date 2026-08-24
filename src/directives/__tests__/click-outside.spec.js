import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import clickOutside from '../click-outside';

// The directive listens on document.body, so the component has to be attached to the real
// document for events to reach it.
function mountTarget(handler) {
    return mount(
        {
            props: ['handler'],
            directives: { clickOutside },
            template:
                '<div><div v-click-outside="handler" class="inside"><span class="child">x</span></div><div class="outside">y</div></div>',
        },
        { props: { handler }, attachTo: document.body },
    );
}

describe('v-click-outside', () => {
    it('calls the handler when a click lands outside the element', async () => {
        const handler = vi.fn();
        const wrapper = mountTarget(handler);

        wrapper.find('.outside').element.click();

        expect(handler).toHaveBeenCalled();
        wrapper.unmount();
    });

    it('does not call the handler when the element itself is clicked', async () => {
        const handler = vi.fn();
        const wrapper = mountTarget(handler);

        wrapper.find('.inside').element.click();

        expect(handler).not.toHaveBeenCalled();
        wrapper.unmount();
    });

    it('does not call the handler when a descendant is clicked', async () => {
        // Closing on a click inside the dropdown would make options unselectable.
        const handler = vi.fn();
        const wrapper = mountTarget(handler);

        wrapper.find('.child').element.click();

        expect(handler).not.toHaveBeenCalled();
        wrapper.unmount();
    });

    it('passes the event and the element to the handler', () => {
        const handler = vi.fn();
        const wrapper = mountTarget(handler);

        wrapper.find('.outside').element.click();

        const [event, el] = handler.mock.calls[0];
        expect(event.type).toBe('click');
        expect(el).toBe(wrapper.find('.inside').element);
        wrapper.unmount();
    });

    it('stops listening once the component is unmounted', () => {
        const handler = vi.fn();
        const wrapper = mountTarget(handler);
        const outside = wrapper.find('.outside').element;

        wrapper.unmount();
        outside.click();

        expect(handler).not.toHaveBeenCalled();
    });
});
