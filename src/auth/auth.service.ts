import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import * as ethUtil from "ethereumjs-util";
import * as sigUtil from "eth-sig-util";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcryptjs";
import { User } from "../users/users.model";
import { JwtService } from "@nestjs/jwt";
import { MailerService } from "@nestjs-modules/mailer";
import { LoginUserDto } from "src/users/dto/login-user.dto";
import { ValidationException } from "src/exceptions/validation.exception";
import { UserSeedsService } from "src/user-seeds/user-seeds.service";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import * as Config from "../config.js";
import { Response } from "express";
import { InjectModel } from "@nestjs/sequelize";
import { TempProfit } from "../temp-profit/temp-profit.model";
const Web3 = require("web3");

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly userSeedService: UserSeedsService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    @InjectModel(TempProfit)
    private readonly tempProfitRepository: typeof TempProfit
  ) {}

  private logger: Logger = new Logger("AuthService");
  provider = new Web3.providers.HttpProvider(process.env.NODE_URL);
  web3 = new Web3(this.provider);
  live_wallet = new this.web3.eth.Contract(
    Config.config.live_wallet.abi,
    Config.config.live_wallet.address
  );
  bankroll = new this.web3.eth.Contract(
    Config.config.bankroll.abi,
    Config.config.bankroll.address
  );

  async login(userDto: LoginUserDto) {
    try {
      const user = await this.validateUser(userDto);
      const tokens = await this.generateToken(user);
      user.remember_token = tokens.refreshToken;
      user.last_login_at = new Date(Date.now());
      user.nonce = Math.floor(Math.random() * 1000000);

      // let user_balance: number = await this.live_wallet.methods
      //   .balanceOf(user.wallet_address)
      //   .call();
      //
      // user_balance = this.web3.utils.fromWei(user_balance.toString());
      // console.log(user_balance, "balance LW");
      // let temp_user_profit = await this.tempProfitRepository.sum("profit", {
      //   where: { wallet: user.wallet_address },
      // });
      //
      // console.log(temp_user_profit, "tmp_profit");
      //
      // if (temp_user_profit) {
      //   user_balance = Number(user_balance) + Number(temp_user_profit);
      // }
      //
      // if (Number(user_balance) !== Number(user.balance)) {
      //   console.log(user.balance, "user before change balance");
      //   console.log(user_balance, "changed balance");
      //   user.balance = Number(user_balance);
      // }
      // console.log(user.balance, "user balance");
      await user.save();

      const user_seed = await this.userSeedService.findOne(user.id);

      return { ...tokens, user_id: user.id, user_seed_id: user_seed.id };
    } catch (err) {
      this.logger.debug(err, "Login Error");
    }
  }

  async login_admin(userDto: LoginUserDto) {
    try {
      const user = await this.validateUser(userDto);
      if (user?.enabled_2fa) {
        user.last_login_at = new Date(Date.now());
        user.nonce = Math.floor(Math.random() * 1000000);
        await user.save();
        return { user_id: user.id, enabled_2fa: true, refreshToken: "" };
      } else {
        const tokens = await this.generateToken(user);
        user.remember_token = tokens.refreshToken;
        user.last_login_at = new Date(Date.now());
        user.nonce = Math.floor(Math.random() * 1000000);
        await user.save();
        const user_seed = await this.userSeedService.findOne(user.id);
        return {
          ...tokens,
          user_id: user.id,
          user_seed_id: user_seed.id,
          enabled_2fa: false,
        };
      }
    } catch (err) {
      this.logger.debug(err, "Login Admin Error");
    }
  }

  async admin_login_wallet(userDto: LoginUserDto) {
    try {
      const user = await this.validateUser(userDto);
      user.nonce = Math.floor(Math.random() * 1000000);
      await user.save();
      return { user_id: user.id };
    } catch (err) {
      this.logger.debug(err, "Login Wallet Error");
    }
  }

  async respondWithQRCode(data: string, response: Response) {
    await QRCode.toFileStream(response, data);
  }

  public getTwoFactorAuthenticationCode() {
    const secretCode = speakeasy.generateSecret({
      name: "Dice Ivaders",
    });
    return {
      otpauthUrl: secretCode.otpauth_url,
      base32: secretCode.base32,
    };
  }

  public async verifyTwoFactorAuthenticationCode(
    google_code: string,
    email_code: string,
    email: string
  ) {
    try {
      const user = await this.userService.getUserByEmail(email);

      if (user.email2fa_secret.length && !user.google2fa_secret.length) {
        return { refreshToken: "" };
      }

      const isValidGoogleCode = speakeasy.totp.verify({
        secret: user.google2fa_secret,
        encoding: "base32",
        token: google_code,
      });

      const isValidEmailCode = email_code === user.email2fa_secret;

      if (isValidGoogleCode && isValidEmailCode) {
        const user = await this.userService.getUserByEmail(email);
        const tokens = await this.generateToken(user);
        user.remember_token = tokens.refreshToken;
        user.last_login_at = new Date(Date.now());
        user.email2fa_secret = "";
        await user.save();

        const user_seed = await this.userSeedService.findOne(user.id);

        return { ...tokens, user_id: user.id, user_seed_id: user_seed.id };
      } else {
        return { refreshToken: "" };
      }
    } catch (err) {
      this.logger.debug(err, "Verify 2FA Error");
    }
  }

  async registration(userDto: CreateUserDto) {
    try {
      const candidate = await this.userService.getUserByWalletAddress(
        userDto.wallet_address
      );

      if (candidate) {
        throw new ValidationException("User with this wallet already exist");
      }
      let hashPassword = null;
      if (userDto.password) {
        hashPassword = await bcrypt.hash(userDto.password, 5);
      }
      const user = await this.userService.createUser({
        wallet_address: userDto.wallet_address.toLowerCase(),
        password: hashPassword,
      });
      let user_balance: number = await this.live_wallet.methods
        .balanceOf(user.wallet_address)
        .call();
      user_balance = this.web3.utils.fromWei(user_balance.toString());
      user.wallet_address = userDto.wallet_address.toLowerCase();
      user.balance = user_balance;
      user.nonce = Math.floor(Math.random() * 1000000);
      await user.save();
      return {
        wallet_address: user.wallet_address,
        nonce: user.nonce,
        balance: Number(user_balance),
      };
    } catch (err) {
      this.logger.debug(
        err,
        "Error register user: " + userDto.wallet_address.toLowerCase()
      );
    }
  }

  async logout(token: string) {
    try {
      const user = await this.userService.getUserByToken(token ? token : "");
      if (user) {
        user.remember_token = null;
        await user.save();
        return null;
      }
      console.log("Logout false! User not found!");
      return null;
    } catch (err) {
      this.logger.debug(err, "Logout Error");
    }
  }

  async sendActivationMailAgain(email: string) {
    try {
      const user = await this.userService.getUserByEmail(email);
      if (!user) {
        throw new NotFoundException("User not found");
      }
      await this.sendActivationMail(
        user.email,
        `${process.env.API_URL}${process.env.PORT}/auth/activate/${user.email_verify_link}`
      );
      return null;
    } catch (err) {
      this.logger.debug(err, "Send Activation Mail Error");
    }
  }

  async refresh(token: string) {
    if (!token) {
      throw new ValidationException({ message: "Refresh Token is required" });
    }
    try {
      const userData = await this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.userService.getUserByToken(token);
      if (!userData || !user) {
        throw new ValidationException({ message: "Refresh Token is expires" });
      }
      const tokens = await this.generateToken(user);
      user.remember_token = tokens.refreshToken;
      await user.save();
      return tokens;
    } catch (err) {
      throw new ValidationException({ message: "Refresh Token is expires" });
    }
  }

  private async generateToken(user: User) {
    try {
      const payload = {
        email: user?.email,
        id: user.id,
        roles: user.roles,
        wallet_address: user.wallet_address,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "24h",
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: "30d",
      });
      return {
        accessToken,
        refreshToken,
      };
    } catch (err) {
      this.logger.debug(err, "Generate Token Error");
    }
  }

  private async validateUser(userDto: LoginUserDto) {
    try {
      if (userDto.email) {
        const user = await this.userService.getUserByEmail(userDto.email);
        if (!user && !user?.password) {
          throw new ValidationException("Access Denied!");
        }
        const passwordEquals = await bcrypt.compare(
          userDto.password,
          user.password
        );
        if (user && passwordEquals) {
          return user;
        } else {
          throw new ValidationException(
            "Wrong password or email or wallet address!"
          );
        }
      } else if (userDto.wallet_address) {
        const user = await this.userService.getUserByWalletAddress(
          userDto.wallet_address
        );
        const msg = `I am signing my one-time nonce: ${user?.nonce}`;
        const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, "utf8"));
        const address = sigUtil.recoverPersonalSignature({
          data: msgBufferHex,
          sig: userDto?.signature,
        });
        if (address.toLowerCase() === userDto.wallet_address.toLowerCase()) {
          return user;
        } else {
          throw new UnauthorizedException({
            message: "Signature verification failed",
          });
        }
      }
      throw new UnauthorizedException({
        message: "Wrong password or email or wallet address",
      });
    } catch (err) {
      this.logger.debug(err, "Validate User Error");
    }
  }

  private async sendActivationMail(email: string, link: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject:
          "Activate your account on " + process.env.API_URL + process.env.PORT,
        text: "",
        html: `
                    <div>
                        <h1>To activate, follow the link</h1>
                        <a href="${link}">Activate account</a>
                    </div>
                `,
      });
      return null;
    } catch (err) {
      this.logger.debug(err, "Send Activation Mail Error");
    }
  }

  async sendActivationCodeMail(email: string) {
    try {
      const code = Math.floor(100000 + Math.random() * 900000);
      const user = await this.userService.getUserByEmail(email);
      user.email2fa_secret = code.toString();
      await user.save();
      await this.mailerService.sendMail({
        to: email,
        subject: "Activation code on BITCRUSH ADMIN! ",
        text: "",
        html: `
        <div>
            <h1>Your activation code: ${code}</h1>
        </div>
      `,
      });
      return null;
    } catch (err) {
      this.logger.debug(err, "Send Activation Code Error");
    }
  }
}
