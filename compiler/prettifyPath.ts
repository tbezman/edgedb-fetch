import { spawn } from "child_process";

export async function prettifyPath(path: string) {
  const args = ["prettier", "--write", path, "--ignore-path"];

  return new Promise<void>((resolve, reject) => {
    const proc = spawn("bun", args);

    proc.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Prettify process exited with code ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}
