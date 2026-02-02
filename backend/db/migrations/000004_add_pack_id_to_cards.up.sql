alter TABLE cards ADD COLUMN packId INTEGER;

alter TABLE cards ADD CONSTRAINT fk_pack_card FOREIGN KEY (packId) REFERENCES packs (id);