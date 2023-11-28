import { EmailService } from './email.service';
import { Module } from '@nestjs/common';

@Module({
  exports: [EmailService],
  providers: [EmailService],
})
export class EmailModule {}
