import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { configuration } from './infrastructure/config/configuration';
import { SocketModule } from './modules/sockets/socket.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 50,
        },
      ],
    }),

    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    SocketModule,
  ],
})
export class AppModule {}
