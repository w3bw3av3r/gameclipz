import { Component, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { combineLatest, forkJoin } from 'rxjs'
import { last, switchMap } from 'rxjs/operators'
import firebase from 'firebase/compat/app'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage'
import { v4 as uuid } from 'uuid'
import { ClipService } from 'src/app/services/clip.service'
import { FfmpegService } from 'src/app/services/ffmpeg.service'

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnDestroy {
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
  uploadTask?: AngularFireUploadTask
  screenshotTask?: AngularFireUploadTask
  screenShots: string[] = []
  selectedScreenShot = ''

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    this.auth.user.subscribe((user) => (this.user = user))
    this.ffmpegService.init()
  }

  async storeFile(event: Event) {
    if (this.ffmpegService.isRunning) {
      return
    }

    this.isDragOver = false
    this.file = (event as DragEvent).dataTransfer
      ? (event as DragEvent).dataTransfer?.files.item(0) ?? null
      : (event.target as HTMLInputElement).files?.item(0) ?? null

    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }

    this.screenShots = await this.ffmpegService.getScreenshots(this.file)
    this.selectedScreenShot = this.screenShots[0]

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''))
    this.nextStep = true
  }

  async uploadFile() {
    this.uploadForm.disable()
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMessage = 'Please wait! Your clip is being uploaded.'
    this.isSubmitting = true
    this.showProgress = true

    const clipFilename = uuid()
    const clipPath = `clipz/${clipFilename}.mp4`

    const screenshotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenShot
    )
    const screenshotPath = `screenshots/${clipFilename}.png`

    this.uploadTask = this.storage.upload(clipPath, this.file)
    const clipRef = this.storage.ref(clipPath)

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob)
    const screenshotRef = this.storage.ref(screenshotPath)

    combineLatest([
      this.uploadTask.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress

      if (!clipProgress || !screenshotProgress) {
        return
      }

      const total = clipProgress + screenshotProgress
      this.uploadProgress = (total as number) / 200
    })

    forkJoin([
      this.uploadTask.snapshotChanges(),
      this.uploadTask.snapshotChanges(),
    ])
      .pipe(
        last(),
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipURL, screenshotURL] = urls
          const clipData = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFilename}.mp4`,
            clipURL,
            screenshotURL,
            screenshotFilename: `${clipFilename}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          }
          console.log(clipData)
          const clipDocRef = await this.clipService.createClip(clipData)

          this.alertColor = 'green'
          this.alertMessage =
            'Success! Your clip is now ready to share with the world.'
          this.showProgress = false
          this.isSubmitting = false

          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id])
          }, 1000)
        },
        error: (error) => {
          this.uploadForm.enable()
          this.alertColor = 'red'
          this.alertMessage = 'Upload failed! Please try again.'
          this.isSubmitting = false
          this.showProgress = false
          console.error(error)
        },
      })
  }

  ngOnDestroy(): void {
    this.uploadTask?.cancel()
  }
}
