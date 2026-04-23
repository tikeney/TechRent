USE techrent_db;

-- Limpar tabelas (ordem inversa das FKs)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE historico_manutencao;
TRUNCATE TABLE chamados;
TRUNCATE TABLE equipamentos;
TRUNCATE TABLE usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- Inserir usuários (Senhas são '123456' em hash bcrypt)
INSERT INTO usuarios (id, nome, email, senha, nivel_acesso) VALUES
(1, 'Administrador', 'admin@techrent.com', '$2a$10$kremclOJ5RL1Qf0xXiqeDeWKzm3IkD8IJ/xrzunUoG2r1ZWBAN/FC', 'admin'),
(2, 'Técnico João', 'joao@techrent.com', '$2a$10$kremclOJ5RL1Qf0xXiqeDeWKzm3IkD8IJ/xrzunUoG2r1ZWBAN/FC', 'tecnico'),
(3, 'Cliente Maria', 'maria@techrent.com', '$2a$10$kremclOJ5RL1Qf0xXiqeDeWKzm3IkD8IJ/xrzunUoG2r1ZWBAN/FC', 'cliente');

-- Inserir equipamentos
INSERT INTO equipamentos (id, nome, categoria, patrimonio, status, descricao) VALUES
(1, 'Notebook Dell Latitude', 'Notebook', 'PAT001', 'operacional', 'Notebook para uso geral'),
(2, 'Projetor Epson', 'Projetor', 'PAT002', 'operacional', 'Projetor da sala de reuniões'),
(3, 'Impressora HP Laser', 'Impressora', 'PAT003', 'em_manutencao', 'Impressora do RH com atolamento'),
(4, 'Servidor PowerEdge', 'Servidor', 'PAT004', 'operacional', 'Servidor de arquivos');

-- Inserir chamados
INSERT INTO chamados (titulo, descricao, cliente_id, equipamento_id, prioridade, status) VALUES
('Impressora não imprime', 'A impressora do RH está com papel atolado e não inicia.', 3, 3, 'media', 'aberto');
