import { Tikon } from 'src/tikon/entity/tikon.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column()
  deviceToken: string;

  @OneToMany(() => Tikon, (tikon) => tikon.user)
  tikons: Tikon[];

  @Column({ default: true })
  available: boolean;

  @Column({ default: null })
  withdrawDate: Date;
}
