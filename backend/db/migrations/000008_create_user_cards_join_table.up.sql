CREATE TABLE IF NOT EXISTS user_cards(
    id serial PRIMARY KEY,
    user_id INTEGER,
    card_id INTEGER
);

alter TABLE user_cards ADD CONSTRAINT fk_user_card_user_id FOREIGN KEY (user_id) REFERENCES users (id);
alter TABLE user_cards ADD CONSTRAINT fk_user_card_card_id FOREIGN KEY (card_id) REFERENCES cards (id);
