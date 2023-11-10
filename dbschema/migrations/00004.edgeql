CREATE MIGRATION m1tca3fbvik2wmewfbp6tvecvqtxdqqog4rahpoidfx2dxpsalkwoq
    ONTO m1cqaddrjwpkbdovsz57ayeysd5jqdlozwshprxg4mv2gsz254qdea
{
  ALTER TYPE default::Post {
      ALTER LINK author {
          SET REQUIRED USING (<default::User>{});
      };
  };
};
