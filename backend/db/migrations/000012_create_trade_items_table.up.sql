CREATE TABLE IF NOT EXISTS trade_items (
    id serial PRIMARY KEY,
    trade_id INTEGER NOT NULL,
    user_card_id INTEGER NOT NULL,
    offered_by_user_id INTEGER NOT NULL,
    CONSTRAINT fk_trade_item_trade FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE,
    CONSTRAINT fk_trade_item_user_card FOREIGN KEY (user_card_id) REFERENCES user_cards(id),
    CONSTRAINT fk_trade_item_user FOREIGN KEY (offered_by_user_id) REFERENCES users(id)
);
