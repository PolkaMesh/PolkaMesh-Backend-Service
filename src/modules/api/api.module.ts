import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { SdkModule } from '../sdk/sdk.module';

@Module({
  imports: [SdkModule],
  controllers: [ApiController],
})
export class ApiModule {}
