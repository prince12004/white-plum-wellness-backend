import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { HomepageCmsController } from './homepage-cms.controller';
import { HomepageCmsService } from './homepage-cms.service';
import { HomepageContent, HomepageContentSchema } from './schemas/homepage-content.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HomepageContent.name, schema: HomepageContentSchema }]),
    AuditLogModule,
  ],
  controllers: [HomepageCmsController],
  providers: [HomepageCmsService],
})
export class HomepageCmsModule {}
