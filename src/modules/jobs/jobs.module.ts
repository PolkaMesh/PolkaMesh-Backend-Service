import { Module } from '@nestjs/common';
import { ContractsModule } from '../contracts/contracts.module';
import { AttestationModule} from '../attestation/attestation.module';
import { JobExecutorService } from './job-executor.service';
import { EventListenerService } from './event-listener.service';

@Module({
  imports: [ContractsModule, AttestationModule],
  providers: [JobExecutorService, EventListenerService],
  exports: [JobExecutorService, EventListenerService],
})
export class JobsModule {}
