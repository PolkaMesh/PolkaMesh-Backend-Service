import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';
import { createHash } from 'crypto';

@Injectable()
export class AttestationService {
  private readonly logger = new Logger(AttestationService.name);

  constructor(private readonly blockchainService: BlockchainService) {}

  /**
   * Generate attestation proof for job result
   * In production with Phat, this happens in TEE with SGX attestation
   */
  async generateAttestation(jobId: number, result: any) {
    this.logger.log(`🔐 Generating attestation for job ${jobId}`);

    try {
      const worker = this.blockchainService.getWorkerAccount();

      // Create message to sign
      const message = `${jobId}:${result.resultHash}:${result.executionTime}`;

      // Sign with worker keypair (simulates TEE signing)
      const signature = worker.sign(message);

      // Create attestation
      const attestation = {
        jobId,
        resultHash: result.resultHash,
        attestationProof: Buffer.from(signature).toString('hex'),
        teeWorkerPubkey: worker.address,
        timestamp: Date.now(),
      };

      this.logger.log(`✅ Attestation generated for job ${jobId}`);
      return attestation;
    } catch (error) {
      this.logger.error(`Failed to generate attestation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify attestation proof
   * In production, this verifies SGX/TEE signatures
   */
  async verifyAttestation(attestation: any): Promise<boolean> {
    try {
      const worker = this.blockchainService.getWorkerAccount();

      // Reconstruct message
      const message = `${attestation.jobId}:${attestation.resultHash}:${attestation.timestamp}`;

      // Verify signature
      const signatureBytes = Buffer.from(attestation.attestationProof, 'hex');
      const isValid = worker.verify(message, signatureBytes, worker.publicKey);

      return isValid;
    } catch (error) {
      this.logger.error(`Attestation verification failed: ${error.message}`);
      return false;
    }
  }
}
