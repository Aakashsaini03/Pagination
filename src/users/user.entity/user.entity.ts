import { Column,PrimaryGeneratedColumn,Entity } from "typeorm";
@Entity('Data')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id!: number ;
      

    @Column()
    name!:String;

    @Column()
    email!:String;

}
