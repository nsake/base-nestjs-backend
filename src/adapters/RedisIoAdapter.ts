import { createClient } from 'redis';
import { JwtService } from '@nestjs/jwt';
import { ServerOptions, Socket } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { ForbiddenException, INestApplicationContext } from '@nestjs/common';

import { AuthService } from 'src/modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(private app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const configService = this.app.get(ConfigService);

    const pubClient = createClient({
      socket: {
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
      },
    });

    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);

    const authService = this.app.get(AuthService);
    const jwtService = this.app.get(JwtService);

    server.use(createTokenMiddleware(authService, jwtService));
    return server;
  }
}

const createTokenMiddleware =
  (authService: AuthService, jwtService: JwtService) =>
  async (socket: Socket & { userId: string }, next) => {
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];

    try {
      const payload = await jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      socket.userId = payload.sub;

      next();
    } catch (err) {
      socket.emit('unauthorized');

      next(new ForbiddenException(err));
    }
  };
