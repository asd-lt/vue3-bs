import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VSelectDate from '../VSelectDate.vue';

describe('VSelectDate', () => {
    it('renders correctly', () => {
        const wrapper = mount(VSelectDate, {
            props: {
                name: 'test-date',
                label: 'Select Date',
            },
        });

        const label = wrapper.find('label');
        expect(label.exists()).toBe(true);
        expect(label.text()).toBe('Select Date');

        const placeholder = wrapper.find('.form-select');
        expect(placeholder.exists()).toBe(true);
    });

    it('toggles calendar on click', async () => {
        const wrapper = mount(VSelectDate, {
            props: {
                name: 'test-date',
            },
        });

        const placeholder = wrapper.find('.form-select');
        await placeholder.trigger('click');

        const calendarBlock = wrapper.find('.calendar-block');
        expect(calendarBlock.classes()).toContain('calendar-block--visible');

        await placeholder.trigger('click');
        expect(calendarBlock.classes()).not.toContain('calendar-block--visible');
    });

    describe('clearable', () => {
        it('offers no clear button unless asked to', () => {
            const wrapper = mount(VSelectDate, {
                props: { name: 'test-date', modelValue: '2026-09-24' },
            });

            expect(wrapper.find('.form-select-clear').exists()).toBe(false);
        });

        it('offers no clear button while the field is empty', () => {
            const wrapper = mount(VSelectDate, {
                props: { name: 'test-date', clearable: true },
            });

            expect(wrapper.find('.form-select-clear').exists()).toBe(false);
        });

        it('empties the value without opening the calendar', async () => {
            const wrapper = mount(VSelectDate, {
                props: { name: 'test-date', clearable: true, modelValue: '2026-09-24' },
            });

            await wrapper.find('.form-select-clear').trigger('click');

            expect(wrapper.emitted('update:modelValue').at(-1)).toEqual([null]);
            expect(wrapper.find('.calendar-block').classes()).not.toContain(
                'calendar-block--visible',
            );
        });
    });
});
