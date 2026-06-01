export const createPaginationMeta = ({
  page,
  limit,
  total
}: {
  page: number;
  limit: number;
  total: number;
}) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit))
});
