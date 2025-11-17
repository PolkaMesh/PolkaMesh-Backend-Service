import { Injectable } from '@nestjs/common';
import { BaseContractService } from './base-contract.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class PaymentEscrowService extends BaseContractService {
  constructor(private readonly blockchainService: BlockchainService) {
    super(
      blockchainService.getApi(),
      process.env.PAYMENT_ESCROW,
      'payment_escrow.json',
      'PaymentEscrowService',
    );
  }

  /**
   * Release payment to provider after job completion
   */
  async releasePayment(jobId: number) {
    try {
      this.logger.log(`💰 Releasing payment for job ${jobId}`);

      const admin = this.blockchainService.getAdminAccount();
      const result = await this.execute('releasePayment', admin, jobId);

      this.logger.log(`✅ Payment released for job ${jobId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to release payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refund payment to job owner if job fails
   */
  async refundPayment(jobId: number) {
    try {
      this.logger.log(`🔙 Refunding payment for job ${jobId}`);

      const admin = this.blockchainService.getAdminAccount();
      const result = await this.execute('refund', admin, jobId);

      this.logger.log(`✅ Payment refunded for job ${jobId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get escrow status for a job
   */
  async getEscrowStatus(jobId: number) {
    try {
      const result = await this.query(
        'getEscrowStatus',
        this.blockchainService.getAdminAccount().address,
        jobId,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to get escrow status: ${error.message}`);
      throw error;
    }
  }
}
