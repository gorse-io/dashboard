const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const env = { ...process.env };
const opensslLegacyProvider = '--openssl-legacy-provider';
const nodeMajor = Number(process.versions.node.split('.')[0]);
const cliArgs = [];

if (nodeMajor >= 17 && !(env.NODE_OPTIONS || '').includes(opensslLegacyProvider)) {
  env.NODE_OPTIONS = [env.NODE_OPTIONS, opensslLegacyProvider].filter(Boolean).join(' ');
}

if (args[0] === 'serve') {
  cliArgs.push('--require', path.join(__dirname, 'webpack-dev-server-compat.js'));
}

const child = spawn(
  process.execPath,
  [...cliArgs, require.resolve('@vue/cli-service/bin/vue-cli-service.js'), ...args],
  {
    env,
    stdio: 'inherit',
  },
);

child.on('close', (code, signal) => {
  if (signal === 'SIGINT') {
    process.exit(130);
  }

  if (signal === 'SIGTERM') {
    process.exit(143);
  }

  process.exit(code || 0);
});
