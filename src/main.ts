import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from "express";
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ["https://saberquest.xyz", "http://localhost:3000"],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  const config = new DocumentBuilder()
    .setTitle("SaberQuest API")
    .setDescription(`This is the documentation for the SaberQuest API<br>If you prefer swagger, you can use it over at ${process.env.REDIRECT_URI_API}/swagger`)
    .setVersion("0.1")
    .build()

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);

  app.use('/docs', apiReference({ content: document, theme: 'kepler' }))

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
