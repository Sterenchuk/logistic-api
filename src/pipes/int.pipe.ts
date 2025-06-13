import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class CustomParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    try {
      const intValue = parseInt(value, 10);

      if (isNaN(intValue)) {
        throw new BadRequestException('Validation failed (integer string is expected)');
      }

      return intValue;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Validation failed (integer string is expected)');
    }
  }
}
