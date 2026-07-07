import{IsEmail,IsInt, IsString,IsOptional} from 'class-validator';
export  class FilterDto{
  @IsString()
  @IsOptional()
  page?: number;

  @IsString()
  @IsOptional()
  pageSize?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  usertype?: string;

  @IsString()
  @IsOptional()
  salary?: number;

  @IsString()
  @IsOptional()
  status?: Boolean;



  @IsString()
  @IsOptional()
  email?: string;

}