import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLearningSessionDto {
  @IsString()
  @MaxLength(100_000)
  rawQuery!: string;

  @IsObject()
  result!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  userId?: string;
}
