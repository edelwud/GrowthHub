import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
  const url = await app.getUrl();
  Logger.log(`${url}/graphql`);
  Logger.log("It's staff microservice");
}

void bootstrap();
