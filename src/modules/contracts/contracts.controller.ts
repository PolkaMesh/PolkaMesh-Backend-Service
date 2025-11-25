import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PhatContractService } from './phat-contract.service';
import { MEVProtectionService } from './mev-protection.service';
import { ComputeProviderService } from './compute-provider.service';
import { DataNFTService } from './data-nft.service';

@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly phatService: PhatContractService,
    private readonly mevService: MEVProtectionService,
    private readonly providerService: ComputeProviderService,
    private readonly dataNFTService: DataNFTService,
  ) {}

  @Get('info')
  getContractAddresses() {
    return {
      paymentEscrow: process.env.PAYMENT_ESCROW,
      aiJobQueue: process.env.AI_JOB_QUEUE,
      computeProviderRegistry: process.env.COMPUTE_PROVIDER_REGISTRY,
      dataNFTRegistry: process.env.DATA_NFT_REGISTRY,
      mevProtection: process.env.MEV_PROTECTION,
      phalaJobProcessor: process.env.PHALA_JOB_PROCESSOR,
      phatContract: this.phatService.getConfig(),
      rpcUrl: process.env.RPC_URL,
      chainName: process.env.CHAIN_NAME || 'Paseo Testnet',
    };
  }

  @Get('health')
  async healthCheck() {
    const phatHealth = await this.phatService.healthCheck();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      contracts: {
        paymentEscrow: { status: 'deployed', address: process.env.PAYMENT_ESCROW },
        aiJobQueue: { status: 'deployed', address: process.env.AI_JOB_QUEUE },
        computeProviderRegistry: { status: 'deployed', address: process.env.COMPUTE_PROVIDER_REGISTRY },
        dataNFTRegistry: { status: 'deployed', address: process.env.DATA_NFT_REGISTRY },
        mevProtection: { status: 'deployed', address: process.env.MEV_PROTECTION },
        phalaJobProcessor: { status: 'deployed', address: process.env.PHALA_JOB_PROCESSOR },
        phatContract: phatHealth,
      },
    };
  }

  @Get('phat/statistics')
  async getPhatStatistics() {
    try {
      const stats = await this.phatService.getStatistics();
      return {
        success: true,
        ...stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('phat/dashboard')
  getPhatDashboard() {
    return {
      dashboardUrl: this.phatService.getDashboardUrl(),
      contractId: this.phatService.getConfig().contractId,
    };
  }

  @Post('mev/submit-intent')
  async submitMEVIntent(@Body() body: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    minAmountOut: string;
    accountAddress: string;
  }) {
    try {
      const intentId = Math.floor(Math.random() * 1000000);

      return {
        success: true,
        intentId,
        message: 'Intent submitted for MEV protection',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('mev/savings')
  async getMEVSavings() {
    // Mock MEV savings data
    return {
      success: true,
      totalSaved: '2500000000000000', // 2.5 DOT
      batchesProcessed: 47,
      avgSavingsPerBatch: '53191489361702', // ~0.053 DOT
      lastUpdated: new Date().toISOString(),
    };
  }

  @Get('providers/list')
  async listProviders() {
    // Mock provider list
    return {
      success: true,
      providers: [
        {
          address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
          endpoint: 'https://provider1.example.com',
          computeTypes: ['GPU_V100', 'CPU_EPYC'],
          reputation: 4.8,
          pricePerHour: '1000000000000000',
          available: true,
        },
        {
          address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
          endpoint: 'https://provider2.example.com',
          computeTypes: ['GPU_A100', 'TPU_V3'],
          reputation: 4.9,
          pricePerHour: '2000000000000000',
          available: true,
        },
      ],
    };
  }

  @Get('data-nfts/list')
  async listDataNFTs() {
    // Mock Data NFT list
    return {
      success: true,
      nfts: [
        {
          nftId: 101,
          owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          metadataUri: 'ipfs://QmXyz123...',
          price: '5000000000000000',
          privacyLevel: 'Private',
          category: 'IoT Sensor Data',
          description: 'Smart city traffic sensor data - 1 month',
        },
        {
          nftId: 102,
          owner: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
          metadataUri: 'ipfs://QmAbc456...',
          price: '8000000000000000',
          privacyLevel: 'Private',
          category: 'Medical Imaging',
          description: 'Anonymized X-ray dataset - 500 images',
        },
      ],
    };
  }
}
