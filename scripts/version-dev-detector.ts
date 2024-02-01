import { readFileSync } from 'fs';

function main() {
  let currentVersion: string;
  try {
    const packageJsonPath = './packages/smartsheet-typescript/package.json';
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    currentVersion = packageJson.version;
  } catch (error) {
    console.error('Error getting current version:', error);
    process.exit(1);
  }
  if (!currentVersion) {
    console.error('Error: current version is empty');
    process.exit(1);
  }
  if (currentVersion.match(/-dev\.\d+$/)) {
    console.error('ERROR: This is a dev version!! You cannot release it before finalizing it.');
    process.exit(1);
  }
}

main();
