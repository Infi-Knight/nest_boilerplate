import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

// atleast 1 number, 1 caps, 1 small, 1 special character

const ValidPasswordRegex = /(?=.*\d)(?=.*\W)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(40)
  @Matches(ValidPasswordRegex, {
    message: 'Password too weak',
  })
  password: string;
}
