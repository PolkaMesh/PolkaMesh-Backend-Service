import { Injectable } from '@nestjs/common';
import { BaseContractService } from './base-contract.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class MEVProtectionService extends BaseContractService {
  constructor(private readonly blockchainService: BlockchainService) {
    super(
      blockchainService.getApi(),
      process.env.MEV_PROTECTION,
      'mev_protection.json',
      'MEVProtectionService',
    );
  }

  /**
   * Get intent details
   */
  async getIntent(intentId: number) {
    try {
      const result = await this.query(
        'getIntent',
        this.blockchainService.getWorkerAccount().address,
        intentId,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get intent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get batch details
   */
  async getBatch(batchId: number) {
    try {
      const result = await this.query(
        'getBatch',
        this.blockchainService.getWorkerAccount().address,
        batchId,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get batch: ${error.message}`);
      throw error;
    }
  }
}
