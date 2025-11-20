INSERT INTO offices (name, description)
VALUES
  ('Presidente', 'Cargo do Poder Executivo Federal'),
  ('Governador', 'Lidera o Executivo estadual'),
  ('Senador', 'Representante no Senado Federal'),
  ('Deputado Federal', 'Membro da Câmara dos Deputados'),
  ('Deputado Estadual', 'Deputado na Assembleia Legislativa'),
  ('Prefeito', 'Chefe do Poder Executivo municipal'),
  ('Vereador', 'Legislador municipal')
ON CONFLICT (name) DO NOTHING;
