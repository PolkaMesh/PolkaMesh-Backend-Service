import { Injectable } from '@nestjs/common';
import { BaseContractService } from './base-contract.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class AIJobQueueService extends BaseContractService {
  constructor(private readonly blockchainService: BlockchainService) {
    super(
      blockchainService.getApi(),
      process.env.AI_JOB_QUEUE,
      'ai_job_queue.json',
      'AIJobQueueService',
    );
  }

  /**
   * Get job details
   */
  async getJob(jobId: number) {
    try {
      const result = await this.query(
        'getJob',
        this.blockchainService.getWorkerAccount().address,
        jobId,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get job ${jobId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId: number, status: string) {
    try {
      this.logger.log(`🔄 Updating job ${jobId} status to ${status}`);

      const worker = this.blockchainService.getWorkerAccount();
      const result = await this.execute('updateJobStatus', worker, jobId, status);

      this.logger.log(`✅ Job ${jobId} status updated to ${status}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update job status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get total number of jobs
   */
  async getJobCount(): Promise<number> {
    try {
      const result = await this.query(
        'getJobCount',
        this.blockchainService.getWorkerAccount().address,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get job count: ${error.message}`);
      return 0;
    }
  }
}
