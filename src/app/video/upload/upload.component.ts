import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit {
  isDragOver = false
  constructor() {}

  ngOnInit(): void {}

  storeFile(event: Event) {
    this.isDragOver = false
  }
}
