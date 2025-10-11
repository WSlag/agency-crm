export type EntityStatus = 'active' | 'inactive' | 'archived' | 'deleted';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: EntityStatus;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  metadata?: Record<string, any>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  metadata: {
    total: number;
    page: number;
    limit: number;
  };
}
