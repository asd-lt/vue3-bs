# vue3-bs

A lightweight Vue 3 component library built for Bootstrap 5 styles.

**Note:** This library provides Vue 3 components that utilize Bootstrap 5 classes. It does **not** include the Bootstrap JS or CSS files. You must include Bootstrap CSS in your project separately.

## Installation

Install the package via npm:

```bash
npm install vue3-bs
```

You will also need Bootstrap 5 CSS if you haven't already installed it:

```bash
npm install bootstrap
```

## Usage

### 1. Global Registration

Register all components globally in your Vue application entry point (e.g., `main.js` or `main.ts`).

```javascript
import { createApp } from 'vue';
import App from './App.vue';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Import the library
import Vue3Bs from 'vue3-bs';
import 'vue3-bs/dist/style.css'; // If the library exports its own styles (optional)

const app = createApp(App);

app.use(Vue3Bs);

app.mount('#app');
```

### 2. Local Import

You can also import individual components directly in your Vue components.

```vue
<script setup>
import { VInput, VButton } from 'vue3-bs';
</script>

<template>
    <VInput label="Email Address" placeholder="name@example.com" />
</template>
```

## Features

- **Vue 3 Composition API**: Built using the latest Vue 3 features.
- **Bootstrap 5 Compatible**: Designed to work seamlessly with Bootstrap 5 utility classes and grid system.
- **Form Components**: Includes a suite of form components like `VInput`, `VSelect`, `VCheckbox`, etc.

## Components

For a full list of available components and their usage, please refer to [COMPONENTS.md](./COMPONENTS.md).

## Development

For instructions on how to contribute or run the project locally, please see [DEVELOPMENT.md](./DEVELOPMENT.md).

## License

MIT
