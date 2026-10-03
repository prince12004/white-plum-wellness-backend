import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { GalleryItem, GalleryItemSchema } from './schemas/gallery-item.schema';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: GalleryItem.name, schema: GalleryItemSchema }]), AuditLogModule],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
