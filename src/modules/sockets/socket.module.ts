import { Module } from '@nestjs/common';
import { SocketStateService } from './socket.service';
import { SocketsGateway } from './sockets.gateway';

@Module({
  providers: [SocketStateService, SocketsGateway],
  exports: [SocketStateService],
})
export class SocketModule {}
