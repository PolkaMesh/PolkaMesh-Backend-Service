import { Module } from '@nestjs/common';
import { PaymentEscrowService } from './payment-escrow.service';
import { AIJobQueueService } from './ai-job-queue.service';
import { ComputeProviderService } from './compute-provider.service';
import { DataNFTService } from './data-nft.service';
import { PhalaJobProcessorService } from './phala-job-processor.service';
import { MEVProtectionService } from './mev-protection.service';
import { PhatContractService } from './phat-contract.service';
import { ContractsController } from './contracts.controller';

@Module({
  controllers: [ContractsController],
  providers: [
    PaymentEscrowService,
    AIJobQueueService,
    ComputeProviderService,
    DataNFTService,
    PhalaJobProcessorService,
    MEVProtectionService,
    PhatContractService,
  ],
  exports: [
    PaymentEscrowService,
    AIJobQueueService,
    ComputeProviderService,
    DataNFTService,
    PhalaJobProcessorService,
    MEVProtectionService,
    PhatContractService,
  ],
})
export class ContractsModule {}
