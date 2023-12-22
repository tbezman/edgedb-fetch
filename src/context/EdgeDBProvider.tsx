"use client";

import { findType, readFromCache, updateCache } from "@/cache";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

import rfdc from "rfdc";
import { fragmentMap } from "../../dist/manifest";

const clone = rfdc();

export type EdgeDBCache = Record<string, Record<string, unknown>>;

type EdgeDBContextType = {
  cache: EdgeDBCache;
  setCache: Dispatch<SetStateAction<EdgeDBCache>>;
  updateFragment: (
    name: string,
    id: string,
    updater: (previous: any) => any,
  ) => void;
};

export const EdgeDBContext = createContext<EdgeDBContextType | undefined>(
  undefined,
);

export function EdgeDBProvider({ children }: PropsWithChildren) {
  const [cache, setCache] = useState<EdgeDBCache>(() => ({}));

  const updateFragment = useCallback<EdgeDBContextType["updateFragment"]>(
    (name, id, updater) => {
      setCache((previousCache) => {
        const cache = clone(previousCache);
        const fragmentDefinion = fragmentMap.get(name);

        if (!fragmentDefinion) {
          throw new Error(`Fragment ${name} not found`);
        }

        const previousData = readFromCache({
          id,
          cache,
          type: findType(fragmentDefinion.type_)!,
          shape: fragmentDefinion.shape()({}),
        });

        const newData = { ...previousData, ...updater(previousData) };

        updateCache({
          cache,
          data: newData,
          type: findType(fragmentDefinion.type_)!,
        });

        return cache;
      });
    },
    [],
  );

  const value = useMemo(
    (): EdgeDBContextType => ({
      cache,
      setCache,
      updateFragment,
    }),
    [cache, updateFragment],
  );

  return (
    <EdgeDBContext.Provider value={value}>{children}</EdgeDBContext.Provider>
  );
}
