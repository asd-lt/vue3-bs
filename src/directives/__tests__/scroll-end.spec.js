import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import scrollEnd from '../scroll-end';

// jsdom does not lay elements out, so the scroll geometry has to be faked.
function setGeometry(el, { scrollTop, clientHeight, scrollHeight }) {
    Object.defineProperty(el, 'scrollTop', { value: scrollTop, configurable: true });
    Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
    Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
}

function mountTarget(handler) {
    return mount(
        {
            props: ['handler'],
            directives: { scrollEnd },
            template: '<div v-scroll-end="handler" class="list">content</div>',
        },
        { props: { handler } },
    );
}

describe('v-scroll-end', () => {
    it('calls the handler once the bottom is reached', async () => {
        const handler = vi.fn();
        const wrapper = mountTarget(handler);
        const el = wrapper.find('.list').element;

        setGeometry(el, { scrollTop: 800, clientHeight: 200, scrollHeight: 1000 });
        await wrapper.find('.list').trigger('scroll');

        expect(handler).toHaveBeenCalled();
    });

    it('does not call the handler while the middle is in view', async () => {
        const handler = vi.fn();
        const wrapper = mountTarget(handler);
        const el = wrapper.find('.list').element;

        setGeometry(el, { scrollTop: 100, clientHeight: 200, scrollHeight: 1000 });
        await wrapper.find('.list').trigger('scroll');

        expect(handler).not.toHaveBeenCalled();
    });

    it('fires slightly before the exact bottom thanks to the 5% tolerance', async () => {
        // VSelectSearch loads the next page here, so it deliberately triggers early.
        const handler = vi.fn();
        const wrapper = mountTarget(handler);
        const el = wrapper.find('.list').element;

        setGeometry(el, { scrollTop: 760, clientHeight: 200, scrollHeight: 1000 });
        await wrapper.find('.list').trigger('scroll');

        expect(handler).toHaveBeenCalled();
    });

    it('stops listening once the component is unmounted', async () => {
        const handler = vi.fn();
        const wrapper = mountTarget(handler);
        const el = wrapper.find('.list').element;
        setGeometry(el, { scrollTop: 800, clientHeight: 200, scrollHeight: 1000 });

        wrapper.unmount();
        el.dispatchEvent(new Event('scroll'));

        expect(handler).not.toHaveBeenCalled();
    });

    it('passes the event and the element to the handler', async () => {
        const handler = vi.fn();
        const wrapper = mountTarget(handler);
        const el = wrapper.find('.list').element;

        setGeometry(el, { scrollTop: 800, clientHeight: 200, scrollHeight: 1000 });
        await wrapper.find('.list').trigger('scroll');

        const [event, passedEl] = handler.mock.calls[0];
        expect(event.type).toBe('scroll');
        expect(passedEl).toBe(el);
    });
});
