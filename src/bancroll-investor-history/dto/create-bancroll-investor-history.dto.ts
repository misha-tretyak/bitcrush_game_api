export class CreateBancrollInvestorHistoryDto {
    readonly amount: number;
    readonly dilution_fee: number;
    readonly type: number;
    readonly added_manually: number;
    readonly investor_id: string;
}
