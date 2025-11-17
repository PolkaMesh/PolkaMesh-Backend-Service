import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { KeyringPair } from '@polkadot/keyring/types';

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private api: ApiPromise;
  private keyring: Keyring;
  private workerAccount: KeyringPair;
  private adminAccount: KeyringPair;

  async onModuleInit() {
    await this.connect();
    this.initializeAccounts();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.logger.log(`📡 Connecting to ${process.env.RPC_URL}...`);

      const provider = new WsProvider(process.env.RPC_URL);
      this.api = await ApiPromise.create({ provider });

      const chain = await this.api.rpc.system.chain();
      const version = await this.api.rpc.system.version();

      this.logger.log(`✅ Connected to ${chain} (${version})`);
    } catch (error) {
      this.logger.error(`❌ Failed to connect: ${error.message}`);
      throw error;
    }
  }

  private initializeAccounts() {
    try {
      this.keyring = new Keyring({ type: 'sr25519' });

      // Worker account (for TEE simulation)
      const workerSeed = process.env.WORKER_SEED || '//Worker//TEE//Simulation';
      this.workerAccount = this.keyring.addFromUri(workerSeed);
      this.logger.log(`🔑 Worker account: ${this.workerAccount.address}`);

      // Admin account (for payment operations)
      const adminSeed = process.env.ADMIN_SEED || '//Admin';
      this.adminAccount = this.keyring.addFromUri(adminSeed);
      this.logger.log(`🔑 Admin account: ${this.adminAccount.address}`);
    } catch (error) {
      this.logger.error(`❌ Failed to initialize accounts: ${error.message}`);
      throw error;
    }
  }

  private async disconnect() {
    if (this.api) {
      await this.api.disconnect();
      this.logger.log('🔌 Disconnected from blockchain');
    }
  }

  getApi(): ApiPromise {
    if (!this.api) {
      throw new Error('Blockchain API not initialized');
    }
    return this.api;
  }

  getWorkerAccount(): KeyringPair {
    return this.workerAccount;
  }

  getAdminAccount(): KeyringPair {
    return this.adminAccount;
  }

  getKeyring(): Keyring {
    return this.keyring;
  }

  async getCurrentBlockNumber(): Promise<number> {
    const header = await this.api.rpc.chain.getHeader();
    return header.number.toNumber();
  }

  async getBalance(address: string): Promise<string> {
    const account: any = await this.api.query.system.account(address);
    return account.data.free.toString();
  }
}
