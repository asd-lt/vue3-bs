import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VCheckbox from '../VCheckbox.vue';

describe('VCheckbox', () => {
    it('renders correctly', () => {
        const wrapper = mount(VCheckbox, {
            props: {
                name: 'test-check',
                label: 'Test Checkbox',
            },
        });

        const input = wrapper.find('input[type="checkbox"]');
        expect(input.exists()).toBe(true);

        const label = wrapper.find('label');
        expect(label.exists()).toBe(true);
        expect(label.text()).toBe('Test Checkbox');
    });

    it('updates modelValue when checked', async () => {
        const wrapper = mount(VCheckbox, {
            props: {
                name: 'test-check',
                modelValue: 0,
            },
        });

        const input = wrapper.find('input[type="checkbox"]');
        await input.setValue(true);

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([1]);
    });

    it('renders as switch when switch prop is true', () => {
        const wrapper = mount(VCheckbox, {
            props: {
                name: 'test-switch',
                switch: true,
            },
        });

        expect(wrapper.classes()).toContain('form-switch');
    });
});
