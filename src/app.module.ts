import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { AttestationModule } from './modules/attestation/attestation.module';
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

    // Core modules
    BlockchainModule,
    ContractsModule,
    JobsModule,
    AttestationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
