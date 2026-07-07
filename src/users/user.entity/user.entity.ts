import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Data')
export class Data {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  UserType!: string;


  @Column()
  salary!:number

  @Column({ type: 'varchar', default: true })
  status!:string
}