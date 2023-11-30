import { Executor } from "edgedb/dist/ifaces";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function convertToPromises(
  item: unknown,
  client: Executor,
  updateSelf: (value: unknown) => void,
  fragmentSelectMap: Map<string, (id: string) => any>,
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
    if (
      "__deferred" in item &&
      "fragmentName" in item &&
      "id" in item &&
      typeof item.fragmentName === "string" &&
      typeof item.id === "string"
    ) {
      const selectFunction = fragmentSelectMap.get(item.fragmentName);

      if (!selectFunction) {
        throw new Error(`Fragment: ${item.fragmentName} did not exist.`);
      }

      const nextValue = selectFunction(item.id)
        .run(client)
        .then(async (result: any) => {
          // TODO(Terence): Remove this timeout which only exists for demo purposes.
          await wait(Math.random() * 500);

          return result;
        });

      updateSelf(nextValue);
    } else {
      for (const key in item) {
        // @ts-expect-error Haven't figured out types yet
        const value = item[key];

        convertToPromises(
          value,
          client,
          (newValue) => {
            // @ts-expect-error Haven't figured out types yet
            item[key] = newValue;
          },
          fragmentSelectMap,
        );
      }
    }
  }
}
