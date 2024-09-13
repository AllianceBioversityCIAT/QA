import { Reflector } from '@nestjs/core';
import { RolesHandler } from '../enum/roles-handler.enum';

export const Roles = Reflector.createDecorator<RolesHandler[]>();