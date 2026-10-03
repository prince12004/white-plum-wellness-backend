import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CustomPage, CustomPageSchema } from './schemas/custom-page.schema';
import { PageBuilderController } from './page-builder.controller';
import { PageBuilderService } from './page-builder.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: CustomPage.name, schema: CustomPageSchema }]), AuditLogModule],
  controllers: [PageBuilderController],
  providers: [PageBuilderService],
  exports: [PageBuilderService],
})
export class PageBuilderModule {}
