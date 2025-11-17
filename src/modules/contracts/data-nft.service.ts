import { Injectable } from '@nestjs/common';
import { BaseContractService } from './base-contract.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class DataNFTService extends BaseContractService {
  constructor(private readonly blockchainService: BlockchainService) {
    super(
      blockchainService.getApi(),
      process.env.DATA_NFT_REGISTRY,
      'data_nft_registry.json',
      'DataNFTService',
    );
  }

  /**
   * Get data NFT details
   */
  async getDataNFT(tokenId: number) {
    try {
      const result = await this.query(
        'getDataNft',
        this.blockchainService.getWorkerAccount().address,
        tokenId,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get data NFT: ${error.message}`);
      throw error;
    }
  }
}
