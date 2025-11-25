import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SdkModule } from './modules/sdk/sdk.module';
import { ApiModule } from './modules/api/api.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Scheduling for background tasks
    ScheduleModule.forRoot(),

    // SDK module for real blockchain integration
    SdkModule,

    // API module with real contract calls
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
