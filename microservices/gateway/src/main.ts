import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  const url = await app.getUrl();
  Logger.log(`${url}/graphql`);
  Logger.log("It's gateway microservice");
}
void bootstrap();
