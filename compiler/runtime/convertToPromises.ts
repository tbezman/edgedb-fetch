import { Executor } from "edgedb/dist/ifaces";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function convertToPromises(
  item: unknown,
  client: Executor,
  updateSelf: (value: unknown) => void,
  fragmentSelectMap: Map<string, (id: string) => unknown>,
) {
  if (!item) {
    return;
  } else if (Array.isArray(item)) {
    for (const index in item) {
      const sub = item[index];

      convertToPromises(
        sub,
        client,
        (newValue) => {
          item[index] = newValue;
        },
        fragmentSelectMap,
      );
    }
  } else if (typeof item === "object") {
    if ("__deferred" in item) {
      const selectFn = fragmentSelectMap.get(item.fragmentName);

      const nextValue = fragmentSelectMap
        .get(item.fragmentName)(item.id)
        .run(client)
        .then(async (result) => {
          await wait(Math.random() * 1000);

          return result;
        });

      updateSelf(nextValue);
    } else {
      Object.entries(item).forEach(([key, value]) => {
        convertToPromises(
          value,
          client,
          (newValue) => {
            item[key] = newValue;
          },
          fragmentSelectMap,
        );
      });
    }
  }
}
