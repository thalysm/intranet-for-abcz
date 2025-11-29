export interface User {
  id: string
  matricula: string
  whatsAppNumber?: string
  name: string
  email: string
  timeZone: string
  role: UserRole
  createdAt: Date
}

export enum UserRole {
  Associado = 0,
  Admin = 1,
}
