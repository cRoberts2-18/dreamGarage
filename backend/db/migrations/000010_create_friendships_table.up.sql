CREATE TABLE IF NOT EXISTS friendships (
    id serial PRIMARY KEY,
    requester_id INTEGER NOT NULL,
    addressee_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_friendship_requester FOREIGN KEY (requester_id) REFERENCES users(id),
    CONSTRAINT fk_friendship_addressee FOREIGN KEY (addressee_id) REFERENCES users(id),
    CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
);
