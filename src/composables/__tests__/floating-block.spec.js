import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import VSelectDate from '../../components/form/VSelectDate.vue';
import VSelectSearch from '../../components/form/VSelectSearch.vue';

const BLOCK_HEIGHT = 200;

let fieldRect;
let blockHeight;
let resizeObserved;

class ResizeObserverStub {
    constructor(callback) {
        resizeObserved = callback;
    }

    observe() {}

    disconnect() {
        resizeObserved = null;
    }
}

function rectAt(top, left, width, height) {
    return { top, left, width, height, bottom: top + height, right: left + width };
}

function mountSelectSearch(options = {}) {
    return mount(VSelectSearch, {
        props: { name: 'item', options: [{ id: 1, name: 'Item 1' }] },
        ...options,
    });
}

function mountSelectDate(options = {}) {
    return mount(VSelectDate, { props: { name: 'date' }, ...options });
}

beforeEach(() => {
    fieldRect = rectAt(100, 20, 300, 30);
    blockHeight = BLOCK_HEIGHT;
    window.innerHeight = 768;
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);

    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function () {
        return this.classList.contains('form-select') ? fieldRect : rectAt(0, 0, 300, BLOCK_HEIGHT);
    });
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe.each([
    ['VSelectSearch', mountSelectSearch, '.search-block'],
    ['VSelectDate', mountSelectDate, '.calendar-block'],
])('%s', (_, mountField, blockSelector) => {
    it('opens under the field, placed on the screen rather than inside its container', async () => {
        const wrapper = mountField();

        await wrapper.find('.form-select').trigger('click');

        const style = wrapper.find(blockSelector).element.style;
        expect(style.top).toBe('130px');
        expect(style.left).toBe('20px');
    });

    it('opens above the field when there is no room left below it', async () => {
        fieldRect = rectAt(650, 20, 300, 30);
        const wrapper = mountField();

        await wrapper.find('.form-select').trigger('click');

        const style = wrapper.find(blockSelector).element.style;
        expect(style.top).toBe('');
        expect(style.bottom).toBe(`${768 - 650}px`);
    });

    it('stays under the field below when neither side has room for all of it', async () => {
        window.innerHeight = 300;
        fieldRect = rectAt(120, 20, 300, 30);
        const wrapper = mountField();

        await wrapper.find('.form-select').trigger('click');

        expect(wrapper.find(blockSelector).element.style.top).toBe('150px');
    });

    it('follows the field when something around it scrolls', async () => {
        const wrapper = mountField({ attachTo: document.body });
        await wrapper.find('.form-select').trigger('click');

        fieldRect = rectAt(60, 20, 300, 30);
        document.body.dispatchEvent(new Event('scroll'));
        await wrapper.vm.$nextTick();

        expect(wrapper.find(blockSelector).element.style.top).toBe('90px');
    });

    it('opens above the field once what it holds grows past the room below', async () => {
        fieldRect = rectAt(650, 20, 300, 30);
        blockHeight = 40;
        const wrapper = mountField();
        await wrapper.find('.form-select').trigger('click');

        blockHeight = BLOCK_HEIGHT;
        resizeObserved();
        await wrapper.vm.$nextTick();

        expect(wrapper.find(blockSelector).element.style.bottom).toBe(`${768 - 650}px`);
    });
});

describe('VSelectSearch', () => {
    it('opens as wide as the field', async () => {
        const wrapper = mountSelectSearch();

        await wrapper.find('.form-select').trigger('click');

        expect(wrapper.find('.search-block').element.style.width).toBe('300px');
    });
});

describe('VSelectDate', () => {
    it('keeps the width of its calendar rather than the field', async () => {
        const wrapper = mountSelectDate();

        await wrapper.find('.form-select').trigger('click');

        expect(wrapper.find('.calendar-block').element.style.width).toBe('');
    });
});
