import { Type } from "edgedb/dist/reflection/queries";
import { EdgeDBCache } from "./context/EdgeDBProvider";
import { Cardinality } from "edgedb/dist/reflection";
import { spec } from "../dbschema/edgeql-js/imports";
import { fragmentMap } from "../dist/manifest";

export function findType(type_: string) {
  const entries = [...spec.values()];
  return entries.find((value) => {
    return value.name === type_;
  });
}

function isKeyFragment(key: string) {
  return key.startsWith("__");
}

function handleLinkedField({
  key,
  cache,
  pointer,
  linkValue,
  cacheEntry,
}: {
  key: string;
  pointer: any;
  cache: EdgeDBCache;
  cacheEntry: Record<string, unknown>;
  linkValue: { id: string } | Array<{ id: string }>;
}) {
  if (pointer.card === Cardinality.Many) {
    if (!Array.isArray(linkValue)) {
      console.error(linkValue);
      throw new Error(
        `Pointer cardindality expected an array, but got the above`,
      );
    }

    const targetType = spec.get(pointer.target_id);

    if (targetType?.name) {
      cacheEntry[key] = linkValue.map((item) => {
        updateCache({ cache, data: item, type: targetType });

        return { __ref__: item.id };
      });
    }
  } else if (pointer.card === Cardinality.One) {
    if (!("id" in linkValue) || typeof linkValue.id !== "string") {
      console.error(linkValue);
      throw new Error(
        "Pointer cardinality was 'ONE', so we expected an object with an id field, but got the above",
      );
    }

    const targetType = spec.get(pointer.target_id);
    updateCache({ cache, data: linkValue, type: targetType });
    cacheEntry[key] = { __ref__: linkValue.id };
  }
}

type UpdateCacheArgs = {
  cache: EdgeDBCache;
  data: any;
  type: Type;
};

export function updateCache({ cache, data, type }: UpdateCacheArgs) {
  const cacheEntry = cache[data.id as string] ?? {};
  cache[data.id as string] = cacheEntry;

  if (!type || type.kind !== "object") {
    throw new Error("Only expecting objects for now");
  }

  for (const key in data) {
    const value = data[key];

    const maybePointer = type.pointers.find((pointer) => {
      return pointer.name === key;
    });

    // This handles `id` since there is not pointer for that
    // Every other field should have a pointer.
    if (!maybePointer) {
      cacheEntry[key] = value;
    }

    if (isKeyFragment(key)) {
      updateCache({ cache, data: value, type });

      return;
    }

    if (maybePointer) {
      if (maybePointer.kind === "property") {
        cacheEntry[key] = value;
      } else if (maybePointer.kind === "link") {
        handleLinkedField({
          key,
          cache,
          cacheEntry,
          linkValue: value,
          pointer: maybePointer,
        });
      } else {
        throw new Error(`Unexpected pointer kind: ${maybePointer.kind}`);
      }
    }
  }

  return cache;
}

type ReadFromCacheArgs = {
  cache: EdgeDBCache;
  type: Type;
  shape: any;
  id: string;
};
export function readFromCache({ cache, shape, type, id }: ReadFromCacheArgs) {
  if (type?.kind !== "object") {
    throw new Error("Only expecting objects for now");
  }

  shape = shape({});
  const cacheEntry = cache[id];

  if (!cacheEntry) {
    return null;
  }

  const result: Record<string, unknown> = { id };
  for (const key in shape) {
    const shapeValue = shape[key];
    const cacheValue = cacheEntry[key];

    if (shapeValue === true) {
      result[key] = cacheEntry[key];
    } else if (shapeValue === false) {
      throw new Error("Did not expect false ");
    } else if (typeof shapeValue === "object") {
      if (key.startsWith("__")) {
        const fragmentName = key.slice(2);
        const fragmentDefinition = fragmentMap.get(fragmentName);

        if (!fragmentDefinition) {
          throw new Error(`Could not find fragment ${fragmentName}`);
        }

        result[key] = readFromCache({
          id,
          type,
          cache,
          shape: fragmentDefinition.shape(),
        });
      } else {
        const pointer = type?.pointers.find((pointer) => {
          return pointer.name === key;
        });

        const targetType = spec.get(pointer?.target_id!)!;

        if (pointer?.card === Cardinality.Many && Array.isArray(cacheValue)) {
          result[key] = cacheValue.map((item: any) => {
            const ref = item.__ref__;

            return readFromCache({
              cache,
              id: ref,
              type: targetType,
              shape: shapeValue,
            });
          });
        } else if (
          cacheValue &&
          typeof cacheValue === "object" &&
          "__ref__" in cacheValue &&
          typeof cacheValue.__ref__ === "string"
        ) {
          result[key] = readFromCache({
            cache,
            type: targetType,
            shape: () => shapeValue,
            id: cacheValue.__ref__,
          });
        }
      }
    } else if (typeof shapeValue === "function") {
      const pointer = type?.pointers.find((pointer) => {
        return pointer.name === key;
      });

      const targetType = spec.get(pointer?.target_id!)!;

      if (pointer?.card === Cardinality.Many && Array.isArray(cacheValue)) {
        result[key] = cacheValue.map((item: any) => {
          const ref = item.__ref__;

          return readFromCache({
            cache,
            id: ref,
            type: targetType,
            shape: shapeValue,
          });
        });
      } else {
        // result[key] = readFromCache(cache, targetType.name, value, id);
      }
    }
  }

  return result;
}
