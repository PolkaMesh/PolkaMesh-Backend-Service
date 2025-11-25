import { Module } from '@nestjs/common';
import { ContractsModule } from '../contracts/contracts.module';
import { AttestationModule} from '../attestation/attestation.module';
import { JobExecutorService } from './job-executor.service';
import { EventListenerService } from './event-listener.service';
import { JobsController } from './jobs.controller';

@Module({
  imports: [ContractsModule, AttestationModule],
  controllers: [JobsController],
  providers: [JobExecutorService, EventListenerService],
  exports: [JobExecutorService, EventListenerService],
})
export class JobsModule {}
