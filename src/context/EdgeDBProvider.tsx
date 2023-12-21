"use client";

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

const clone = rfdc();

export type EdgeDBCache = Record<string, Record<string, unknown>>;

type EdgeDBContextType = {
  cache: EdgeDBCache;
  setCache: Dispatch<SetStateAction<EdgeDBCache>>;
};

export const EdgeDBContext = createContext<EdgeDBContextType | undefined>(
  undefined,
);

export function EdgeDBProvider({ children }: PropsWithChildren) {
  const [cache, setCache] = useState<EdgeDBCache>(() => ({}));

  const value = useMemo(
    (): EdgeDBContextType => ({
      cache,
      setCache,
    }),
    [cache],
  );

  return (
    <EdgeDBContext.Provider value={value}>{children}</EdgeDBContext.Provider>
  );
}
