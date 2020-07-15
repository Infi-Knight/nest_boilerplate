import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { User } from './user.entity';

// client send request to a protected route with an access token
// we decode that token and extract the username from it
// and use it to retrieve the user from our database if it exists
// any attempt to change (for example changing the user or role) the token will result in failed authorization unless the attacker knows our jwt secret
// However if the token gets stealed then the attacker can impersonate as our user
// For this reason jwt's should be short lived, rotated, refreshed etc
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  // For the jwt-strategy, Passport first verifies the JWT's signature and decodes the JSON.
  // It then invokes our validate() method passing the decoded JSON as its single parameter.
  // Based on the way JWT signing works, we're guaranteed that we're receiving a valid token
  // that we have previously signed and issued to a valid user.
  async validate(payload: JwtPayload): Promise<User> {
    const { username } = payload;
    const user = await this.userRepository.findOne({ username });
    if (!user) {
      throw new UnauthorizedException();
    }
    // After successful authorization we can populate the request object decorated using AuthGuard
    // with our user entity. (Try removing the line @UseGuards(AuthGuard()) in the 'test' controller )
    // and you will notice that we don't get a log of user entity in console anymore
    return user;
  }
}
