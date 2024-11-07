import { Controller, Post, Body, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmbedTokenDto } from './dto/embed-token.dto';
import { CreateGeneralConfigDto } from './dto/create-general-config.dto';
import { TokenLoginDto } from './dto/token-login.dto';
import { TokenDto } from '../../shared/global-dto/token.dto';
import { UserToken } from '../../shared/decorators/user.decorator';
import { RolesHandler } from '../../shared/enum/roles-handler.enum';
import { RolesGuard } from '../../shared/guards/role.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.loginService(loginDto);
  }

  @Post('token/login')
  @ApiOperation({ summary: 'Login with token' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in with token.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async tokenLogin(@Body() tokenLoginDto: TokenLoginDto) {
    return await this.authService.tokenLoginService(tokenLoginDto);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer token',
  })
  @ApiResponse({ status: 200, description: 'Password successfully changed.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @UserToken() user: TokenDto,
  ) {
    return await this.authService.changePassword(changePasswordDto, user);
  }

  @Post('create-config')
  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @ApiOperation({ summary: 'Create general configuration' })
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer token',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createConfig(@Body() createConfigDto: CreateGeneralConfigDto) {
    return await this.authService.createGeneralConfig(createConfigDto);
  }

  @Post('token-embed')
  @ApiOperation({ summary: 'Get embed token' })
  @ApiResponse({ status: 200, description: 'Token successfully generated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async embedToken(@Body() embedTokenDto: EmbedTokenDto) {
    return await this.authService.embedToken(embedTokenDto);
  }
}
