CREATE TABLE IF NOT EXISTS trades (
    id serial PRIMARY KEY,
    initiator_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    pending_user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_trade_initiator FOREIGN KEY (initiator_id) REFERENCES users(id),
    CONSTRAINT fk_trade_recipient FOREIGN KEY (recipient_id) REFERENCES users(id),
    CONSTRAINT fk_trade_pending FOREIGN KEY (pending_user_id) REFERENCES users(id)
);
