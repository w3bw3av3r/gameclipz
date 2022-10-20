import { Injectable } from '@angular/core'
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore'
import {
  BehaviorSubject,
  of,
  combineLatest,
  lastValueFrom,
  Observable,
} from 'rxjs'
import { switchMap, map } from 'rxjs/operators'
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
  Router,
} from '@angular/router'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { AngularFireStorage } from '@angular/fire/compat/storage'
import IClip from '../models/clip.model'

@Injectable({
  providedIn: 'root',
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollection: AngularFirestoreCollection<IClip>
  pageClipz: IClip[] = []
  pendingRequest = false

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = db.collection('clipz')
  }

  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data)
  }

  getUserClipz(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap((combinedData) => {
        const [user, sort] = combinedData
        if (!user) {
          return of([])
        }
        const query = this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc')
        return query.get()
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    )
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
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

    await this.clipsCollection.doc(clip.docID).delete()
  }

  async getClipz() {
    if (this.pendingRequest) {
      return
    }
    this.pendingRequest = true
    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6)

    const { length } = this.pageClipz

    if (length) {
      const lastDocID = this.pageClipz[length - 1].docID
      const lastDoc = await lastValueFrom(
        this.clipsCollection.doc(lastDocID).get()
      )

      query = query.startAfter(lastDoc)
    }

    const snapshot = await query.get()
    snapshot.forEach((doc) => {
      this.pageClipz.push({
        docID: doc.id,
        ...doc.data(),
      })
    })

    this.pendingRequest = false
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection
      .doc(route.params.id)
      .get()
      .pipe(
        map((snapshot) => {
          const data = snapshot.data()
          if (!data) {
            this.router.navigate(['/'])
            return null
          }
          return data
        })
      )
  }
}
