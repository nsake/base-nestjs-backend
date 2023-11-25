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

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findWithQuery(query: FilterQuery<User>) {
    return this.userModel.findOne(query);
  }

  async findOneByIdAndUpdate(id: string, updateUserDto: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }
}
