import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { PhalaJobProcessorService } from '../contracts/phala-job-processor.service';
import { PaymentEscrowService } from '../contracts/payment-escrow.service';
import { AIJobQueueService } from '../contracts/ai-job-queue.service';
import { JobExecutorService } from './job-executor.service';
import { AttestationService } from '../attestation/attestation.service';

@Injectable()
export class EventListenerService implements OnModuleInit {
  private readonly logger = new Logger(EventListenerService.name);

  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly phalaJobService: PhalaJobProcessorService,
    private readonly paymentEscrowService: PaymentEscrowService,
    private readonly jobQueueService: AIJobQueueService,
    private readonly jobExecutorService: JobExecutorService,
    private readonly attestationService: AttestationService,
  ) {}

  async onModuleInit() {
    // Start listening for events after module initialization
    await this.startListening();
  }

  /**
   * Start listening for blockchain events
   */
  private async startListening() {
    this.logger.log('👂 Starting event listener...');

    const api = this.blockchainService.getApi();

    // Subscribe to all system events
    api.query.system.events((events) => {
      events.forEach((record) => {
        const { event } = record;

        // Listen for contract events
        if (event.section === 'contracts') {
          this.handleContractEvent(event);
        }
      });
    });

    this.logger.log('✅ Event listener active');
  }

  /**
   * Handle contract events
   */
  private async handleContractEvent(event: any) {
    try {
      // Check if event is ContractEmitted
      if (event.method === 'ContractEmitted') {
        const [contractAddress, data] = event.data;
        const addressStr = contractAddress.toString();

        // Decode and handle based on which contract emitted it
        if (addressStr === process.env.PHALA_JOB_PROCESSOR) {
          await this.handlePhalaJobEvent(data);
        } else if (addressStr === process.env.AI_JOB_QUEUE) {
          await this.handleJobQueueEvent(data);
        } else if (addressStr === process.env.MEV_PROTECTION) {
          await this.handleMEVEvent(data);
        }
      }
    } catch (error) {
      this.logger.error(`Error handling contract event: ${error.message}`);
    }
  }

  /**
   * Handle Phala Job Processor events
   */
  private async handlePhalaJobEvent(data: any) {
    try {
      // Decode event using contract ABI
      const contract = this.phalaJobService.getContract();
      const decodedEvent = contract.abi.decodeEvent(data);

      this.logger.log(`📥 Phala event: ${decodedEvent.event.identifier}`);

      // Handle JobSubmitted event
      if (decodedEvent.event.identifier === 'JobSubmitted') {
        const jobId = Number(decodedEvent.args[0].toString());
        const encryptedPayload = decodedEvent.args[1].toString();

        this.logger.log(`🆕 New job submitted: ${jobId}`);

        // Process the job
        await this.processJob(jobId, encryptedPayload);
      }
    } catch (error) {
      this.logger.error(`Error handling Phala event: ${error.message}`);
    }
  }

  /**
   * Handle AI Job Queue events
   */
  private async handleJobQueueEvent(data: any) {
    try {
      const contract = this.jobQueueService.getContract();
      const decodedEvent = contract.abi.decodeEvent(data);

      this.logger.log(`📥 JobQueue event: ${decodedEvent.event.identifier}`);

      // Handle specific events if needed
      // Example: JobStatusChanged, JobAssigned, etc.
    } catch (error) {
      this.logger.error(`Error handling JobQueue event: ${error.message}`);
    }
  }

  /**
   * Handle MEV Protection events
   */
  private async handleMEVEvent(data: any) {
    try {
      // Decode and handle MEV events
      this.logger.log(`📥 MEV event received`);
      // TODO: Implement MEV batch processing if needed
    } catch (error) {
      this.logger.error(`Error handling MEV event: ${error.message}`);
    }
  }

  /**
   * Process a job end-to-end
   * This is the main orchestration function
   */
  private async processJob(jobId: number, encryptedPayload: string) {
    try {
      this.logger.log(`\n${'='.repeat(60)}`);
      this.logger.log(`🎯 PROCESSING JOB ${jobId}`);
      this.logger.log(`${'='.repeat(60)}\n`);

      // Step 1: Update job status to InProgress
      this.logger.log(`[1/5] Updating job status to InProgress...`);
      await this.jobQueueService.updateJobStatus(jobId, 'InProgress');

      // Step 2: Execute job
      this.logger.log(`[2/5] Executing job...`);
      const result = await this.jobExecutorService.executeJob(jobId, encryptedPayload);

      if (!result.success) {
        throw new Error(`Job execution failed: ${result.error}`);
      }

      // Step 3: Generate attestation
      this.logger.log(`[3/5] Generating attestation...`);
      const attestation = await this.attestationService.generateAttestation(jobId, result);

      // Step 4: Record attestation on-chain
      this.logger.log(`[4/5] Recording attestation on-chain...`);
      await this.phalaJobService.recordAttestation(
        jobId,
        attestation.resultHash,
        attestation.attestationProof,
        attestation.teeWorkerPubkey,
      );

      // Step 5: Release payment
      this.logger.log(`[5/5] Releasing payment...`);
      await this.paymentEscrowService.releasePayment(jobId);

      // Step 6: Update job status to Completed
      await this.jobQueueService.updateJobStatus(jobId, 'Completed');

      this.logger.log(`\n${'='.repeat(60)}`);
      this.logger.log(`✅ JOB ${jobId} COMPLETED SUCCESSFULLY`);
      this.logger.log(`${'='.repeat(60)}\n`);
    } catch (error) {
      this.logger.error(`\n${'='.repeat(60)}`);
      this.logger.error(`❌ JOB ${jobId} FAILED: ${error.message}`);
      this.logger.error(`${'='.repeat(60)}\n`);

      // Refund payment on failure
      try {
        await this.paymentEscrowService.refundPayment(jobId);
        await this.jobQueueService.updateJobStatus(jobId, 'Failed');
      } catch (refundError) {
        this.logger.error(`Failed to refund payment: ${refundError.message}`);
      }
    }
  }
}
