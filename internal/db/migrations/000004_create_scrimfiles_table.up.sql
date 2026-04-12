CREATE TABLE scrimfiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scrim_id UUID NOT NULL REFERENCES scrims(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'plaintext',
    location TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    description JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
