CREATE MIGRATION m1j2jfw4bzage6b7zy4nyr4co3k3mh6a6xt6ja4f35oradqofokhwq
    ONTO m1amtqfwmg5ahjf6hlgg2sk5v3ihnda2hypc5ke6bc2taca3tvlbjq
{
  ALTER TYPE default::Comment {
      ALTER LINK parentPost {
          RESET OPTIONALITY;
      };
  };
};
