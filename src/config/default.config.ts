export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT, 10) || 3000,
  },
  db: {
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    type: process.env.DB_TYPE || 'postgres',
    name: process.env.DB_NAME || 'taskmanager',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    synchronize: process.env.DB_TYPEORM_SYNC || false,
  },
  jwt: {
    expiresIn: process.env.JWT_EXPIRES_IN || 3600,
    secret: process.env.JWT_SECRET || 'topsecret',
  },
});
