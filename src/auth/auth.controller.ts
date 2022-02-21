import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import { Roles } from "./roles-auth.decorator";
import { EmailVerifyGuard } from "./email-verify.guard";
import { RolesGuard } from "./roles.guard";

@ApiTags("Authorization")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService
  ) {}

  @Post("/login")
  async login(@Body() userDto: LoginUserDto, @Res() res: Response) {
    const result = await this.authService.login(userDto);
    if (result?.refreshToken) {
      res.setHeader(
        "Set-Cookie",
        `refreshToken=${result?.refreshToken}; HttpOnly; Path=/; Max-Age=${
          30 * 24 * 60 * 60 * 1000
        }`
      );
    }
    return res.status(200).send(result);
  }

  @Post("/admin/login")
  async admin_login(@Body() userDto: LoginUserDto, @Res() res: Response) {
    const result = await this.authService.login_admin(userDto);
    if (result?.enabled_2fa) {
      return res.status(200).send(result);
    }
    res.setHeader(
      "Set-Cookie",
      `refreshToken=${result?.refreshToken}; HttpOnly; Path=/; Max-Age=${
        30 * 24 * 60 * 60 * 1000
      }`
    );
    return res.status(200).send(result);
  }

  @Post("/admin/wallet/login")
  async admin_login_wallet(@Body() userDto: LoginUserDto) {
    const result = await this.authService.admin_login_wallet(userDto);
    return result;
  }

  @Get("/2fa/google")
  async two_factor_google(@Res() response: Response, @Body() body: any) {
    const user = await this.userService.getUserByEmail(body.email);
    const {
      otpauthUrl,
      base32,
    } = this.authService.getTwoFactorAuthenticationCode();
    user.google2fa_secret = base32;
    await user.save();
    await this.authService.respondWithQRCode(otpauthUrl, response);
  }

  @ApiOperation({ summary: "Get Admin User Info" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post("/user/info")
  async getUserInfo(@Body() body: any) {
    const user = await this.userService.getUserInfoByWalletAddress(
      body.wallet_address
    );
    return user;
  }

  @Post("/2fa/verify")
  async two_factor_verify(@Body() body: any, @Res() res: Response) {
    const result = await this.authService.verifyTwoFactorAuthenticationCode(
      body.google_code,
      body.email_code,
      body.email
    );

    if (result.refreshToken.length) {
      res.setHeader(
        "Set-Cookie",
        `refreshToken=${result?.refreshToken}; HttpOnly; Path=/; Max-Age=${
          30 * 24 * 60 * 60 * 1000
        }`
      );
    }
    return res.status(200).send(result);
  }

  @Post("/2fa/email")
  async two_factor_email(@Body() body: any) {
    await this.authService.sendActivationCodeMail(body.email);
  }

  @Post("/registration")
  async registration(@Body() userDto: CreateUserDto) {
    const result = await this.authService.registration(userDto);
    return result;
  }

  @Get("/logout")
  async logout(@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = req.cookies;
    await this.authService.logout(refreshToken);
    res.setHeader("Set-Cookie", `refreshToken=; HttpOnly; Path=/; Max-Age=0`);
    return res.status(200).send();
  }

  @Get("/refresh")
  async refresh(@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = req.cookies;
    const tokens = await this.authService.refresh(refreshToken);

    res.setHeader(
      "Set-Cookie",
      `refreshToken=${tokens?.refreshToken}; HttpOnly; Path=/; Max-Age=${
        30 * 24 * 60 * 60 * 1000
      }`
    );
    return res.status(200).send(tokens);
  }

  @Get("/activate/:active_link")
  async activate(@Req() req: Request, @Res() res: Response) {
    await this.userService.activate(req.params.active_link);
    return res.redirect(process.env.CLIENT_URL);
  }
}
