import 'dotenv/config';
import { env } from 'process';
import { DataSource } from 'typeorm';

export const datasource: DataSource = new DataSource({
  type: 'mysql',
  host: env.DB_HOST,
  port: parseInt(env.DB_PORT),
  username: env.DB_USER_NAME,
  password: env.DB_USER_PASS,
  database: env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: true,
  logging: false,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  metadataTableName: 'metadata',
});
