import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
  ) {}

  findAll() {
    return this.roleModel.find().populate('permissions').sort({ createdAt: 1 }).lean();
  }

  async findById(id: string) {
    const role = await this.roleModel.findById(id).populate('permissions').lean();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  listPermissions() {
    return this.permissionModel.find().sort({ module: 1, action: 1 }).lean();
  }

  /** Used by AuthService to embed flat permission keys in the JWT payload. */
  async getPermissionKeysForRole(roleId: Types.ObjectId): Promise<{ roleKey: string; permissions: string[] }> {
    const role = await this.roleModel.findById(roleId).populate<{ permissions: Permission[] }>('permissions').lean();
    if (!role) throw new NotFoundException('Role not found');
    return {
      roleKey: role.key,
      permissions: role.permissions.map((p) => p.key),
    };
  }

  async create(dto: CreateRoleDto, actorId: string) {
    const existing = await this.roleModel.findOne({ key: dto.key.toUpperCase() });
    if (existing) throw new ConflictException('A role with this key already exists');

    const role = await this.roleModel.create({
      key: dto.key.toUpperCase(),
      label: dto.label,
      description: dto.description ?? null,
      permissions: dto.permissionIds.map((id) => new Types.ObjectId(id)),
      isSystem: false,
      createdBy: new Types.ObjectId(actorId),
      updatedBy: new Types.ObjectId(actorId),
    });
    return role.populate('permissions');
  }

  async update(id: string, dto: UpdateRoleDto, actorId: string) {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException('Role not found');

    const before = role.toObject();

    // System roles' key/label/description are fixed by the seed configuration —
    // only their permission set can be edited from the admin UI.
    if (!role.isSystem) {
      if (dto.label !== undefined) role.label = dto.label;
      if (dto.description !== undefined) role.description = dto.description;
    }
    if (dto.permissionIds !== undefined) {
      role.permissions = dto.permissionIds.map((pid) => new Types.ObjectId(pid));
    }
    role.updatedBy = new Types.ObjectId(actorId);
    await role.save();

    return { role: await role.populate('permissions'), before };
  }

  async remove(id: string) {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }
    await role.deleteOne();
    return role;
  }
}
