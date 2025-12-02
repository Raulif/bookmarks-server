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

const projectId = Deno.env.get('FIREBASE_PROJECT_ID')

const firebaseConfig = {
  apiKey: Deno.env.get('FIREBASE_API_KEY'),
  projectId,
  authDomain: `${projectId}.firebaseapp.com`,
  databaseURL: `https://${projectId}-default-rtdb-default-rtdb.europe-west1.firebasedatabase.app/`,
  storageBucket: `${projectId}.firebasestorage.app`,
  messagingSenderId: Deno.env.get('FIREBASE_MESSAGING_SENDER_ID'),
  appId: Deno.env.get('FIREBASE_APP_ID'),
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

export const updateMany = async (bookmarks: Array<Bookmark>) => {
  try {
    const batch = writeBatch(database)
    for (const bookmark of bookmarks) {
      const updateDoc = doc(collection(database, 'bookmarks'), bookmark.dbId)

      batch.update(updateDoc, { ...bookmark })
    }

    await batch.commit()
  } catch (e) {
    console.error(e)
    console.error('Error on updateMany')
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

