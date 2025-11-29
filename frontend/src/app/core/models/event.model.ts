import type { User } from "./user.model"

export interface Event {
  id: string
  title: string
  description: string
  eventDate: Date
  location: string
  createdAt: Date
  createdByUserId: string
  createdBy?: User
  confirmations?: EventConfirmation[]
}

export interface EventConfirmation {
  id: string
  eventId: string
  userId: string
  status: ConfirmationStatus
  responseDate: Date
  user?: User
}

export enum ConfirmationStatus {
  Pending = 0,
  Confirmed = 1,
  Declined = 2,
}
