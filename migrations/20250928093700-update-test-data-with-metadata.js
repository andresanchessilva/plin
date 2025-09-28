"use strict";

exports.up = async function (db) {
  // Atualizar documentos de teste com type e meta_data
  await db.runSql(`
    UPDATE documents 
    SET 
      type = CASE 
        WHEN titulo IN ('Documento de Contrato', 'Relatório Mensal', 'Política de Privacidade') THEN 'pdf'
        ELSE 'url'
      END,
      meta_data = CASE 
        WHEN titulo = 'Documento de Contrato' THEN '{"pages": 5, "author": "Sistema", "created_date": "2024-01-15"}'::jsonb
        WHEN titulo = 'Relatório Mensal' THEN '{"pages": 3, "author": "Sistema", "created_date": "2024-01-15"}'::jsonb
        WHEN titulo = 'Proposta Comercial' THEN '{"url": "https://example.com/proposta", "contentLength": 1200, "images": 2}'::jsonb
        WHEN titulo = 'Manual de Usuário' THEN '{"url": "https://example.com/manual", "contentLength": 2500, "images": 5}'::jsonb
        WHEN titulo = 'Política de Privacidade' THEN '{"pages": 2, "author": "Sistema", "created_date": "2024-01-15"}'::jsonb
        WHEN titulo = 'Termos de Uso' THEN '{"url": "https://example.com/termos", "contentLength": 800, "images": 1}'::jsonb
      END
    WHERE titulo IN (
      'Documento de Contrato', 
      'Relatório Mensal', 
      'Proposta Comercial', 
      'Manual de Usuário', 
      'Política de Privacidade', 
      'Termos de Uso'
    );
  `);
};

exports.down = async function (db) {
  // Remover metadata dos documentos de teste
  await db.runSql(`
    UPDATE documents 
    SET 
      type = 'pdf',
      meta_data = NULL
    WHERE titulo IN (
      'Documento de Contrato', 
      'Relatório Mensal', 
      'Proposta Comercial', 
      'Manual de Usuário', 
      'Política de Privacidade', 
      'Termos de Uso'
    );
  `);
};
