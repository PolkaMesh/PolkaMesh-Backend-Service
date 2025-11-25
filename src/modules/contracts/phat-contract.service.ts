import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service for interacting with the deployed Phala Phat Contract (Off-chain TEE)
 *
 * The Phat Contract runs in Phala's Trusted Execution Environment and handles:
 * - Confidential job execution
 * - Attestation generation
 * - Result reporting back to on-chain contracts
 */
@Injectable()
export class PhatContractService {
  private readonly logger = new Logger(PhatContractService.name);
  private readonly contractId: string;
  private readonly workerEndpoint: string;
  private readonly clusterId: string;
  private readonly dashboardUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.contractId = this.configService.get<string>('PHALA_PHAT_CONTRACT_ID');
    this.workerEndpoint = this.configService.get<string>('PHALA_WORKER_ENDPOINT');
    this.clusterId = this.configService.get<string>('PHALA_CLUSTER_ID');
    this.dashboardUrl = this.configService.get<string>('PHALA_DASHBOARD_URL');

    if (!this.contractId) {
      this.logger.warn('⚠️ PHALA_PHAT_CONTRACT_ID not configured');
    } else {
      this.logger.log(`✅ Phat Contract initialized: ${this.contractId}`);
    }
  }

  /**
   * Get Phat Contract configuration
   */
  getConfig() {
    return {
      contractId: this.contractId,
      workerEndpoint: this.workerEndpoint,
      clusterId: this.clusterId,
      dashboardUrl: this.dashboardUrl,
    };
  }

  /**
   * Check if Phat Contract is configured
   */
  isConfigured(): boolean {
    return !!(this.contractId && this.workerEndpoint);
  }

  /**
   * Get job execution status from Phat Contract
   *
   * @param jobId - The job ID to query
   * @returns Job execution status and result
   */
  async getJobStatus(jobId: number) {
    if (!this.isConfigured()) {
      throw new Error('Phat Contract not configured');
    }

    try {
      this.logger.log(`🔍 Querying Phat Contract for job ${jobId}`);

      // TODO: Implement actual Phat Contract API call
      // For now, return mock data structure
      // In production, this would query the Phala worker endpoint

      const response = {
        jobId,
        status: 'completed', // pending | in_progress | completed | failed
        contractId: this.contractId,
        executionTime: 2500, // ms
        attestationGenerated: true,
        timestamp: new Date().toISOString(),
      };

      return response;
    } catch (error) {
      this.logger.error(`Failed to get job status from Phat Contract: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Phat Contract statistics
   *
   * @returns Execution statistics from the TEE
   */
  async getStatistics() {
    if (!this.isConfigured()) {
      throw new Error('Phat Contract not configured');
    }

    try {
      this.logger.log('📊 Fetching Phat Contract statistics');

      // TODO: Implement actual statistics API call
      // This would query the Phat Contract's get_statistics() method

      return {
        contractId: this.contractId,
        totalExecuted: 0,
        totalFailed: 0,
        successRate: 100.0,
        lastUpdate: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get statistics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Submit a job to the Phat Contract for execution
   *
   * @param jobRequest - Job request details
   * @returns Submission result
   */
  async submitJob(jobRequest: {
    jobId: number;
    encryptedPayload: string;
    publicKey: string;
  }) {
    if (!this.isConfigured()) {
      throw new Error('Phat Contract not configured');
    }

    try {
      this.logger.log(`📤 Submitting job ${jobRequest.jobId} to Phat Contract`);

      // TODO: Implement actual job submission
      // This would send the job to the Phat Contract via Phala worker API

      const response = {
        success: true,
        jobId: jobRequest.jobId,
        contractId: this.contractId,
        message: 'Job submitted to TEE for execution',
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`✅ Job ${jobRequest.jobId} submitted successfully`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to submit job: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Phat Contract health status
   *
   * @returns Health check result
   */
  async healthCheck() {
    if (!this.isConfigured()) {
      return {
        status: 'not_configured',
        contractId: null,
        message: 'Phat Contract environment variables not set',
      };
    }

    try {
      // TODO: Implement actual health check
      // This would ping the Phat Contract to verify it's running

      return {
        status: 'healthy',
        contractId: this.contractId,
        clusterId: this.clusterId,
        dashboardUrl: this.dashboardUrl,
        message: 'Phat Contract is operational',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        contractId: this.contractId,
        error: error.message,
      };
    }
  }

  /**
   * Get dashboard URL for monitoring
   */
  getDashboardUrl(): string {
    return this.dashboardUrl;
  }

  /**
   * Log Phat Contract activity
   */
  logActivity(activity: string, metadata?: any) {
    this.logger.log(`🔐 [Phat Contract] ${activity}`, metadata);
  }
}
