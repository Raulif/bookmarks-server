import { Application } from '@oak/oak/application'
import { Router } from '@oak/oak/router'
import {
  deleteBookmarks,
  getBookmarks,
  getDeletedBookmarks,
  updateBookmarksCollection,
} from './route-handlers.ts'

const router = new Router()

router.get('/', (ctx) => {
  ctx.response.status = 200
  ctx.response.body = 'Bookmarks Server listening'
})
router.get('/bookmarks', getBookmarks)
router.post('/bookmarks', updateBookmarksCollection)
router.delete('/bookmarks', deleteBookmarks)
router.get('/bookmarks/deleted', getDeletedBookmarks)

const app = new Application()

app.use((ctx, next) => {
  ctx.response.headers.set('Access-Control-Allow-Origin', '*')
  return next()
})
app.use(router.routes())
app.use(router.allowedMethods())

app.listen({ port: 8080 })
console.log('Listening on PORT: 8080')

