import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import VForm from '../VForm.vue';
import VInput from '../VInput.vue';
import VTextarea from '../VTextarea.vue';
import VCheckbox from '../VCheckbox.vue';
import VSelectDate from '../VSelectDate.vue';

global.axios = { post: vi.fn().mockResolvedValue({ data: {} }) };

// Every field resolves its value through `form-data` when a VForm is above it, and falls back
// to modelValue when standalone. The per-component specs cover the standalone half; this file
// covers the injected half.
function mountInForm(template, model, components = { VInput }) {
    return mount(VForm, {
        props: { modelValue: model },
        slots: { default: template },
        global: { components },
    });
}

describe('fields inside a VForm', () => {
    it('reads its initial value from the form model', () => {
        const wrapper = mountInForm('<VInput name="email" />', reactive({ email: 'a@b.c' }));

        expect(wrapper.find('input').element.value).toBe('a@b.c');
    });

    it('writes back into the form model as the user types', async () => {
        const model = reactive({ email: '' });
        const wrapper = mountInForm('<VInput name="email" />', model);

        await wrapper.find('input').setValue('new@b.c');

        expect(model.email).toBe('new@b.c');
    });

    it('reads a nested value through a dot path', () => {
        const wrapper = mountInForm(
            '<VInput name="user.address.city" />',
            reactive({ user: { address: { city: 'Vilnius' } } }),
        );

        expect(wrapper.find('input').element.value).toBe('Vilnius');
    });

    it('writes a nested value through a dot path', async () => {
        const model = reactive({ user: { address: { city: '' } } });
        const wrapper = mountInForm('<VInput name="user.address.city" />', model);

        await wrapper.find('input').setValue('Kaunas');

        expect(model.user.address.city).toBe('Kaunas');
    });

    it('creates missing intermediate objects when writing a dot path', async () => {
        const model = reactive({});
        const wrapper = mountInForm('<VInput name="user.name" />', model);

        await wrapper.find('input').setValue('Ada');

        expect(model.user).toEqual({ name: 'Ada' });
    });

    it('reads and writes an indexed path', async () => {
        const model = reactive({ tags: ['vue', 'node'] });
        const wrapper = mountInForm('<VInput name="tags.1" />', model);

        expect(wrapper.find('input').element.value).toBe('node');

        await wrapper.find('input').setValue('react');
        expect(model.tags).toEqual(['vue', 'react']);
    });

    it('keeps sibling fields independent', async () => {
        const model = reactive({ email: '', password: '' });
        const wrapper = mountInForm('<VInput name="email" /><VInput name="password" />', model);

        await wrapper.findAll('input')[0].setValue('a@b.c');

        expect(model.email).toBe('a@b.c');
        expect(model.password).toBe('');
    });

    it('reflects a model change made from outside the field', async () => {
        const model = reactive({ email: 'a@b.c' });
        const wrapper = mountInForm('<VInput name="email" />', model);

        model.email = 'changed@b.c';
        await wrapper.vm.$nextTick();

        expect(wrapper.find('input').element.value).toBe('changed@b.c');
    });

    it('binds a VTextarea to the model', async () => {
        const model = reactive({ bio: 'before' });
        const wrapper = mountInForm('<VTextarea name="bio" />', model, { VTextarea });

        expect(wrapper.find('textarea').element.value).toBe('before');

        await wrapper.find('textarea').setValue('after');
        expect(model.bio).toBe('after');
    });

    it('binds a VCheckbox to the model as 1 and 0', async () => {
        const model = reactive({ agree: 0 });
        const wrapper = mountInForm('<VCheckbox name="agree" />', model, { VCheckbox });

        await wrapper.find('input[type="checkbox"]').setValue(true);
        expect(model.agree).toBe(1);

        await wrapper.find('input[type="checkbox"]').setValue(false);
        expect(model.agree).toBe(0);
    });

    it('submits a VSelectDate value through its hidden input', () => {
        const wrapper = mountInForm(
            '<VSelectDate name="birthdate" />',
            reactive({ birthdate: '2020-01-02' }),
            {
                VSelectDate,
            },
        );

        expect(wrapper.find('input[type="hidden"]').element.value).toBe('2020-01-02');
    });

    describe('enctype name formatting', () => {
        it('renders bracket-style names when the form has an enctype', () => {
            // Multipart bodies are sent as-is, so PHP-style servers need
            // `user[address][city]` instead of the dot path.
            const wrapper = mount(VForm, {
                props: {
                    modelValue: reactive({ user: { address: { city: '' } } }),
                    enctype: 'multipart/form-data',
                },
                slots: { default: '<VInput name="user.address.city" />' },
                global: { components: { VInput } },
            });

            expect(wrapper.find('input').attributes('name')).toBe('user[address][city]');
        });

        it('keeps plain dot-path names without an enctype', () => {
            const wrapper = mountInForm(
                '<VInput name="user.address.city" />',
                reactive({ user: { address: { city: '' } } }),
            );

            expect(wrapper.find('input').attributes('name')).toBe('user.address.city');
        });
    });

    describe('error styling', () => {
        it('adds is-invalid to a VInput when its field has an error', async () => {
            const wrapper = mountInForm('<VInput name="email" />', reactive({ email: '' }));

            wrapper.vm.setErrors({ email: ['Bad'] });
            await wrapper.vm.$nextTick();

            expect(wrapper.find('input').classes()).toContain('is-invalid');
        });

        it('adds is-invalid to a VTextarea when its field has an error', async () => {
            const wrapper = mountInForm('<VTextarea name="bio" />', reactive({ bio: '' }), {
                VTextarea,
            });

            wrapper.vm.setErrors({ bio: ['Bad'] });
            await wrapper.vm.$nextTick();

            expect(wrapper.find('textarea').classes()).toContain('is-invalid');
        });

        it('leaves a field without an error unstyled', async () => {
            const wrapper = mountInForm(
                '<VInput name="email" /><VInput name="password" />',
                reactive({ email: '', password: '' }),
            );

            wrapper.vm.setErrors({ email: ['Bad'] });
            await wrapper.vm.$nextTick();

            expect(wrapper.findAll('input')[1].classes()).not.toContain('is-invalid');
        });
    });
});
