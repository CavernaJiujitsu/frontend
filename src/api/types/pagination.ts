export type PageLink = {
  href: string;
};

export type PageMeta = {
  /** Current page number (1-based). */
  page: number;
  /** Total number of pages. */
  totalPage: number;
  /** Total number of items across all pages. */
  total: number;
};

export type PageLinks = {
  self: PageLink;
  first: PageLink;
  /** Null when the current page is the first one. */
  prev: PageLink | null;
  /** Null when the current page is the last one. */
  next: PageLink | null;
  last: PageLink;
};

export type PaginatedResponse<T> = {
  data: T[];
  _meta: PageMeta;
  _links: PageLinks;
};

export type PageParams = {
  page?: number;
  limit?: number;
  search?: string;
};
