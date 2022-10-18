import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { last, switchMap } from 'rxjs/operators'
import firebase from 'firebase/compat/app'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { v4 as uuid } from 'uuid'
import { ClipService } from 'src/app/services/clip.service'

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit {
  isDragOver = false
  file: File | null = null
  nextStep = false

  title = new FormControl<string>('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  })

  uploadForm = new FormGroup({
    title: this.title,
  })

  showAlert = false
  alertColor = 'blue'
  alertMessage = 'Please wait! Your clip is being uploaded.'
  isSubmitting = false
  uploadProgress = 0
  showProgress = false
  user: firebase.User | null = null

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService
  ) {
    auth.user.subscribe((user) => (this.user = user))
  }

  ngOnInit(): void {}

  storeFile(event: Event) {
    this.isDragOver = false
    this.file = (event as DragEvent).dataTransfer?.files.item(0) ?? null

    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''))
    this.nextStep = true
  }

  uploadFile() {
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMessage = 'Please wait! Your clip is being uploaded.'
    this.isSubmitting = true
    this.showProgress = true

    const clipFilename = uuid()
    const clipPath = `clipz/${clipFilename}.mp4`

    const uploadTask = this.storage.upload(clipPath, this.file)
    const clipRef = this.storage.ref(clipPath)
    uploadTask.percentageChanges().subscribe((progress) => {
      this.uploadProgress = (progress as number) / 100
    })

    uploadTask
      .snapshotChanges()
      .pipe(
        last(),
        switchMap(() => clipRef.getDownloadURL())
      )
      .subscribe({
        next: (url) => {
          const clipData = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFilename}.mp4`,
            url,
          }
          console.log(clipData)
          this.clipService.createClip(clipData)

          this.alertColor = 'green'
          this.alertMessage =
            'Success! Your clip is now ready to share with the world.'
          this.showProgress = false
          this.isSubmitting = false
        },
        error: (error) => {
          this.alertColor = 'red'
          this.alertMessage = 'Upload failed! Please try again.'
          this.isSubmitting = false
          this.showProgress = false
          console.error(error)
        },
      })
  }
}
