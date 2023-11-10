CREATE MIGRATION m163mcfsvq3idu6wzec4aihagy327sq3x3wbzyafncxcjtckt6f7ha
    ONTO initial
{
  CREATE TYPE default::Post {
      CREATE REQUIRED PROPERTY content: std::str;
      CREATE REQUIRED PROPERTY published: std::bool;
      CREATE REQUIRED PROPERTY title: std::str;
  };
  CREATE TYPE default::User {
      CREATE REQUIRED PROPERTY age: std::int32;
      CREATE REQUIRED PROPERTY name: std::str;
  };
  ALTER TYPE default::Post {
      CREATE LINK author: default::User;
  };
  ALTER TYPE default::User {
      CREATE LINK post := (.<author[IS default::Post]);
  };
};
