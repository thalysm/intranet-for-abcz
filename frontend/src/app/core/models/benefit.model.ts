export interface Benefit {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  imageUrl?: string;
  buttonAction?: string;
  createdAt: string;
  updatedAt?: string;
  createdByUserId: string;
  createdByName?: string;
}

export interface CreateBenefitRequest {
  name: string;
  description: string;
  isActive: boolean;
  imageUrl?: string;
  buttonAction?: string;
}

export interface UpdateBenefitRequest {
  name: string;
  description: string;
  isActive: boolean;
  imageUrl?: string;
  buttonAction?: string;
}

export interface BenefitCard {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  buttonAction?: string;
}