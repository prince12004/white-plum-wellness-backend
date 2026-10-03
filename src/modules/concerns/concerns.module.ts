import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { Concern, ConcernSchema } from './schemas/concern.schema';
import { ConcernsController } from './concerns.controller';
import { ConcernsService } from './concerns.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Concern.name, schema: ConcernSchema }]), AuditLogModule],
  controllers: [ConcernsController],
  providers: [ConcernsService],
  exports: [ConcernsService],
})
export class ConcernsModule {}
