import { Injectable, Logger } from '@nestjs/common';
import { ContractPromise } from '@polkadot/api-contract';
import { ApiPromise } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export abstract class BaseContractService {
  protected contract: ContractPromise;
  protected readonly logger: Logger;

  constructor(
    protected readonly api: ApiPromise,
    protected readonly contractAddress: string,
    protected readonly abiFileName: string,
    loggerName: string,
  ) {
    this.logger = new Logger(loggerName);
    this.initializeContract();
  }

  private initializeContract() {
    try {
      // Load ABI
      const abiPath = path.join(process.cwd(), 'abis', this.abiFileName);
      const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

      // Create contract instance
      this.contract = new ContractPromise(this.api, abi, this.contractAddress);

      this.logger.log(`✅ Contract initialized: ${this.contractAddress}`);
    } catch (error) {
      this.logger.error(`❌ Failed to initialize contract: ${error.message}`);
      throw error;
    }
  }

  /**
   * Query contract (read-only, no gas cost)
   */
  protected async query(
    method: string,
    caller: string,
    ...args: any[]
  ): Promise<any> {
    try {
      const { result, output } = await this.contract.query[method](
        caller,
        { gasLimit: -1 },
        ...args,
      );

      if (result.isOk) {
        return output?.toJSON();
      } else {
        throw new Error(`Query failed: ${result.asErr}`);
      }
    } catch (error) {
      this.logger.error(`Query ${method} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute contract transaction (state-changing, costs gas)
   */
  protected async execute(
    method: string,
    signer: KeyringPair,
    ...args: any[]
  ): Promise<any> {
    try {
      this.logger.log(`🔄 Executing ${method}...`);

      const tx = this.contract.tx[method](
        { gasLimit: -1 },
        ...args,
      );

      return new Promise((resolve, reject) => {
        tx.signAndSend(signer, ({ status, events }) => {
          if (status.isInBlock) {
            this.logger.log(`✅ ${method} included in block`);

            // Check for contract events
            events.forEach(({ event }) => {
              if (this.api.events.system.ExtrinsicFailed.is(event)) {
                reject(new Error('Transaction failed'));
              }
            });

            resolve({ status, events });
          }
        }).catch(reject);
      });
    } catch (error) {
      this.logger.error(`Execute ${method} failed: ${error.message}`);
      throw error;
    }
  }

  getContract(): ContractPromise {
    return this.contract;
  }

  getAddress(): string {
    return this.contractAddress;
  }
}
