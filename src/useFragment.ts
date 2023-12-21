"use client";

import { useContext, useEffect } from "react";
import { EdgeDBContext } from "./context/EdgeDBProvider";
import rfdc from "rfdc";
import { FragmentReturnType } from "../dbschema/edgeql-js/select";
import { findType, readFromCache, updateCache } from "./cache";

const clone = rfdc();

export function useFragment<F extends FragmentReturnType<any, any>>(
  ref: Parameters<F["pull"]>[0],
  fragment: F,
): ReturnType<F["pull"]> {
  const context = useContext(EdgeDBContext);
  const setCache = context?.setCache;
  const data = fragment.pull(ref);

  useEffect(() => {
    setCache?.((previous) => {
      const cache = clone(previous);

      updateCache({ cache, data, type: findType(fragment.type_)! });

      return cache;
    });
  }, [ref, setCache, data, fragment.type_]);

  const resultFromCache = readFromCache({
    cache: context?.cache ?? {},
    type: findType(fragment.type_)!,
    shape: fragment.shape()({}),
    id: data.id,
  }) as ReturnType<F["pull"]>;

  return resultFromCache ?? data;
}
