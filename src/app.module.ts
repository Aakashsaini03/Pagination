import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import{ UserEntity} from './users/user.entity/user.entity'
@Module({
  imports: [
    TypeOrmModule.forRoot({
    type:'mssql',
    host:'localhost',
    port:1433,
    username:'sa',
    password:'Aaka@123',
    database:'pagination_db',
    entities:[UserEntity],
    synchronize:true,
    options:{
      encrypt:false,
      trustServerCertificate:true,
    },
    }),
    UsersModule],
  
})
export class AppModule {}
