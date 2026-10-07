import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { reactive, ref } from 'vue';
import VTabs from '../VTabs.vue';
import VTab from '../VTab.vue';
import VForm from '../../form/VForm.vue';
import VInput from '../../form/VInput.vue';

const TWO_TABS = '<VTab label="One">first</VTab><VTab label="Two">second</VTab>';

// Panes register themselves with their VTabs once mounted, so the nav is a tick behind.
async function mountTabs(template, props = {}) {
    const wrapper = mount(VTabs, {
        props,
        slots: { default: template },
        global: { components: { VTab } },
    });

    await flushPromises();

    return wrapper;
}

async function mountTabsInHost(template, setup = () => ({})) {
    const wrapper = mount({
        components: { VTabs, VTab },
        setup,
        template,
    });

    await flushPromises();

    return wrapper;
}

async function mountTabsInForm(props) {
    const wrapper = mount(VForm, {
        props,
        slots: {
            default: `<VTabs>
                <VTab label="Account"><VInput name="email" /></VTab>
                <VTab label="Security"><VInput name="password" /></VTab>
            </VTabs>`,
        },
        global: { components: { VTabs, VTab, VInput } },
    });

    await flushPromises();

    return wrapper;
}

function navLabels(wrapper) {
    return wrapper.findAll('.nav-tabs .nav-link').map((link) => link.text());
}

function activePaneText(wrapper) {
    return wrapper.find('.tab-pane.active').text();
}

describe('VTabs', () => {
    it('renders a nav link and a pane per tab', async () => {
        const wrapper = await mountTabs(TWO_TABS);

        expect(wrapper.find('ul').classes()).toContain('nav-tabs');
        expect(navLabels(wrapper)).toEqual(['One', 'Two']);
        expect(wrapper.findAll('.tab-content > .tab-pane')).toHaveLength(2);
    });

    it('activates the first tab when no modelValue is given', async () => {
        const wrapper = await mountTabs(TWO_TABS);

        expect(activePaneText(wrapper)).toBe('first');
        expect(wrapper.findAll('.nav-link.active')).toHaveLength(1);
        expect(wrapper.find('.nav-link.active').text()).toBe('One');
    });

    it('reports the tab it settled on through v-model', async () => {
        const wrapper = await mountTabs('<VTab label="One">first</VTab>');

        expect(wrapper.emitted('update:modelValue')).toEqual([['One']]);
    });

    it('activates the tab named by modelValue', async () => {
        const wrapper = await mountTabs(TWO_TABS, { modelValue: 'Two' });

        expect(activePaneText(wrapper)).toBe('second');
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('activates a tab the consumer switches to after mount', async () => {
        const wrapper = await mountTabs(TWO_TABS, { modelValue: 'One' });

        await wrapper.setProps({ modelValue: 'Two' });

        expect(activePaneText(wrapper)).toBe('second');
    });

    it('activates the clicked tab and emits its label', async () => {
        const wrapper = await mountTabs(TWO_TABS, { modelValue: 'One' });

        await wrapper.findAll('.nav-link')[1].trigger('click');

        expect(activePaneText(wrapper)).toBe('second');
        expect(wrapper.emitted('update:modelValue')).toEqual([['Two']]);
    });

    it('falls back to the first tab when modelValue names no tab', async () => {
        const wrapper = await mountTabs(TWO_TABS, { modelValue: 'Missing' });

        expect(activePaneText(wrapper)).toBe('first');
        expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('navigates with buttons that cannot submit a surrounding form', async () => {
        const wrapper = await mountTabs('<VTab label="One">first</VTab>');

        expect(wrapper.find('.nav-link').attributes('type')).toBe('button');
    });

    it('renames a nav link when its tab label changes', async () => {
        const label = ref('Before');
        const wrapper = await mountTabsInHost(
            '<VTabs><VTab :label="label">body</VTab></VTabs>',
            () => ({ label }),
        );

        label.value = 'After';
        await flushPromises();

        expect(navLabels(wrapper)).toEqual(['After']);
    });

    it('activates a remaining tab when the active one is removed', async () => {
        const showFirst = ref(true);
        const wrapper = await mountTabsInHost(
            `<VTabs>
                <VTab v-if="showFirst" label="One">first</VTab>
                <VTab label="Two">second</VTab>
            </VTabs>`,
            () => ({ showFirst }),
        );
        expect(activePaneText(wrapper)).toBe('first');

        showFirst.value = false;
        await flushPromises();

        expect(navLabels(wrapper)).toEqual(['Two']);
        expect(activePaneText(wrapper)).toBe('second');
    });

    it('returns a re-added pane to its place in the nav', async () => {
        const showFirst = ref(true);
        const wrapper = await mountTabsInHost(
            `<VTabs>
                <VTab v-if="showFirst" label="One">first</VTab>
                <VTab label="Two">second</VTab>
            </VTabs>`,
            () => ({ showFirst }),
        );

        showFirst.value = false;
        await flushPromises();
        showFirst.value = true;
        await flushPromises();

        expect(navLabels(wrapper)).toEqual(['One', 'Two']);
    });

    it('keeps the tab the consumer picked when its pane mounts late', async () => {
        const activeTab = ref('Two');
        const showSecond = ref(false);
        const wrapper = await mountTabsInHost(
            `<VTabs v-model="activeTab">
                <VTab label="One">first</VTab>
                <VTab v-if="showSecond" label="Two">second</VTab>
            </VTabs>`,
            () => ({ activeTab, showSecond }),
        );
        expect(activePaneText(wrapper)).toBe('first');

        showSecond.value = true;
        await flushPromises();

        expect(activePaneText(wrapper)).toBe('second');
        expect(activeTab.value).toBe('Two');
    });

    it('keeps an inactive pane rendered rather than unmounting it', async () => {
        const wrapper = await mountTabs(TWO_TABS);

        const panes = wrapper.findAll('.tab-pane');
        expect(panes[1].classes()).not.toContain('active');
        expect(panes[1].text()).toBe('second');
    });
});

describe('VTab', () => {
    it('renders active on its own, with no VTabs above it', () => {
        const wrapper = mount(VTab, {
            props: { label: 'Lonely' },
            slots: { default: 'body' },
        });

        expect(wrapper.classes()).toContain('tab-pane');
        expect(wrapper.classes()).toContain('active');
    });
});

describe('VTabs inside a VForm', () => {
    it('submits the fields of an inactive pane', async () => {
        const onSubmit = vi.fn();
        const wrapper = await mountTabsInForm({
            modelValue: reactive({ email: 'a@b.c', password: 'secret' }),
            onSubmit,
        });

        await wrapper.find('form').trigger('submit');

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ email: 'a@b.c', password: 'secret' }),
        );
    });

    it('reaches a field in an inactive pane when the form reports an error on it', async () => {
        const wrapper = await mountTabsInForm({
            modelValue: reactive({ email: '', password: '' }),
        });

        wrapper.vm.setErrors({ password: ['Password is too short'] });
        await flushPromises();

        const inactivePane = wrapper.findAll('.tab-pane')[1];
        expect(inactivePane.classes()).not.toContain('active');
        expect(inactivePane.find('.invalid-feedback').text()).toBe('Password is too short');
        expect(inactivePane.find('input[name="password"]').classes()).toContain('is-invalid');
    });
});
