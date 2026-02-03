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
});
