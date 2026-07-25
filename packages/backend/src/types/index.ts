export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  org_id?: string;
}
