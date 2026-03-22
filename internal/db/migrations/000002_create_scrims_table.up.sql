CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE scrims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(userid),
    title TEXT NOT NULL,
    description TEXT,
    videodescription JSONB DEFAULT '{}'::jsonb,
    video_url TEXT,
    oplog_url TEXT,
    duration INT,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- migrate create -ext sql -dir internal/db/migrations -seq create_scrims_table