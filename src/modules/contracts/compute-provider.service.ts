import { Injectable } from '@nestjs/common';
import { BaseContractService } from './base-contract.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class ComputeProviderService extends BaseContractService {
  constructor(private readonly blockchainService: BlockchainService) {
    super(
      blockchainService.getApi(),
      process.env.COMPUTE_PROVIDER_REGISTRY,
      'compute_provider_registry.json',
      'ComputeProviderService',
    );
  }

  /**
   * Get provider information
   */
  async getProviderInfo(providerAddress: string) {
    try {
      const result = await this.query(
        'getProviderInfo',
        this.blockchainService.getWorkerAccount().address,
        providerAddress,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get provider info: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all active providers
   */
  async getActiveProviders() {
    try {
      const result = await this.query(
        'getActiveProviders',
        this.blockchainService.getWorkerAccount().address,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get active providers: ${error.message}`);
      return [];
    }
  }
}
