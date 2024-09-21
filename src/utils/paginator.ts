
export const paginateData = ({
    data,
    limit,
    page,
  }: {
    data: any[];
    limit: number;
    page: number;
  }) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return data.slice(startIndex, endIndex);
  };
  