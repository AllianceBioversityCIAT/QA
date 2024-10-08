import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TokenDto } from '../global-dto/token.dto';

export const UserToken = createParamDecorator(
  (authParameter = 'authentication', ctx: ExecutionContext): TokenDto => {
    const request = ctx.switchToHttp().getRequest();
    const headerValue = request.headers[authParameter];

    if (!headerValue) {
      throw new HttpException(
        'Authentication header not found',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = processUserToken(headerValue);
    console.log('🚀 ~ user:', user);
    return user;
  },
);

function processUserToken(headerValue: string): TokenDto {
  const token: TokenDto = <TokenDto>(
    JSON.parse(Buffer.from(headerValue.split('.')[1], 'base64').toString())
  );
  return token;
}
