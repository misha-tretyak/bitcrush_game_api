import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { Chat } from "./chat.model";
import { SequelizeModule } from "@nestjs/sequelize";

@Module({
  imports: [SequelizeModule.forFeature([Chat])],
  exports: [ChatService],
  providers: [ChatService],
})
export class ChatModule {}
