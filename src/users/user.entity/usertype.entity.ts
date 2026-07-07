import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('UserTypeMaster')
export class UserTypeMaster {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  userType!: string;

  @Column({ type: 'bit', default: true })
  IsActive!: boolean;

  @Column({ type: 'bit', default: false })
  IsDelete!: boolean;
}