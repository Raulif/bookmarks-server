import { initializeApp } from 'firebase/app'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDocsFromCache,
  getFirestore,
  query,
  where,
  writeBatch,
} from 'firebase/firestore'

import type { Bookmark } from './types.d.ts'

const firebaseConfig = {
  apiKey: Deno.env.get('FIREBASE_API_KEY'),
  authDomain: 'bookmarks-angular-f86d4.firebaseapp.com',
  databaseURL: Deno.env.get('FIREBASE_DATABASE_URL'),
  projectId: 'bookmarks-angular-f86d4',
  storageBucket: 'bookmarks-angular-f86d4.firebasestorage.app',
  messagingSenderId: '163213790936',
  appId: '1:163213790936:web:96c055ce734183d34c11ad',
}

const app = initializeApp(firebaseConfig)

const database = getFirestore(app)

export const getAll = async () => {
  try {
    const bookmarksCollection = collection(database, 'bookmarks')
    const docs = [] as Array<Bookmark>

    const cachedQueryRes = await getDocsFromCache(bookmarksCollection)
    cachedQueryRes.forEach((doc) => docs.push(doc.data() as Bookmark))
    if (docs.length) {
      return docs
    }

    const queryRes = await getDocs(bookmarksCollection)
    queryRes.forEach((doc) => docs.push(doc.data() as Bookmark))
    return docs
  } catch (e) {
    console.error('Error getAll: ', e)
  }
}

export const postMany = async (bookmarks: Array<Bookmark>) => {
  try {
    const batch = writeBatch(database)

    for (const bookmark of bookmarks) {
      const newDoc = doc(collection(database, 'bookmarks'))
      bookmark.dbId = newDoc.id
      bookmark.deleted = bookmark.consumed
      delete bookmark.hearable
      batch.set(newDoc, bookmark)
    }

    await batch.commit()
  } catch (e) {
    console.error('Error postMany: ', e)
  }
}

export const deleteDeleted = async () => {
  try {
    const bookmarksCollection = collection(database, 'bookmarks')
    const deletedBookmarks = await getAllDeleted()
    if (!deletedBookmarks?.length) {
      return false
    }
    await Promise.all(
      deletedBookmarks.map(async (bm) => {
        const bookmarkDoc = doc(bookmarksCollection, bm.id)
        if (bookmarkDoc) {
          await deleteDoc(bookmarkDoc)
        }
      })
    )
    return true
  } catch (e) {
    console.error('Error deleteMany: ', e)
  }
}

export const getAllDeleted = async () => {
  try {
    const bookmarksCollection = collection(database, 'bookmarks')
    const q = query(bookmarksCollection, where('deleted', '==', true))
    const queryRes = await getDocs(q)
    const docs = [] as Array<Bookmark>
    queryRes.forEach((doc) => docs.push(doc.data() as Bookmark))
    return docs
  } catch (e) {
    console.error('Error getAllDeleted: ', e)
  }
}
