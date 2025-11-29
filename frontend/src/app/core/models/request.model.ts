export interface RequestType {
  id: string
  name: string
  createdAt: string
  updatedAt?: string
}

export interface Request {
  id: string
  typeId: string
  typeName: string
  status: number
  statusName: string
  userId: string
  userName: string
  response?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateRequestRequest {
  typeId: string
}

export interface UpdateRequestStatusRequest {
  status: number
  response?: string
}

export interface CreateRequestTypeRequest {
  name: string
}