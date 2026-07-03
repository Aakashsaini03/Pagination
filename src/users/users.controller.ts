import { Controller, Get, Query, UploadedFile, UseInterceptors ,Post} from '@nestjs/common';
import { UsersService } from './users.service';
import { FilterDto } from 'src/dto/Filter.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService) { }


  @Get()
  async getUsers(@Query() query:FilterDto) {
    const pageNumber = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    return this.usersService.getUsers(pageNumber,
      query.name || '',
      query.email ||'',
      pageSize
    );
  }

  @Post('bulkupload')
  @UseInterceptors(FileInterceptor('file'))
  async bulkupload(@UploadedFile() file:any){
    return this.usersService.bulkupload(file);
  }
}
