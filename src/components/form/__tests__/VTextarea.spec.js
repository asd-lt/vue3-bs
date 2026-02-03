import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VTextarea from '../VTextarea.vue';

describe('VTextarea', () => {
    it('renders correctly', () => {
        const wrapper = mount(VTextarea, {
            props: {
                name: 'test-area',
                label: 'Test Area',
            },
        });

        const textarea = wrapper.find('textarea');
        expect(textarea.exists()).toBe(true);
        expect(textarea.attributes('name')).toBe('test-area');

        const label = wrapper.find('label');
        expect(label.exists()).toBe(true);
        expect(label.text()).toBe('Test Area');
    });

    it('updates modelValue when input changes', async () => {
        const wrapper = mount(VTextarea, {
            props: {
                name: 'test-area',
                modelValue: '',
            },
        });

        const textarea = wrapper.find('textarea');
        await textarea.setValue('new content');

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new content']);
    });
});
