INSERT INTO elections (year, description, updated_at)
VALUES
  (2026, 'Eleicao federal', NOW()),
  (2028, 'Eleicao municipal', NOW())
ON CONFLICT (year) DO NOTHING;
