import { Component, OnInit } from '@angular/core'
import { ModalService } from '../services/modal.service'
import { AuthService } from '../services/auth.service'
import { IsActiveMatchOptions } from '@angular/router'

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  readonly isActiveMatchOptions: IsActiveMatchOptions = {
    queryParams: 'ignored',
    matrixParams: 'exact',
    paths: 'exact',
    fragment: 'exact',
  }
  constructor(public modal: ModalService, public auth: AuthService) {}

  ngOnInit(): void {}

  openModal(e: Event) {
    e.preventDefault()
    this.modal.toggleModal('auth')
  }
}
