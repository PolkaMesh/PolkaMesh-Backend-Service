import { Module } from '@nestjs/common';
import { PaymentEscrowService } from './payment-escrow.service';
import { AIJobQueueService } from './ai-job-queue.service';
import { ComputeProviderService } from './compute-provider.service';
import { DataNFTService } from './data-nft.service';
import { PhalaJobProcessorService } from './phala-job-processor.service';
import { MEVProtectionService } from './mev-protection.service';

@Module({
  providers: [
    PaymentEscrowService,
    AIJobQueueService,
    ComputeProviderService,
    DataNFTService,
    PhalaJobProcessorService,
    MEVProtectionService,
  ],
  exports: [
    PaymentEscrowService,
    AIJobQueueService,
    ComputeProviderService,
    DataNFTService,
    PhalaJobProcessorService,
    MEVProtectionService,
  ],
})
export class ContractsModule {}
