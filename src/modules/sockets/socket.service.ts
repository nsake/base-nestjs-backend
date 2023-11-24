import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketStateService {
  private socketState = {} as Record<string, Socket>;

  public remove(userId: string): boolean {
    delete this.socketState[userId];

    return true;
  }

  public add(userId: string, socket: Socket): boolean {
    this.socketState[userId] = socket;

    return true;
  }

  public get(userId: string): Socket {
    return this.socketState[userId];
  }

  public getAll(): Socket[] {
    return Object.values(this.socketState);
  }
}
