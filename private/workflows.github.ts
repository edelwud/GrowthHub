import { Component, Project } from "projen";
import { GitHub, GithubWorkflow } from "projen/lib/github";
import { JobPermission, Step } from "projen/lib/github/workflows-model";

export interface GithubWorkflowsOptions {
  prereleaseJobs: string[];
}

export class GithubWorkflows extends Component {
  github = new GitHub(this.project, {
    workflows: true,
  });

  setupSteps: Step[] = [
    {
      name: "checkout",
      uses: "actions/checkout@v3",
      with: {
        "fetch-depth": 0,
      },
    },
    {
      name: "pnpm setup",
      uses: "pnpm/action-setup@v2",
      with: {
        version: 8,
      },
    },
    {
      name: "node.js setup",
      uses: "actions/setup-node@v3",
      with: {
        "node-version": "18",
        cache: "pnpm",
      },
    },
    {
      name: "install dependencies",
      run: "pnpm install --frozen-lockfile",
    },
  ];

  constructor(
    project: Project,
    private options: GithubWorkflowsOptions,
  ) {
    super(project);
  }

  private synthReleaseWorkflow(): GithubWorkflow {
    const releaseWorkflow = new GithubWorkflow(this.github, "release");
    releaseWorkflow.on({
      push: {
        branches: ["main", "*.x"],
      },
    });

    this.options.prereleaseJobs.forEach((job) =>
      releaseWorkflow.addJob(job, {
        runsOn: ["ubuntu-latest"],
        permissions: {
          contents: JobPermission.READ,
        },
        steps: [
          ...this.setupSteps,
          {
            name: `nx affected:${job}`,
            uses: "mansagroup/nrwl-nx-action@v3.2.1",
            with: {
              targets: job,
              nxCloud: true,
            },
            env: {
              NX_CLOUD_ACCESS_TOKEN: "${{ secrets.NX_CLOUD_ACCESS_TOKEN }}",
            },
          },
        ],
      }),
    );

    releaseWorkflow.addJob("release", {
      needs: this.options.prereleaseJobs,
      runsOn: ["ubuntu-latest"],
      permissions: {
        contents: JobPermission.WRITE,
        packages: JobPermission.WRITE,
      },
      steps: [
        ...this.setupSteps,
        {
          name: "login to github container registry",
          uses: "docker/login-action@v2",
          with: {
            registry: "ghcr.io",
            username: "${{ github.actor }}",
            password: "${{ secrets.GITHUB_TOKEN }}",
          },
        },
        {
          name: "build affected docker images",
          uses: "mansagroup/nrwl-nx-action@v3.2.1",
          with: {
            targets: "docker",
            nxCloud: true,
            parallel: 3,
          },
          env: {
            NX_CLOUD_ACCESS_TOKEN: "${{ secrets.NX_CLOUD_ACCESS_TOKEN }}",
          },
        },
        {
          name: "release",
          uses: "mansagroup/nrwl-nx-action@v3.2.1",
          with: {
            targets: "release",
            nxCloud: true,
            parallel: 1,
          },
          env: {
            NX_CLOUD_ACCESS_TOKEN: "${{ secrets.NX_CLOUD_ACCESS_TOKEN }}",
            GITHUB_TOKEN: "${{ secrets.SEMANTIC_RELEASE_BOT_GITHUB_PAT }}",
          },
        },
      ],
    });

    return releaseWorkflow;
  }

  public synthesize() {
    this.synthReleaseWorkflow();
  }
}
