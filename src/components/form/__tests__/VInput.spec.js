import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VInput from '../VInput.vue';

describe('VInput', () => {
    it('renders correctly', () => {
        const wrapper = mount(VInput, {
            props: {
                name: 'test-input',
                label: 'Test Label',
            },
        });

        const input = wrapper.find('input');
        expect(input.exists()).toBe(true);
        expect(input.attributes('name')).toBe('test-input');

        const label = wrapper.find('label');
        expect(label.exists()).toBe(true);
        expect(label.text()).toBe('Test Label');
    });

    it('updates modelValue when input changes', async () => {
        const wrapper = mount(VInput, {
            props: {
                name: 'test-input',
                modelValue: '',
            },
        });

        const input = wrapper.find('input');
        await input.setValue('new value');

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new value']);
    });
});
