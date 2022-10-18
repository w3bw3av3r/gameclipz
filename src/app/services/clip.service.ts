import { Injectable } from '@angular/core'
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import IClip from '../models/clip.model'
import { of } from 'rxjs'
import { switchMap, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class ClipService {
  public clipCollection: AngularFirestoreCollection<IClip>

  constructor(private db: AngularFirestore, private auth: AngularFireAuth) {
    this.clipCollection = db.collection('clipz')
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipCollection.add(data)
  }

  getUserClipz() {
    return this.auth.user.pipe(
      switchMap((user) => {
        if (!user) {
          return of([])
        }
        const query = this.clipCollection.ref.where('uid', '==', user.uid)
        return query.get()
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    )
  }
}
