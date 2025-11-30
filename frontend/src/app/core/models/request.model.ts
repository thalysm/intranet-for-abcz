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
  title?: string
  description?: string
  response?: string
  createdAt: string
  updatedAt?: string
  simulationId?: string // ID da simulação específica escolhida pelo usuário
  // Dados específicos do empréstimo (quando aplicável)
  loanDetails?: {
    wage: number
    loanAmount: number
    numberInstallments: number
  }
}

export interface CreateRequestRequest {
  typeId: string
  title?: string
  description?: string
  simulationId?: string // Para empréstimos, inclui o ID da simulação
}

export interface UpdateRequestStatusRequest {
  status: number
  response?: string
}

export interface CreateRequestTypeRequest {
  name: string
}