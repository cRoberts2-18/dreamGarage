ALTER TABLE trade_items ADD COLUMN card_id INTEGER;

UPDATE trade_items ti
SET card_id = (SELECT card_id FROM user_cards WHERE id = ti.user_card_id)
WHERE ti.user_card_id IS NOT NULL;

ALTER TABLE trade_items ALTER COLUMN card_id SET NOT NULL;
ALTER TABLE trade_items ADD CONSTRAINT fk_trade_item_card FOREIGN KEY (card_id) REFERENCES cards(id);

ALTER TABLE trade_items ALTER COLUMN user_card_id DROP NOT NULL;
ALTER TABLE trade_items DROP CONSTRAINT IF EXISTS fk_trade_item_user_card;
ALTER TABLE trade_items ADD CONSTRAINT fk_trade_item_user_card FOREIGN KEY (user_card_id) REFERENCES user_cards(id) ON DELETE SET NULL;
