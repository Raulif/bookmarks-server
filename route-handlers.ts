import { Context } from '@oak/oak/context'
import { QUERY_LIMIT } from './constants.ts'
import {
  deleteDeleted,
  getAllDeleted,
  getMany,
  postMany,
  updateMany,
  updateSingle,
} from './firebase.ts'
import { Bookmark } from './types.d.ts'

export const getBookmarks = async (ctx: Context) => {
  try {
    const body = await ctx.request?.body?.json()
    const currentCursor = body?.cursor ?? 0
    const bookmarks = await getMany(currentCursor)

    ctx.response.body = { bookmarks, cursor: currentCursor + QUERY_LIMIT }
    ctx.response.status = 200
    return ctx
  } catch (e) {
    console.error(e)
    console.error('Error in getBookmarks')
    ctx.response.status = 500
  }
}

export const postBookmarks = async (ctx: Context) => {
  try {
    const bookmarks = await ctx.request.body.json()
    await postMany(bookmarks as unknown as Array<Bookmark>)
    ctx.response.status = 200
    ctx.response.body = { ok: true }
  } catch (e) {
    console.error(e)
    console.error('Error in postBookmarks')
    ctx.response.status = 500
  }
}

export const deleteBookmarks = async (ctx: Context) => {
  try {
    await deleteDeleted()
    ctx.response.status = 200
    ctx.response.body = { ok: true }
  } catch (e) {
    console.error(e)
    console.error('Error in deleteBookmarks')
    ctx.response.status = 500
  }
}

export const getDeletedBookmarks = async (ctx: Context) => {
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

export const updateBookmarksCollection = async (ctx: Context) => {
  try {
    const browserBookmarks = (await ctx.request.body.json()) as Array<Bookmark>
    console.log(`Bookmarks sent from browser: ${browserBookmarks?.length ?? 0}`)
    const dbBookmarks = await getMany()
    console.log(`Bookmarks found in DB: ${dbBookmarks?.length ?? 0}`)
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
      console.log(
        `New browser bookmarks to store: ${newBookmarks?.length ?? 0}`
      )
      await postMany(newBookmarks)
    } else {
      console.log(
        'No Bookmarks currently found in DB. Saving all bookmarks sent from browser.'
      )
      await postMany(browserBookmarks)
    }
    await deleteDeleted()
    ctx.response.status = 200
    ctx.response.body = { ok: true }
  } catch (e) {
    console.error(e)
    console.error('Error in updateBookmarksCollection')
    ctx.response.status = 500
  }
}

export const updateIds = async (ctx: Context) => {
  try {
    const bookmarks = await getMany()
    const updatedBookmarks = bookmarks?.map((bm) => {
      const { id } = bm
      const [realId] = id.split('-')
      bm.id = realId
      return bm
    }) as Array<Bookmark>
    await updateMany(updatedBookmarks)
    ctx.response.status = 200
    ctx.response.body = { ok: true }
  } catch (e) {
    console.error(e)
    console.error('Error in updateBookmarksCollection')
    ctx.response.status = 500
  }
}

export const updateSingleBookmark = async (ctx: Context) => {
  try {
    const bookmark: Bookmark = await ctx.request.body.json()
    console.log('Updating bookmark with DB id: ', bookmark?.dbId)
    await updateSingle(bookmark)
    ctx.response.status = 200
    ctx.response.body = { ok: true }
  } catch (e) {
    console.error(e)
    console.error('Error in updateBookmarksCollection')
    ctx.response.status = 500
  }
}
