import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings, SettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>) {}

  /** Singleton pattern: there is always exactly one Settings document. */
  async getSingleton(): Promise<SettingsDocument> {
    let settings = await this.settingsModel.findOne();
    if (!settings) {
      settings = await this.settingsModel.create({});
    }
    return settings;
  }

  async update(dto: UpdateSettingsDto, actorId: string) {
    const settings = await this.getSingleton();
    const before = settings.toObject();

    // class-transformer leaves every declared DTO field present (as `undefined`) even
    // when the client omits it from the request body — spreading that directly into
    // Object.assign would overwrite untouched fields (including required ones like
    // businessName) with undefined, which Mongoose then rejects on save. Only the keys
    // the client actually sent should ever reach the document.
    const sentKeys = Object.entries(dto).filter(([, v]) => v !== undefined);
    const patch = Object.fromEntries(sentKeys) as Partial<UpdateSettingsDto>;

    Object.assign(settings, {
      ...patch,
      socialLinks: dto.socialLinks ? { ...settings.socialLinks, ...dto.socialLinks } : settings.socialLinks,
      marketingPixels: dto.marketingPixels
        ? { ...settings.marketingPixels, ...dto.marketingPixels }
        : settings.marketingPixels,
      seoDefaults: dto.seoDefaults ? { ...settings.seoDefaults, ...dto.seoDefaults } : settings.seoDefaults,
      address: dto.address ? { ...settings.address, ...dto.address } : settings.address,
    });
    settings.updatedBy = new Types.ObjectId(actorId);
    await settings.save();

    return { settings, before };
  }
}
