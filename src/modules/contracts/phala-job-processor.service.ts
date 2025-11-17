import { Injectable } from '@nestjs/common';
import { BaseContractService } from './base-contract.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { KeyringPair } from '@polkadot/keyring/types';

@Injectable()
export class PhalaJobProcessorService extends BaseContractService {
  constructor(private readonly blockchainService: BlockchainService) {
    super(
      blockchainService.getApi(),
      process.env.PHALA_JOB_PROCESSOR,
      'phala_job_processor.json',
      'PhalaJobProcessorService',
    );
  }

  /**
   * Get confidential job details
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
   * Record attestation proof on-chain
   */
  async recordAttestation(
    jobId: number,
    resultHash: string,
    attestationProof: string,
    teeWorkerPubkey: string,
  ) {
    try {
      this.logger.log(`📝 Recording attestation for job ${jobId}`);

      const worker = this.blockchainService.getWorkerAccount();
      const result = await this.execute(
        'recordAttestation',
        worker,
        jobId,
        resultHash,
        attestationProof,
        teeWorkerPubkey,
      );

      this.logger.log(`✅ Attestation recorded for job ${jobId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to record attestation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get attestation for a job
   */
  async getAttestation(jobId: number) {
    try {
      const result = await this.query(
        'getAttestation',
        this.blockchainService.getWorkerAccount().address,
        jobId,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get attestation ${jobId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify attestation proof
   */
  async verifyAttestation(jobId: number): Promise<boolean> {
    try {
      const result = await this.query(
        'verifyAttestation',
        this.blockchainService.getWorkerAccount().address,
        jobId,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to verify attestation: ${error.message}`);
      return false;
    }
  }
}
