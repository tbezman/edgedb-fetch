CREATE MIGRATION m1amtqfwmg5ahjf6hlgg2sk5v3ihnda2hypc5ke6bc2taca3tvlbjq
    ONTO m1ladmyt3mmj6e5aj5u5srghi7p533h2otvj33yl57qunes3bgezxa
{
  ALTER TYPE default::Comment {
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
      };
  };
  ALTER TYPE default::Post {
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
      };
  };
};
