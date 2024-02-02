import { readFileSync, writeFileSync } from 'fs';

/**
 * The type of version bump to perform.
 * - major: Increment the major version number (e.g. 1.0.0 -> 2.0.0)
 * - minor: Increment the minor version number (e.g. 1.0.0 -> 1.1.0)
 * - patch: Increment the patch version number (e.g. 1.0.0 -> 1.0.1)
 * - dev: Increment the dev version number (e.g. 1.0.0 -> 1.0.0-dev.0)
 */
type VersionType = 'major' | 'minor' | 'patch' | 'dev';

/**
 * Bump the version number based on the type.
 * @param currentVersion - The current version string read from package.json
 * @param type - The type of version bump (from terminal argument)
 */
function bumpVersion(currentVersion: string, type: VersionType): string {
  const devMatch = currentVersion.match(/-dev\.(\d+)$/);
  if (type === 'dev') {
    if (devMatch) {
      const devNumber = parseInt(devMatch[1], 10) + 1;
      return currentVersion.replace(/-dev\.\d+$/, `-dev.${devNumber}`);
    } else {
      return `${currentVersion}-dev.0`;
    }
  }
  const mainVersion = currentVersion.replace(/-dev\.\d+$/, '');
  const parts = mainVersion.split('.').map((part) => parseInt(part, 10));
  switch (type) {
    case 'major':
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1] += 1;
      parts[2] = 0;
      break;
    case 'patch':
      parts[2] += 1;
      break;
    default:
      throw new Error(`Unknown version type: ${type}`);
  }
  return parts.join('.');
}

function main() {
  const args = Bun.argv.slice(2); // Skip the first two default arguments
  const versionType: VersionType = (args[0] ? args[0] : 'dev') as VersionType;

  if (!versionType || !['major', 'minor', 'patch', 'dev'].includes(versionType)) {
    console.error('Usage: bun version <major|minor|patch|dev>');
    process.exit(1);
  }

  try {
    const packageJsonPath = './packages/smartsheet-typescript/package.json';
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;

    const newVersion = bumpVersion(currentVersion, versionType);
    packageJson.version = newVersion;

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Version updated.\nFrom: ${currentVersion}\nTo:   ${newVersion}`);
  } catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
  }
}

main();
