import { SampleFile, TextFile } from "projen";
import {
  TypeScriptAppProject,
  TypeScriptProjectOptions,
} from "projen/lib/typescript";

export interface MicroserviceProjectOptions extends TypeScriptProjectOptions {
  microservicePort: number;
  isGateway?: boolean;
}

export class MicroserviceProject extends TypeScriptAppProject {
  constructor(options: MicroserviceProjectOptions) {
    super({
      ...options,
      outdir: "./microservices/" + options.name,
      sampleCode: false,
      tsconfig: {
        ...options.tsconfig,
        compilerOptions: {
          ...options.tsconfig?.compilerOptions,
        },
      },
    });
    this.addDeps(
      "@nestjs/common",
      "@nestjs/core",
      "@nestjs/graphql",
      "@nestjs/apollo",
      "@apollo/server",
      "graphql",
    );
    if (options.isGateway) this.addDeps("@apollo/gateway");

    new TextFile(this, ".dockerignore", {
      lines: [
        ".vscode",
        ".idea",
        "node_modules",
        "dist",
        "coverage",
        ".git",
        "Dockerfile",
      ],
    });

    new TextFile(this, "Dockerfile", {
      lines: [
        "FROM node:18-alpine",
        "WORKDIR /microservice/" + options.name,
        "RUN npm i -g pnpm",
        "COPY package*.json .",
        "RUN pnpm i --no-frozen-lockfile",
        "COPY . .",
        "RUN pnpm run build",
        'CMD ["node", "lib/main.js"]',
      ],
    });

    new SampleFile(this, "src/main.ts", {
      contents: [
        "import { NestFactory } from '@nestjs/core';",
        "import { AppModule } from './app.module';",
        "",
        "async function bootstrap() {",
        "  const app = await NestFactory.create(AppModule);",
        `  await app.listen(${options.microservicePort});`,
        "}",
        "void bootstrap();",
        "",
      ].join("\n"),
    });

    new SampleFile(this, "src/app.module.ts", {
      contents: [
        "import { Module } from '@nestjs/common';",
        "",
        "@Module({",
        "  imports: [],",
        "  providers: [],",
        "})",
        "export class AppModule {}",
        "",
      ].join("\n"),
    });

    new SampleFile(this, ".env.example", {
      contents: [
        "DATABASE_URL=postgresql://user:password@localhost:5432/dbname",
      ].join("\n"),
    });
  }
}
