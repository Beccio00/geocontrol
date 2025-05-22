import { UserRepository } from "@repositories/UserRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { UserType } from "@models/UserType";
import { UserDAO } from "@dao/UserDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(UserDAO).clear();
});

describe("UserRepository: SQLite in-memory", () => {
  const repo = new UserRepository();
  
  it("create user", async () => {
    const user = await repo.createUser("john", "pass123", UserType.Admin);
    expect(user).toMatchObject({
      username: "john",
      password: "pass123",
      type: UserType.Admin
    });

    const found = await repo.getUserByUsername("john");
    expect(found.username).toBe("john");
  });

  it("find user by username: not found", async () => {
    await expect(repo.getUserByUsername("ghost")).rejects.toThrow(
      NotFoundError
    );
  });

  it("create user: conflict", async () => {
    await repo.createUser("john", "pass123", UserType.Admin);
    await expect(
      repo.createUser("john", "anotherpass", UserType.Viewer)
    ).rejects.toThrow(ConflictError);
  });
  it("delete user", async () => {
    await repo.createUser("john", "pass123", UserType.Admin);    
    await repo.deleteUser("john");

    await expect(
      repo.getUserByUsername("john")
    ).rejects.toThrow(NotFoundError);
  })
  it("get all user", async () => {
    const user1 = await repo.createUser("john", "pass123", UserType.Admin);
    const user2 = await repo.createUser("jack", "password", UserType.Viewer);

    const allUsers = await repo.getAllUsers();

    expect(allUsers).toHaveLength(2);

    expect(allUsers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: "john", type: UserType.Admin }),
        expect.objectContaining({ username: "jack", type: UserType.Viewer })
      ])
    );
  })
});
