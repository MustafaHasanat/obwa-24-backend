export function getPaginationDetails({
  totalRecords,
  pageSize,
  page,
}: {
  totalRecords: number;
  pageSize: number;
  page: number;
}) {
  const pagesCount = Math.ceil(totalRecords / pageSize);
  const nextPage = page < pagesCount ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  return {
    pagesCount,
    nextPage,
    prevPage,
  };
}
