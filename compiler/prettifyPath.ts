export async function prettifyPath(path: string) {
  const args = [`bun`, `prettier`, "--write", path, "--ignore-path"];

  const proc = Bun.spawn(args);

  await proc.exited;
}
