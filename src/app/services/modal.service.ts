import { Injectable } from '@angular/core'

interface IModal {
  id: string
  visible: boolean
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private _modals: IModal[] = []

  constructor() {}

  register(id: string) {
    this._modals = [...this._modals, { id, visible: false }]
  }

  unregister(id: string) {
    this._modals = this._modals.filter((m) => m.id !== id)
  }

  isModalOpen(id: string): boolean {
    return !!this._modals.find((m) => m.id === id)?.visible
  }

  toggleModal(id: string) {
    const modal = this._modals.find((m) => m.id === id)
    if (modal) {
      modal.visible = !modal.visible
    }
  }
}
