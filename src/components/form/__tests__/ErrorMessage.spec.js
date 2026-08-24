import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import ErrorMessage from '../ErrorMessage.vue';

// VForm provides `form-errors` as a reactive object whose `value` holds the Laravel-shaped
// payload, so tests mirror that shape rather than the bare error map.
function mountWithErrors(errors, name = 'email') {
    const formErrors = reactive({});

    if (errors) {
        formErrors.value = { errors };
    }

    return {
        formErrors,
        wrapper: mount(ErrorMessage, {
            props: { name },
            global: { provide: { 'form-errors': formErrors } },
        }),
    };
}

describe('ErrorMessage', () => {
    it('renders nothing when the form has no errors', () => {
        const { wrapper } = mountWithErrors(null);

        expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
    });

    it('renders nothing when another field has the error', () => {
        const { wrapper } = mountWithErrors({ password: ['Too short'] });

        expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
    });

    it('renders the message for its own field', () => {
        const { wrapper } = mountWithErrors({ email: ['Email is already taken'] });

        expect(wrapper.find('.invalid-feedback').text()).toBe('Email is already taken');
    });

    it('renders only the first message when a field has several', () => {
        const { wrapper } = mountWithErrors(
            { password: ['Password is too short', 'Password must contain a number'] },
            'password',
        );

        expect(wrapper.find('.invalid-feedback').text()).toBe('Password is too short');
    });

    it('renders nothing when the field key exists but holds no messages', () => {
        const { wrapper } = mountWithErrors({ email: [] });

        expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
    });

    it('exposes hasError so inputs can add is-invalid', () => {
        const { wrapper } = mountWithErrors({ email: ['Bad'] });

        expect(wrapper.vm.hasError).toBeTruthy();
    });

    it('appears and disappears as the provided errors change', async () => {
        const { wrapper, formErrors } = mountWithErrors(null);

        formErrors.value = { errors: { email: ['Bad'] } };
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.invalid-feedback').text()).toBe('Bad');

        formErrors.value = {};
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
    });

    it('renders nothing when used outside a VForm', () => {
        // The inject default keeps a standalone field from throwing.
        const wrapper = mount(ErrorMessage, { props: { name: 'email' } });

        expect(wrapper.find('.invalid-feedback').exists()).toBe(false);
    });
});
