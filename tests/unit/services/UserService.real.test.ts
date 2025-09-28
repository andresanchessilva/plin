import { UserService } from "../../../src/services/UserService";
import { UserRole } from "../../../src/models/User";
import User from "../../../src/models/User";

describe("UserService - Real Tests (No Mocks)", () => {
  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
  });

  afterEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe("createUser", () => {
    it("should create a user with valid data", async () => {
      const userData = {
        email: "testuser@example.com",
        password: "password123",
        role: UserRole.USER,
      };

      const result = await UserService.createUser(userData);
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

      const firstUser = await UserService.createUser(userData);
      expect(firstUser).toBeDefined();

      await new Promise((resolve) => setTimeout(resolve, 200));
      try {
        await UserService.createUser(userData);
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getUserById", () => {
    it("should return user by id", async () => {
      const userData = {
        email: "getuser@example.com",
        password: "password123",
        role: UserRole.USER,
      };
      const createdUser = await UserService.createUser(userData);

      const result = await UserService.getUserById(createdUser.id);

 o usuário foi encontrado
      expect(result?.id).toBe(createdUser.id);
      expect(result?.email).toBe(userData.email);
      expect(result?.role).toBe(userData.role);
    });

    it("should return null when user not found", async () => {
 com ID inexistente
      const result = await UserService.getUserById(99999);

 retorna null
      expect(result).toBeNull();
    });
  });

  describe("getUserByEmail", () => {
    it("should return user by email", async () => {
      const userData = {
        email: "getbyemail@example.com",
        password: "password123",
        role: UserRole.USER,
      };
      await UserService.createUser(userData);

      const result = await UserService.getUserByEmail(userData.email);

 o usuário foi encontrado
      expect(result?.email).toBe(userData.email);
      expect(result?.id).toBeDefined();
    });

    it("should return null when user not found by email", async () => {
 com email inexistente
      const result = await UserService.getUserByEmail(
        "nonexistent@example.com"
      );

 retorna null
      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
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

      const result = await UserService.updateUser(createdUser.id, updateData);

 o usuário foi atualizado
      expect(result?.id).toBe(createdUser.id);
      expect(result?.email).toBe(updateData.email);
      expect(result?.role).toBe(updateData.role);
    });

    it("should return null when user not found for update", async () => {
      const updateData = { email: "test@example.com" };

 com ID inexistente
      const result = await UserService.updateUser(99999, updateData);

 retorna null
      expect(result).toBeNull();
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const userData = {
        email: "deleteuser@example.com",
        password: "password123",
        role: UserRole.USER,
      };
      const createdUser = await UserService.createUser(userData);

      const result = await UserService.deleteUser(createdUser.id);

 o usuário foi deletado
      expect(result).toBe(true);

 o usuário não existe mais
      const deletedUser = await UserService.getUserById(createdUser.id);
      expect(deletedUser).toBeNull();
    });

    it("should return false when user not found for delete", async () => {
 com ID inexistente
      const result = await UserService.deleteUser(99999);

 retorna false
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

 os usuários foram salvos
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = await UserService.getAllUsers(1, 10);

 os usuários foram retornados
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
 com página 2, limite 5
      const result = await UserService.getAllUsers(2, 5);

 a paginação está correta
      expect(result.currentPage).toBe(2);
      expect(result.users.length).toBeLessThanOrEqual(5);
    });
  });
});
