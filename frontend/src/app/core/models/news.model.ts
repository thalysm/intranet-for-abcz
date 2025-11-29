export interface News {
  id: string
  title: string
  content: string
  imageUrl?: string
  publishedAt: Date
  createdByUserId: string
  comments?: NewsComment[]
}

export interface NewsComment {
  id: string
  newsId: string
  userId: string
  content: string
  createdAt: Date
}
