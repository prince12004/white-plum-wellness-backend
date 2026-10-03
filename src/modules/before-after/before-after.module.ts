import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { BeforeAfterResult, BeforeAfterResultSchema } from './schemas/before-after-result.schema';
import { BeforeAfterController } from './before-after.controller';
import { BeforeAfterService } from './before-after.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BeforeAfterResult.name, schema: BeforeAfterResultSchema }]),
    AuditLogModule,
  ],
  controllers: [BeforeAfterController],
  providers: [BeforeAfterService],
  exports: [BeforeAfterService],
})
export class BeforeAfterModule {}
