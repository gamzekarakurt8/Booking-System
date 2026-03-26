import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ZodType } from "zod";

@Injectable()
export class ZodValidationPipe<TInput, TOutput = TInput> implements PipeTransform {
  constructor(private readonly schema: ZodType<TOutput, any, TInput>) {}

  transform(value: TInput): TOutput {
    const parsed = this.schema.safeParse(value);

    if (!parsed.success) {
      throw new BadRequestException({
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    return parsed.data;
  }
}
