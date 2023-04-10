import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}

  async create(createUserDto: CreateUserDto) {
    
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });
      
      await this.userRepository.save(user);
      
      delete user.password;

      return {
        ...user,
        token: this.getJwt({ id: user.id })
      };
    } catch (e) {
      this.handleDBErrors(e)
    }
  }

  async login(loginUserDto: LoginUserDto) {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true
      }
    });

    if( !user || !bcrypt.compareSync( password, user.password )) throw new UnauthorizedException('Credentials are not valid');
    
    return {
      ...user,
      token: this.getJwt({ id: user.id })
    };
  
  }

  async checkStatus (user: User) {
    return {
      ...user,
      token: this.getJwt({ id: user.id })
    };
  }

  /* Librerías privadas */
  private handleDBErrors (e: any): never {
    if (e.code === '23505') {
      throw new BadRequestException(e.detail);
    }
    console.log(e);

    throw new InternalServerErrorException('Please check server logs');
    
  }

  private getJwt (payload: JwtPayload) {
    const token = this.jwtService.sign( payload );
    return token;
  }
}
