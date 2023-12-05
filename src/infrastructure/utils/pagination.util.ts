import { Model } from 'mongoose';

export async function makePagination<ModelDocument>(model: Model<ModelDocument>) {
  const page = Number(this.page) || 1;
  const pageSize = Number(this.pageSize) || 50;

  try {
    const aggregation = await model.aggregate([
      {
        $unset: ['otpUrl', 'password', 'kycSelfie', 'emailToken', 'twoFactorAuthSecret'],
      },
      {
        $facet: {
          metadata: [{ $count: 'totalCount' }],
          data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
        },
      },
    ]);

    return {
      metadata: {
        totalCount: aggregation[0].metadata[0].totalCount,
        page,
        pageSize,
      },
      data: aggregation[0].data,
    };
  } catch (error) {
    return error;
  }
}
