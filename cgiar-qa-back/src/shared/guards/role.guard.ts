import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RolesHandler } from '../enum/roles-handler.enum';
import { UserRepository } from '../../api/users/users.repository';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get(Roles, context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request.headers['authorization']);

    if (!token) {
      throw new UnauthorizedException('No token found');
    }

    const payload = this.jwtService.decode(token);
    if (!payload?.userId || !payload?.username) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userRepository.findOne({
      where: [
        { id: payload.userId },
        { username: payload.username.trim().toLowerCase() },
      ],
      relations: {
        roles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userRoles: RolesHandler[] = user.roles.map(
      (userRole) => userRole.role.description as RolesHandler,
    );

    const hasRole = requiredRoles.some((role: RolesHandler) =>
      userRoles.includes(role),
    );
    if (!hasRole) {
      throw new UnauthorizedException('You do not have the required role');
    }

    return true;
  }

  private extractTokenFromHeader(authHeader: string): string {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }
    return authHeader;
  }
}
