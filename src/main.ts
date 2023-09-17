import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { readFileSync } from 'fs';
import { AppCreationOptions } from './interfaces/IAppCreationOptions';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  let options: AppCreationOptions = { cors: { origin: true, credentials: true } };
  if(process.env.ENABLE_HTTPS === 'true') {
    options.httpsOptions = {
      cert: readFileSync('/user/src/app/ssl/fullchain1.pem'),
      key: readFileSync('/user/src/app/ssl/privkey1.pem')
    }
  }
  const app = await NestFactory.create(AppModule, options);
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('OpenChatRooms')
    .setDescription('The OpenChatRoom API description')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.APP_PORT!);
}
bootstrap();