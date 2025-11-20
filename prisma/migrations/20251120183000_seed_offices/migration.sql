INSERT INTO offices (name, description, updated_at)
VALUES
  ('Presidente', 'Cargo do Poder Executivo Federal', NOW()),
  ('Governador', 'Lidera o Executivo estadual', NOW()),
  ('Senador', 'Representante no Senado Federal', NOW()),
  ('Deputado Federal', 'Membro da Câmara dos Deputados', NOW()),
  ('Deputado Estadual', 'Deputado na Assembleia Legislativa', NOW()),
  ('Prefeito', 'Chefe do Poder Executivo municipal', NOW()),
  ('Vereador', 'Legislador municipal', NOW())
ON CONFLICT (name) DO NOTHING;
