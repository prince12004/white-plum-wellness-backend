import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateHomepageContentDto } from './dto/update-homepage-content.dto';
import { HomepageContent, HomepageContentDocument } from './schemas/homepage-content.schema';

@Injectable()
export class HomepageCmsService {
  constructor(
    @InjectModel(HomepageContent.name) private readonly model: Model<HomepageContentDocument>,
  ) {}

  async getSingleton(): Promise<HomepageContentDocument> {
    let doc = await this.model.findOne();
    if (!doc) {
      doc = await this.model.create({});
    }
    return doc;
  }

  async update(dto: UpdateHomepageContentDto, actorId: string) {
    const doc = await this.getSingleton();
    const before = doc.toObject();

    // class-transformer leaves every declared DTO field present (as `undefined`) even
    // when the client omits it — spreading that directly would overwrite untouched
    // fields with undefined. Only apply keys the client actually sent.
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));

    Object.assign(doc, patch);
    doc.updatedBy = new Types.ObjectId(actorId);
    await doc.save();
    return { doc, before };
  }
}
