-- Make room name optional; trigger auto-sets it to the generated code
ALTER TABLE rooms ALTER COLUMN name DROP NOT NULL;
ALTER TABLE rooms ALTER COLUMN name SET DEFAULT NULL;

CREATE OR REPLACE FUNCTION set_room_code()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF new.code IS NULL OR new.code = '' THEN
    new.code := generate_room_code();
  END IF;
  IF new.name IS NULL OR new.name = '' THEN
    new.name := new.code;
  END IF;
  RETURN new;
END;
$$;
