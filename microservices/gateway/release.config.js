const appName = 'gateway';
const appPath = 'microservices/gateway';
const artifactName = appName;
module.exports = {
  name: appName,
  pkgRoot: `dist/${appPath}`, // should come from angular.cli
  tagFormat: artifactName + '-v${version}',
  commitPaths: ['force-release.md', `${appPath}/*`], // should come from dep-graph and angular.json
  assets: [`${appPath}/README.md`, `${appPath}/CHANGELOG.md`],
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: `${appPath}/CHANGELOG.md`,
      },
    ],
    [
      '@semantic-release/git',
      {
        message:
          `chore(release): ${artifactName}` +
          '-v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};