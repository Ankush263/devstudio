ALTER TABLE scrims ADD COLUMN forked_from_id UUID REFERENCES scrims(id);
