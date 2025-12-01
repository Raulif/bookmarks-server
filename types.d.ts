import { RouterContext } from '@oak/oak/router'

export interface Bookmark {
  consumed: boolean
  createdAt: number
  dateAdded: number
  hearable?: boolean
  title: string
  url: string
  dbIndex?: number
  deleted?: boolean
  id: string
  dbId: string
}

export type ContextBookmarks = RouterContext<
  '/bookmarks',
  Record<string | number, string | undefined>,
  // deno-lint-ignore no-explicit-any
  Record<string, any>
>

export type ContextDeletedBookmarks = RouterContext<
  '/bookmarks/deleted',
  Record<string | number, string | undefined>,
  // deno-lint-ignore no-explicit-any
  Record<string, any>
>

export type ContextMarkDeletedBookmarks = RouterContext<
  '/bookmarks/mark-deleted',
  Record<string | number, string | undefined>,
  // deno-lint-ignore no-explicit-any
  Record<string, any>
>
