import { deleteDeleted, getAll, getAllDeleted, postMany } from './firebase.ts'
import {
  Bookmark,
  ContextBookmarks,
  ContextDeletedBookmarks,
} from './types.d.ts'

export const getBookmarks = async (ctx: ContextBookmarks) => {
  try {
    const bookmarks = await getAll()
    ctx.response.body = bookmarks
    ctx.response.status = 200
    return ctx
  } catch (e) {
    console.error(e)
    console.error('Error in getBookmarks')
    ctx.response.status = 500
  }
}

export const postBookmarks = async (ctx: ContextBookmarks) => {
  try {
    const bookmarks = await ctx.request.body.json()
    await postMany(bookmarks as unknown as Array<Bookmark>)
    ctx.response.status = 200
  } catch (e) {
    console.error(e)
    console.error('Error in postBookmarks')
    ctx.response.status = 500
  }
}

export const deleteBookmarks = async (ctx: ContextBookmarks) => {
  try {
    await deleteDeleted()
    ctx.response.status = 200
  } catch (e) {
    console.error(e)
    console.error('Error in deleteBookmarks')
    ctx.response.status = 500
  }
}

export const getDeletedBookmarks = async (ctx: ContextDeletedBookmarks) => {
  try {
    const deletedBookmarks = await getAllDeleted()
    ctx.response.body = deletedBookmarks
    ctx.response.status = 200
  } catch (e) {
    console.error(e)
    console.error('Error in getDeletedBookmarks')
    ctx.response.status = 500
  }
}

export const updateBookmarksCollection = async (ctx: ContextBookmarks) => {
  try {
    const browserBookmarks = (await ctx.request.body.json()) as Array<Bookmark>
    const dbBookmarks = await getAll()

    if (dbBookmarks?.length) {
      const newBookmarks = browserBookmarks.reduce<Array<Bookmark>>(
        (acc, browserBm) => {
          const exists = dbBookmarks.some((dbBm) => dbBm.id === browserBm.id)
          if (!exists) {
            acc.push(browserBm)
          }
          return acc
        },
        []
      )
      await postMany(newBookmarks)
    } else {
      await postMany(browserBookmarks)
    }
    await deleteDeleted()
  } catch (e) {
    console.error(e)
    console.error('Error in updateBookmarksCollection')
    ctx.response.status = 500
  }
}
