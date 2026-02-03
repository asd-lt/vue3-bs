import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import VFile from '../VFile.vue';

// Mock URL.createObjectURL since it's not available in jsdom environment
global.URL.createObjectURL = (obj) => 'blob:mocked_url';

describe('VFile', () => {
    it('renders correctly', () => {
        const wrapper = mount(VFile, {
            props: {
                name: 'test-file',
                label: 'Upload File',
            },
        });

        const input = wrapper.find('input[type="file"]');
        expect(input.exists()).toBe(true);

        const label = wrapper.find('label');
        expect(label.exists()).toBe(true);
        expect(label.text()).toBe('Upload File');
    });

    // Simulating file selection in test-utils is tricky because input[type=file] is read-only securely.
    // However, we can test that the button triggers the file input click (via spy if needed,
    // but refs are internal).
    // Instead, let's test props passing.

    it('renders file badges when files are present in modelValue', async () => {
        const file = { name: 'test.txt' };
        const wrapper = mount(VFile, {
            props: {
                name: 'test-file',
                modelValue: [file],
                multiple: true,
            },
        });

        // Wait for onMounted to process modelValue
        await wrapper.vm.$nextTick();

        const badges = wrapper.findAll('.badge');
        // Should find at least one badge for the file (and maybe the '+' button if multiple)
        expect(badges.length).toBeGreaterThan(0);
        expect(wrapper.text()).toContain('test.txt');
    });
});
