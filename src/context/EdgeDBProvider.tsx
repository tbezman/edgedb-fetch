"use client";

import {
  PropsWithChildren,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

import rfdc from "rfdc";

const clone = rfdc();

type EdgeDBResponseRecord = { id: string; __type: string } & Record<
  string,
  unknown
>;

type EdgeRecord = Record<string, unknown>;
type EdgeDBCache = { [type: string]: { [id: string]: EdgeRecord } };

type EdgeDBContextType = {
  // Cache map of type => id => data
  //   cache: Map<string, Map<string, EdgeRecord>>;
  cache: EdgeDBCache;
  insertResponseIntoCache: (response: EdgeDBResponseRecord) => void;
};

export const EdgeDBContext = createContext<EdgeDBContextType | undefined>(
  undefined,
);

function updateCacheEntry(
  cache: EdgeDBCache,
  type: string,
  id: string,
  data: EdgeRecord,
) {
  const cloned = clone(cache);

  if (!cloned[type]) {
    cloned[type] = {};
  }

  const existing = cloned[type][id];
  cloned[type][id] = { ...existing, ...data };

  return cloned;
}

type CacheEntry = {
  id: string;
  __type: string;
  record: EdgeRecord;
};

function normalizeEdgeDBResponse(response: EdgeDBResponseRecord): CacheEntry[] {
  const entries: CacheEntry[] = [];
  const record: EdgeRecord = {};

  const id = response.id;
  const __type = response.__type;

  if (!id || !__type || typeof id !== "string" || typeof __type !== "string") {
    console.error(response);
    throw new Error(
      "Tried to normalize the above record without an id and type",
    );
  }

  for (const key in response) {
  }

  entries.push({ id, __type, record });

  return entries;
}

export function EdgeDBProvider({ children }: PropsWithChildren) {
  const [cache, setCache] = useState<EdgeDBCache>(() => ({}));

  const insertResponseIntoCache = useCallback(
    (response: EdgeDBResponseRecord) => {
      setCache((previous) => {
        const entries = normalizeEdgeDBResponse(response);

        const result = entries.reduce((cache, entry) => {
          return updateCacheEntry(cache, entry.__type, entry.id, entry.record);
        }, previous);

        console.log("Updated cache", result);

        return result;
      });
    },
    [],
  );

  const value = useMemo(
    (): EdgeDBContextType => ({
      cache,
      insertResponseIntoCache,
    }),
    [cache, insertResponseIntoCache],
  );

  return (
    <EdgeDBContext.Provider value={value}>{children}</EdgeDBContext.Provider>
  );
}
