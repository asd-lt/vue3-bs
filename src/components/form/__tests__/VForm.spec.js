import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import VForm from '../VForm.vue';
import VInput from '../VInput.vue';

// Mock axios globally
global.axios = {
    post: vi.fn().mockResolvedValue({ data: {} }),
};

beforeEach(() => {
    global.axios.post = vi.fn().mockResolvedValue({ data: {} });
});

// Mounts a VForm with real fields inside it, which is the only way to exercise
// serialization: VForm reads the DOM via `new FormData(formEl)` rather than the model.
function mountForm(template, props = {}) {
    return mount(VForm, {
        props: { action: '/submit', ...props },
        slots: { default: template },
        global: { components: { VInput } },
    });
}

function submittedPayload() {
    return global.axios.post.mock.calls[0][1];
}

describe('VForm', () => {
    it('renders form and slot content', () => {
        const wrapper = mount(VForm, {
            slots: {
                default: '<div class="slot-content">Slot Content</div>',
            },
        });

        const form = wrapper.find('form');
        expect(form.exists()).toBe(true);
        expect(wrapper.find('.slot-content').exists()).toBe(true);
    });

    it('emits loading events on submit', async () => {
        const wrapper = mount(VForm, {
            props: {
                action: '/test-submit',
            },
        });

        const form = wrapper.find('form');
        await form.trigger('submit');

        expect(wrapper.emitted('loading')).toBeTruthy();
        // Should emit true then false (after promise resolves)
        // Since axios mock is instant, we might miss the interim state in synchronous check
        // But we can check that it was called.
    });

    it('calls onSubmit prop if provided', async () => {
        const onSubmit = vi.fn();
        const wrapper = mount(VForm, {
            props: {
                onSubmit,
            },
        });

        const form = wrapper.find('form');
        await form.trigger('submit');

        expect(onSubmit).toHaveBeenCalled();
    });

    describe('submission payload', () => {
        it('posts to the action url', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
            });

            await wrapper.vm.submitForm();

            expect(global.axios.post.mock.calls[0][0]).toBe('/submit');
        });

        it('collects field values from the rendered inputs', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
            });

            await wrapper.vm.submitForm();

            expect(submittedPayload().email).toBe('a@b.c');
        });

        it('expands dot-path field names back into a nested object', async () => {
            // The round trip that makes `name="user.address.city"` work: FormData flattens it
            // to a string key, then `set()` rebuilds the nesting.
            const wrapper = mountForm('<VInput name="user.address.city" />', {
                modelValue: reactive({ user: { address: { city: 'Vilnius' } } }),
            });

            await wrapper.vm.submitForm();

            expect(submittedPayload().user).toEqual({ address: { city: 'Vilnius' } });
        });

        it('expands indexed field names back into an array', async () => {
            const wrapper = mountForm('<VInput name="tags.0" /><VInput name="tags.1" />', {
                modelValue: reactive({ tags: ['vue', 'node'] }),
            });

            await wrapper.vm.submitForm();

            expect(submittedPayload().tags).toEqual(['vue', 'node']);
        });

        it('appends the method as _method', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
                method: 'PUT',
            });

            await wrapper.vm.submitForm();

            expect(submittedPayload()._method).toBe('PUT');
        });

        it('omits _method when method is false', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
                method: false,
            });

            await wrapper.vm.submitForm();

            expect(submittedPayload()._method).toBeUndefined();
        });

        it('omits an additionalField that is absent from the model', async () => {
            // A create form has no id yet; appending it anyway would submit the
            // string "undefined" because FormData stringifies every value.
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
            });

            await wrapper.vm.submitForm();

            expect(submittedPayload()).not.toHaveProperty('id');
        });

        it('appends additionalFields that are not rendered as inputs', async () => {
            // `id` has no input of its own, so it is pulled straight off the model.
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ id: 7, email: 'a@b.c' }),
            });

            await wrapper.vm.submitForm();

            expect(submittedPayload().id).toBe('7');
        });

        it('honours a custom additionalFields list', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ uuid: 'abc', email: 'a@b.c' }),
                additionalFields: ['uuid'],
            });

            await wrapper.vm.submitForm();

            expect(submittedPayload().uuid).toBe('abc');
        });

        it('sends raw FormData when an enctype is set', async () => {
            // File uploads need the multipart body untouched, so the JSON rebuild is skipped.
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
                enctype: 'multipart/form-data',
            });

            await wrapper.vm.submitForm();

            const payload = submittedPayload();
            expect(payload).toBeInstanceOf(FormData);
            expect(payload.get('email')).toBe('a@b.c');
        });

        it('hands the prepared payload to a custom onSubmit instead of posting', async () => {
            const onSubmit = vi.fn();
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
                onSubmit,
            });

            await wrapper.find('form').trigger('submit');

            expect(global.axios.post).not.toHaveBeenCalled();
            expect(onSubmit.mock.calls[0][0].email).toBe('a@b.c');
        });
    });

    describe('response handling', () => {
        it('emits response with the payload on success', async () => {
            global.axios.post = vi.fn().mockResolvedValue({ data: { saved: true } });
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
            });

            await wrapper.vm.submitForm();

            expect(wrapper.emitted('response')[0]).toEqual([{ saved: true }]);
        });

        it('invokes the submitForm callback with the response payload', async () => {
            global.axios.post = vi.fn().mockResolvedValue({ data: { saved: true } });
            const callback = vi.fn();
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
            });

            await wrapper.vm.submitForm(callback);

            expect(callback).toHaveBeenCalledWith({ saved: true });
        });

        it('emits loading true then false around the request', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
            });

            await wrapper.vm.submitForm();

            expect(wrapper.emitted('loading')).toEqual([[true], [false]]);
        });

        it('renders validation errors returned by a failed request', async () => {
            global.axios.post = vi.fn().mockRejectedValue({
                response: { data: { errors: { email: ['Email is already taken'] } } },
            });
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
            });

            await wrapper.vm.submitForm();
            await wrapper.vm.$nextTick();

            expect(wrapper.find('.invalid-feedback').text()).toBe('Email is already taken');
            expect(wrapper.emitted('responseError')).toBeTruthy();
        });

        it('stops loading even when the request fails', async () => {
            global.axios.post = vi.fn().mockRejectedValue({ response: { data: {} } });
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
            });

            await wrapper.vm.submitForm();

            expect(wrapper.emitted('loading')).toEqual([[true], [false]]);
        });

        it('clears errors from a previous attempt when resubmitting', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'a@b.c' }),
            });
            wrapper.vm.setErrors({ email: ['Stale error'] });
            await wrapper.vm.$nextTick();

            await wrapper.vm.submitForm();
            await wrapper.vm.$nextTick();

            expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
        });
    });

    describe('error helpers', () => {
        it('marks the form and the field when setErrors is called', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: '' }),
            });

            wrapper.vm.setErrors({ email: ['Bad'] });
            await wrapper.vm.$nextTick();

            expect(wrapper.find('form').classes()).toContain('needs-validation');
            expect(wrapper.find('input').classes()).toContain('is-invalid');
            expect(wrapper.vm.formHasError).toBeTruthy();
        });

        it('clears every error when setErrors is called with null', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: '' }),
            });
            wrapper.vm.setErrors({ email: ['Bad'] });
            await wrapper.vm.$nextTick();

            wrapper.vm.setErrors(null);
            await wrapper.vm.$nextTick();

            expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
            expect(wrapper.vm.formHasError).toBeFalsy();
        });

        it('sets a field error on a fresh form with setError', async () => {
            // Regression: before any setErrors call, formErrors.value is undefined and
            // setError used to throw reading `.errors` off it.
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: '' }),
            });

            wrapper.vm.setError('email', 'Oops');
            await wrapper.vm.$nextTick();

            expect(wrapper.find('.invalid-feedback').text()).toBe('Oops');
        });

        it('tolerates setError clearing a field on a fresh form', () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: '' }),
            });

            expect(() => wrapper.vm.setError('email', null)).not.toThrow();
        });

        it('exposes formHasError as a real boolean', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: '' }),
            });

            expect(wrapper.vm.formHasError).toBe(false);

            wrapper.vm.setErrors({ email: ['Bad'] });
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.formHasError).toBe(true);
        });

        it('replaces a single field message with setError', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: '' }),
            });
            wrapper.vm.setErrors({ email: ['First'] });
            await wrapper.vm.$nextTick();

            wrapper.vm.setError('email', 'Second');
            await wrapper.vm.$nextTick();

            expect(wrapper.find('.invalid-feedback').text()).toBe('Second');
        });

        it('removes a field message when setError is given no message', async () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: '' }),
            });
            wrapper.vm.setErrors({ email: ['Bad'] });
            await wrapper.vm.$nextTick();

            wrapper.vm.setError('email', null);
            await wrapper.vm.$nextTick();

            expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
        });

        it('leaves other fields alone when setError targets one', async () => {
            const wrapper = mountForm('<VInput name="email" /><VInput name="password" />', {
                modelValue: reactive({ email: '', password: '' }),
            });
            wrapper.vm.setErrors({ email: ['Email bad'], password: ['Password bad'] });
            await wrapper.vm.$nextTick();

            wrapper.vm.setError('email', null);
            await wrapper.vm.$nextTick();

            expect(wrapper.findAll('.invalid-feedback')).toHaveLength(1);
            expect(wrapper.find('.invalid-feedback').text()).toBe('Password bad');
        });
    });

    describe('model helpers', () => {
        it('replaces the whole model with setData', () => {
            const wrapper = mountForm('<VInput name="email" />', {
                modelValue: reactive({ email: 'old@b.c' }),
            });

            wrapper.vm.setData({ email: 'new@b.c' });

            expect(wrapper.emitted('update:modelValue')[0]).toEqual([{ email: 'new@b.c' }]);
        });

        it('updates one key with setField', async () => {
            const model = reactive({ email: 'old@b.c' });
            const wrapper = mountForm('<VInput name="email" />', { modelValue: model });

            wrapper.vm.setField('email', 'new@b.c');
            await wrapper.vm.$nextTick();

            expect(model.email).toBe('new@b.c');
            expect(wrapper.find('input').element.value).toBe('new@b.c');
        });
    });
});
