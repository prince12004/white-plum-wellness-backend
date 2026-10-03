import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { hashValue, verifyHash } from '../../common/utils/hash.util';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmailWithPassword(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase() }).select('+passwordHash').populate('role').exec();
  }

  async findByIdWithRefreshHash(id: string) {
    return this.userModel.findById(id).select('+refreshTokenHash').populate('role').exec();
  }

  async findAll(query: ListUsersQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.role) filter.role = new Types.ObjectId(query.role);
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.userModel
        .find(filter)
        .populate('role', 'key label')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return toPaginatedResult(items, total, page, pageSize);
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).populate('role', 'key label').lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto, actorId: string) {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new ConflictException('A user with this email already exists');

    const passwordHash = await hashValue(dto.password);
    const created = await this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: new Types.ObjectId(dto.roleId),
      phone: dto.phone ?? null,
      createdBy: new Types.ObjectId(actorId),
      updatedBy: new Types.ObjectId(actorId),
    });
    // Re-fetch rather than returning the in-memory document: `select: false` on
    // passwordHash only applies to query results, not documents just created in this
    // process, so returning `created` directly would leak the password hash.
    const fresh = await this.userModel.findById(created._id).populate('role', 'key label');
    if (!fresh) throw new NotFoundException('User not found after creation');
    return fresh;
  }

  async update(id: string, dto: UpdateUserDto, actorId: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const before = user.toObject();

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.roleId !== undefined) user.role = new Types.ObjectId(dto.roleId);
    if (dto.status !== undefined) user.status = dto.status;
    if (dto.phone !== undefined) user.phone = dto.phone;
    user.updatedBy = new Types.ObjectId(actorId);
    await user.save();

    return { user: await user.populate('role', 'key label'), before };
  }

  /** Soft-delete: mark SUSPENDED rather than removing the document. */
  async softDelete(id: string, actorId: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const before = user.toObject();
    user.status = 'SUSPENDED';
    user.updatedBy = new Types.ObjectId(actorId);
    await user.save();
    return { user, before };
  }

  /**
   * Permanent delete — Super Admin only (enforced by the controller). Guards against
   * the two ways this could brick the admin: deleting your own account, and deleting
   * the last remaining SUPER_ADMIN (which would leave nobody able to manage admins).
   */
  async hardDelete(id: string, actorId: string) {
    if (id === actorId) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    const user = await this.userModel.findById(id).populate<{ role: { _id: Types.ObjectId; key: string } }>(
      'role',
      'key',
    );
    if (!user) throw new NotFoundException('User not found');

    if (user.role?.key === 'SUPER_ADMIN') {
      const otherSuperAdmins = await this.userModel.countDocuments({
        _id: { $ne: user._id },
        role: user.role._id,
      });
      if (otherSuperAdmins === 0) {
        throw new ForbiddenException('Cannot delete the last remaining Super Admin');
      }
    }

    const before = user.toObject();
    await user.deleteOne();
    return { before };
  }

  async changePassword(id: string, dto: ChangePasswordDto, requesterId: string, isSelf: boolean) {
    const user = await this.userModel.findById(id).select('+passwordHash');
    if (!user) throw new NotFoundException('User not found');

    if (isSelf) {
      if (!dto.currentPassword) throw new ForbiddenException('Current password is required');
      const valid = await verifyHash(user.passwordHash, dto.currentPassword);
      if (!valid) throw new ForbiddenException('Current password is incorrect');
    }

    user.passwordHash = await hashValue(dto.newPassword);
    user.mustChangePassword = false;
    user.updatedBy = new Types.ObjectId(requesterId);
    await user.save();
    return user;
  }

  async recordLogin(id: string) {
    await this.userModel.updateOne({ _id: id }, { lastLoginAt: new Date() });
  }

  async setRefreshTokenHash(id: string, refreshTokenHash: string | null) {
    await this.userModel.updateOne({ _id: id }, { refreshTokenHash });
  }
}
