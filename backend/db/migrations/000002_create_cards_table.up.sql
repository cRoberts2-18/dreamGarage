CREATE TABLE IF NOT EXISTS cards(
   id serial PRIMARY KEY,
   name TEXT,
   image TEXT,
   rating TEXT,
   topSpeed INTEGER,
   horsepower INTEGER,
   handling INTEGER,
   engine TEXT
);