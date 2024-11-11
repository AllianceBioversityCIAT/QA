import { env } from 'process';

export default {
  jwtSecret: '@QEGTUI',
  port: 3000,
  jwtTime: '5h',
  host: '0.0.0.0',
  active_directory: {
    url: env.AD_URL,
    baseDN: env.AD_BASEDN,
    domain: env.AD_DOMAIN,
  },
};
