/* eslint-disable @typescript-eslint/no-var-requires */
import { Module } from '@nestjs/common';
import { CountersService } from './counters.service';

import { MongooseModule } from '@nestjs/mongoose';
import { Counters, CountersSchema } from './counters.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Counters.name, schema: CountersSchema },
    ]),
  ],
  providers: [CountersService],

  exports: [CountersService],
})
export class CountersModule {}
