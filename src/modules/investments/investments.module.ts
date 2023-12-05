import { Module } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { InvestmentsController } from './investments.controller';
import { UserModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Investment, InvestmentSchema } from './models/investments.model';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Investment.name,
        useFactory: () => {
          const schema = InvestmentSchema;

          return schema;
        },
      },
    ]),
    UserModule,
  ],
  controllers: [InvestmentsController],
  providers: [InvestmentsService],
})
export class InvestmentsModule {}
