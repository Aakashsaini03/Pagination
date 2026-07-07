import { Injectable, BadRequestException } from '@nestjs/common';
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
  constructor(private datasource: DataSource) { }

  async getUsers(
    page: number,
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
      console.log("name------>", name)
      params = [`%${name}%`];
    }
    else if (email) {
      condition = 'WHERE email LIKE @0';
      console.log("email------->", email)
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
  async bulkupload(file: MulterFile) {
    if (!file)
      throw new BadRequestException('Required the file');
    const validUsers: {
      name: string;
      email: string;
      usertype: string;
      salary: number;
      rowNumber: number;
      status: string;
    }[] = [];
    const skippedRows: any[] = [];
    const stream = Readable.from(file.buffer);
    await new Promise<void>((resolve, reject) => {
      let rowNumber = 1;
      stream.pipe(csvParser())
        .on('data', (row) => {
          const name = row.name?.trim();
          const email = row.email?.trim();
          const usertype = row.UserType?.trim();
          const salaryValue = row.salary?.trim();
          const salary = Number(salaryValue);
          const status = row.status?.trim().toLowerCase();
          const errors: string[] = [];

          if (!name) {
            errors.push('Name is required');
          }

          if (!email) {
            errors.push('Email is required');
          }

          if (!usertype) {
            errors.push('UserType is required');
          }

          if (!salaryValue) {
            errors.push('Salary is required');
          } else if (Number.isNaN(salary)) {
            errors.push('Salary must be a number');
          } else if (salary < 10000 || salary > 50000) {
            errors.push('Salary must be between 10000 and 50000');
          }
          if (errors.length > 0) {
            skippedRows.push({
              rowNumber,
              reason: errors,
              row,
            });
            return;
          }

          validUsers.push({
            name,
            email,
            usertype,
            salary,
            rowNumber,
            status
          });
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    const finalUsers: {
      name: string;
      email: string;
      usertype: string;
      salary: number;
      status: string;

    }[] = [];
    for (const user of validUsers) {
      const errors: string[] = [];
      const userTypeResult = await this.datasource.query(
        `
      SELECT id, usertype, IsActive, IsDelete
      FROM UserTypeMaster
      
      WHERE usertype = @0
      `,
        [user.usertype],
      );
      if (userTypeResult.length === 0) {
        errors.push('Usertype does not exist in UserType table');
        continue;
      }
      const userTypeData = userTypeResult[0];

      if (userTypeData.IsActive !== true && userTypeData.IsActive !== 1) {
        skippedRows.push({
          reason: ['Usertype is not active'],
          row: user,
        });
        continue;
      }

      if (userTypeData.IsDelete === true || userTypeData.IsDelete === 1) {
        errors.push('Usertype is deleted, so row cannot be inserted');
        continue;
      }


      const gmailTableResult = await this.datasource.query(
        `
      SELECT id
      FROM Gmail
      WHERE email = @0
      `,
        [user.email],
      );
      if (gmailTableResult.length > 0) {
        errors.push('Gmail already exists in Gmail table');
      }
      const dataTableResult = await this.datasource.query(
        `
      SELECT id
      FROM Data
      WHERE email = @0
      `,
        [user.email],
      );

      if (dataTableResult.length > 0) {
        errors.push('Gmail already exists in Data table');
      }
      finalUsers.push({
        name: user.name,
        email: user.email,
        usertype: user.usertype,
        salary: user.salary,
        status: 'active'

      });
    }

    const batchSize = 400;
    let totalInserted = 0;

    for (let i = 0; i < finalUsers.length; i += batchSize) {
      const batch = finalUsers.slice(i, i + batchSize);

      const values: string[] = [];
      const params: any[] = [];

      batch.forEach((user, index) => {
        values.push(`(@${index * 5}, @${index * 5 + 1},@${index * 5 + 2},@${index * 5 + 3},@${index * 5 + 4})`);
        params.push(user.name, user.email, user.usertype, user.salary, user.status);
      });

      await this.datasource.query(
        `
      INSERT INTO Data (name, email,usertype,salary,status)
      VALUES ${values.join(',')}
      `,
        params,
      );

      totalInserted += batch.length;
    }

    return {
      message: 'Bulk upload completed successfully',
      totalInserted: finalUsers.length,
    };
  }
}