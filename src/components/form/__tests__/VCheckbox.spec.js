import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
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

    it('honours custom true-value and false-value props', async () => {
        const wrapper = mount(VCheckbox, {
            props: {
                name: 'test-check',
                modelValue: 'no',
                trueValue: 'yes',
                falseValue: 'no',
            },
        });

        const input = wrapper.find('input[type="checkbox"]');
        await input.setValue(true);
        expect(wrapper.emitted('update:modelValue')[0]).toEqual(['yes']);

        await input.setValue(false);
        expect(wrapper.emitted('update:modelValue')[1]).toEqual(['no']);
    });

    it('renders its validation error and marks the control invalid', async () => {
        // Regression: VCheckbox was the only field without an ErrorMessage, so a
        // server error on e.g. an "agree to terms" box was silently dropped.
        const formErrors = reactive({ value: { errors: { agree: ['You must agree'] } } });
        const wrapper = mount(VCheckbox, {
            props: { name: 'agree' },
            global: { provide: { 'form-errors': formErrors } },
        });

        expect(wrapper.find('.invalid-feedback').text()).toBe('You must agree');

        // The is-invalid class depends on the ErrorMessage template ref, which is only
        // populated after mount, so the class lands one tick later.
        await wrapper.vm.$nextTick();
        expect(wrapper.find('input[type="checkbox"]').classes()).toContain('is-invalid');
    });
});
