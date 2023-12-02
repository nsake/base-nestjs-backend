import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

import { RedisSocketEventSendDTO } from './dto/socket-event-send.dto';

import { WebSocketServer } from '@nestjs/websockets';
import { SocketStateService } from 'src/modules/helpers/sockets/socket.service';

@Injectable()
export class RedisPropagatorService {
  @WebSocketServer() socketServer: Server;

  public constructor(private readonly socketStateService: SocketStateService) {}

  public injectSocketServer(server: Server): RedisPropagatorService {
    this.socketServer = server;

    return this;
  }

  public propagateEventToExactUser(
    eventInfo: RedisSocketEventSendDTO,
  ): boolean {
    if (!eventInfo.userId) return false;

    const { userId, event, data } = eventInfo;

    const socket = this.socketStateService.get(userId);

    if (socket) {
      socket.emit(event, data);

      return true;
    }

    return false;
  }
}
