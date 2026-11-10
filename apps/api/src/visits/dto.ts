import {
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateVisitDto {
  @IsMongoId()
  personId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  address!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @IsIn(['typed', 'link', 'back', 'forward', 'history', 'search', 'publish'])
  method!: string;

  @IsBoolean()
  found!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200_000)
  htmlSnapshot?: string;
}
