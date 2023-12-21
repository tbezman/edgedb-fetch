import { createClient } from "../dbschema/edgeql-js";

const edgedbClientSingleton = () => {
  return createClient({ dsn: process.env.EDGEDB_DSN }).withConfig({
    allow_user_specified_id: true,
  });
};

declare global {
  var edgedb: undefined | ReturnType<typeof edgedbClientSingleton>;
}

const edgedb = globalThis.edgedb ?? edgedbClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.edgedb = edgedb;

export { edgedb as client };
