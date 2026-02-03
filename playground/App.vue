<script setup>
import { reactive, ref } from 'vue'

const formRef = ref(null)

const formData = reactive({
  email: '',
  password: '',
  description: '',
  agree: false,
  role: '',
  tags: [],
  birthdate: '',
  avatar: null
})

const roles = [
  { id: 'admin', name: 'Administrator' },
  { id: 'user', name: 'User' },
  { id: 'guest', name: 'Guest' }
]

const availableTags = [
  { id: 'vue', name: 'Vue.js' },
  { id: 'react', name: 'React' },
  { id: 'angular', name: 'Angular' },
  { id: 'node', name: 'Node.js' }
]

const onSubmit = (data) => {
  console.log('Form Submitted:', data)
  alert(JSON.stringify(data, null, 2))
}

const triggerErrors = () => {
  if (formRef.value) {
    formRef.value.setErrors({
      email: ['Email is already taken'],
      password: ['Password is too short', 'Password must contain a number'],
      birthdate: ['You must be at least 18 years old'],
      role: ['Please select a valid role'],
      tags: ['Please select at least one skill'],
      description: ['Bio must be at least 50 characters'],
      avatar: ['Image size must be less than 2MB'],
      agree: ['You must agree to the terms']
    })
  }
}

const clearErrors = () => {
  if (formRef.value) {
    formRef.value.setErrors(null)
  }
}
</script>

<template>
  <div class="container mt-5 mb-5">
    <h1>Vue3-BS Playground</h1>
    <p class="lead">Testing Form Components</p>
    
    <div class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">Registration Form Example</h5>
        
        <VForm ref="formRef" :model-value="formData" :on-submit="onSubmit">
          <div class="row">
            <div class="col-md-6 mb-3">
              <VInput 
                name="email" 
                label="Email Address" 
                placeholder="Enter your email"
                type="email"
                required
              />
            </div>
            
            <div class="col-md-6 mb-3">
              <VInput 
                name="password" 
                label="Password" 
                placeholder="Enter your password"
                type="password"
                required
              />
            </div>
          </div>

          <div class="mb-3">
            <VSelectDate
              name="birthdate"
              label="Date of Birth"
              placeholder="Select date"
            />
          </div>

          <div class="mb-3">
            <VSelectSearch
              name="role"
              label="Role (Single Select)"
              placeholder="Select a role"
              :options="roles"
              key-id="id"
              key-name="name"
            />
          </div>

          <div class="mb-3">
            <VSelectSearch
              name="tags"
              label="Skills (Multi Select)"
              placeholder="Select skills"
              :options="availableTags"
              key-id="id"
              key-name="name"
              multiple
            />
          </div>

          <div class="mb-3">
            <VTextarea
              name="description"
              label="Bio"
              placeholder="Tell us about yourself"
              rows="3"
            />
          </div>

          <div class="mb-3">
            <VFile
              name="avatar"
              label="Avatar"
            />
          </div>

          <div class="mb-3">
            <VCheckbox
              name="agree"
              label="I agree to terms and conditions"
            />
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary">Register</button>
            <button type="button" class="btn btn-danger" @click="triggerErrors">Simulate Errors</button>
            <button type="button" class="btn btn-secondary" @click="clearErrors">Clear Errors</button>
          </div>
        </VForm>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Form Data State</h5>
        <pre>{{ formData }}</pre>
      </div>
    </div>
  </div>
</template>
