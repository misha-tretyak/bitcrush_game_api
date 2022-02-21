import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { UserSeed } from "src/user-seeds/user-seeds.model";
import { ValidationException } from "src/exceptions/validation.exception";
import { GameRollsService } from "src/game-rolls/game-rolls.service";
import { GameRoll } from "src/game-rolls/game-rolls.model";
import { CreateUserSeedDto } from "src/user-seeds/dto/create-user-seed.dto";
const crypto = require("crypto");

interface IVerifyProbablyFair {
  user_id: string;
  server_seed_public: string;
  server_seed_private: string;
  client_seed: string;
  betNumber: number;
}
interface IRollResult {
  hash: string;
  result: number;
}

@Injectable()
export class ProbablyFairService {
  constructor(
    @InjectModel(UserSeed) private readonly userSeedRepository: typeof UserSeed,
    @InjectModel(GameRoll) private readonly gameRollRepository: typeof GameRoll,
    @Inject(forwardRef(() => GameRollsService))
    private readonly gameRollService: GameRollsService
  ) {}

  private logger: Logger = new Logger("ProbablyFairService");

  async verify(data: IVerifyProbablyFair): Promise<number> {
    try {
      const seed: UserSeed = await this.userSeedRepository.findOne({
        where: {
          user_id: data.user_id,
          client_seed: data.client_seed,
          server_seed_private: data.server_seed_private,
          server_seed_public: data.server_seed_public,
        },
      });
      let rollResult: IRollResult | null;
      const hash: string = crypto
        .createHash("sha256")
        .update(data.server_seed_private)
        .digest("hex");

      if (data.server_seed_public !== hash) {
        throw new ValidationException("Wrong Server Seed (hashed)");
      } else if (!seed) {
        throw new ValidationException("Wrong Seeds Provided");
      } else if (!data.betNumber) {
        throw new ValidationException("Please provide Last/Specific Nonce");
      } else {
        rollResult = this.gameRollService.getNextRollResult(
          data.betNumber,
          data.server_seed_private,
          data.client_seed
        );
        if (!rollResult) {
          throw new Error("Server error");
        }
      }
      return rollResult.result;
    } catch (err) {
      this.logger.debug(err, "Probably Verify Error");
    }
  }

  async getSeeds(user_id: string) {
    try {
      const currentSeed = await this.userSeedRepository.findOne({
        where: { user_id, is_active: true },
      });

      let nextSeed = await this.userSeedRepository.findOne({
        where: { user_id, is_active: false, is_next_unused: true },
      });
      if (!nextSeed) {
        nextSeed = await this.generateNewSeeds(user_id, false);
      }

      let previousSeed = null;
      const previous = await this.userSeedRepository.findOne({
        where: { user_id, is_active: false, is_next_unused: false },
        order: [["id", "DESC"]],
      });

      if (previous) {
        const rolls = await this.gameRollRepository.count({
          where: { user_id: previous.user_id, user_seed_id: previous.id },
        });
        previousSeed = {
          serverSeedPublic: previous.server_seed_public,
          serverSeedPrivate: previous.server_seed_private,
          clientSeed: previous.client_seed,
          totalBets: rolls,
        };
      }

      return {
        currentSeed: {
          id: currentSeed.id,
          serverSeedPublic: currentSeed.server_seed_public,
          clientSeed: currentSeed.client_seed,
        },
        nextSeed: {
          serverSeedPublic: nextSeed.server_seed_public,
          clientSeed: nextSeed.client_seed,
        },
        previous: previousSeed,
      };
    } catch (err) {
      this.logger.debug(err, "Get Seed Error");
    }
  }

  async changeSeed({
    user_id,
    server_seed_public,
    clientSeed,
  }: {
    user_id: string;
    server_seed_public: string;
    clientSeed: string;
  }) {
    try {
      const seed = await this.userSeedRepository.findOne({
        where: { user_id, server_seed_public, is_next_unused: true },
      });

      if (!seed) {
        throw new ValidationException("Wrong Server Seed");
      }

      if (clientSeed.length < 1) {
        throw new ValidationException("Wrong Client Seed");
      }

      await this.useNextNewSeeds(user_id, seed, clientSeed);
      return this.getSeeds(user_id);
    } catch (err) {
      this.logger.debug(err, "Change Seed Error");
    }
  }

  private useNextNewSeeds = async (
    user_id: string,
    seed: UserSeed,
    clientSeed: string
  ) => {
    try {
      await this.userSeedRepository.update(
        { is_active: false, is_next_unused: false },
        { where: { user_id } }
      );

      seed.client_seed = clientSeed;
      seed.user_id = user_id;
      seed.is_active = true;
      await seed.save();
    } catch (err) {
      this.logger.debug(err, "Use Next Seed Error");
    }
  };

  generateNewSeeds = async (
    user_id: string,
    isActive: boolean = true
  ): Promise<UserSeed> => {
    try {
      const privateKey = this.generateServerSeed(128);
      const clientSeed = this.generateServerSeed(32);

      if (isActive) {
        await this.userSeedRepository.update(
          { is_active: false, is_next_unused: false },
          { where: { user_id, is_active: true } }
        );
      }

      const seed: CreateUserSeedDto = {
        server_seed_public: crypto
          .createHash("sha256")
          .update(privateKey)
          .digest("hex"),
        server_seed_private: privateKey,
        client_seed: clientSeed,
        is_active: isActive,
        is_next_unused: !isActive,
        user_id,
      };

      const nextSeed = this.userSeedRepository.create(seed);

      return nextSeed;
    } catch (err) {
      this.logger.debug(err, "Generate New Seeds Error");
    }
  };

  private generateServerSeed = (length: number) => {
    try {
      const characters =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let randomString = "";
      for (let i = 0; i < length; i++) {
        let index = Math.floor(Math.random() * characters.length);
        randomString += characters[index];
      }

      return randomString;
    } catch (err) {
      this.logger.debug(err, "Generate Server Seed Error");
    }
  };
}
