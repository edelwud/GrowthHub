const path = require("path");
const appName = path.basename(path.dirname(__filename));

module.exports = {
  name: appName,
  pkgRoot: "lib/",
  tagFormat: appName + "-v${version}",
  commitPaths: ["*"],
  assets: ["README.md", "CHANGELOG.md"],
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        changelogFile: `CHANGELOG.md`,
      },
    ],
    [
      "@semantic-release-plus/docker",
      {
        name: `ghcr.io/edelwud/${appName}`,
        skipLogin: "true",
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md"],
        message:
          `chore(release): ${appName}` +
          "-v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
