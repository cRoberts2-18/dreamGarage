CREATE TABLE IF NOT EXISTS packs(
   id serial PRIMARY KEY,
   name TEXT,
   image TEXT,
   price INTEGER,
   featured BOOLEAN
);