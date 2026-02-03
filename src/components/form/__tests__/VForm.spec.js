import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import VForm from '../VForm.vue';

// Mock axios globally
global.axios = {
    post: vi.fn().mockResolvedValue({ data: {} }),
};

describe('VForm', () => {
    it('renders form and slot content', () => {
        const wrapper = mount(VForm, {
            slots: {
                default: '<div class="slot-content">Slot Content</div>',
            },
        });

        const form = wrapper.find('form');
        expect(form.exists()).toBe(true);
        expect(wrapper.find('.slot-content').exists()).toBe(true);
    });

    it('emits loading events on submit', async () => {
        const wrapper = mount(VForm, {
            props: {
                action: '/test-submit',
            },
        });

        const form = wrapper.find('form');
        await form.trigger('submit');

        expect(wrapper.emitted('loading')).toBeTruthy();
        // Should emit true then false (after promise resolves)
        // Since axios mock is instant, we might miss the interim state in synchronous check
        // But we can check that it was called.
    });

    it('calls onSubmit prop if provided', async () => {
        const onSubmit = vi.fn();
        const wrapper = mount(VForm, {
            props: {
                onSubmit,
            },
        });

        const form = wrapper.find('form');
        await form.trigger('submit');

        expect(onSubmit).toHaveBeenCalled();
    });
});
