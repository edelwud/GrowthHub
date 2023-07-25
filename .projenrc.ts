import { NodePackageManager } from "projen/lib/javascript";
import { MicroserviceProject } from "./private/microservice";
import { MonorepoProject } from "./private/monorepo";

const monorepo = new MonorepoProject({
  name: "growth-hub",
  defaultReleaseBranch: "main",
  devDeps: ["@aws-prototyping-sdk/nx-monorepo"],
  projenrcTs: true,
  packageManager: NodePackageManager.PNPM,
  repository: "https://github.com/edelwud/GrowthHub",
});

new MicroserviceProject({
  parent: monorepo,
  name: "staff",
  defaultReleaseBranch: "main",
  packageManager: NodePackageManager.PNPM,
  microservicePort: 3001,
  repository: "https://github.com/edelwud/GrowthHub",
  devDeps: ["@types/ws"],
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
