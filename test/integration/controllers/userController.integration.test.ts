import * as userController from "@controllers/userController";
import { UserDAO } from "@dao/UserDAO";
import { UserType } from "@models/UserType";
import { UserRepository } from "@repositories/UserRepository";

jest.mock("@repositories/UserRepository");

describe("UserController integration", () => {
  it("get User: mapperService integration", async () => {
    const fakeUserDAO: UserDAO = {
      username: "testuser",
      password: "secret",
      type: UserType.Operator
    };

    const expectedDTO = {
      username: fakeUserDAO.username,
      type: fakeUserDAO.type
    };

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getUserByUsername: jest.fn().mockResolvedValue(fakeUserDAO)
    }));

    const result = await userController.getUser("testuser");

    expect(result).toEqual({
      username: expectedDTO.username,
      type: expectedDTO.type
    });
    expect(result).not.toHaveProperty("password");
  });
  it("get all Users: mapperService integration", async () => {
    const fakeUsersDAO: UserDAO[] = [
      { username: "testuser1", password: "secret", type: UserType.Operator },
      { username: "testuser2", password: "pswd", type: UserType.Admin }
    ];

    const expectedDTOs = fakeUsersDAO.map(user => ({
      username: user.username,
      type: user.type
    }));

    (UserRepository as jest.Mock).mockImplementation(() => ({
      getAllUsers: jest.fn().mockResolvedValue(fakeUsersDAO)
    }));

    const result = await userController.getAllUsers();

    expect(result).toEqual(expectedDTOs);
    result.forEach(user => {
      expect(user).not.toHaveProperty("password");
    });
  });
});
