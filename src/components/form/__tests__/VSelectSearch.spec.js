import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import VSelectSearch from '../VSelectSearch.vue';

// Mock axios globally
global.axios = {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
};

describe('VSelectSearch', () => {
    it('renders correctly', () => {
        const wrapper = mount(VSelectSearch, {
            props: {
                name: 'test-select',
                label: 'Search Item',
                options: [{ id: 1, name: 'Item 1' }],
            },
        });

        const label = wrapper.find('label');
        expect(label.exists()).toBe(true);
        expect(label.text()).toBe('Search Item');

        const searchPlaceholder = wrapper.find('.form-select');
        expect(searchPlaceholder.exists()).toBe(true);
    });

    it('displays static options when clicked', async () => {
        const options = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
        ];
        const wrapper = mount(VSelectSearch, {
            props: {
                name: 'test-select',
                options: options,
            },
        });

        const placeholder = wrapper.find('.form-select');
        await placeholder.trigger('click');

        const listItems = wrapper.findAll('.list-group-item-action');
        expect(listItems.length).toBe(2);
        expect(listItems[0].text()).toBe('Item 1');
        expect(listItems[1].text()).toBe('Item 2');
    });

    it('updates modelValue when option is selected', async () => {
        const options = [{ id: 1, name: 'Item 1' }];
        const wrapper = mount(VSelectSearch, {
            props: {
                name: 'test-select',
                options: options,
                modelValue: null,
            },
        });

        // Open search
        await wrapper.find('.form-select').trigger('click');

        // Click option
        const option = wrapper.find('.list-group-item-action');
        await option.trigger('click');

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([1]);
    });
});
