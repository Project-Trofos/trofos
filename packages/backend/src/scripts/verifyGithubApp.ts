import { GithubAppService } from '../services/githubApp.service';

async function main() {
  const service = GithubAppService.fromEnvironment();
  const installations = await service.listInstallations();
  if (!installations.length) throw new Error('App authentication succeeded, but no installations were found. Install the App on a test repository first.');
  console.log(`App authentication succeeded. Found ${installations.length} installation(s).`);
  let verified = 0;
  for (const installation of installations) {
    console.log(`Installation ${installation.id}: ${installation.account?.login || installation.account?.name || 'unknown account'}`);
    if (installation.suspended_at) {
      console.log('  Suspended; repository verification skipped.');
      continue;
    }
    const repositories = await service.listRepositories(installation.id);
    console.log(`  Repository access verified: ${repositories.length} repository/repositories.`);
    for (const repo of repositories) console.log(`  ${repo.full_name} (ID ${repo.id})`);
    verified += 1;
  }
  if (!verified) throw new Error('No active installations available to verify repository access.');
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'GitHub App verification failed.');
  process.exitCode = 1;
});
