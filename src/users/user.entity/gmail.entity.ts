import { IsOptional, IsString } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('Gmail')
export class Gmail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @IsString()
  @IsOptional()
  email?: string;
}