import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const ports = [3000, 3001, 3002, 3004];

function tryExec(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString('utf8')
      .trim();
  } catch {
    return '';
  }
}

for (const port of ports) {
  const pids = tryExec(`lsof -tiTCP:${port} -sTCP:LISTEN`) // macOS
    .split(/\s+/)
    .filter(Boolean);
  for (const pid of pids) {
    tryExec(`kill ${pid}`);
  }
}

// Clear Next cache to avoid missing chunk / pack rename corruption.
tryExec(`rm -rf "${ROOT}/.next"`);

