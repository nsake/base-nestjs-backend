import { Controller, UseGuards, Query, Get, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { AccessTokenGuard } from 'src/infrastructure/guards/acess_token.guard';
import { UsersService } from './users.service';

import { SchemaValidationPipe } from 'src/infrastructure/pipes/schema_validation.pipe';
import { TPaginationOptionDto } from 'src/infrastructure/dtos/pagination.dto';
import { TPaginationOption } from 'src/infrastructure/types/pagination.types';

@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('find-all')
  async generateQrCode(
    @Query(new SchemaValidationPipe(TPaginationOptionDto, ['sort'])) query: TPaginationOption,
  ) {
    return this.userService.findWithPagination(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }
}
