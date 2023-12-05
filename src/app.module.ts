import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { configuration } from './infrastructure/config/configuration';
import { SocketModule } from './modules/helpers/sockets/socket.module';
import { UserModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CountersModule } from './modules/helpers/counters/counters.module';
import { AwsModule } from './modules/helpers/aws/aws.module';
import { EmailModule } from './modules/helpers/email/email.module';
import { RedisPropagatorModule } from './adapters/redis-propagator/redis-propagator.module';
import { AdminModule } from './modules/admin/admin.module';
import { InvestmentsModule } from './modules/investments/investments.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 30,
        },
      ],
    }),

    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [configuration],
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('database.uri'),
      }),
      inject: [ConfigService],
    }),

    AwsModule,
    EmailModule,
    CountersModule,
    SocketModule,

    RedisPropagatorModule,

    UserModule,
    AuthModule,
    AdminModule,
    InvestmentsModule,
  ],
})
export class AppModule {}
