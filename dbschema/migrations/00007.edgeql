CREATE MIGRATION m1ladmyt3mmj6e5aj5u5srghi7p533h2otvj33yl57qunes3bgezxa
    ONTO m1htxk7mdpuaniphi6tgdu6u6ds3vyfefsifcy7tqylxmyjpxthg7q
{
  ALTER TYPE default::Comment {
      CREATE MULTI LINK replies := (.<parentComment[IS default::Comment]);
  };
};
