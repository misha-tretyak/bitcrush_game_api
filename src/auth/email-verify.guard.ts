import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";

@Injectable()
export class EmailVerifyGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userServise: UsersService
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedException({ message: "User is not authorized" });
      }

      const bearer = authHeader.split(" ")[0];
      const token = authHeader.split(" ")[1];

      if (bearer !== "Bearer" || !token) {
        throw new UnauthorizedException({ message: "User is not authorized" });
      }

      const userData = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      req.user = userData;
      const user = await this.userServise.getUserById(userData.id);
      if (!user?.email_verified_at) {
        throw new HttpException("Email not verified", HttpStatus.FORBIDDEN);
      }

      return true;
    } catch (e) {
      throw new HttpException("Email not verified", HttpStatus.FORBIDDEN);
    }
  }
}
