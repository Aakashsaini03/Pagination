import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import{ Data} from './users/user.entity/user.entity'
import { UserTypeMaster } from './users/user.entity/usertype.entity';
import { Gmail } from './users/user.entity/gmail.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
    type:'mssql',
    host:'localhost',
    port:1433,
    username:'sa',
    password:'Aaka@123',
    database:'pagination_db',
    entities:[Data,UserTypeMaster,Gmail],
    synchronize:false,
    options:{
      encrypt:true,
      trustServerCertificate:true,
    },
    }),
    UsersModule],
  
})
export class AppModule {}

