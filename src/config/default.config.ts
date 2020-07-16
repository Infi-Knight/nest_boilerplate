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
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10) || 3600,
      secret: process.env.JWT_SECRET || 'topsecret',
    },
  };
};
