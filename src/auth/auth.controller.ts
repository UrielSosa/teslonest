import { Controller, Post, Body, Get, UseGuards, Req, Version, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { Auth, GetUser, RawHeaders } from './decorators';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testing (
    @GetUser() user: User,
    @GetUser(['email']) userEmail: string,
    @RawHeaders() raw: string[]
  ) {
    return {
      ok: true,
      message: 'Test',
      user,
      userEmail,
      raw
    }
  }

  @Get('check-status')
  @Auth()
  checkStatus (
    @GetUser() user: User
  ) {
    return this.authService.checkStatus( user );
  }
  
  /* RUTAS PRUEBA */
  @Get('privateone')
  @RoleProtected( ValidRoles.user )
  @UseGuards( AuthGuard(), UserRoleGuard)
  testone (
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      message: 'Test1',
      user
    }
  }


  @Get('privatetwo')
  @Auth(ValidRoles.admin)
  testwo (
    @GetUser() user: User,
  ) {
    return {
      ok: true,
      message: 'Test1',
      user
    }
  }

}
