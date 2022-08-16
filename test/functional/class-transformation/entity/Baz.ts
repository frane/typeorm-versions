import { Type } from 'class-transformer';

export class Baz {
  a: number = 0;

  @Type(() => Date)
  d: Date = new Date(0);
}
