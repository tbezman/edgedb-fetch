CREATE MIGRATION m1htxk7mdpuaniphi6tgdu6u6ds3vyfefsifcy7tqylxmyjpxthg7q
    ONTO m1qfxz7zb45dlvvexuuz7cq5v466pwasdjp4h3odqfjsmuf2au3aua
{
  ALTER TYPE default::Comment {
      CREATE REQUIRED LINK parentPost: default::Post {
          SET REQUIRED USING (<default::Post>{});
      };
  };
  ALTER TYPE default::Post {
      CREATE MULTI LINK comments := (.<parentPost[IS default::Comment]);
  };
};
