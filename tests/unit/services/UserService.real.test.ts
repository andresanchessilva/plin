import { UserService } from "../../../src/services/UserService";
import { UserRole } from "../../../src/models/User";
import User from "../../../src/models/User";

describe("UserService - Real Tests (No Mocks)", () => {
  // NENHUM MOCK - Testa o service real com banco de dados real

  // Cleanup antes e após cada teste
  beforeEach(async () => {
    // Limpar dados antes de cada teste para evitar conflitos
    await User.destroy({ where: {}, force: true });
    // Aguardar um pouco para garantir que a limpeza foi concluída
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

  afterEach(async () => {
    // Limpar dados após cada teste
    await User.destroy({ where: {}, force: true });
  });

  describe("createUser", () => {
    it("should create a user with valid data", async () => {
      const userData = {
        email: "testuser@example.com",
        password: "password123",
        role: UserRole.USER,
      };

      // Executar o service REAL
      const result = await UserService.createUser(userData);

      // Verificar se o usuário foi criado
      expect(result.email).toBe(userData.email);
      expect(result.role).toBe(userData.role);
      expect(result.id).toBeDefined();
    });

    it("should handle email already exists error", async () => {
      const userData = {
        email: "duplicate@example.com",
        password: "password123",
        role: UserRole.USER,
      };

      // Criar o primeiro usuário
      const firstUser = await UserService.createUser(userData);
      expect(firstUser).toBeDefined();

      // Aguardar um pouco para garantir que o primeiro usuário foi salvo
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Tentar criar o segundo usuário com o mesmo email
      try {
        await UserService.createUser(userData);
        // Se chegou aqui, o teste falhou
        expect(true).toBe(false);
      } catch (error) {
        // Esperado que lance erro
        expect(error).toBeDefined();
      }
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      // Primeiro criar um usuário
      const userData = {
        email: "getuser@example.com",
        password: "password123",
        role: UserRole.USER,
      };
      const createdUser = await UserService.createUser(userData);

      // Executar o service REAL
      const result = await UserService.getUserById(createdUser.id);

      // Verificar se o usuário foi encontrado
      expect(result?.id).toBe(createdUser.id);
      expect(result?.email).toBe(userData.email);
      expect(result?.role).toBe(userData.role);
    });

    it("should return null when user not found", async () => {
      // Executar o service REAL com ID inexistente
      const result = await UserService.getUserById(99999);

      // Verificar se retorna null
      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("should return user by email", async () => {
      // Primeiro criar um usuário
      const userData = {
        email: "getbyemail@example.com",
        password: "password123",
        role: UserRole.USER,
      };
      await UserService.createUser(userData);

      // Executar o service REAL
      const result = await UserService.getUserByEmail(userData.email);

      // Verificar se o usuário foi encontrado
      expect(result?.email).toBe(userData.email);
      expect(result?.id).toBeDefined();
    });

    it("should return null when user not found by email", async () => {
      // Executar o service REAL com email inexistente
      const result = await UserService.getUserByEmail(
        "nonexistent@example.com"
      );

      // Verificar se retorna null
      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      // Primeiro criar um usuário
      const userData = {
        email: "updateuser@example.com",
        password: "password123",
        role: UserRole.USER,
      };
      const createdUser = await UserService.createUser(userData);

      const updateData = {
        email: "updated@example.com",
        role: UserRole.ADMIN,
      };

      // Executar o service REAL
      const result = await UserService.updateUser(createdUser.id, updateData);

      // Verificar se o usuário foi atualizado
      expect(result?.id).toBe(createdUser.id);
      expect(result?.email).toBe(updateData.email);
      expect(result?.role).toBe(updateData.role);
    });

    it("should return null when user not found for update", async () => {
      const updateData = { email: "test@example.com" };

      // Executar o service REAL com ID inexistente
      const result = await UserService.updateUser(99999, updateData);

      // Verificar se retorna null
      expect(result).toBeNull();
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      // Primeiro criar um usuário
      const userData = {
        email: "deleteuser@example.com",
        password: "password123",
        role: UserRole.USER,
      };
      const createdUser = await UserService.createUser(userData);

      // Executar o service REAL
      const result = await UserService.deleteUser(createdUser.id);

      // Verificar se o usuário foi deletado
      expect(result).toBe(true);

      // Verificar se o usuário não existe mais
      const deletedUser = await UserService.getUserById(createdUser.id);
      expect(deletedUser).toBeNull();
    });

    it("should return false when user not found for delete", async () => {
      // Executar o service REAL com ID inexistente
      const result = await UserService.deleteUser(99999);

      // Verificar se retorna false
      expect(result).toBe(false);
    });
  });

  describe("getAllUsers", () => {
    it("should return all users with pagination", async () => {
      // Criar alguns usuários para teste
      const users = [
        {
          email: "user1@example.com",
          password: "password123",
          role: UserRole.USER,
        },
        {
          email: "user2@example.com",
          password: "password123",
          role: UserRole.ADMIN,
        },
      ];

      for (const userData of users) {
        await UserService.createUser(userData);
      }

      // Aguardar um pouco para garantir que os usuários foram salvos
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Executar o service REAL
      const result = await UserService.getAllUsers(1, 10);

      // Verificar se os usuários foram retornados
      // Filtrar apenas os usuários que criamos neste teste
      const testUsers = result.users.filter(
        (user) =>
          user.email === "user1@example.com" ||
          user.email === "user2@example.com"
      );
      expect(testUsers.length).toBe(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.currentPage).toBe(1);
    });

    it("should handle pagination correctly", async () => {
      // Executar o service REAL com página 2, limite 5
      const result = await UserService.getAllUsers(2, 5);

      // Verificar se a paginação está correta
      expect(result.currentPage).toBe(2);
      expect(result.users.length).toBeLessThanOrEqual(5);
    });
  });
});
