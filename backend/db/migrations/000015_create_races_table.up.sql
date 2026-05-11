CREATE TABLE IF NOT EXISTS races (
    id               SERIAL PRIMARY KEY,
    user_id          INT NOT NULL REFERENCES users(id),
    event_id         INT NOT NULL REFERENCES events(id),
    user_card_id     INT NOT NULL REFERENCES cards(id),
    opponent_card_id INT NOT NULL REFERENCES cards(id),
    result           TEXT NOT NULL,
    user_time        FLOAT NOT NULL,
    opponent_time    FLOAT NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);
