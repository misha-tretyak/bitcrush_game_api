import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class WSJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: any
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const token = context.args[0].handshake.auth.token;
    try {
      if (!token) {
        return false;
      }
      const user = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      if (user) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}
