import { Pointer, Type } from "edgedb/dist/reflection/queries";
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

function isNode(value: any): value is { id: string } {
  return (
    (value && typeof value === "object") ||
    ("id" in value && typeof value.id === "string")
  );
}

const optimisticIds = new Set<string>();

export function isOptimistic(record: { id: string }) {
  return optimisticIds.has(record.id);
}

function handleLinkedField({
  key,
  cache,
  pointer,
  linkValue,
  cacheEntry,
}: {
  key: string;
  pointer: Pointer;
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
  data: { id: string } & Record<string, unknown>;
  type: Type;
};

export function updateCache({ cache, data, type }: UpdateCacheArgs) {
  if (!("id" in data) || typeof data.id !== "string") {
    console.error(data);
    throw new Error("Tried to insert the above without an id");
  }

  if (!type || type.kind !== "object") {
    throw new Error("Expected type with kind object, but got: " + type?.kind);
  }

  const cacheEntry = cache[data.id as string] ?? {};
  cache[data.id as string] = cacheEntry;

  if (data.__optimistic__) {
    optimisticIds.add(data.id);

    delete data.__optimistic__;
  } else {
    optimisticIds.delete(data.id);
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
      if (!isNode(value)) {
        console.error(value);
        throw new Error(
          "Expected fragment value to be an object with an id in it, but got above instead.",
        );
      }

      updateCache({ cache, data: value, type });

      return;
    }

    if (maybePointer) {
      if (maybePointer.kind === "property") {
        cacheEntry[key] = value;
      } else if (maybePointer.kind === "link") {
        if (!isNode(value)) {
          console.error(value);
          throw new Error(
            "Expected linked field to be an object with an id in it, but got above instead.",
          );
        }

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
  shape: Record<string, unknown>;
  id: string;
};

export function readFromCache({ cache, shape, type, id }: ReadFromCacheArgs) {
  if (type?.kind !== "object") {
    throw new Error("Expected type with kind object, but got: " + type?.kind);
  }

  const cacheEntry = cache[id];

  if (!cacheEntry) {
    return null;
  }

  const result: Record<string, unknown> = { id };
  for (const key in shape) {
    const shapeValue = shape[key];
    const cacheValue = cacheEntry[key];

    // These are special keys that are used for filtering and ordering
    // that should not be put into the cache
    if (key === "filter_single" || key === "filter" || key === "order_by") {
      continue;
    }

    if (shapeValue === true) {
      result[key] = cacheEntry[key];
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
          shape: fragmentDefinition.shape()({}),
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
              shape: shapeValue({}),
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
            shape: shapeValue,
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
            shape: shapeValue({}),
          });
        });
      } else {
        // result[key] = readFromCache(cache, targetType.name, value, id);
      }
    }
  }

  return result;
}
