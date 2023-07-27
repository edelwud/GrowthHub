import { readFileSync } from "fs";
import { relative, join } from "path";
import {
  NodePackageUtils,
  NxMonorepoProject,
  NxMonorepoProjectOptions,
  NxProject,
} from "@aws-prototyping-sdk/nx-monorepo";
import { TextFile } from "projen";
import isNodeProject = NodePackageUtils.isNodeProject;
import { MicroserviceProject } from "./microservice";
import { GithubWorkflows } from "./workflows.github";

export interface MonorepoProjectOptions extends NxMonorepoProjectOptions {}

export class MonorepoProject extends NxMonorepoProject {
  runManyTasks = ["release", "docker", "watch-and-run"];
  semVerDeps = [
    "semantic-release-plus",
    "@semantic-release/changelog",
    "@semantic-release/git",
    "@semantic-release-plus/docker",
    "@semantic-release/release-notes-generator",
  ];

  constructor(options: MonorepoProjectOptions) {
    super(options);

    this.gitignore.include("lib");
    this.deps.removeDependency("aws-cdk-lib");
    this.deps.removeDependency("cdk-nag");
    this.deps.removeDependency("constructs");
    this.eslint?.addRules({
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/test/**",
            "**/build-tools/**",
            ".projenrc.ts",
            "projenrc/**/*.ts",
            "private/*.ts",
          ],
          optionalDependencies: false,
          peerDependencies: true,
        },
      ],
    });

    this.runManyTasks.forEach((task) =>
      this.nxConfigurator.addNxRunManyTask(task, {
        target: task,
      }),
    );

    new GithubWorkflows(this, {
      prereleaseJobs: ["lint", "test", "build"],
    });

    this.nx.useNxCloud(
      "N2E2YzBkY2YtZmI5NS00ZTgxLWJjZDUtYjA3MDJmYWRmNTIyfHJlYWQtd3JpdGU",
    );

    new TextFile(this, "release.config.js", {
      lines: readFileSync(
        join(__dirname, "templates", "release-base.config.js"),
      )
        .toString()
        .split("\n"),
    });
  }

  preSynthesize() {
    super.preSynthesize();
    this.subprojects.forEach((subproject) => {
      if (
        isNodeProject(subproject) &&
        subproject instanceof MicroserviceProject
      ) {
        this.semVerDeps.forEach((dep) => subproject.addDevDeps(dep));
        if (subproject.tryFindFile(".helm")) {
          subproject.addDevDeps("semantic-release-helm");
        }

        const nxProject = NxProject.ensure(subproject);
        const projectTargets = [
          {
            name: "release",
            command: "pnpm exec semantic-release-plus",
          },
          {
            name: "docker",
            command: `docker build -t edelwud/${subproject.name} .`,
          },
          {
            name: "watch-and-run",
            command: "nodemon src/main.ts",
          },
        ];

        projectTargets.forEach(({ name, command }) =>
          nxProject.setTarget(name, {
            executor: "nx:run-commands",
            options: {
              command,
              cwd: relative(this.outdir, subproject.outdir),
            },
          }),
        );

        new TextFile(subproject, "release.config.js", {
          lines: readFileSync(join(__dirname, "templates", "release.config.js"))
            .toString()
            .split("\n"),
        });
      }
    });
  }
}
