import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from './users.model';
import { CountersService } from '../helpers/counters/counters.service';

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
}
