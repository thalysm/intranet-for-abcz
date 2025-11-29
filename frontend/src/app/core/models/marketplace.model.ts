export interface MarketplaceItem {
  id: string
  title: string
  description: string
  price: number
  type: MarketplaceItemType
  imageUrl?: string
  contactInfo: string
  userId: string
  isActive: boolean
  createdAt: Date
}

export enum MarketplaceItemType {
  Product = 0,
  Service = 1,
}
