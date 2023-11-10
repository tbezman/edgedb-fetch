CREATE MIGRATION m1qfxz7zb45dlvvexuuz7cq5v466pwasdjp4h3odqfjsmuf2au3aua
    ONTO m1tca3fbvik2wmewfbp6tvecvqtxdqqog4rahpoidfx2dxpsalkwoq
{
  CREATE TYPE default::Comment {
      CREATE REQUIRED LINK author: default::User;
      CREATE LINK parentComment: default::Comment;
      CREATE REQUIRED PROPERTY text: std::str;
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK comments := (.<author[IS default::Comment]);
  };
};
