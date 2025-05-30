
import { afterAllE2e, beforeAllE2e, TEST_USERS } from "../lifecycle";
import request from "supertest";
import { app } from "@app";

describe("POST /auth (e2e)", ()=>{    

    beforeAll(async () => {
        await beforeAllE2e();
    });

    afterAll(async () => {
        await afterAllE2e();
    });

    it("authenticate an admin user", async () => {
        const res = await request(app)
        .post("/api/v1/auth")
        .send({
            username: TEST_USERS.admin.username,
            password: TEST_USERS.admin.password
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(typeof res.body.token).toBe("string");
    });
    it("authenticate an operator user", async () => {
        const res = await request(app)
        .post("/api/v1/auth")
        .send({
            username: TEST_USERS.operator.username,
            password: TEST_USERS.operator.password
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(typeof res.body.token).toBe("string");
    });
    it("authenticate a viewer user", async () => {
        const res = await request(app)
        .post("/api/v1/auth")
        .send({
            username: TEST_USERS.viewer.username,
            password: TEST_USERS.viewer.password
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(typeof res.body.token).toBe("string");
    });
    it("authenticate with incorrect password", async () => {
        const res = await request(app)
        .post("/api/v1/auth")
        .send({
            username: TEST_USERS.admin.username,
            password: "fakepass"
        });
        expect(res.status).toBe(401);
        expect(res.body).not.toHaveProperty("token");
    });
    it("authenticate a fake username: NotFound", async () => {
        let fakeUser = {username: "fakeUsername", password: TEST_USERS.admin.password};
        const res = await request(app)
        .post("/api/v1/auth")
        .send(fakeUser);
        expect(res.status).toBe(404);
        expect(res.body).not.toHaveProperty("token");
    });    
});