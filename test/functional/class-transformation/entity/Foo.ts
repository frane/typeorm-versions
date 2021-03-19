import { Type } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { VersionedEntity } from '../../../../src';

@Entity()
@VersionedEntity()
export class Foo {
    @PrimaryColumn()
    a: number = 2;

    @Column()    
    text: string = 'foo';

    @Column()
    d: Date = new Date(0);
    
    @Column({ type: 'simple-json' })
    @Type(() => Bar)
    bar: Bar = new Bar();
}

export class Bar {
    x: number = 1;

    @Type(() => Baz)
    b: Baz = new Baz();
}

export class Baz {
    a: number = 0;

    @Type(() => Date)
    d: Date = new Date(0);
}