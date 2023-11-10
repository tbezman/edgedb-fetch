CREATE MIGRATION m1qb56soxwn2gqkieytvbpmc56amlezsig2d35j2uqfxkmufqbvsta
    ONTO m163mcfsvq3idu6wzec4aihagy327sq3x3wbzyafncxcjtckt6f7ha
{
  ALTER TYPE default::User {
      ALTER LINK post {
          RENAME TO posts;
      };
  };
};
