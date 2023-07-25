const appName = 'gateway';
const appPath = 'microservices/gateway';
const artifactName = appName;
module.exports = {
  name: appName,
  pkgRoot: 'lib/',
  tagFormat: artifactName + '-v${version}',
  commitPaths: ['*'],
  assets: ['README.md', 'CHANGELOG.md'],
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
    [
      '@semantic-release-plus/docker',
      {
        name: `edelwud/${appName}`+':${nextRelease.version}',
        registry: 'ghcr.io',
        skipLogin: 'true'
      },
    ],
  ],
};