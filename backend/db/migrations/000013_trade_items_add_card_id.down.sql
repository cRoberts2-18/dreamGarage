ALTER TABLE trade_items DROP CONSTRAINT IF EXISTS fk_trade_item_user_card;
ALTER TABLE trade_items ADD CONSTRAINT fk_trade_item_user_card FOREIGN KEY (user_card_id) REFERENCES user_cards(id);
ALTER TABLE trade_items ALTER COLUMN user_card_id SET NOT NULL;
ALTER TABLE trade_items DROP CONSTRAINT IF EXISTS fk_trade_item_card;
ALTER TABLE trade_items DROP COLUMN IF EXISTS card_id;
