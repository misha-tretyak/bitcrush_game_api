import { Injectable } from "@nestjs/common";
import { CreateChatDto } from "./dto/create-chat.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Chat } from "./chat.model";
import { User } from "../users/users.model";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat) private readonly userRepository: typeof Chat
  ) {}
  create(createChatDto: CreateChatDto) {
    return this.userRepository.create(createChatDto);
  }

  async findAll(query: { offset?: string; limit?: string }) {
    const { offset: off, limit: lim } = this.calculatePagination(
      query.limit ? query.limit : "25",
      query.offset ? query.offset : "1"
    );
    const data = await this.userRepository.findAndCountAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, attributes: ["username", "wallet_address", "id"] },
      ],
      limit: lim,
      offset: off,
    });
    const pages = Math.ceil(data.count / lim);
    const currentPage = off / lim + 1;

    return {
      pages,
      currentPage,
      nextPage:
        currentPage < pages
          ? currentPage + 1
          : currentPage >= pages
          ? null
          : null,
      prevPage:
        currentPage >= pages
          ? pages - 1
          : currentPage <= 0
          ? null
          : currentPage < pages
          ? currentPage - 1
          : null,
      firstPage: 1,
      lastPage: pages,
      data: [...data.rows],
      items: data.count,
    };
  }

  private calculatePagination = (lim: string, off: string) => {
    let limit = null;
    let offset = +off - 1 > 0 ? +off - 1 : 0;
    if (lim && typeof +lim === "number" && +lim > 0) limit = +lim;
    if (limit && offset && typeof offset === "number" && offset > 0)
      offset *= limit;
    if (!lim && !off) {
      return {
        limit: 25,
        offset: 0,
      };
    }
    return {
      limit,
      offset,
    };
  };
}
