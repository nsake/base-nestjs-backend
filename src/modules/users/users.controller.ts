import { Controller, UseGuards, Query, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { AccessTokenGuard } from 'src/infrastructure/guards/acess_token.guard';
import { UsersService } from './users.service';

import { SchemaValidationPipe } from 'src/infrastructure/pipes/schema_validation.pipe';
import { CurrentUser } from 'src/infrastructure/decorators/current-user.decorator';
import { TPaginationOptionDto } from 'src/infrastructure/dtos/pagintaion.dto';
import { ChangePasswordUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @UseGuards(AccessTokenGuard)
  @Get('find-all')
  async generateQrCode(
    @Query(new SchemaValidationPipe(TPaginationOptionDto))
    query: TPaginationOptionDto,
  ) {
    return this.userService.findWithPagination(query);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
