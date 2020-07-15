import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { GetCurrentlyAuthenticatedUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }

  @Post('/signin')
  signin(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signin(authCredentialsDto);
  }

  @Post('/test')
  // This Guard invokes the Passport strategy and kicks off the steps like
  // retrieving credentials, running the validate function in jwt.strategy.ts, creating the user property on req object, etc.
  @UseGuards(AuthGuard()) // populate req object with user entity if the access token is valid
  test(@GetCurrentlyAuthenticatedUser() user: User) {
    console.log(user);
  }
}
