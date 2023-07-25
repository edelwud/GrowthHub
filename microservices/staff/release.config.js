const appName = 'staff';
const appPath = 'microservices/staff';
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
        changelogFile: `CHANGELOG.md`,
      },
    ],
    [
      '@semantic-release-plus/docker',
      {
        name: `ghcr.io/edelwud/${appName}`,
        skipLogin: 'true'
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md'],
        message:
          `chore(release): ${artifactName}` +
          '-v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};