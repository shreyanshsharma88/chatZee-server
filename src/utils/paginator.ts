
export const paginateData = ({
    data,
    limit,
    page,
  }: {
    data: any[];
    limit?: number;
    page?: number;
  }) => {
    if(!limit || !page ) return data
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return data.slice(startIndex, endIndex);
  };
  