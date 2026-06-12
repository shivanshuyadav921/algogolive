import { IsString, MaxLength, MinLength } from 'class-validator';

export class ParseInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100_000)
  query!: string;
}
