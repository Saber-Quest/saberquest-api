import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from "express";

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
    .setDescription("This is the documentation for the SaberQuest API")
    .setVersion("0.1")
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, documentFactory)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
