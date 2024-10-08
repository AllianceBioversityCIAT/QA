import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { env } from 'process';
import { AuthService } from '../../api/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../../api/auth/dto/login.dto';
import constConfig from '../../config/const.config';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly _authService: AuthService,
    private readonly _jwtService: JwtService,
  ) {}

  async use(
    req: Request,
    res: Response & { locals: any },
    next: NextFunction,
  ): Promise<void> {
    const authBasic: string = req.headers.authorization;
    const credentials: string | null = authBasic
      ? authBasic.split('Basic ')[1]
      : null;

    let jwtPayload: any, token_: string;
    try {
      if (credentials) {
        const cre: string = Buffer.from(credentials, 'base64').toString(
          'utf-8',
        );
        const userLogin: LoginDto = {
          username: cre.split(':')[0],
          password: cre.split(':')[1],
        };

        const dataAuth = await this._authService.loginService(userLogin);
        token_ = dataAuth.data.token;
      } else {
        token_ = req.headers['authentication'] as string;
      }

      if (!token_) {
        throw new HttpException(
          {
            message: 'Token not provided',
            response: {},
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      jwtPayload = await this._jwtService.verifyAsync(token_, {
        secret: constConfig.jwtSecret,
        ignoreExpiration: true,
      });

      res.locals.jwtPayload = jwtPayload;

      const newToken: string = await this._jwtService.signAsync(
        { jwtPayload },
        { secret: constConfig.jwtSecret, expiresIn: constConfig.jwtTime },
      );

      res.setHeader('authentication', newToken);

      next();
    } catch (error) {
      throw new HttpException(
        {
          message: 'Invalid token',
          response: {},
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
