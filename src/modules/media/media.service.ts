import { Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { ListMediaAssetsQueryDto } from './dto/list-media-assets-query.dto';
import { UpdateMediaAssetDto } from './dto/update-media-asset.dto';
import { MediaAsset, MediaAssetDocument } from './schemas/media-asset.schema';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

@Injectable()
export class MediaService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(MediaAsset.name) private readonly mediaAssetModel: Model<MediaAssetDocument>,
  ) {}

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloudName'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  async uploadImage(file: Express.Multer.File, originalName: string, uploadedBy: string | null) {
    if (!this.configService.get<string>('cloudinary.cloudName')) {
      throw new InternalServerErrorException(
        'Image uploads are not configured yet — set CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET',
      );
    }

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'white-plum-wellness', resource_type: 'image' },
        (error, uploadResult) => {
          if (error || !uploadResult) return reject(error ?? new Error('Upload failed'));
          resolve(uploadResult as CloudinaryUploadResult);
        },
      );
      stream.end(file.buffer);
    });

    // Every upload is tracked as a reusable, admin-editable MediaAsset (not just a
    // bare URL) — this is what powers the Media Library's name/alt-text/category
    // management, without adding any friction to the existing upload flow.
    const asset = await this.mediaAssetModel.create({
      cloudinaryPublicId: result.public_id,
      url: result.secure_url,
      name: originalName.replace(/\.[^/.]+$/, ''),
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      uploadedBy,
    });

    return { url: asset.url, assetId: String(asset._id) };
  }

  async findAll(query: ListMediaAssetsQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.category) filter.category = query.category;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };

    const [items, total] = await Promise.all([
      this.mediaAssetModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.mediaAssetModel.countDocuments(filter),
    ]);

    return toPaginatedResult(items, total, page, pageSize);
  }

  async update(id: string, dto: UpdateMediaAssetDto) {
    const asset = await this.mediaAssetModel.findById(id);
    if (!asset) throw new NotFoundException('Media asset not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(asset, patch);
    await asset.save();
    return asset;
  }

  async remove(id: string) {
    const asset = await this.mediaAssetModel.findById(id);
    if (!asset) throw new NotFoundException('Media asset not found');
    try {
      await cloudinary.uploader.destroy(asset.cloudinaryPublicId);
    } catch {
      // best-effort — still remove the local record even if Cloudinary cleanup fails
    }
    await asset.deleteOne();
  }

  /** Used by the one-time migration script — uploads from a remote URL instead of a multer buffer. */
  async uploadFromUrl(sourceUrl: string, name: string, category: string | null) {
    const result = await cloudinary.uploader.upload(sourceUrl, {
      folder: 'white-plum-wellness/migrated',
      resource_type: 'image',
    });
    return this.mediaAssetModel.create({
      cloudinaryPublicId: result.public_id,
      url: result.secure_url,
      name,
      category,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      uploadedBy: null,
    });
  }
}
