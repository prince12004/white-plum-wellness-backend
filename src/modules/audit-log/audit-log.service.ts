import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model, Types } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { AuditAction, AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface RecordAuditInput {
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  module: string;
  entityId?: string | null;
  entityLabel?: string | null;
  before?: unknown;
  after?: unknown;
  req?: Request;
}

export interface AuditLogQuery {
  page?: number;
  pageSize?: number;
  module?: string;
  actorId?: string;
}

@Injectable()
export class AuditLogService {
  constructor(@InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>) {}

  async record(input: RecordAuditInput): Promise<void> {
    await this.auditLogModel.create({
      actor: new Types.ObjectId(input.actorId),
      actorEmail: input.actorEmail,
      action: input.action,
      module: input.module,
      entityId: input.entityId ? new Types.ObjectId(input.entityId) : null,
      entityLabel: input.entityLabel ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
      ipAddress: input.req?.ip ?? null,
      userAgent: input.req?.headers['user-agent'] ?? null,
    });
  }

  async findAll(query: AuditLogQuery) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.module) filter.module = query.module;
    if (query.actorId) filter.actor = new Types.ObjectId(query.actorId);

    const [items, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('actor', 'name email')
        .lean(),
      this.auditLogModel.countDocuments(filter),
    ]);

    return toPaginatedResult(items, total, page, pageSize);
  }
}
