import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'

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

  constructor() {}

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
    console.log('File uploaded')
  }
}
