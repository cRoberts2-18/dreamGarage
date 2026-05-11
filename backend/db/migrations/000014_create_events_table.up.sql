CREATE TABLE IF NOT EXISTS events (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL
);

INSERT INTO events (name, type) VALUES
    ('Drag Race',    'drag'),
    ('Circuit Race', 'circuit'),
    ('Rally Stage',  'rally');
