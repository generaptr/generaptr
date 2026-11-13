import { spawn } from 'node:child_process';

/**
 * Runs a command in `cwd` without a shell, so paths with spaces stay safe.
 */
export const run = async (command: string, args: string[], cwd: string): Promise<void> =>
  new Promise<void>((resolve: () => void, reject: (reason: Error) => void): void => {
    spawn(command, args, { cwd, stdio: 'inherit' })
      .on('error', reject)
      .on('exit', (code: number | null) =>
        code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`)));
  });
