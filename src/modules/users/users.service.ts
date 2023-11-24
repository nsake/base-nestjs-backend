/* eslint-disable @typescript-eslint/no-var-requires */
const aws = require('aws-sdk');

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.model';
import { RegisterDto } from '../auth/auth.dto';
import { TOptions } from 'src/infrastructure/types/options';
import { prepareSearchOptions } from 'src/infrastructure/utils/search-options';
import { TUserFilters } from './user.dto';

import mongoose, { FilterQuery } from 'mongoose';
import { Card, CardDocument, CardStatuses } from './cards/cards.model';
import { Role, RoleDocument, RoleEnum } from '../roles/roles.model';
import { CountersService } from '../counters.service';
import { getRule } from 'src/infrastructure/utils/getRule.utils';
import { EUserRole } from 'src/infrastructure/enums/user_roles.enum';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('user')
    private readonly userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Card.name)
    private readonly cardModel: SoftDeleteModel<CardDocument>,

    @InjectModel(Role.name)
    private readonly roleModel: SoftDeleteModel<RoleDocument>,

    private counterService: CountersService,

    private awsService: AwsService,
  ) {}

  async createCard(payload) {
    const cardId = await this.counterService.findCounterAndIncrease('cards');

    return this.cardModel.create({ ...payload, cardId });
  }

  async editCard(cardId: string, payload: any) {
    return this.cardModel.updateOne({ _id: cardId }, payload);
  }

  async deleteCard(cardId: string) {
    return this.cardModel.deleteOne({ _id: cardId });
  }

  async getOneCard(cardId: string) {
    return this.cardModel
      .findOne({ _id: cardId })
      .populate({
        path: 'buyer',
        populate: {
          path: 'role',
        },
      })
      .populate({
        path: 'command',
      })
      .populate({
        path: 'offer',
      });
  }

  async setOpenCard(cardId: string) {
    return this.cardModel.updateOne(
      { _id: cardId },
      { status: CardStatuses.Open },
    );
  }

  async setCloseCard(cardId: string) {
    return this.cardModel.updateOne(
      { _id: cardId },
      { status: CardStatuses.Closed },
    );
  }

  async findTeamUsers(commandId: string) {
    return await this.userModel.find({ command: commandId }).exec();
  }

  async getCards(userId: string, rules, query: TOptions) {
    const cardsShowOnlyOwn = getRule(rules, 'CardsShowOnlyOwn');

    const { pagination, page } = prepareSearchOptions(query);

    const filters = {
      ...(cardsShowOnlyOwn && {
        buyer: new mongoose.Types.ObjectId(userId),
      }),
    };

    const [records, count] = await Promise.all([
      this.cardModel
        .find(filters, null, pagination)
        .populate({
          path: 'buyer',
          populate: {
            path: 'role',
          },
        })
        .populate({
          path: 'command',
        })
        .populate({
          path: 'payment_system',
        })
        .populate({
          path: 'offer',
        })
        .exec(),
      this.cardModel.count(filters).exec(),
    ]);

    const isNextPage = count / pagination.limit > page + 1;

    return { records, count, isNextPage };
  }

  async createUser(payload: RegisterDto): Promise<User> {
    return this.userModel.create(payload);
  }

  async getUser(query: object): Promise<User> {
    return this.userModel.findOne(query);
  }

  async create(createUserDto: any): Promise<UserDocument> {
    const userId = await this.counterService.findCounterAndIncrease('user');

    const createdUser = new this.userModel({
      ...createUserDto,
      userId,
    });
    return createdUser.save();
  }

  async findAllAffiliates(params: TOptions, query: TUserFilters) {
    const { pagination, page } = prepareSearchOptions(params);

    const filters: FilterQuery<User> = {
      ...(query.status && { status: query.status }),
      ...(query.name && { name: { $regex: query.name, $options: 'i' } }),
    };

    const role = await this.roleModel.findOne({
      name: RoleEnum.AffiliatesManager,
    });

    filters.role = new mongoose.Types.ObjectId(role?._id) || '';

    const [users, count] = await Promise.all([
      this.userModel
        .find(filters, null, pagination)
        .populate('command')
        .populate('role')
        .exec(),
      this.userModel.count(filters).exec(),
    ]);

    const isNextPage = count / pagination.limit > page + 1;

    return { users, count, isNextPage };
  }

  async updateUser(userId: string, image?: any) {
    if (image) {
      const avatarUrl = await this.awsService.uploadFileWithS3(image);

      await this.userModel.updateOne(
        { _id: userId },
        {
          avatarUrl,
        },
      );
    }
  }

  async findAll(params: TOptions, query: TUserFilters, user?: any) {
    const { pagination, page } = prepareSearchOptions(params);

    const filters: FilterQuery<User> = {};

    filters.status = 'active';

    if (user) {
      const usersShowNotActive = getRule(user?.rules, 'usersShowNotActive');

      if (usersShowNotActive) {
        filters.status = {
          $in: ['declined', 'confirmation', 'active', 'fired'],
        };

        if (query.status) {
          filters.status = query.status;
        }
      }
    }

    if (query.name) {
      filters.name = { $regex: query.name, $options: 'i' };
    }

    if (query.role) {
      const role = await this.roleModel.findOne({
        _id: query.role,
      });

      if (role) filters.role = new mongoose.Types.ObjectId(role._id);
    }

    const [users, count] = await Promise.all([
      this.userModel
        .find(filters, null, pagination)
        .populate('command')
        .populate('role')
        .exec(),
      this.userModel.count(filters).exec(),
    ]);

    const isNextPage = count / pagination.limit > page + 1;

    return { users, count, isNextPage };
  }

  async findBuyers(params: TOptions, query: TUserFilters, user: any) {
    const expenseIncomeShowCommandBuyers = getRule(
      user?.rules,
      'expenseIncomeShowCommandBuyers',
    );

    const { pagination, page } = prepareSearchOptions(params);

    const filters: FilterQuery<User> = {
      ...(query.status ? { status: query.status } : { status: 'active' }),
      ...(query.name && { name: { $regex: query.name, $options: 'i' } }),
    };

    if (user.role === EUserRole.TeamLead) {
      const media_buyer = await this.roleModel.findOne({
        name: EUserRole.MediaBuyer,
      });
      const support_buyer = await this.roleModel.findOne({
        name: 'support_buyer',
      });

      if (media_buyer || support_buyer)
        filters.role = {
          $in: [
            new mongoose.Types.ObjectId(support_buyer._id),
            new mongoose.Types.ObjectId(media_buyer._id),
          ],
        };
    }

    if (user.role === EUserRole.Affiliate) {
      const affiliate_manager = await this.userModel.findById(user?.id).exec();

      if (affiliate_manager?.helpers)
        filters._id = {
          $in: affiliate_manager.helpers,
        };
    }

    if (query.roles) {
      const roles = await this.roleModel.find({ name: { $in: query.roles } });

      if (roles)
        filters.role = {
          $in: roles.map((_id) => _id),
        };
    }

    if (expenseIncomeShowCommandBuyers)
      filters.command = new mongoose.Types.ObjectId(user.command._id);

    const [users, count] = await Promise.all([
      this.userModel
        .find(filters, null, pagination)
        .populate('command')
        .populate('role')
        .exec(),
      this.userModel.count(filters).exec(),
    ]);

    const isNextPage = count / pagination.limit > page + 1;

    return { users, count, isNextPage };
  }

  async findAllForFilters(params: TOptions, query: TUserFilters) {
    const { pagination, page } = prepareSearchOptions(params);

    const filters: FilterQuery<User> = {
      status: 'active',
      ...(query.role && { role: query.role }),
      ...(query.status && { status: query.status }),
      ...(query.name && { name: { $regex: query.name, $options: 'i' } }),
    };

    const [users, count] = await Promise.all([
      this.userModel.find(filters, null, pagination).populate('command').exec(),
      this.userModel.count(filters).exec(),
    ]);

    const isNextPage = count / pagination.limit > page + 1;

    return { users, count, isNextPage };
  }

  async findAllWithoutCommand(query: TOptions, params: TUserFilters) {
    const { pagination, page } = prepareSearchOptions(query);

    const filters = {
      ...(params.role && { role: params.role }),
      ...(params.status && { status: params.status }),
      ...(params.name && { name: { $regex: params.name, $options: 'i' } }),
      command: null,
    };

    const [users, count] = await Promise.all([
      this.userModel.find(filters, null, pagination).exec(),
      this.userModel.count(filters).exec(),
    ]);

    const isNextPage = count / pagination.limit > page + 1;

    return { users, count, isNextPage };
  }

  async findById(id: string) {
    return this.userModel
      .findById(id)
      .populate('role')
      .populate({ path: 'helpers', populate: 'role' });
  }

  async findByClearId(id: string) {
    return this.userModel.findById(id);
  }

  async findByIdAndGetRole(id: string) {
    return this.userModel
      .findById(id)
      .populate('role')
      .populate('keitaro_user');
  }

  async findByIdAndGetCommand(id: string) {
    return this.userModel.findById(id).populate('command');
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findByEmailAndGetRole(email: string) {
    return await this.userModel
      .findOne({ email })
      .populate('role')
      .populate('command');
  }

  async remove(userId: string) {
    return this.userModel.updateOne({ _id: userId }, { status: 'fired' });
  }

  async update(id: string, updateUserDto: any) {
    if (updateUserDto?.role === '') delete updateUserDto?.role;

    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }
}
