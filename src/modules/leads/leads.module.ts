import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, LeadSchema } from './schemas/lead.schema';

/**
 * Bare stub module — registers the Lead collection ahead of the WhatsApp/CRM phase
 * so the AuditLog "leads" module name and future guards have a real target.
 */
@Module({
  imports: [MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }])],
  exports: [MongooseModule],
})
export class LeadsModule {}
