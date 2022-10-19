import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { ModalService } from 'src/app/services/modal.service'
import { ClipService } from 'src/app/services/clip.service'
import IClip from 'src/app/models/clip.model'

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null
  @Output() update = new EventEmitter()

  clipID = new FormControl('', { nonNullable: true })
  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  })
  editForm = new FormGroup({
    title: this.title,
    id: this.clipID,
  })

  showAlert = false
  alertColor = 'blue'
  alertMessage = 'Updating clip...'
  isSubmitting = false

  constructor(private modal: ModalService, private clipService: ClipService) {}

  ngOnInit(): void {
    this.modal.register('editClip')
  }

  async submit() {
    if (!this.activeClip) {
      return
    }
    this.isSubmitting = true
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMessage = 'Updateing clip...'

    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value)
    } catch (e) {
      this.isSubmitting = false
      this.alertColor = 'red'
      this.alertMessage = 'An error occured. Please try again.'
      return
    }

    this.isSubmitting = false
    this.alertColor = 'green'
    this.alertMessage = 'Success! Clip updated.'

    this.activeClip.title = this.title.value
    this.update.emit(this.activeClip)
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip')
  }

  ngOnChanges() {
    if (!this.activeClip) {
      return
    }

    this.clipID.setValue(this.activeClip.docID as string)
    this.title.setValue(this.activeClip.title)
    this.isSubmitting = false
    this.showAlert = false
  }
}
