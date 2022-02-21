export class CreateChatDto {
  readonly from_user_id: string;
  readonly to_user_id: string | null;
  readonly message: string;
}
