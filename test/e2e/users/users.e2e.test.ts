import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("GET /users (e2e)", () => {
  let token: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("get all users", async () => {
    const res = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);

    const usernames = res.body.map((u: any) => u.username).sort();
    const types = res.body.map((u: any) => u.type).sort();

    expect(usernames).toEqual(["admin", "operator", "viewer"]);
    expect(types).toEqual(["admin", "operator", "viewer"]);
  });
});
describe("POST /users (e2e)", () => {
  let token: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("create new User", async () => {
    const newUser = {
      username: "newuser",
      password: "newpass",
      type: "operator",
    };

    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${token}`)
      .send(newUser);

    expect(res.status).toBe(201);

    const confirmRes = await request(app)
      .get(`/api/v1/users/newuser`)
      .set("Authorization", `Bearer ${token}`);

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.username).toBe("newuser");
    expect(confirmRes.body.type).toBe("operator");
  });  

  it("create new User: ConflictError", async () => {
    const newUser = {
      username: "admin",
      password: "adminpass",
      type: "admin",
    };

    const res = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${token}`)
      .send(newUser);

    expect(res.status).toBe(409);   
  }); 
});
describe("GET /users/{userName} (e2e)", () => {
  let token: string;
  
  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("get user by userName", async () => {
    let userName: string = "admin";
    const res = await request(app)
      .get(`/api/v1/users/${userName}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe("admin");
    expect(res.body.type).toBe("admin");
  });
  it("get user by userName: NotFoundError", async () => {
    let userName: string = "ghost";
    const res = await request(app)
      .get(`/api/v1/users/${userName}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
describe("DELETE /users/{userName} (e2e)", () => {
  let token: string;

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  it("delete user by userName", async () => {
    let userName : string = "viewer"
    const res = await request(app)
      .delete(`/api/v1/users/${userName}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);

    const confirmRes = await request(app)
      .get(`/api/v1/users/${userName}`)
      .set("Authorization", `Bearer ${token}`);

    expect(confirmRes.status).toBe(404);
  });
  it("delete user by userName: NotFoundError", async () => {
    let userName : string = "ghost"
    const res = await request(app)
      .delete(`/api/v1/users/${userName}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
