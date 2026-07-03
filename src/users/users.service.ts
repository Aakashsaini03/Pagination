import { Injectable,BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import type { Express } from 'express';


 type MulterFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};
@Injectable()
export class UsersService {
  constructor(private datasource: DataSource) {}

  async getUsers(
    page: number ,
    name: string = '',
    email: string = '',
    pageSize: number
  ) {
    const limit = Number(pageSize) || 10;
    const offset = (page - 1) * limit;

    let condition = '';
    let params: any[] = [];

    if (name) {
      condition = 'WHERE name LIKE @0';
      console.log("name------>",name)
      params = [`%${name}%`];
    }
    if (email) {
      condition = 'WHERE email LIKE @1';
      console.log("email------->",email)
      params = [`%${email}%`];
    }

    const users = await this.datasource.query(
      `
      SELECT *
      FROM Data
      ${condition}
      ORDER BY id ASC
      OFFSET @${params.length} ROWS
      FETCH NEXT @${params.length + 1} ROWS ONLY
      `,
      [...params, offset, limit],
    );

    const countResult = await this.datasource.query(
      `
      SELECT COUNT(*) AS totalUsers
      FROM Data
      ${condition}
      `,
      params,
    );

    const totalUsers = countResult[0].totalUsers;
    const totalPages = Math.ceil(totalUsers / limit);

    return {
      currentPage: page,
      limit,
      totalUsers,
      totalPages,
      users,
    };
  }
  async bulkupload(file:MulterFile){
    if(!file)
      throw new BadRequestException('Required the file');
    const users :{name:string, email:string}[]=[];

    const stream = Readable.from(file.buffer);
     await new Promise<void>((resolve,reject)=>{
      stream.pipe(csvParser())
      .on('data',(row)=>{
        if(row.name && row.email){
          users.push({
            name:row.name,
            email:row.email,

          });
        }
      })
      .on('end',()=>resolve())
      .on('error',(error)=>reject(error));
     });

   const batchSize = 1000;
  let totalInserted = 0;

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);

    const values: string[] = [];
    const params: any[] = [];

    batch.forEach((user, index) => {
      values.push(`(@${index * 2}, @${index * 2 + 1})`);
      params.push(user.name, user.email);
    });

    await this.datasource.query(
      `
      INSERT INTO Data (name, email)
      VALUES ${values.join(',')}
      `,
      params,
    );

    totalInserted += batch.length;
  }

   return {
      message: 'Bulk upload completed successfully',
      totalInserted: users.length,
    };
  }
}