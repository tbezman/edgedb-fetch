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

  useEffect(() => {
    context?.setCache((previous) => {
      const cache = clone(previous);

      const data = fragment.pull(ref);

      updateCache({ cache, data, type: findType(fragment.type_)! });

      return cache;
    });
  }, []);

  const data = fragment.pull(ref);
  const resultFromCache = readFromCache({
    cache: context?.cache ?? {},
    type: findType(fragment.type_)!,
    shape: fragment.shape()({}),
    id: data.id,
  }) as ReturnType<F["pull"]>;

  return resultFromCache ?? fragment.pull(ref);
}
