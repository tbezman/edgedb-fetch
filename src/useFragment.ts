"use client";

import e, { Cardinality } from "../dbschema/edgeql-js";
import { useContext, useEffect, useLayoutEffect } from "react";
import { EdgeDBContext, EdgeDBCache } from "./context/EdgeDBProvider";
import { $ } from "edgedb";
import { spec } from "../dbschema/edgeql-js/__spec__";
import rfdc from "rfdc";
import { fragmentMap } from "../dist/manifest";

function findType(type_: string) {
  const entries = [...spec.values()];
  return entries.find((value) => {
    return value.name === type_;
  });
}

const clone = rfdc();

function updateCache(cache: EdgeDBCache, data: any, type_: string) {
  const type = findType(type_);
  const cacheEntry = cache[data.id as string] ?? {};
  cache[data.id as string] = cacheEntry;

  if (type && type.kind === "object") {
    for (const key in data) {
      const value = data[key];

      const pointer = type.pointers.find((pointer) => {
        return pointer.name === key;
      });

      if (pointer?.kind === "link") {
        if (pointer.card === Cardinality.Many) {
          const arrayValue = value as any[];

          const targetType = spec.get(pointer.target_id);

          if (targetType?.name) {
            cacheEntry[key] = arrayValue.map((item) => {
              updateCache(cache, item, targetType!.name);

              return { __ref__: item.id };
            });
          }
        } else if (pointer.card === Cardinality.One) {
          const targetType = spec.get(pointer.target_id);
          updateCache(cache, value, targetType.name);
          cacheEntry[key] = { __ref__: value.id };
        }
      } else if (key.startsWith("__")) {
        updateCache(cache, value, type_);
      } else if (pointer?.kind === "property") {
        cacheEntry[key] = value;
      } else if (!pointer) {
        cacheEntry[key] = value;

        cache[data.id as string] = cacheEntry;
      }
    }
  }

  return cache;
}

function readFromCache(
  cache: EdgeDBCache,
  type_: string,
  shape: any,
  id: string,
) {
  let type = findType(type_);

  if (type?.kind !== "object") {
    throw new Error("Only expecting objects for now");
    return null;
  }

  shape = shape({});
  const cacheEntry = cache[id];

  if (!cacheEntry) {
    return null;
  }

  const result = {};
  result.id = id;
  for (const key in shape) {
    const value = shape[key];

    if (value === true) {
      result[key] = cacheEntry[key];
    } else if (value === false) {
      throw new Error("Did not expect false ");
    } else if (typeof value === "object") {
      if (key.startsWith("__")) {
        const fragmentName = key.slice(2);
        const fragmentDefinition = fragmentMap.get(fragmentName);

        if (!fragmentDefinition) {
          throw new Error(`Could not find fragment ${fragmentName}`);
        }

        const shape = fragmentDefinition.shape()({});

        console.log("Reading fragment definition", shape);
        result[key] = readFromCache(
          cache,
          type_,
          fragmentDefinition.shape(),
          id,
        );
      } else {
        const pointer = type?.pointers.find((pointer) => {
          return pointer.name === key;
        });

        const targetType = spec.get(pointer?.target_id!)!;

        if (pointer?.card === Cardinality.Many) {
          result[key] = cacheEntry[key].map((item: any) => {
            const ref = item.__ref__;

            return readFromCache(cache, targetType.name, value, ref);
          });
        } else {
          console.log("CACHDE ENTYR KEY", cacheEntry[key], cacheEntry, key);
          result[key] = readFromCache(
            cache,
            targetType.name,
            () => value,
            cacheEntry[key].__ref__,
          );
        }
      }
    } else if (typeof value === "function") {
      const pointer = type?.pointers.find((pointer) => {
        return pointer.name === key;
      });

      const targetType = spec.get(pointer?.target_id!)!;

      if (pointer?.card === Cardinality.Many) {
        result[key] = cacheEntry[key].map((item: any) => {
          const ref = item.__ref__;

          return readFromCache(cache, targetType.name, value, ref);
        });
      } else {
        // result[key] = readFromCache(cache, targetType.name, value, id);
      }
    }
  }

  return result;
}

export function useFragment(ref: any, fragment: ReturnType<typeof e.fragment>) {
  const context = useContext(EdgeDBContext);

  useLayoutEffect(() => {
    context?.setCache((previous) => {
      const cache = clone(previous);

      const data: Record<string, unknown> = fragment.pull(ref);

      updateCache(cache, data, fragment.type_);

      readFromCache(cache, fragment.type_, fragment.shape(), data.id);

      return cache;
    });
  }, []);

  const data = fragment.pull(ref);
  const resultFromCache = readFromCache(
    context?.cache ?? {},
    fragment.type_,
    fragment.shape(),
    data.id,
  );

  if (resultFromCache) {
    console.log("result from cache", resultFromCache);
  }

  return resultFromCache ?? fragment.pull(ref);
}
