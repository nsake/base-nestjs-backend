import { Controller, UseGuards, Query, Get } from '@nestjs/common';
import { AccessTokenGuard } from 'src/infrastructure/guards/acess_token.guard';
import { UsersService } from './users.service';
import { TPaginationOptionDto } from './users.dto';
import { SchemaValidationPipe } from 'src/infrastructure/pipes/schema_validation.pipe';

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
}
