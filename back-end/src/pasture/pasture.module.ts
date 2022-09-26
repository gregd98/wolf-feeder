import { Module } from '@nestjs/common';
import { PastureGateway } from './pasture.gateway';

@Module({
  providers: [PastureGateway],
})
export class PastureModule {}
