import { ClientService } from "../../../src/services/ClientService";
import Client from "../../../src/models/Client";
import User, { UserRole } from "../../../src/models/User";

describe("ClientService - Real Tests (No Mocks)", () => {
  // NENHUM MOCK - Testa o service real com banco de dados real

  let testUser: any;

  // Setup antes de cada teste
  beforeEach(async () => {
    // Criar usuário de teste com email único
    const timestamp = Date.now();
    testUser = await User.create({
      email: `userteste${timestamp}@example.com`,
      password: "password123",
      role: UserRole.USER,
    });
  });

  afterEach(async () => {
    // Limpar dados após cada teste
    await Client.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  describe("create", () => {
    it("should create a client with valid data", async () => {
      const clientData = {
        nome: "Cliente Teste",
        email: "cliente@example.com",
        created_by: testUser.id,
      };

      // Executar o service REAL
      const result = await ClientService.create(clientData);

      // Verificar se o cliente foi criado
      expect(result.data.nome).toBe(clientData.nome);
      expect(result.data.email).toBe(clientData.email);
      expect(result.data.created_by).toBe(clientData.created_by);
      expect(result.data.id).toBeDefined();
      expect(result.message).toBe("Cliente criado com sucesso");
    });

    it("should handle email already exists error", async () => {
      const clientData = {
        nome: "Cliente Duplicado",
        email: "duplicate@example.com",
        created_by: testUser.id,
      };

      // Criar o primeiro cliente
      await ClientService.create(clientData);

      // Tentar criar o segundo cliente com o mesmo email
      await expect(ClientService.create(clientData)).rejects.toThrow();
    });
  });

  describe("getById", () => {
    it("should return client by id with documents count", async () => {
      // Primeiro criar um cliente
      const clientData = {
        nome: "Cliente GetById",
        email: "getbyid@example.com",
        created_by: testUser.id,
      };
      const createdClient = await ClientService.create(clientData);

      // Executar o service REAL
      const result = await ClientService.getById(createdClient.data.id);

      // Verificar se o cliente foi encontrado
      expect(result.data.id).toBe(createdClient.data.id);
      expect(result.data.nome).toBe(clientData.nome);
      expect(result.data.email).toBe(clientData.email);
      expect(result.data.documentsCount).toBeDefined();
    });

    it("should return error when client not found", async () => {
      // Executar o service REAL com ID inexistente
      await expect(ClientService.getById(99999)).rejects.toThrow(
        "Cliente não encontrado"
      );
    });
  });

  describe("update", () => {
    it("should update client successfully", async () => {
      // Primeiro criar um cliente
      const clientData = {
        nome: "Cliente Original",
        email: "update@example.com",
        created_by: testUser.id,
      };
      const createdClient = await ClientService.create(clientData);

      const updateData = {
        nome: "Cliente Atualizado",
        email: "updated@example.com",
      };

      // Executar o service REAL
      const result = await ClientService.update(
        createdClient.data.id,
        updateData
      );

      // Verificar se o cliente foi atualizado
      expect(result.message).toBe("Cliente atualizado com sucesso");
    });

    it("should return error when client not found for update", async () => {
      const updateData = { nome: "Test" };

      // Executar o service REAL com ID inexistente
      await expect(ClientService.update(99999, updateData)).rejects.toThrow(
        "Cliente não encontrado"
      );
    });
  });

  describe("delete", () => {
    it("should perform soft delete successfully", async () => {
      // Primeiro criar um cliente
      const clientData = {
        nome: "Cliente Delete",
        email: "delete@example.com",
        created_by: testUser.id,
      };
      const createdClient = await ClientService.create(clientData);

      // Executar o service REAL
      const result = await ClientService.delete(createdClient.data.id);

      // Verificar se o cliente foi deletado (soft delete)
      expect(result.message).toBe("Cliente deletado com sucesso");

      // Verificar se o cliente não pode ser encontrado (soft delete)
      await expect(
        ClientService.getById(createdClient.data.id)
      ).rejects.toThrow("Cliente não encontrado");
    });

    it("should return error when client not found for delete", async () => {
      // Executar o service REAL com ID inexistente
      await expect(ClientService.delete(99999)).rejects.toThrow(
        "Cliente não encontrado"
      );
    });
  });

  describe("getAll", () => {
    it("should return all clients with pagination", async () => {
      // Criar alguns clientes para teste
      const clients = [
        {
          nome: "Cliente 1",
          email: "cliente1@example.com",
          created_by: testUser.id,
        },
        {
          nome: "Cliente 2",
          email: "cliente2@example.com",
          created_by: testUser.id,
        },
      ];

      for (const clientData of clients) {
        await ClientService.create(clientData);
      }

      // Executar o service REAL
      const result = await ClientService.getAll(1, 10);

      // Verificar se os clientes foram retornados
      expect(result.data.length).toBeGreaterThanOrEqual(2);
      expect(result.count).toBeGreaterThanOrEqual(2);
    });

    it("should handle pagination correctly", async () => {
      // Executar o service REAL com página 2, limite 5
      const result = await ClientService.getAll(2, 5);

      // Verificar se a paginação está funcionando
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it("should handle empty results", async () => {
      // Executar o service REAL com página alta para garantir resultado vazio
      const result = await ClientService.getAll(999, 10);

      // Verificar se retorna resultado vazio
      expect(result.data.length).toBe(0);
      expect(result.count).toBe(0);
    });
  });
});
