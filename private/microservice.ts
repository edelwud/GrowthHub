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
      prettier: true,
      tsconfig: {
        ...options.tsconfig,
        compilerOptions: {
          ...options.tsconfig?.compilerOptions,
          strictPropertyInitialization: false,
          emitDecoratorMetadata: true,
        },
      },
      tsconfigDev: {
        ...options.tsconfigDev,
        compilerOptions: {
          ...options.tsconfigDev?.compilerOptions,
          rootDir: ".",
          strictPropertyInitialization: false,
          emitDecoratorMetadata: true,
        },
      },
    });
    this.tsconfigDev?.addInclude("prisma/**/*.ts");
    this.addDeps(
      "@nestjs/common",
      "@nestjs/core",
      "@nestjs/graphql",
      "@nestjs/apollo",
      "@apollo/server",
      "@nestjs/platform-express",
      "@apollo/gateway@2.5.1",
      "@apollo/subgraph@2.5.1",
      "graphql",
      "graphql-type-json",
      "prisma-graphql-type-decimal",
      "class-transformer",
      "@paljs/plugins",
    );
    this.addDevDeps(
      "prisma@4.14.0",
      "prisma-nestjs-graphql",
      "@faker-js/faker",
      "dotenv",
    );
    this.gitignore.addPatterns("src/@generated", "prisma/sqlite");
    this.eslint?.addIgnorePattern("src/@generated");
    this.eslint?.addRules({
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: ["**/test/**", "**/build-tools/**", "**/prisma/**"],
          optionalDependencies: false,
          peerDependencies: true,
        },
      ],
    });
    this.preCompileTask.prependExec("prisma generate");

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
        "LABEL org.opencontainers.image.source=" + options.repository,
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
