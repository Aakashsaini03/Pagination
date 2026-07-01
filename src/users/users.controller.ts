import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('Users')
export class UsersController {
  constructor(
    private usersService: UsersService) { }


  @Get()
  async getUsers(@Query('page') page: string) {
    const pageNumber = Number(page) || 1;

    return this.usersService.getUser(pageNumber);
  }
}
