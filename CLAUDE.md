# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` holds the full code-style rules for this repo (formatting, Vue conventions, import
order). Read it before writing code; this file covers commands and architecture.

## Commands

All commands run through Docker (`docker-compose.yml` mounts the repo into a `node:20-slim` `app`
service). Do not run `npm` directly on the host.

```bash
docker compose run --rm --service-ports app npm run dev   # Vite dev server on :5173 (playground)
docker compose run --rm app npm run build                 # build the library into dist/
docker compose run --rm app npm run lint                  # eslint --fix
docker compose run --rm app npm run format                # prettier --write
docker compose run --rm app npm test                      # vitest
docker compose run --rm app npm test -- src/components/form/__tests__/VInput.spec.js  # one file
docker compose run --rm app npm test -- -t "renders correctly"                        # one case
```

Verify a change with lint → test → build before considering it done.

Prettier owns all formatting: `eslint.config.js` applies `skipFormatting` and deliberately adds no
rules of its own. The one-attribute-per-line house style comes from `singleAttributePerLine: true`
in `.prettierrc.json` — do not reimplement it as `vue/max-attributes-per-line`, since a formatting
rule that drifts from Prettier makes `lint --fix` and `format` undo each other on every run. CI
(`.github/workflows/tests.yml`) runs only build and test, so formatting is enforced by running
`npm run format` locally.

## Architecture

A Vue 3 component library (no runtime deps; `vue` is a peer dep) that emits Bootstrap 5 markup.
Bootstrap CSS itself is **not** bundled — consumers import it. `vite.config.js` switches on the
Vite command: `serve` roots at `playground/` with a `vue3-bs` → `src/index.js` alias, `build`
produces the ES/UMD lib from `src/index.js` with `vue` externalized.

`src/index.js` is the single public surface: it named-exports every component and default-exports
an `install(app)` plugin that registers them globally. A new component must be added in both
places or it ships as dead code.

### The form system

Everything centers on `VForm` (`src/components/form/VForm.vue`), which `provide()`s three keys that
every field `inject()`s:

- `form-data` — a writable computed over `props.modelValue`; fields read/write through it
- `form-props` — the raw `VForm` props (fields check `enctype` to decide name formatting)
- `form-errors` — a reactive object shaped `{ errors: { field: [messages] } }`

`src/components/form/base-input.js` supplies `baseProps()` (spread extra props into it) and
`baseComputed(props, formData, formProps, emit)`, which returns the shared derived state —
`fieldValue`, `parsedId`, `parsedName`, `parsedLabel`, `parsedPlaceholder`, `parsedWrapperClass`,
`parsedAttributes`. `fieldValue` is the key abstraction: when a `VForm` ancestor exists it
get/sets `formData` via dot-path (`src/utils/object-utils.js` `get`/`set`, supporting `user.name`
and `items[0].id`); standalone it falls back to `modelValue` and emits `update:modelValue` +
`change`. Any new input component follows this shape: inject the three keys, call
`baseProps`/`baseComputed`, render an `<ErrorMessage :name="props.name" />` and add `is-invalid` to
the control when that ref reports `hasError`.

### Submission

`VForm` serializes with the native `FormData(formEl)`, so **fields must render a real named input**
— components with custom UI (`VCheckbox`, `VSelectDate`, `VSelectSearch`) emit a `type="hidden"`
input alongside their visible controls. `prepareSubmitData()` appends `_method` and
`additionalFields` (default `['id']`), then either returns the `FormData` as-is (when `enctype` is
set) or rebuilds a nested JSON object by running each entry name back through `set()`. That's why a
`multiple` `VSelectSearch` renders one hidden input per value with `name="field.0"`, `field.1`, …
— the dot path is what expands it back into an array.

`submitForm()` calls a **global `axios`** (declared as a readonly global in `eslint.config.js`, not
imported or in `package.json`); consuming apps must supply it. `VSelectSearch`'s remote search does
the same. Tests set `global.axios` to a mock. On failure `setErrors(error.response.data.errors)`
populates `form-errors`, which `ErrorMessage` renders. `VForm` also exposes `setData`, `setField`,
`setErrors`, `setError(field, message)`, `submitForm`, `formData`, and `formHasError` via
`defineExpose`.

### Other pieces

- `src/directives/` — `click-outside` and `scroll-end`, imported locally as `vClickOutside` /
  `vScrollEnd` by `VSelectSearch` and `VSelectDate`; not registered globally by the plugin.
- `VSelectSearch` (the largest component) handles static options, remote paginated search
  (Laravel-style `links.next` / `next_page_url`), multi-select badges, and an inline create row.
- `_VCalendar.vue` — leading underscore marks it internal to `VSelectDate`; not exported.
- `playground/App.vue` is the manual test bench for every component, including a button that
  triggers `setErrors` to exercise error rendering.

## Release

Published to npm as `vue3-bs` with only `dist/` in `files`. Convention in this repo: bump
`package.json` `version` in the same commit as the change, and say so in the commit message.
