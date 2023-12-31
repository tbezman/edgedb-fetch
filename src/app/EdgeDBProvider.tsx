"use client";
import { EdgeDBProvider as External } from "@edgedb/react/dist/react/src/EdgeDBProvider";
import { spec } from "../../dbschema/edgeql-js/__spec__";
import { fragmentMap } from "../../dbschema/edgeql-js/manifest";
import { PropsWithChildren } from "react";

export function EdgeDBProvider({ children }: PropsWithChildren) {
  return (
    <External spec={spec} fragmentMap={fragmentMap}>
      {children}
    </External>
  );
}
