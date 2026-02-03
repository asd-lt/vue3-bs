# Agent Guide for vue3-bs

This repository is a Vue 3 + Bootstrap 5 Component Library.
Follow these guidelines when analyzing or modifying the codebase.

## 1. Project Commands

**IMPORTANT**: All `npm` commands must be run via Docker using the `app` service.

### Build & Development

- **Dev Server**: `docker compose run --rm --service-ports app npm run dev`
- **Production Build**: `docker compose run --rm app npm run build`
- **Preview Build**: `docker compose run --rm --service-ports app npm run preview`

### Linting & Formatting

- **Lint**: `docker compose run --rm app npm run lint`
- **Format**: `docker compose run --rm app npm run format`

### Testing

- **Status**: Unit tests are available using Vitest.
- **Run Tests**: `docker compose run --rm app npm test`
- **Action**: When adding critical logic, add unit tests in `src/**/__tests__/*.spec.js`.

## 2. Code Style & Conventions

### Formatting (Source of Truth)

**Note**: The codebase has some legacy inconsistencies (4 spaces/semis vs 2 spaces/no-semis).
**Always adhere to the configuration files** for new code:

- **Indentation**: 4 spaces (per `.prettierrc.json`)
- **Semicolons**: Always (per `.prettierrc.json`)
- **Quotes**: Single quotes (per `.prettierrc.json`)
- **Trailing Commas**: All (per `.prettierrc.json`)

_Tip: Run `npm run format` on files you edit to ensure compliance._

### Vue Components

- **Syntax**: Use `<script setup>` with Composition API.
- **Naming**:
    - Filenames: `PascalCase.vue` (e.g., `VInput.vue`).
    - Component Names: PascalCase, typically prefixed with `V` (e.g., `VButton`, `VForm`).
- **Props**: Defined using `defineProps`. Use camelCase for prop names.
- **Emits**: Defined using `defineEmits`.
- **Directives**: Use standard Vue directives (`v-if`, `v-for`, `v-model`).
- **Attributes**: One attribute per line if there is more than one attribute. Single attribute can be on the same line.

### CSS / Styling

- **Framework**: Bootstrap 5.
- **Classes**: Use standard Bootstrap classes (e.g., `form-control`, `input-group`, `is-invalid`).
- **Scoped Styles**: Use `<style scoped>` if custom CSS is needed, but prefer Bootstrap classes.

### File Structure

- `src/components/`: Vue components (grouped by category, e.g., `form/`).
- `src/utils/`: Utility functions (kebab-case filenames).
- `src/directives/`: Custom Vue directives.
- `src/index.js`: Library entry point (exports components).

### JavaScript / Logic

- **Module System**: ESM (`type: "module"` in `package.json`).
- **Imports**: Always include file extensions for local imports (e.g., `import X from './X.vue'`).
- **Reactivity**: Heavily use `computed`, `ref`, and `inject`.
- **Error Handling**:
    - Form components rely on injecting `form-errors`.
    - Components typically use a child `ErrorMessage` component and check `hasError` state.

## 3. Workflow for Agents

1.  **Analyze**: Check `package.json` and `eslint.config.js` to understand the environment.
2.  **Edit**: modifying components in `src/components`. Maintain the `V` prefix convention.
3.  **Verify**:
    - Run `npm run lint` to fix standard issues.
    - Run `npm run format` to ensure style consistency.
    - Since there are no tests, verify build success with `npm run build`.
