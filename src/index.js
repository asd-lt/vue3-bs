import VForm from './components/form/VForm.vue'
import VInput from './components/form/VInput.vue'
import VSelectDate from './components/form/VSelectDate.vue'
import VSelectSearch from './components/form/VSelectSearch.vue'
import VTextarea from './components/form/VTextarea.vue'
import VCheckbox from './components/form/VCheckbox.vue'
import VFile from './components/form/VFile.vue'
import ErrorMessage from './components/form/ErrorMessage.vue'

export { 
  VForm, 
  VInput, 
  VSelectDate, 
  VSelectSearch, 
  VTextarea, 
  VCheckbox, 
  VFile,
  ErrorMessage 
}

export default {
  install(app) {
    app.component('VForm', VForm)
    app.component('VInput', VInput)
    app.component('VSelectDate', VSelectDate)
    app.component('VSelectSearch', VSelectSearch)
    app.component('VTextarea', VTextarea)
    app.component('VCheckbox', VCheckbox)
    app.component('VFile', VFile)
    app.component('ErrorMessage', ErrorMessage)
  }
}
