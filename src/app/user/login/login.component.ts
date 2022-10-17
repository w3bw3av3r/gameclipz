import { Component, OnInit } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/compat/auth'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: '',
  }

  showAlert = false
  alertColor = 'blue'
  alertMsg = ''
  isSubmitting = false

  constructor(private auth: AngularFireAuth) {}

  ngOnInit(): void {}

  async login() {
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait! We are logging you in.'
    this.isSubmitting = true

    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      )
    } catch (e) {
      console.error(e)
      this.isSubmitting = false
      this.alertMsg = `${e}.error.code`
      this.alertColor = 'red'
      return
    }

    this.alertMsg = 'Logged in'
    this.alertColor = 'green'
  }
}
