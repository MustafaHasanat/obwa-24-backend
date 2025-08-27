export type CustomResponse<T> = {
  message: string;
  payload: T | null;
  status: number;
  extra?: Record<string, string>;
};

export type CustomPaginatedResponse<T> = CustomResponse<T[]> & {
  count: number;
  next: number | null;
  pagesCount: number | null;
  previous: number | null;
};

export type PaginationParams = {
  pageSize?: number;
  page?: number;
};
