import { EntityRepository, Repository } from 'typeorm';
import {
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;

    // our auth strategy: hash(password + unique salt per user), then save this hash and salt in db
    // Note that the security of this approach lies in bcrypt's intentional slow hashing which is compute intensive
    // Also timing based attacks are irrelevant, because if db is breached, salt is going to be revealed too.
    // but getting back the plain text password from this salt + hash combination is going to compute intensive thus strengthening security
    // hash(password) -> db is a poor strategy becaue in case the db is breached, attackers
    // can use some available database to find the passwords
    const passwordSalt = await bcrypt.genSalt();
    const hashedPassword = await this.hashPassword(password, passwordSalt);

    const user = this.create({
      username,
      passwordSalt,
      password: hashedPassword,
    });
    // We have a unique constraint defined in the User entity. This way if a
    // request to create a duplicate username comes in, pg throws an error
    // Thus we avoid two calls to db
    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate username
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async validateUserPassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });

    if (user) {
      // Algo: user the incoming password and originally stored salt to calculate the hash of the incoming password
      // if this hash and the stored password (which infact is the hash) match, we found a match
      const hash = await this.hashPassword(password, user.passwordSalt);
      if (hash === user.password) {
        return user.username;
      }
    } else {
      return null;
    }
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
