import { Module } from '@nestjs/common';

import { RedisPropagatorService } from './redis-propagator.service';
import { SocketModule } from 'src/modules/helpers/sockets/socket.module';

@Module({
  imports: [SocketModule],
  providers: [RedisPropagatorService],
  exports: [RedisPropagatorService],
})
export class RedisPropagatorModule {}
