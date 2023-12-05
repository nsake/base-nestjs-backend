import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CreateInvestmentDto } from './dto/create-investment.dto';
import { Investment, InvestmentDocument } from './models/investments.model';
import { TPaginationOption } from 'src/infrastructure/types/pagination.types';
import { makePagination } from 'src/infrastructure/utils/pagination.util';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectModel(Investment.name)
    private readonly investmentModel: Model<InvestmentDocument>,
  ) {}

  public create(createInvestmentDto: CreateInvestmentDto) {
    return this.investmentModel.create(createInvestmentDto);
  }

  public findAll(userId: string, query: TPaginationOption) {
    return makePagination.call(query, this.investmentModel);
  }

  public async uniteInvestments(investmentsIds: string[]) {
    const investments = await this.investmentModel
      .find({ _id: { $in: investmentsIds } })
      .sort({ createdAt: 'desc' });

    //! Rename const later !//
    const theMostOldInvestment = investments[0];

    theMostOldInvestment.amount = investments.reduce(
      (accumulator, investment) => accumulator + investment.amount,
      theMostOldInvestment.amount,
    );

    return this.update(theMostOldInvestment._id, theMostOldInvestment);
  }

  private update(id: string, updateInvestmentDto: Partial<Investment>) {
    return this.investmentModel.findByIdAndUpdate(id, updateInvestmentDto);
  }
}
