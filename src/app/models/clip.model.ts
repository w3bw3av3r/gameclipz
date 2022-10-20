import firebase from 'firebase/compat/app'
export default interface IClip {
  docID?: string
  uid: string
  displayName: string
  title: string
  fileName: string
  clipURL: string
  screenshotURL: string
  screenshotFilename: string
  timestamp: firebase.firestore.FieldValue
}
