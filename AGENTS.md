# Agent Guide for vue3-bs

This repository is a Vue 3 + Bootstrap 5 Component Library.
Use this guide to understand the development workflow, code style, and verification processes.

## 1. Project Commands

**CRITICAL**: All commands must be run via Docker using the `app` service. Do not run `npm` directly on your host machine.

### Build & Development

| Command                                                       | Description                         |
| :------------------------------------------------------------ | :---------------------------------- |
| `docker compose run --rm --service-ports app npm run dev`     | Start the development server (Vite) |
| `docker compose run --rm app npm run build`                   | Build the library for production    |
| `docker compose run --rm --service-ports app npm run preview` | Preview the production build        |

### Linting & Formatting

| Command                                      | Description                      |
| :------------------------------------------- | :------------------------------- |
| `docker compose run --rm app npm run lint`   | Run ESLint and fix automatically |
| `docker compose run --rm app npm run format` | Run Prettier to format code      |

### Testing (Vitest)

Unit tests are located in `src/**/__tests__/*.spec.js`.

- **Run All Tests**:

    ```bash
    docker compose run --rm app npm test
    ```

- **Run a Single Test File**:

    ```bash
    docker compose run --rm app npm test -- src/components/form/__tests__/VInput.spec.js
    ```

- **Run Specific Test Case**:
    ```bash
    docker compose run --rm app npm test -- -t "should render correctly"
    ```

## 2. Code Style & Conventions

### General Formatting

- **Source of Truth**: `.prettierrc.json` and `eslint.config.js`.
- **Indentation**: **4 spaces**.
- **Semicolons**: Always used.
- **Quotes**: Single quotes (`'`).
- **Trailing Commas**: All (es5 + function parameters).
- **Line Width**: 100 characters.

### Vue Components

- **Syntax**: Use `<script setup>` with the Composition API.
- **Filenames**: PascalCase (e.g., `VInput.vue`, `VSelect.vue`).
- **Component Names**: PascalCase, prefixed with `V` (e.g., `VButton`, `VCard`).
- **Props**: Defined using `defineProps`. Use camelCase for prop keys.
- **Emits**: Defined using `defineEmits`.
- **Directives**: Use shorthands (`@` for `v-on`, `:` for `v-bind`, `#` for `v-slot`).
- **Self-closing**: Self-close tags if they have no content (e.g., `<VInput />`).

### Attributes & Props

- **One attribute per line.** Enforced by Prettier's `singleAttributePerLine: true` in
  `.prettierrc.json`, not by a lint rule. Any tag with two or more attributes gets each on its own
  line with the closing bracket on a line of its own; a single-attribute tag stays inline. Run
  `npm run format` rather than wrapping by hand.
- **Do not enforce this with `vue/max-attributes-per-line`** (or any other ESLint formatting rule).
  `skipFormatting` exists to hand layout to Prettier; duplicating the rule in ESLint risks the two
  tools drifting apart and undoing each other's output on every run.

```vue
<!-- Good -->
<VInput v-model="value" label="Name" :disabled="isDisabled" />

<!-- Single attribute stays inline -->
<slot name="prepend" />
```

### Imports

- **Extensions**: Always include file extensions for local imports.
    ```javascript
    import VInput from './VInput.vue'; // Correct
    import VInput from './VInput'; // Incorrect
    ```
- **Order**:
    1. Vue / Third-party libraries
    2. Local components
    3. Utilities / Constants
    4. Styles (if any)

### JavaScript / Logic

- **Reactivity**: Prefer `ref` over `reactive`. Use `computed` for derived state.
- **Error Handling**:
    - Components often inject `form-errors` provided by a parent `VForm`.
    - Use the `ErrorMessage` component to display validation errors.
- **Props/Emits**:
    - Use `baseProps` and `baseComputed` from `base-input.js` for common form field logic if creating a new input type.

### CSS / Styling

- **Framework**: Bootstrap 5 is the foundation.
- **Classes**: usage of standard Bootstrap utility classes is preferred over custom CSS.
- **Scoped Styles**: Use `<style scoped lang="scss">` only when Bootstrap classes are insufficient.

## 3. Workflow for Agents

1.  **Analyze**:
    - Read `package.json` to understand dependencies.
    - Check `src/components` for similar components to mimic.
    - Read `AGENTS.md` (this file) to refresh on conventions.

2.  **Plan**:
    - Identify which components need modification or creation.
    - Determine if new tests are needed.

3.  **Implement**:
    - Write code following the **4-space indentation** and **single-quote** rules.
    - Ensure attributes are broken into multiple lines if more than one.

4.  **Verify**:
    - **Lint**: Run `docker compose run --rm app npm run lint` to fix formatting.
    - **Test**: Run `docker compose run --rm app npm test` to ensure no regressions.
    - **Build**: Run `docker compose run --rm app npm run build` to confirm the build passes.
