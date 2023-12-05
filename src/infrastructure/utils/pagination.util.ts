import { Model, PipelineStage } from 'mongoose';

interface IPaginationMetadata<M> {
  metadata: {
    total: number;
    page: number;
    pageSize: number;
  };

  data: Array<M>;
}

interface IMakePaginationContext<M> {
  page?: number;
  pageSize?: number;
  filter?: Partial<M>;
  unset?: Array<string>;
  sort?: Record<string, 1 | -1>;
}

export async function makePagination<M>(
  this: IMakePaginationContext<M>,
  model: Model<M>,
): Promise<IPaginationMetadata<M>> {
  const page = +this?.page || 1;
  const pageSize = +this?.pageSize || 10;

  const filter = this?.filter || null;

  const defaultUnset = ['otpUrl', 'password', 'kycSelfie', 'emailToken', 'twoFactorAuthSecret'];

  const unset = this?.unset || defaultUnset;

  const sort = this?.sort || null;

  const stages = [
    {
      $unset: unset,
    },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
      },
    },
  ] as PipelineStage[];

  if (sort)
    stages.unshift({
      $sort: sort,
    });

  if (filter) stages.unshift({ $match: filter });

  try {
    const aggregation = await model.aggregate(stages);

    return {
      metadata: {
        total: aggregation[0].metadata[0].totalCount,
        page,
        pageSize,
      },
      data: aggregation[0].data,
    };
  } catch (error) {
    return error;
  }
}
