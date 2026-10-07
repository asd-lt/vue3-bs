import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { reactive, ref } from 'vue';
import VTabs from '../VTabs.vue';
import VTab from '../VTab.vue';
import VForm from '../../form/VForm.vue';
import VInput from '../../form/VInput.vue';
import VSelectSearch from '../../form/VSelectSearch.vue';

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

const TWO_FIELD_TABS = `<VTabs>
    <VTab label="Account"><VInput name="email" /></VTab>
    <VTab label="Security"><VInput name="password" /></VTab>
</VTabs>`;

async function mountTabsInForm(props, template = TWO_FIELD_TABS) {
    const wrapper = mount(VForm, {
        props,
        slots: { default: template },
        global: { components: { VTabs, VTab, VInput, VSelectSearch } },
    });

    await flushPromises();

    return wrapper;
}

// A pane or field put behind a v-if needs a host component to own the flag, so the VForm goes
// in the host's template and is reached through findComponent.
async function mountTabsInFormHost(template, setup) {
    const wrapper = mount({
        components: { VForm, VTabs, VTab, VInput },
        setup,
        template,
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

function erroredLabels(wrapper) {
    return wrapper
        .findAll('.nav-tabs .nav-link')
        .filter((link) => link.classes().includes('text-danger'))
        .map((link) => link.text());
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

describe('a tab holding an errored field', () => {
    it('marks the nav link of the pane the error belongs to', async () => {
        const wrapper = await mountTabsInForm({
            modelValue: reactive({ email: '', password: '' }),
        });

        wrapper.vm.setErrors({ password: ['Password is too short'] });
        await flushPromises();

        expect(erroredLabels(wrapper)).toEqual(['Security']);
    });

    it('marks the nav link of the pane the user is already looking at', async () => {
        const wrapper = await mountTabsInForm({
            modelValue: reactive({ email: '', password: '' }),
        });

        wrapper.vm.setErrors({ email: ['Email is already taken'] });
        await flushPromises();

        expect(erroredLabels(wrapper)).toEqual(['Account']);
    });

    it('marks every pane an error landed in', async () => {
        const wrapper = await mountTabsInForm({
            modelValue: reactive({ email: '', password: '' }),
        });

        wrapper.vm.setErrors({
            email: ['Email is already taken'],
            password: ['Password is too short'],
        });
        await flushPromises();

        expect(erroredLabels(wrapper)).toEqual(['Account', 'Security']);
    });

    it('marks a pane whose errored field is named by a dot path', async () => {
        const wrapper = await mountTabsInForm(
            { modelValue: reactive({ user: { name: '' } }) },
            `<VTabs>
                <VTab label="Account"><VInput name="email" /></VTab>
                <VTab label="Profile"><VInput name="user.name" /></VTab>
            </VTabs>`,
        );

        wrapper.vm.setErrors({ 'user.name': ['Name is required'] });
        await flushPromises();

        expect(erroredLabels(wrapper)).toEqual(['Profile']);
    });

    it('drops the mark once the errors clear', async () => {
        const wrapper = await mountTabsInForm({
            modelValue: reactive({ email: '', password: '' }),
        });

        wrapper.vm.setErrors({ password: ['Password is too short'] });
        await flushPromises();

        wrapper.vm.setErrors(null);
        await flushPromises();

        expect(erroredLabels(wrapper)).toEqual([]);
    });

    it('marks a pane by the field name the error carries, not by the inputs it renders', async () => {
        const wrapper = await mountTabsInForm(
            { modelValue: reactive({ email: '', tags: ['vue'] }) },
            `<VTabs>
                <VTab label="Account"><VInput name="email" /></VTab>
                <VTab label="Skills"><VSelectSearch name="tags" multiple /></VTab>
            </VTabs>`,
        );
        // A multiple VSelectSearch posts one indexed input per value, so no element carries the
        // bare name the error arrives under.
        expect(wrapper.find('input[name="tags.0"]').exists()).toBe(true);
        expect(wrapper.find('input[name="tags"]').exists()).toBe(false);

        wrapper.vm.setErrors({ tags: ['Pick at least one skill'] });
        await flushPromises();

        expect(erroredLabels(wrapper)).toEqual(['Skills']);
    });

    it('marks the outer nav link too when a nested pane holds the error', async () => {
        const wrapper = await mountTabsInForm(
            { modelValue: reactive({ password: '' }) },
            `<VTabs>
                <VTab label="Outer">
                    <VTabs>
                        <VTab label="Inner"><VInput name="password" /></VTab>
                    </VTabs>
                </VTab>
            </VTabs>`,
        );

        wrapper.vm.setErrors({ password: ['Password is too short'] });
        await flushPromises();

        expect(erroredLabels(wrapper)).toEqual(['Outer', 'Inner']);
    });

    it('marks nothing when the errored field sits in no pane', async () => {
        const wrapper = await mountTabsInForm({
            modelValue: reactive({ email: '', password: '' }),
        });

        wrapper.vm.setErrors({ captcha: ['Prove you are human'] });
        await flushPromises();

        expect(erroredLabels(wrapper)).toEqual([]);
    });

    it('marks nothing with no VForm above it', async () => {
        const wrapper = await mountTabs(TWO_TABS);

        expect(erroredLabels(wrapper)).toEqual([]);
    });
});

describe('a tab whose errored field comes or goes', () => {
    it('marks a pane that mounts after the error arrived', async () => {
        const model = reactive({ email: '', password: '' });
        const showSecurity = ref(false);
        const wrapper = await mountTabsInFormHost(
            `<VForm :model-value="model">
                <VTabs>
                    <VTab label="Account"><VInput name="email" /></VTab>
                    <VTab
                        v-if="showSecurity"
                        label="Security"
                    >
                        <VInput name="password" />
                    </VTab>
                </VTabs>
            </VForm>`,
            () => ({ model, showSecurity }),
        );

        wrapper.findComponent(VForm).vm.setErrors({ password: ['Password is too short'] });
        await flushPromises();
        expect(erroredLabels(wrapper)).toEqual([]);

        showSecurity.value = true;
        await flushPromises();

        expect(erroredLabels(wrapper)).toEqual(['Security']);
    });

    it('drops the mark when the errored field leaves its pane', async () => {
        const model = reactive({ email: '', password: '' });
        const showPassword = ref(true);
        const wrapper = await mountTabsInFormHost(
            `<VForm :model-value="model">
                <VTabs>
                    <VTab label="Account"><VInput name="email" /></VTab>
                    <VTab label="Security">
                        <VInput
                            v-if="showPassword"
                            name="password"
                        />
                    </VTab>
                </VTabs>
            </VForm>`,
            () => ({ model, showPassword }),
        );

        wrapper.findComponent(VForm).vm.setErrors({ password: ['Password is too short'] });
        await flushPromises();
        expect(erroredLabels(wrapper)).toEqual(['Security']);

        showPassword.value = false;
        await flushPromises();

        expect(erroredLabels(wrapper)).toEqual([]);
    });

    it('drops the outer mark when the errored nested pane leaves', async () => {
        const model = reactive({ password: '' });
        const showInner = ref(true);
        const wrapper = await mountTabsInFormHost(
            `<VForm :model-value="model">
                <VTabs>
                    <VTab label="Outer">
                        <VTabs>
                            <VTab
                                v-if="showInner"
                                label="Inner"
                            >
                                <VInput name="password" />
                            </VTab>
                            <VTab label="Other">other</VTab>
                        </VTabs>
                    </VTab>
                </VTabs>
            </VForm>`,
            () => ({ model, showInner }),
        );

        wrapper.findComponent(VForm).vm.setErrors({ password: ['Password is too short'] });
        await flushPromises();
        expect(erroredLabels(wrapper)).toEqual(['Outer', 'Inner']);

        showInner.value = false;
        await flushPromises();

        expect(erroredLabels(wrapper)).toEqual([]);
    });
});
