import { Type } from 'class-transformer';
import { Baz } from './Baz';

export class Bar {
  x: number = 1;

  @Type(() => Baz) // required to keep maintain type-safety
  b: Baz = new Baz();
}
