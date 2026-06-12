import {
  IsInt,
  IsObject,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdateLearningSessionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  currentStep?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  revealedHints?: number;

  @IsOptional()
  @IsObject()
  codeDrafts?: Record<string, string>;
}
