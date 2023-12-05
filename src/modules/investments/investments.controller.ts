import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UpdateInvestmentDto } from './dto/update-investment.dto';
import { AccessTokenGuard } from 'src/infrastructure/guards/acess_token.guard';
import { CurrentUser } from 'src/infrastructure/decorators/current-user.decorator';
import { SchemaValidationPipe } from 'src/infrastructure/pipes/schema_validation.pipe';
import { TPaginationOptionDto } from 'src/infrastructure/dtos/pagination.dto';
import { TPaginationOption } from 'src/infrastructure/types/pagination.types';

@UseGuards(AccessTokenGuard)
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  create(@Body() createInvestmentDto: CreateInvestmentDto) {
    return this.investmentsService.create(createInvestmentDto);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query(new SchemaValidationPipe(TPaginationOptionDto))
    query: TPaginationOption,
  ) {
    return this.investmentsService.findAll(userId, query);
  }
}
