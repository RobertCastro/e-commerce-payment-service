import { Type } from 'class-transformer';
import { IsString, IsObject, ValidateNested, IsDefined } from 'class-validator';

class WompiTransactionData {
  @IsString()
  id: string;

  @IsString()
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED';

  @IsString()
  reference: string;

  // TODO revisar campos
}

class WompiEventData {
  @ValidateNested()
  @Type(() => WompiTransactionData)
  @IsDefined()
  transaction: WompiTransactionData;
}

export class WompiEventDto {
  @IsString()
  event: string;

  @IsObject()
  @ValidateNested()
  @Type(() => WompiEventData)
  @IsDefined()
  data: WompiEventData;
}
