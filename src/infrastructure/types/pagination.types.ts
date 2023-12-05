export type TSortOption = {
  createdAt: 1 | -1;
};
export type TPaginationOption = {
  page: number;

  pageSize: number;

  sort: TSortOption;
};
