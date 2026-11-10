import { IsMongoId, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class PublishSiteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  @Matches(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]{2,12})+$/i, {
    message: 'address must look like name.tld (e.g. tidepool.zz)',
  })
  address!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200_000)
  html!: string;

  @IsMongoId()
  authorId!: string;
}
