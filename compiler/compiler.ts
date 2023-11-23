import { glob } from "fast-glob";
import { mkdirSync, rmdirSync } from "fs";
import { Project } from "ts-morph";

import { join } from "path";

import { Program } from "./context";
import { collectDefinitions } from "./collectDefinitions";
import { writeFragmentFile } from "./fragment";
import { writeQueryFile } from "./query";
import { writeManifestFile } from "./manifest";

const program: Program = {
  project: new Project(),
  fragments: new Map(),
  queries: new Map(),
};

rmdirSync(join(process.cwd(), "dist"), { recursive: true });
mkdirSync(join(process.cwd(), "dist"));

const files = await glob("**/*.ts*", { cwd: "src" });

await Promise.all(
  files.map(async (file) => {
    const definitions = await collectDefinitions(join("src", file));

    for (const query of definitions.queries) {
      program.queries.set(query.context.name().getText(), query);
    }

    for (const fragment of definitions.fragments) {
      program.fragments.set(fragment.context.name().getText(), fragment);
    }
  }),
);

const promises: Promise<void>[] = [];

for (const fragment of program.fragments.values()) {
  promises.push(writeFragmentFile(program, fragment));
}

for (const query of program.queries.values()) {
  promises.push(writeQueryFile(program, query));
}

promises.push(writeManifestFile(program));

await Promise.all(promises);
