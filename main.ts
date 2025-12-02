import { Application } from '@oak/oak/application'
import { Router } from '@oak/oak/router'
import {
  deleteBookmarks,
  getBookmarks,
  getDeletedBookmarks,
  updateBookmarksCollection,
  updateIds,
  updateSingleBookmark,
} from './route-handlers.ts'

const app = new Application()

app.use((ctx, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*')
  return next()
})

const router = new Router()

router.get('/', (ctx) => {
  ctx.response.status = 200
  ctx.response.body = 'Bookmarks Server listening'
})

router.get('/bookmarks', getBookmarks)
router.post('/bookmarks', updateBookmarksCollection)
router.delete('/bookmarks', deleteBookmarks)
router.put('/bookmarks', updateSingleBookmark)

router.put('/bookmarks/update-ids', updateIds)
router.get('/bookmarks/deleted', getDeletedBookmarks)

app.use(router.routes())
app.use(router.allowedMethods())

app.listen({ port: 8080 })
console.log('Listening on PORT: 8080')

