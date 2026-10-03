import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ListCampaignsQueryDto } from './dto/list-campaigns-query.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Campaign, CampaignDocument } from './schemas/campaign.schema';

@Injectable()
export class CampaignsService {
  constructor(@InjectModel(Campaign.name) private readonly campaignModel: Model<CampaignDocument>) {}

  async findAll(query: ListCampaignsQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.status !== undefined) filter.status = query.status;

    const [items, total] = await Promise.all([
      this.campaignModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.campaignModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async findById(id: string) {
    const campaign = await this.campaignModel.findById(id).lean();
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async create(dto: CreateCampaignDto) {
    return this.campaignModel.create(dto);
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const campaign = await this.campaignModel.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(campaign, patch);
    await campaign.save();
    return campaign;
  }

  async remove(id: string) {
    const campaign = await this.campaignModel.findByIdAndDelete(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return { success: true };
  }
}
