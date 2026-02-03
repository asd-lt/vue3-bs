# Components Documentation

## Setup

### Global Registration
In your `main.js`:
```javascript
import { createApp } from 'vue'
import Vue3Bs from 'vue3-bs'
import 'bootstrap/scss/bootstrap.scss'

const app = createApp(App)
app.use(Vue3Bs)
```

### Individual Imports
```javascript
import { VForm, VInput, VButton } from 'vue3-bs'
```

---

## VForm

The wrapper component for all form inputs. Handles data synchronization, submission, and error display.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `model-value` | Object | `{}` | Reactive object containing form data |
| `action` | String | `/` | URL to submit to (if using default submit handler) |
| `method` | String | `POST` | HTTP method |
| `on-submit` | Function | `null` | Custom submit handler. Receives form data. |

### Example
```vue
<script setup>
import { reactive } from 'vue'
const formData = reactive({ email: '' })
const handleSubmit = (data) => console.log(data)
</script>

<template>
  <VForm :model-value="formData" :on-submit="handleSubmit">
    <!-- inputs go here -->
    <button type="submit">Submit</button>
  </VForm>
</template>
```

---

## VInput

Standard text input component (wraps `input.form-control`).

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | String | required | Key in `formData` object |
| `label` | String | `null` | Label text |
| `type` | String | `text` | Input type (text, email, password, etc.) |
| `placeholder`| String | `null` | Placeholder text |
| `required` | Boolean | `false` | Adds required styling/validation |

### Example
```vue
<VInput 
  name="email" 
  label="Email Address" 
  type="email" 
  placeholder="user@example.com"
  required 
/>
```

---

## VSelectSearch

Advanced select component with search, remote data, and multi-select capabilities.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | String | required | Key in `formData` object |
| `options` | Array | `[]` | Array of objects to select from |
| `key-id` | String | `id` | Property to use as value |
| `key-name` | String | `name` | Property to display |
| `multiple` | Boolean | `false` | Allow multiple selections |
| `url` | String | `null` | API URL for remote searching |
| `no-search` | Boolean | `false` | Hide search input (act like standard select) |

### Example
```vue
<script setup>
const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'User' }
]
</script>

<template>
  <VSelectSearch
    name="role_id"
    label="Assign Role"
    :options="roles"
    key-id="id"
    key-name="name"
  />
</template>
```

---

## VSelectDate

Date picker component with a popup calendar.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | String | required | Key in `formData` object |
| `label` | String | `null` | Label text |

### Example
```vue
<VSelectDate name="birth_date" label="Date of Birth" />
```

---

## VCheckbox

Checkbox component. Can be styled as a switch.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | String | required | Key in `formData` object |
| `label` | String | `null` | Label text |
| `switch` | Boolean | `false` | Render as Bootstrap switch |
| `true-value` | Any | `1` | Value when checked |
| `false-value` | Any | `0` | Value when unchecked |

### Example
```vue
<VCheckbox name="is_active" label="Active Status" switch />
```

---

## VTextarea

Textarea component.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | String | required | Key in `formData` object |
| `label` | String | `null` | Label text |
| `rows` | String | `null` | Number of rows |

### Example
```vue
<VTextarea name="bio" label="Biography" rows="5" />
```

---

## VFile

File input component with preview support.

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | String | required | Key in `formData` object |
| `label` | String | `null` | Label text |
| `multiple` | Boolean | `false` | Allow multiple file upload |

### Example
```vue
<VFile name="avatar" label="Upload Avatar" />
```
