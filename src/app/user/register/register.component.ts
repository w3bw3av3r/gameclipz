import { Component } from '@angular/core'
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms'
import { AuthService } from 'src/app/services/auth.service'
import IUser from 'src/app/models/user.model'

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  constructor(private fb: FormBuilder, private auth: AuthService) {}

  name = new FormControl<string>('', [
    Validators.required,
    Validators.minLength(3),
  ])
  email = new FormControl<string>('', [Validators.required, Validators.email])
  age = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ])
  password = new FormControl<string>('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
  ])
  confirmPassword = new FormControl<string>('', [
    Validators.required,
    // Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
  ])
  phoneNumber = new FormControl<string>('', [
    Validators.required,
    Validators.minLength(15),
    Validators.maxLength(15),
  ])

  registerForm: FormGroup = this.fb.group({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirmPassword: this.confirmPassword,
    phoneNumber: this.phoneNumber,
  })

  showAlert = false
  alertColor = 'blue'
  alertMsg = ''
  isSubmitting = false

  async register() {
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait, your account is being created.'
    this.isSubmitting = true

    try {
      await this.auth.createUser(this.registerForm.value as IUser)
      this.isSubmitting = false
    } catch (e) {
      console.error(e)
      this.alertMsg = `${e}.message`
      this.alertColor = 'red'
      this.isSubmitting = false
      return
    }

    this.alertMsg = 'Success! Your account has been created.'
    this.alertColor = 'green'
  }
}
