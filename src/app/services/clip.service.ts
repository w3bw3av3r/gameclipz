import { Injectable } from '@angular/core'
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { AngularFireStorage } from '@angular/fire/compat/storage'
import IClip from '../models/clip.model'
import { BehaviorSubject, of, combineLatest } from 'rxjs'
import { switchMap, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  public clipCollection: AngularFirestoreCollection<IClip>

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) {
    this.clipCollection = db.collection('clipz')
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipCollection.add(data)
  }

  getUserClipz(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap((combinedData) => {
        const [user, sort] = combinedData
        if (!user) {
          return of([])
        }
        const query = this.clipCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc')
        return query.get()
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    )
  }

  updateClip(id: string, title: string) {
    return this.clipCollection.doc(id).update({
      title,
    })
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clipz/${clip.fileName}`)
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFilename}`
    )
    clipRef.delete()
    screenshotRef.delete()

    await this.clipCollection.doc(clip.docID).delete()
  }
}
