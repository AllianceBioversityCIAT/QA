import { Routes } from '@nestjs/core';
import { ModulesRoutes } from './api/modules.routes';

export const MainRoutes: Routes = [
  {
    path: 'api/',
    children: ModulesRoutes,
  },
];
