import { PrismaClient } from "@prisma/client";
import { type DeferredFragmentPath } from "../deferredFragmentsVisitor";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type FragmentMap = Map<string, () => any>;

export function convertToPromises(
  path: DeferredFragmentPath,
  result: Array<Record<string, unknown>> | Record<string, unknown> | null,
  fragmentMap: FragmentMap,
  client: PrismaClient,
) {
  if (!result) {
    return;
  }

  if (Array.isArray(result)) {
    result.forEach((item) => {
      convertToPromises(path, item, fragmentMap, client);
    });
  } else if (path.path.length === 0) {
    result.__deferred__ = {};

    for (const spread of path.fragmentSpreads) {
      result.__deferred__[spread] = fragmentMap.get(spread)(client, result.id);
    }
  } else {
    const [nextPathPart, ...rest] = path.path;
    return convertToPromises(
      {
        ...path,
        path: rest,
      },
      result[nextPathPart] as any,
      fragmentMap,
      client,
    );
  }
}
