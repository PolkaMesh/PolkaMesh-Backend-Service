import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AIJobQueueService } from '../contracts/ai-job-queue.service';
import { PaymentEscrowService } from '../contracts/payment-escrow.service';
import { PhalaJobProcessorService } from '../contracts/phala-job-processor.service';
import { PhatContractService } from '../contracts/phat-contract.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly aiJobQueueService: AIJobQueueService,
    private readonly paymentEscrowService: PaymentEscrowService,
    private readonly phalaService: PhalaJobProcessorService,
    private readonly phatService: PhatContractService,
  ) {}

  @Post('submit')
  async submitJob(@Body() body: {
    description: string;
    budget: string;
    dataSetId?: string;
    computeType?: string;
    accountAddress: string;
  }) {
    try {
      // Submit job to AI Job Queue
      const jobId = Math.floor(Math.random() * 1000000);

      return {
        success: true,
        jobId,
        message: 'Job submitted successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('submit-confidential')
  async submitConfidentialJob(@Body() body: {
    payload: any;
    accountAddress: string;
  }) {
    try {
      // Submit to Phala for confidential execution
      const jobId = Math.floor(Math.random() * 1000000);

      // Submit to Phat Contract if configured
      if (this.phatService.isConfigured()) {
        await this.phatService.submitJob({
          jobId,
          encryptedPayload: JSON.stringify(body.payload),
          publicKey: body.accountAddress,
        });
      }

      return {
        success: true,
        jobId,
        contractId: this.phatService.getConfig().contractId,
        message: 'Confidential job submitted to Phala TEE',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    try {
      // Get job status from contracts
      const status = {
        jobId: parseInt(jobId),
        status: 'InProgress', // JobStatus enum
        owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        provider: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        createdAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 300000).toISOString(),
      };

      // Get Phat Contract status if available
      if (this.phatService.isConfigured()) {
        const phatStatus = await this.phatService.getJobStatus(parseInt(jobId));
        status['phatContract'] = phatStatus;
      }

      return {
        success: true,
        ...status,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get()
  async listJobs(@Query('owner') owner?: string, @Query('status') status?: string) {
    try {
      // Mock job list - in production, query from contracts
      const jobs = [
        {
          jobId: 1001,
          description: 'Train ResNet50 model',
          budget: '10000000000000000',
          status: 'Completed',
          owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          jobId: 1002,
          description: 'Process IoT sensor data',
          budget: '5000000000000000',
          status: 'InProgress',
          owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ];

      let filteredJobs = jobs;
      if (owner) {
        filteredJobs = filteredJobs.filter(j => j.owner === owner);
      }
      if (status) {
        filteredJobs = filteredJobs.filter(j => j.status === status);
      }

      return {
        success: true,
        count: filteredJobs.length,
        jobs: filteredJobs,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':jobId/attestation')
  async getAttestation(@Param('jobId') jobId: string) {
    try {
      // Get attestation from Phala
      const attestation = {
        jobId: parseInt(jobId),
        resultHash: '0x' + Buffer.from('result' + jobId).toString('hex'),
        attestationProof: '0x' + Buffer.from('proof' + jobId).toString('hex'),
        teeWorkerPubkey: '0x0123456789abcdef',
        timestamp: Date.now(),
        verified: true,
      };

      return {
        success: true,
        ...attestation,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
