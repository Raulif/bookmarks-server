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
