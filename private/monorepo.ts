import { relative } from "path";
import {
  NodePackageUtils,
  NxMonorepoProject,
  NxMonorepoProjectOptions,
  NxProject,
} from "@aws-prototyping-sdk/nx-monorepo";
import isNodeProject = NodePackageUtils.isNodeProject;
import { NodeProject } from "projen/lib/javascript";
import { TextFile } from "projen";

export interface MonorepoProjectOptions extends NxMonorepoProjectOptions {}

export class MonorepoProject extends NxMonorepoProject {
  constructor(options: MonorepoProjectOptions) {
    super(options);

    this.nxConfigurator.addNxRunManyTask("release", {
      target: "release",
    });

    this.nx.useNxCloud(
      "N2E2YzBkY2YtZmI5NS00ZTgxLWJjZDUtYjA3MDJmYWRmNTIyfHJlYWQtd3JpdGU",
    );

    new TextFile(this, "release.config.js", {
      lines: [
        "module.exports = {",
        "  preset: 'conventionalcommits',",
        "  presetConfig: {",
        "    types: [",
        "      { type: 'feat', section: 'Features' },",
        "      { type: 'fix', section: 'Bug Fixes' },",
        "      { type: 'chore', section: 'Chores' },",
        "      { type: 'docs', hidden: true },",
        "      { type: 'style', hidden: true },",
        "      { type: 'refactor', section: 'Refactoring' },",
        "      { type: 'perf', hidden: true },",
        "      { type: 'test', hidden: true },",
        "    ],",
        "  },",
        "  releaseRules: [{ type: 'refactor', release: 'patch' }],",
        "};",
      ],
    });

    new TextFile(this, ".github/workflows/release.yml", {
      lines: [
        `name: ${this.name} release`,
        "on:",
        " push:",
        "   branches:",
        "     - main",
        "     - '*.x'",
        "jobs:",
        "  lint:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v3.5.0",
        "        with:",
        "          fetch-depth: 0",
        "      - uses: pnpm/action-setup@v2",
        "        with:",
        "          version: 8",
        "      - uses: actions/setup-node@v3",
        "        with:",
        "          cache: pnpm",
        "      - run: pnpm i",
        "      - uses: mansagroup/nrwl-nx-action@v3.2.1",
        "        with:",
        "          targets: lint",
        "          nxCloud: 'true'",
        "        env:",
        "          NX_CLOUD_ACCESS_TOKEN: ${{secrets.NX_CLOUD_ACCESS_TOKEN}}",
        "  test:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v3.5.0",
        "        with:",
        "          fetch-depth: 0",
        "      - uses: pnpm/action-setup@v2",
        "        with:",
        "          version: 8",
        "      - uses: actions/setup-node@v3",
        "        with:",
        "          cache: pnpm",
        "      - run: pnpm i",
        "      - uses: mansagroup/nrwl-nx-action@v3.2.1",
        "        with:",
        "          targets: test",
        "          nxCloud: 'true'",
        "        env:",
        "          NX_CLOUD_ACCESS_TOKEN: ${{secrets.NX_CLOUD_ACCESS_TOKEN}}",
        "  build:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v3.5.0",
        "        with:",
        "          fetch-depth: 0",
        "      - uses: pnpm/action-setup@v2",
        "        with:",
        "          version: 8",
        "      - uses: actions/setup-node@v3",
        "        with:",
        "          cache: pnpm",
        "      - run: pnpm i",
        "      - name: Build affected",
        "        uses: mansagroup/nrwl-nx-action@v3.2.1",
        "        with:",
        "          targets: build",
        "          args: --configuration=production",
        "          nxCloud: 'true'",
        "        env:",
        "          NX_CLOUD_ACCESS_TOKEN: ${{secrets.NX_CLOUD_ACCESS_TOKEN}}",
        "      - name: Save build output",
        "        uses: actions/upload-artifact@v2",
        "        with:",
        "          name: packages",
        "          path: dist/packages",
        "",
        "  release:",
        "    needs:",
        "      - lint",
        "      - test",
        "      - build",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v3.5.0",
        "        with:",
        "          fetch-depth: 0",
        "      - uses: pnpm/action-setup@v2",
        "        with:",
        "          version: 8",
        "      - uses: actions/setup-node@v3",
        "        with:",
        "          cache: pnpm",
        "      - run: pnpm i",
        "      - name: Get build output",
        "        continue-on-error: true",
        "        uses: actions/download-artifact@v2",
        "        with:",
        "          name: packages",
        "          path: dist/packages",
        "      - name: Release affected",
        "        uses: mansagroup/nrwl-nx-action@v3.2.1",
        "        with:",
        "          targets: release",
        "          nxCloud: 'true'",
        "        env:",
        "          NX_CLOUD_ACCESS_TOKEN: ${{secrets.NX_CLOUD_ACCESS_TOKEN}}",
        "          GITHUB_TOKEN: ${{ secrets.SEMANTIC_RELEASE_BOT_GITHUB_PAT }}",
      ],
    });
  }

  preSynthesize() {
    super.preSynthesize();
    this.subprojects.forEach((subproject) => {
      if (isNodeProject(subproject) && subproject instanceof NodeProject) {
        subproject.addDevDeps("semantic-release");
        subproject.addDevDeps("semantic-release-plus");
        subproject.addDevDeps("@semantic-release/changelog");
        subproject.addDevDeps("@semantic-release/git");
        subproject.addDevDeps("@semantic-release/release-notes-generator");
        if (subproject.tryFindFile(".helm")) {
          subproject.addDevDeps("semantic-release-helm");
        }

        NxProject.ensure(subproject).setTarget("release", {
          executor: "nx:run-commands",
          options: {
            command: "pnpm exec semantic-release-plus",
            cwd: relative(this.outdir, subproject.outdir),
          },
        });

        new TextFile(subproject, "release.config.js", {
          lines: [
            `const appName = '${subproject.name}';`,
            `const appPath = '${relative(this.outdir, subproject.outdir)}';`,
            "const artifactName = appName;",
            "module.exports = {",
            "  name: appName,",
            "  pkgRoot: 'lib/',",
            "  tagFormat: artifactName + '-v${version}',",
            "  commitPaths: ['*'],",
            "  assets: ['README.md', 'CHANGELOG.md'],",
            "  branches: ['main'],",
            "  plugins: [",
            "    '@semantic-release/commit-analyzer',",
            "    '@semantic-release/release-notes-generator',",
            "    [",
            "      '@semantic-release/changelog',",
            "      {",
            "        changelogFile: `${appPath}/CHANGELOG.md`,",
            "      },",
            "    ],",
            "    [",
            "      '@semantic-release/git',",
            "      {",
            "        message:",
            "          `chore(release): ${artifactName}` +",
            "          '-v${nextRelease.version} [skip ci]\\n\\n${nextRelease.notes}',",
            "      },",
            "    ],",
            "  ],",
            "};",
          ],
        });
      }
    });
  }
}
