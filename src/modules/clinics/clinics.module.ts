import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { Clinic, ClinicSchema } from './schemas/clinic.schema';
import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Clinic.name, schema: ClinicSchema }]), AuditLogModule],
  controllers: [ClinicsController],
  providers: [ClinicsService],
  exports: [MongooseModule, ClinicsService],
})
export class ClinicsModule {}
