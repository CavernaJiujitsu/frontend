export type PageLink = {
  href: string;
};

export type PageMeta = {
  page: number;
  totalPage: number;
  total: number;
};

export type PageLinks = {
  self: PageLink;
  first: PageLink;
  prev: PageLink | null;
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
