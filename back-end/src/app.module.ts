import { Module } from '@nestjs/common';
import { PastureModule } from './pasture/pasture.module';

@Module({
  imports: [PastureModule],
})
export class AppModule {}
