import { PartialType } from "@nestjs/mapped-types";
import { CreateTempProfitDto } from "./create-temp-profit.dto";

export class UpdateTempProfitDto extends PartialType(CreateTempProfitDto) {
  id: number;
}
