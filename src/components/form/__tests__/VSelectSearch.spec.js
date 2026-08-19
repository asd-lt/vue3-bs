import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import VSelectSearch from '../VSelectSearch.vue';

// Mock axios globally
global.axios = {
    get: vi.fn().mockResolvedValue({ data: { data: [] } }),
};

function respondWith(items) {
    global.axios.get = vi.fn().mockResolvedValue({ data: { data: items } });
}

function mountMultiple(props = {}) {
    const formData = ref({});

    const wrapper = mount(VSelectSearch, {
        props: {
            name: 'tags',
            multiple: true,
            ...props,
        },
        global: {
            provide: { 'form-data': formData },
        },
    });

    return { wrapper, formData };
}

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

    describe('multiple', () => {
        it('submits every selected value in its own indexed input', async () => {
            const { wrapper } = mountMultiple({
                options: [
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                ],
            });

            await wrapper.find('.form-select').trigger('click');

            const options = wrapper.findAll('.list-group-item-action');
            await options[0].trigger('click');
            await options[1].trigger('click');

            const inputs = wrapper.findAll('input[type="hidden"]');
            expect(inputs.length).toBe(2);
            expect(inputs[0].attributes('name')).toBe('tags.0');
            expect(inputs[0].attributes('value')).toBe('1');
            expect(inputs[1].attributes('name')).toBe('tags.1');
            expect(inputs[1].attributes('value')).toBe('2');
        });

        it('submits nothing while the selection is empty', () => {
            const { wrapper } = mountMultiple({ options: [{ id: 1, name: 'Item 1' }] });

            expect(wrapper.findAll('input[type="hidden"]').length).toBe(0);
        });

        it('keeps earlier picks when another one is made after new results arrive', async () => {
            respondWith([{ id: 1, name: 'Item 1' }]);

            const { wrapper, formData } = mountMultiple({ url: '/items' });
            await flushPromises();

            await wrapper.find('.form-select').trigger('click');
            await wrapper.find('.list-group-item-action').trigger('click');

            // Searching again replaces the results, so Item 1 is no longer among them.
            respondWith([{ id: 2, name: 'Item 2' }]);
            await wrapper.vm.queryResults('Item 2');
            await flushPromises();

            await wrapper.find('.list-group-item-action').trigger('click');

            expect(formData.value.tags).toEqual([1, 2]);
            expect(wrapper.find('.form-select').text()).toContain('Item 1');
            expect(wrapper.find('.form-select').text()).toContain('Item 2');
        });

        it('keeps a created item when the next one is created after it', async () => {
            respondWith([]);

            const { wrapper, formData } = mountMultiple({ url: '/items', create: true });
            await flushPromises();

            await wrapper.find('.form-select').trigger('click');
            await wrapper.find('.search-input').setValue('Brand new');
            await wrapper.find('.list-group-item-create').trigger('click');

            expect(formData.value.tags).toEqual(['Brand new']);

            // The first creation only ever existed in the results the next query throws away.
            await wrapper.vm.queryResults('Second new');
            await flushPromises();
            await wrapper.find('.search-input').setValue('Second new');
            await wrapper.find('.list-group-item-create').trigger('click');

            expect(formData.value.tags).toEqual(['Brand new', 'Second new']);
            expect(wrapper.find('.form-select').text()).toContain('Brand new');
            expect(wrapper.find('.form-select').text()).toContain('Second new');
        });

        it('does not offer to create an item that is already selected', async () => {
            respondWith([]);

            const { wrapper } = mountMultiple({ url: '/items', create: true });
            await flushPromises();

            await wrapper.find('.form-select').trigger('click');
            await wrapper.find('.search-input').setValue('Brand new');
            await wrapper.find('.list-group-item-create').trigger('click');

            await wrapper.find('.search-input').setValue('Brand new');

            expect(wrapper.find('.list-group-item-create').exists()).toBe(false);
        });
    });
});
