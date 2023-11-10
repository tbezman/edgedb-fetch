CREATE MIGRATION m1cqaddrjwpkbdovsz57ayeysd5jqdlozwshprxg4mv2gsz254qdea
    ONTO m1qb56soxwn2gqkieytvbpmc56amlezsig2d35j2uqfxkmufqbvsta
{
  ALTER TYPE default::User {
      ALTER LINK posts {
          SET MULTI;
      };
  };
};
