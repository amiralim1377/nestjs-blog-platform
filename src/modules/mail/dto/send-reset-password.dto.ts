import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SendResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  resetLink: string;
}
