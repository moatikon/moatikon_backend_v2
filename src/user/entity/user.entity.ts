import { Tikon } from 'src/tikon/entity/tikon.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  email: string;

  @Column()
  name: string;

  @OneToMany(() => Tikon, (tikon) => tikon.user)
  tikons: Tikon[];
}
