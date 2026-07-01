import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity/user.entity';
import { Repository } from 'typeorm';
@Injectable()
export class UsersService {
    constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}
  async getUser(page: number=1){
    const limit=10;
     const[users , totalUsers]= await this.userRepository.findAndCount({
      skip:(page-1)*10,
      take:limit,
      order:{
        id:'ASC'
      },
     });

     const totalPages=Math.ceil(totalUsers/limit);
     return {
      currentPage: page,
      limit,
      totalUsers,
      totalPages,
      users,
    };  
  }
}
