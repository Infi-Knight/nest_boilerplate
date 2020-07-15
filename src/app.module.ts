import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';

import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import defaultConfig from './config/default.config';

const envVariablesValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .required(),
  DATABASE_URL: Joi.string().required(),
  APP_PORT: Joi.number().required(),
  DB_TYPEORM_SYNC: Joi.boolean().required(),
  JWT_EXPIRES_IN: Joi.number().required(),
  JWT_SECRET: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      // Instead of using raw env variables from .env we will maximize
      // using the transformed values from src/config/default.config
      // e.g instead of using DB_PORT we are using db.port value which might
      // have transformed the DB_PORT value (transformations like parseInt or setting a default)
      // this gives us an added benefit of type safety and custom transformations
      load: [defaultConfig],
      validationSchema: envVariablesValidationSchema,
      expandVariables: true,
      validationOptions: {
        abortEarly: false, // show all failing validations
      },
    }),
    // https://docs.nestjs.com/techniques/database#async-configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('db.host'),
        port: configService.get<number>('db.port'),
        username: configService.get('db.username'),
        password: configService.get('db.password'),
        database: configService.get('db.database'),
        // https://github.com/nrwl/nx/issues/1393#issuecomment-526135967
        entities: getMetadataArgsStorage().tables.map(tbl => tbl.target),
        synchronize: configService.get<boolean>('db.synchronize'),
      }),
    }),
    TasksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
