import { TikonCategory } from 'src/common/enum/tikon-category.enum';
import { User } from 'src/user/entity/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Tikon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  image: string;

  @Column()
  storeName: string;

  @Column()
  tikonName: string;

  @Column()
  category: TikonCategory;

  @Column()
  discount: number;

  @Column()
  dDay: string;

  @ManyToOne(() => User, (user) => user.tikons)
  user: User;
}
