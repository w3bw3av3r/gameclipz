import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute, Params } from '@angular/router'
import { ClipService } from 'src/app/services/clip.service'
import { ModalService } from 'src/app/services/modal.service'
import IClip from 'src/app/models/clip.model'

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  videoOrder = '1'
  clipz: IClip[] = []
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modal: ModalService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1'
    })
    this.clipService.getUserClipz().subscribe((docs) => {
      this.clipz = []
      docs.forEach((doc) => {
        this.clipz.push({
          docID: doc.id,
          ...doc.data(),
        })
      })
    })
  }

  sort(event: Event) {
    const { value } = event.target as HTMLSelectElement
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value,
      },
    })
  }

  openModal($event: Event, clip: IClip) {
    $event.preventDefault()
    this.modal.toggleModal('editClip')
  }
}
