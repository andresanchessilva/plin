"use strict";

const bcrypt = require("bcrypt");

exports.up = async function (db) {
  // Hash das senhas
  const hashedPassword = await bcrypt.hash("test123", 10);

  // 1. Inserir usuário de teste
  const userResult = await db.runSql(
    `
    INSERT INTO users (email, password, role, created_at, updated_at)
      VALUES ('test@plin.com', $1, 'USER', NOW(), NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id;
  `,
    [hashedPassword]
  );

  let userId;
  if (userResult.rows && userResult.rows.length > 0) {
    userId = userResult.rows[0].id;
  } else {
    // Se o usuário já existe, buscar o ID
    const existingUser = await db.runSql(
      "SELECT id FROM users WHERE email = $1",
      ["test@plin.com"]
    );
    userId = existingUser.rows[0].id;
  }

  // 2. Inserir clientes de teste
  const clientsResult = await db.runSql(
    `
    INSERT INTO clients (nome, email, created_by, created_at, updated_at)
    VALUES 
      ('Cliente Teste 1', 'cliente1@example.com', $1, NOW(), NOW()),
      ('Cliente Teste 2', 'cliente2@example.com', $1, NOW(), NOW()),
      ('Empresa ABC Ltda', 'contato@empresaabc.com', $1, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING
    RETURNING id;
  `,
    [userId]
  );

  // Buscar IDs dos clientes
  const clients = await db.runSql(
    "SELECT id FROM clients WHERE created_by = $1 ORDER BY id",
    [userId]
  );
  const clientIds = clients.rows.map((row) => row.id);

  // 3. Inserir documentos de teste
  if (clientIds.length > 0) {
    await db.runSql(
      `
      INSERT INTO documents (titulo, conteudo, client_id, uploaded_by, data_processamento, created_at, updated_at)
      VALUES 
        ('Documento de Contrato', 'Este é um documento de contrato de exemplo com termos e condições importantes para o cliente.', $1, $4, NOW(), NOW(), NOW()),
        ('Relatório Mensal', 'Relatório mensal de atividades e resultados obtidos durante o período.', $1, $4, NOW(), NOW(), NOW()),
        ('Proposta Comercial', 'Proposta comercial detalhada com preços, prazos e condições especiais.', $2, $4, NOW(), NOW(), NOW()),
        ('Manual de Usuário', 'Manual completo de utilização do sistema com instruções passo a passo.', $2, $4, NOW(), NOW(), NOW()),
        ('Política de Privacidade', 'Documento contendo as políticas de privacidade e proteção de dados.', $3, $4, NOW(), NOW(), NOW()),
        ('Termos de Uso', 'Termos e condições de uso do serviço oferecido pela empresa.', $3, $4, NOW(), NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `,
      [clientIds[0], clientIds[1], clientIds[2], userId]
    );
  }
};

exports.down = async function (db) {
  // Remover documentos de teste
  await db.runSql(`
    DELETE FROM documents 
    WHERE uploaded_by IN (SELECT id FROM users WHERE email = 'test@plim.com');
  `);

  // Remover clientes de teste
  await db.runSql(`
    DELETE FROM clients 
    WHERE created_by IN (SELECT id FROM users WHERE email = 'test@plin.com');
  `);

  // Remover usuário de teste
  await db.runSql(`
    DELETE FROM users WHERE email = 'test@plin.com';
  `);
};
