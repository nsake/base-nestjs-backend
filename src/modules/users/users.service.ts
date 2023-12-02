import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from './users.model';
import { CountersService } from '../helpers/counters/counters.service';
import { makePagination } from 'src/infrastructure/utils/pagination.util';
import { TPaginationOption } from 'src/infrastructure/types/pagination.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    private counterService: CountersService,
  ) {}

  async create(createUserDto: Partial<User>) {
    const userId = await this.counterService.findCounterAndIncrease('user');

    const createdUser = new this.userModel({
      ...createUserDto,
      userId,
    });

    return createdUser.save();
  }

  findById(id: string) {
    this.userModel.aggregate;
    return this.userModel.findById(id);
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  findWithQuery(query: FilterQuery<User>) {
    return this.userModel.findOne(query);
  }

  findOneByIdAndUpdate(id: string, updateUserDto: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  findWithPagination({ page, pageSize }: TPaginationOption) {
    return makePagination.call({ page, pageSize }, this.userModel);
  }
}
