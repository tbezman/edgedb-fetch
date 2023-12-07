import { spawn } from "child_process";

export async function prettifyPath(path: string) {
  const args = ["prettier", "--write", path, "--ignore-path"];

  return new Promise<void>((resolve, reject) => {
    const proc = spawn("bun", args);

    let output = "";

    proc.stderr.on("data", (data) => {
      // Accumulate the data in the output variable
      output += data.toString();
    });

    proc.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.log("OUTPUT", output);
        reject(new Error(output));
      }
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}
