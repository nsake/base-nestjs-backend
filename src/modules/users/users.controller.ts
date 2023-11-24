import {
  Body,
  Post,
  Query,
  UseGuards,
  Controller,
  Delete,
  Param,
  Patch,
  Get,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/infrastructure/guards/acess_token.guard';
import { TOptions } from 'src/infrastructure/types/options';
import { TUserFilters } from './user.dto';

import { CurrentUser } from 'src/infrastructure/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AccessTokenGuard)
  @Post('/all')
  getAllByType(
    @Body()
    params: TUserFilters,
    @Query() query: TOptions,

    @CurrentUser() user: any,
  ) {
    return this.usersService.findAll(query, params, user);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/buyers')
  getAllBuyers(
    @Body()
    params: TUserFilters,
    @Query() query: TOptions,

    @CurrentUser() user: any,
  ) {
    return this.usersService.findBuyers(query, params, user);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/affiliates_managers')
  findAllAffiliates(
    @Body()
    params: TUserFilters,
    @Query() query: TOptions,
  ) {
    return this.usersService.findAllAffiliates(query, params);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/all/filters')
  getAllForFilters(
    @Body()
    params: TUserFilters,
    @Query() query: TOptions,
  ) {
    return this.usersService.findAll(query, params);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/all/without-command')
  getAllWithoutCommand(@Body() params: TUserFilters, @Query() query: TOptions) {
    return this.usersService.findAllWithoutCommand(query, params);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/:userId')
  getOne(@Param('userId') userId: string) {
    return this.usersService.findById(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('/:userId')
  remove(@Param('userId') userId: string) {
    return this.usersService.remove(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('edit')
  editExact(@CurrentUser('id') userId: string, @Body() payload: any) {
    delete payload.role;

    return this.usersService.update(userId, payload);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('assign_helpers/:userId')
  async assign_helpers(@Param('userId') userId: string, @Body() payload: any) {
    const user = (await this.usersService.findByClearId(userId)) as any;

    const helpers = [
      ...new Set([
        ...user.helpers,
        ...payload.helpers.map((id) => new mongoose.Types.ObjectId(id)),
      ]),
    ];

    return this.usersService.update(userId, { helpers });
  }

  @UseGuards(AccessTokenGuard)
  @Patch('remove_helpers/:userId')
  async remove_helpers(@Param('userId') userId: string, @Body() payload: any) {
    const user = (await this.usersService.findByClearId(userId)) as any;

    const payloadHelper = new mongoose.Types.ObjectId(payload?.helpers[0]);

    const index = user?.helpers.findIndex((id) => id === payloadHelper);

    user.helpers.splice(index, 1);

    return this.usersService.update(userId, { helpers: user.helpers });
  }

  @UseGuards(AccessTokenGuard)
  @Patch('/:id')
  editById(@Param('id') userId: string, @Body() payload: any) {
    return this.usersService.update(userId, payload);
  }

  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  @Post('avatar')
  async updateUser(
    @CurrentUser('id') userId,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return await this.usersService.updateUser(userId, image);
  }

  // Cards //

  @UseGuards(AccessTokenGuard)
  @Post('cards')
  createCard(@Body() payload: any) {
    return this.usersService.createCard(payload);
  }

  @UseGuards(AccessTokenGuard)
  @Get('cards/one/:cardId')
  getOneCard(@Param('cardId') cardId: string) {
    return this.usersService.getOneCard(cardId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('cards/close/:cardId')
  setCloseCard(@Param('cardId') cardId: string) {
    return this.usersService.setCloseCard(cardId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('cards/open/:cardId')
  setOpenCard(@Param('cardId') cardId: string) {
    return this.usersService.setOpenCard(cardId);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('cards/:cardId')
  editCard(@Param('cardId') cardId: string, @Body() payload: any) {
    return this.usersService.editCard(cardId, payload);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('cards/:cardId')
  deleteCard(@Param('cardId') cardId: string) {
    return this.usersService.deleteCard(cardId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('cards/all')
  getCards(
    @CurrentUser('id') userId: string,
    @CurrentUser('rules') rules: any[],
    @Query() query: TOptions,
  ) {
    return this.usersService.getCards(userId, rules, query);
  }
}
