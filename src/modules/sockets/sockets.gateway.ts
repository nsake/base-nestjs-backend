import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketStateService } from './socket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private socketStateService: SocketStateService) {}

  handleConnection(socket: Socket & { userId: string }) {
    this.socketStateService.add(socket.userId, socket);
  }

  handleDisconnect(socket: Socket & { userId: string }) {
    this.socketStateService.remove(socket.userId);
  }

  @SubscribeMessage('/common/get-lists')
  async getOnline(): Promise<any> {
    this.socketStateService.getAll();
  }
}
