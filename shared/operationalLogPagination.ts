export type OperationalLogLike = {
  timestamp: number;
  type: string;
  category: string;
  courseId: string;
  details: unknown;
};

export function normalizeOperationalLogPage(page: number, pageSize: number) {
  const normalizedPage = Math.max(1, Math.floor(page));
  const normalizedPageSize = Math.min(100, Math.max(10, Math.floor(pageSize)));
  return { page: normalizedPage, pageSize: normalizedPageSize, offset: (normalizedPage - 1) * normalizedPageSize };
}

export function paginateOperationalLogs<T extends OperationalLogLike>(items: T[], page: number, pageSize: number, search?: string) {
  const { page: normalizedPage, pageSize: normalizedPageSize } = normalizeOperationalLogPage(page, pageSize);
  const term = search?.trim().toLocaleLowerCase("fr-FR");
  const filtered = term
    ? items.filter((item) => `${item.type} ${item.category} ${item.courseId} ${JSON.stringify(item.details)}`.toLocaleLowerCase("fr-FR").includes(term))
    : items;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / normalizedPageSize));
  const safePage = Math.min(normalizedPage, totalPages);
  const offset = (safePage - 1) * normalizedPageSize;
  return { items: filtered.slice(offset, offset + normalizedPageSize), total, page: safePage, pageSize: normalizedPageSize, totalPages };
}
