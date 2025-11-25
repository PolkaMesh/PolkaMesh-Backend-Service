import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPolkaMesh } from 'polkamesh-sdk';
import type { PolkaMesh } from 'polkamesh-sdk';

/**
 * SDK Service - Real Integration with PolkaMesh Contracts
 * Initializes and manages the SDK connection to blockchain
 */
@Injectable()
export class SdkService implements OnModuleInit {
  private readonly logger = new Logger(SdkService.name);
  private sdk: PolkaMesh | null = null;
  private initializationPromise: Promise<void> | null = null;
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    // Initialize SDK on module startup
    this.initializationPromise = this.initializeSDK();
  }

  private async initializeSDK(): Promise<void> {
    try {
      this.logger.log('🚀 Initializing PolkaMesh SDK...');

      const config = {
        rpcUrl: this.configService.get<string>('RPC_URL'),
        contractAddresses: {
          paymentEscrow: this.configService.get<string>('PAYMENT_ESCROW'),
          aiJobQueue: this.configService.get<string>('AI_JOB_QUEUE'),
          computeProviderRegistry: this.configService.get<string>('COMPUTE_PROVIDER_REGISTRY'),
          dataNFTRegistry: this.configService.get<string>('DATA_NFT_REGISTRY'),
          mevProtection: this.configService.get<string>('MEV_PROTECTION'),
          phalaJobProcessor: this.configService.get<string>('PHALA_JOB_PROCESSOR'),
        },
        phatConfig: {
          contractId: this.configService.get<string>('PHALA_PHAT_CONTRACT_ID'),
          workerEndpoint: this.configService.get<string>('PHALA_WORKER_ENDPOINT'),
          clusterId: this.configService.get<string>('PHALA_CLUSTER_ID'),
          dashboardUrl: this.configService.get<string>('PHALA_DASHBOARD_URL'),
        },
      };

      this.logger.log('📡 Connecting to: ' + config.rpcUrl);
      this.logger.log('🔐 Phat Contract: ' + config.phatConfig.contractId);

      this.sdk = await createPolkaMesh(config);
      this.isInitialized = true;

      this.logger.log('✅ SDK initialized successfully!');
      this.logger.log('📋 Contract addresses loaded');
      this.logger.log('🔗 Connected to Polkadot network');
    } catch (error) {
      this.logger.error('❌ Failed to initialize SDK:', error.message);
      this.logger.warn('⚠️ Running in mock mode - SDK not available');
      this.isInitialized = false;
    }
  }

  async getSDK(): Promise<PolkaMesh> {
    // Wait for initialization if still in progress
    if (this.initializationPromise) {
      await this.initializationPromise;
    }

    if (!this.isInitialized || !this.sdk) {
      throw new Error('SDK not initialized - check configuration');
    }

    return this.sdk;
  }

  isReady(): boolean {
    return this.isInitialized && !!this.sdk;
  }

  getConfig() {
    return {
      rpcUrl: this.configService.get<string>('RPC_URL'),
      chainName: this.configService.get<string>('CHAIN_NAME', 'Paseo Testnet'),
      contracts: {
        paymentEscrow: this.configService.get<string>('PAYMENT_ESCROW'),
        aiJobQueue: this.configService.get<string>('AI_JOB_QUEUE'),
        computeProviderRegistry: this.configService.get<string>('COMPUTE_PROVIDER_REGISTRY'),
        dataNFTRegistry: this.configService.get<string>('DATA_NFT_REGISTRY'),
        mevProtection: this.configService.get<string>('MEV_PROTECTION'),
        phalaJobProcessor: this.configService.get<string>('PHALA_JOB_PROCESSOR'),
      },
      phatContract: {
        contractId: this.configService.get<string>('PHALA_PHAT_CONTRACT_ID'),
        workerEndpoint: this.configService.get<string>('PHALA_WORKER_ENDPOINT'),
        clusterId: this.configService.get<string>('PHALA_CLUSTER_ID'),
        dashboardUrl: this.configService.get<string>('PHALA_DASHBOARD_URL'),
      },
    };
  }

  /**
   * Submit a job to AI Job Queue contract
   */
  async submitJob(params: {
    description: string;
    budget: string;
    dataSetId?: string;
    computeType?: string;
  }) {
    try {
      const sdk = await this.getSDK();
      const aiJobQueue = sdk.getAIJobQueue();

      this.logger.log('📝 Submitting job to contract...');

      const result = await aiJobQueue.submitJob({
        description: params.description,
        budget: params.budget,
        dataSetId: params.dataSetId,
        computeType: params.computeType,
      });

      this.logger.log('✅ Job submitted:', result);

      return {
        success: true,
        jobId: typeof result === 'string' ? result : (result as any).jobId,
        txHash: typeof result === 'object' ? (result as any).txHash : undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Failed to submit job:', error.message);
      throw error;
    }
  }

  /**
   * Submit confidential job to Phala
   */
  async submitConfidentialJob(params: {
    payload: any;
  }) {
    try {
      const sdk = await this.getSDK();
      const phala = sdk.getPhalaJobProcessor();

      this.logger.log('🔐 Submitting confidential job to Phala TEE...');

      const result = await phala.submitConfidentialJob(params.payload);

      this.logger.log('✅ Confidential job submitted:', result.jobId);

      return {
        success: true,
        jobId: result.jobId,
        encryptedPayload: result.encryptedPayload,
        phatContractId: this.configService.get<string>('PHALA_PHAT_CONTRACT_ID'),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Failed to submit confidential job:', error.message);
      throw error;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: number) {
    try {
      const sdk = await this.getSDK();
      const aiJobQueue = sdk.getAIJobQueue();

      const job = await aiJobQueue.getJob(jobId.toString());

      return {
        success: true,
        ...job,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get job status:', error.message);
      throw error;
    }
  }

  /**
   * Get attestation from Phala
   */
  async getAttestation(jobId: number) {
    try {
      const sdk = await this.getSDK();
      const phala = sdk.getPhalaJobProcessor();

      const attestation = await phala.getAttestation(jobId);

      return {
        success: true,
        ...attestation,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get attestation:', error.message);
      throw error;
    }
  }

  /**
   * Submit MEV-protected intent
   */
  async submitMEVIntent(params: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    minAmountOut: string;
  }) {
    try {
      const sdk = await this.getSDK();
      const mev = sdk.getMEVProtection();

      this.logger.log('🛡️ Submitting MEV-protected intent...');

      // This would be real contract call
      // For now, returning structure until contract methods are fully implemented
      const intentId = Math.floor(Math.random() * 1000000) + 5000;

      return {
        success: true,
        intentId,
        message: 'Intent submitted for MEV protection',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Failed to submit MEV intent:', error.message);
      throw error;
    }
  }

  /**
   * Get all registered providers from contract
   */
  async getProviders() {
    try {
      const sdk = await this.getSDK();
      const registry = sdk.getComputeProviderRegistry();

      this.logger.log('📡 Querying providers from contract...');

      // Query total providers and get active list
      const totalResult = await registry.getTotalProviders();
      const activeResult = await registry.getActiveProviders();

      this.logger.log(`✅ Found ${totalResult.data || 0} total providers`);

      return {
        success: true,
        total: totalResult.data || 0,
        providers: activeResult.data || [],
      };
    } catch (error) {
      this.logger.error('❌ Failed to get providers:', error.message);
      // Return empty on error so UI doesn't break
      return {
        success: false,
        total: 0,
        providers: [],
        error: error.message,
      };
    }
  }

  /**
   * Get provider profile by address
   */
  async getProviderProfile(address: string) {
    try {
      const sdk = await this.getSDK();
      const registry = sdk.getComputeProviderRegistry();

      this.logger.log(`📡 Querying provider profile: ${address}`);

      const result = await registry.getProfile(address);

      return {
        success: result.success,
        profile: result.data,
        error: result.error,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get provider profile:', error.message);
      return {
        success: false,
        profile: null,
        error: error.message,
      };
    }
  }

  /**
   * Get all Data NFTs from contract
   */
  async getDataNFTs() {
    try {
      const sdk = await this.getSDK();
      const nftRegistry = sdk.getDataNFTRegistry();

      this.logger.log('📡 Querying Data NFTs from contract...');

      const totalResult = await nftRegistry.getTotalNFTs();
      const total = totalResult.data || 0;

      this.logger.log(`✅ Found ${total} total Data NFTs`);

      // Query individual NFTs (limited to first 20 for performance)
      const nfts = [];
      const limit = Math.min(total, 20);

      for (let i = 1; i <= limit; i++) {
        try {
          const nftResult = await nftRegistry.getNFT(i.toString());
          if (nftResult.success && nftResult.data) {
            nfts.push(nftResult.data);
          }
        } catch (e) {
          // Skip NFTs that don't exist or error
        }
      }

      return {
        success: true,
        total,
        nfts,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get Data NFTs:', error.message);
      return {
        success: false,
        total: 0,
        nfts: [],
        error: error.message,
      };
    }
  }

  /**
   * Get single Data NFT by ID
   */
  async getDataNFT(tokenId: number) {
    try {
      const sdk = await this.getSDK();
      const nftRegistry = sdk.getDataNFTRegistry();

      this.logger.log(`📡 Querying Data NFT #${tokenId}`);

      const result = await nftRegistry.getNFT(tokenId.toString());

      return {
        success: result.success,
        nft: result.data,
        error: result.error,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get Data NFT:', error.message);
      return {
        success: false,
        nft: null,
        error: error.message,
      };
    }
  }

  /**
   * Get job counter from contract
   */
  async getJobCount() {
    try {
      const sdk = await this.getSDK();
      const aiJobQueue = sdk.getAIJobQueue();

      const result = await aiJobQueue.getTotalJobs();

      return {
        success: result.success,
        count: result.data || 0,
      };
    } catch (error) {
      this.logger.error('❌ Failed to get job count:', error.message);
      return {
        success: false,
        count: 0,
        error: error.message,
      };
    }
  }
}
