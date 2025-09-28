import { DocumentService } from "../../../src/services/DocumentService";
import Document from "../../../src/models/Document";
import Client from "../../../src/models/Client";
import User, { UserRole } from "../../../src/models/User";

describe("DocumentService - Real Tests (No Mocks)", () => {

  let testClient: any;
  let testUser: any;

  beforeEach(async () => {
    await Document.destroy({ where: {}, force: true });
    await Client.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });

    await new Promise((resolve) => setTimeout(resolve, 300));
    const timestamp = Date.now();
    testUser = await User.create({
      email: `userteste${timestamp}@example.com`,
      password: "password123",
      role: UserRole.USER,
    });

    // Aguardar um pouco para garantir que o usuário foi criado
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Criar cliente de teste com email único
    // Não usar created_by para evitar problemas com foreign key constraints
    testClient = await Client.create({
      nome: "Cliente Teste",
      email: `clienteteste${timestamp}@example.com`,
      created_by: undefined,
    });

    // Aguardar um pouco para garantir que o cliente foi criado
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Verificar se o cliente foi realmente criado
    const verifyClient = await Client.findByPk(testClient.id);
    if (!verifyClient) {
      throw new Error("Cliente não foi criado corretamente no setup");
    }
  });

  afterEach(async () => {
    // Limpar dados após cada teste
    await Document.destroy({ where: {}, force: true });
    await Client.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  describe("create", () => {
    it("should create a document with valid data", async () => {
      const documentData = {
        titulo: "Documento Teste",
        conteudo: "Conteúdo do documento de teste",
        client_id: testClient.id,
        uploaded_by: undefined, // Não usar uploaded_by para evitar problemas com foreign key constraints
        data_processamento: new Date(),
        type: "pdf" as const,
        meta_data: { pages: 5, author: "Sistema" },
      };

      // Executar o service REAL
      const result = await DocumentService.create(documentData);

      // Verificar se o documento foi criado
      expect(result.data?.titulo).toBe(documentData.titulo);
      expect(result.data?.conteudo).toBe(documentData.conteudo);
      expect(result.data?.client_id).toBe(documentData.client_id);
      expect(result.data?.uploaded_by).toBeNull();
      expect(result.data?.type).toBe(documentData.type);
      expect(result.message).toBe("Documento criado com sucesso");
    });

    it("should handle missing required fields", async () => {
      const invalidData = {
        titulo: "Documento Teste",
        // Missing client_id
        uploaded_by: undefined,
      };

      // Executar e verificar se o erro é lançado
      await expect(
        DocumentService.create(invalidData as any)
      ).rejects.toThrow();
    });
  });

  describe("getById", () => {
    it("should return document by id", async () => {
      // Primeiro criar um documento
      const documentData = {
        titulo: "Documento GetById",
        conteudo: "Conteúdo do documento",
        client_id: testClient.id,
        uploaded_by: undefined,
        data_processamento: new Date(),
        type: "pdf" as const,
        meta_data: { pages: 3 },
      };
      const createdDocument = await DocumentService.create(documentData);

      // Executar o service REAL
      const result = await DocumentService.getById(createdDocument.data?.id!);

      // Verificar se o documento foi encontrado
      expect(result.data.id).toBe(createdDocument.data?.id);
      expect(result.data.titulo).toBe(documentData.titulo);
      expect(result.data.conteudo).toBe(documentData.conteudo);
    });

    it("should return error when document not found", async () => {
      // Executar o service REAL com ID inexistente
      await expect(DocumentService.getById(99999)).rejects.toThrow(
        "Documento não encontrado"
      );
    });
  });

  describe("getByClient", () => {
    it("should return documents for a specific client", async () => {
      // Criar alguns documentos para o cliente
      const documents = [
        {
          titulo: "Documento 1",
          conteudo: "Conteúdo 1",
          client_id: testClient.id,
          uploaded_by: undefined,
          data_processamento: new Date(),
          type: "pdf" as const,
          meta_data: { pages: 2 },
        },
        {
          titulo: "Documento 2",
          conteudo: "Conteúdo 2",
          client_id: testClient.id,
          uploaded_by: undefined,
          data_processamento: new Date(),
          type: "url" as const,
          meta_data: { url: "https://example.com" },
        },
      ];

      for (const docData of documents) {
        await DocumentService.create(docData);
      }

      // Executar o service REAL
      const result = await DocumentService.getByClient(testClient.id, 1, 10);

      // Verificar se os documentos foram retornados
      expect(result.data.length).toBe(2);
      expect(result.count).toBe(2);
    });

    it("should handle empty results for client", async () => {
      // Executar o service REAL com cliente sem documentos
      const result = await DocumentService.getByClient(testClient.id, 1, 10);

      // Verificar se retorna resultado vazio
      expect(result.data.length).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getByUser", () => {
    it("should return documents uploaded by a specific user", async () => {
      // Criar um usuário específico para este teste
      const timestamp = Date.now();
      const specificUser = await User.create({
        email: `specificuser${timestamp}@example.com`,
        password: "password123",
        role: UserRole.USER,
      });

      // Aguardar um pouco para garantir que o usuário foi criado
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Criar um documento para o usuário específico
      const documentData = {
        titulo: "Documento do Usuário",
        conteudo: "Conteúdo do documento",
        client_id: testClient.id,
        uploaded_by: specificUser.id,
        data_processamento: new Date(),
        type: "pdf" as const,
        meta_data: { pages: 1 },
      };
      await DocumentService.create(documentData);

      // Executar o service REAL
      const result = await DocumentService.getByUser(specificUser.id, 1, 10);

      // Verificar se o documento foi retornado
      expect(result.data.length).toBe(1);
      expect(result.count).toBe(1);
      expect(result.data[0].uploaded_by).toBe(specificUser.id);
    });
  });

  describe("update", () => {
    it("should update document successfully", async () => {
      // Primeiro criar um documento
      const documentData = {
        titulo: "Documento Original",
        conteudo: "Conteúdo original",
        client_id: testClient.id,
        uploaded_by: undefined,
        data_processamento: new Date(),
        type: "pdf" as const,
        meta_data: { pages: 2 },
      };
      const createdDocument = await DocumentService.create(documentData);

      const updateData = {
        titulo: "Documento Atualizado",
        conteudo: "Conteúdo atualizado",
      };

      // Executar o service REAL
      const result = await DocumentService.update(
        createdDocument.data?.id!,
        updateData
      );

      // Verificar se o documento foi atualizado
      expect(result.message).toBe("Documento atualizado com sucesso");
    });

    it("should return error when document not found for update", async () => {
      const updateData = { titulo: "Test" };

      // Executar o service REAL com ID inexistente
      await expect(DocumentService.update(99999, updateData)).rejects.toThrow(
        "Documento não encontrado"
      );
    });
  });

  describe("delete", () => {
    it("should perform soft delete successfully", async () => {
      // Primeiro criar um documento
      const documentData = {
        titulo: "Documento Delete",
        conteudo: "Conteúdo para deletar",
        client_id: testClient.id,
        uploaded_by: undefined,
        data_processamento: new Date(),
        type: "pdf" as const,
        meta_data: { pages: 1 },
      };
      const createdDocument = await DocumentService.create(documentData);

      // Executar o service REAL
      const result = await DocumentService.delete(createdDocument.data?.id!);

      // Verificar se o documento foi deletado (soft delete)
      expect(result.message).toBe("Documento deletado com sucesso");

      // Verificar se o documento não pode ser encontrado (soft delete)
      await expect(
        DocumentService.getById(createdDocument.data?.id!)
      ).rejects.toThrow("Documento não encontrado");
    });

    it("should return error when document not found for delete", async () => {
      // Executar o service REAL com ID inexistente
      await expect(DocumentService.delete(99999)).rejects.toThrow(
        "Documento não encontrado"
      );
    });
  });

  describe("getAll", () => {
    it("should return all documents with pagination", async () => {
      // Criar alguns documentos para teste
      const documents = [
        {
          titulo: "Documento 1",
          conteudo: "Conteúdo 1",
          client_id: testClient.id,
          uploaded_by: undefined,
          data_processamento: new Date(),
          type: "pdf" as const,
          meta_data: { pages: 1 },
        },
        {
          titulo: "Documento 2",
          conteudo: "Conteúdo 2",
          client_id: testClient.id,
          uploaded_by: undefined,
          data_processamento: new Date(),
          type: "url" as const,
          meta_data: { url: "https://example.com" },
        },
      ];

      for (const docData of documents) {
        await DocumentService.create(docData);
      }

      // Executar o service REAL
      const result = await DocumentService.getAll(1, 10);

      // Verificar se os documentos foram retornados
      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.count).toBeGreaterThanOrEqual(2);
    });

    it("should handle pagination correctly", async () => {
      // Executar o service REAL com página 2, limite 5
      const result = await DocumentService.getAll(2, 5);

      // Verificar se a paginação está funcionando
      expect(result.data.length).toBeLessThanOrEqual(5);
    });
  });
});
