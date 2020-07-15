import * as PostgressConnectionStringParser from 'pg-connection-string';

export default () => {
  const databaseUrl: string = process.env.DATABASE_URL;
  const connectionOptions = PostgressConnectionStringParser.parse(databaseUrl);

  return {
    app: {
      port: parseInt(process.env.PORT, 10) || 3000,
    },
    db: {
      host: connectionOptions.host,
      port: connectionOptions.port,
      database: connectionOptions.database,
      username: connectionOptions.user,
      password: connectionOptions.password,
      synchronize: process.env.DB_TYPEORM_SYNC || false,
    },
    jwt: {
      expiresIn: process.env.JWT_EXPIRES_IN || 3600,
      secret: process.env.JWT_SECRET || 'topsecret',
    },
  };
};
