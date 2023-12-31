import { NodePackageManager } from "projen/lib/javascript";
import { MicroserviceProject } from "./private/microservice";
import { MonorepoProject } from "./private/monorepo";

const monorepo = new MonorepoProject({
  name: "growth-hub",
  defaultReleaseBranch: "main",
  devDeps: ["@aws-prototyping-sdk/nx-monorepo", "ts-node", "nodemon"],
  projenrcTs: true,
  packageManager: NodePackageManager.PNPM,
  repository: "https://github.com/edelwud/GrowthHub",
  eslintOptions: {
    dirs: ["private", "microservices", "libs"],
    ignorePatterns: ["*.js", "microservices/**/*.*"],
  },
});

new MicroserviceProject({
  parent: monorepo,
  name: "skills",
  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.PNPM,
  microservicePort: 3002,
  repository: "https://github.com/edelwud/GrowthHub",
  devDeps: ["@types/ws@8.5.4"],
  deps: ["ts-morph"],
});

new MicroserviceProject({
  parent: monorepo,
  name: "staff",
  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.PNPM,
  microservicePort: 3001,
  repository: "https://github.com/edelwud/GrowthHub",
  devDeps: ["@types/ws@8.5.4"],
  deps: ["ts-morph"],
});

new MicroserviceProject({
  parent: monorepo,
  name: "gateway",
  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.PNPM,
  isGateway: true,
  microservicePort: 3000,
  repository: "https://github.com/edelwud/GrowthHub",
});

monorepo.synth();
