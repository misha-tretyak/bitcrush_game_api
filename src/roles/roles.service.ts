import { Injectable, Logger } from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Role } from "./roles.model";

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role) private roleRepository: typeof Role) {}
  private logger: Logger = new Logger("RolesService");

  async createRole(dto: CreateRoleDto) {
    try {
      const role = await this.roleRepository.create(dto);
      return role;
    } catch (err) {
      this.logger.debug(err, "Create Role Error");
    }
  }

  async getRoleByValue(value: string) {
    try {
      const role = await this.roleRepository.findOne({ where: { value } });
      return role;
    } catch (err) {
      this.logger.debug(err, "Get Role By Id Error");
    }
  }
}
