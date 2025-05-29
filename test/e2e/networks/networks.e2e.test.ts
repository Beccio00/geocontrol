import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("Networks API (e2e)", () => {
  let adminToken: string;
  let operatorToken: string;
  let viewerToken: string;
  const networkCode = "test-network";
  const secondNetworkCode = "second-network";

  beforeAll(async () => {
    await beforeAllE2e();
    
    adminToken = generateToken(TEST_USERS.admin);
    operatorToken = generateToken(TEST_USERS.operator);
    viewerToken = generateToken(TEST_USERS.viewer);
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  describe("POST api networks - Create Network", () => {
    it("create a network as admin", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: networkCode,
          name: "Test Network",
          description: "A test network for e2e testing",
        });

      expect(res.status).toBe(201);
    });

    it("create a network as operator", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${operatorToken}`)
        .send({
          code: secondNetworkCode,
          name: "Second Test Network",
          description: "Another test network",
        });

      expect(res.status).toBe(201);
    });

    it("create network as viewer", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({
          code: "viewer-network",
          name: "Viewer Network",
          description: "This should be forbidden",
        });

      expect(res.status).toBe(403);
    });

    it("create a network with no authentication token", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .send({
          code: "no-auth-network",
          name: "No Auth Network",
          description: "Should be unauthorized",
        });

      expect(res.status).toBe(401);
    });


    it("creating a network with duplicate code", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: networkCode, // duplicate code, already exists
          name: "Duplicate Network",
          description: "This should fail",
        });

      expect(res.status).toBe(409);
    });

    it("required field 'code' is missing", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          // no code field
          name: "Incomplete Network",
          description: "Missing code field",
        });

      expect(res.status).toBe(400);
    });

    it("code is empty string", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "", // empty code, violates minLength 1
          name: "Empty Code Network",
          description: "Code is empty",
        });

      expect(res.status).toBe(400);
    });

    it("no optional fields, only 'code'", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "minimal-network",
        });

      expect(res.status).toBe(201);

      await request(app)
        .delete("/api/v1/networks/minimal-network")
        .set("Authorization", `Bearer ${adminToken}`);
    });

    it("ignore nested gateways in request body", async () => {
      const res = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "nested-ignored-network",
          name: "Network with Nested Data",
          description: "Testing nested data ignoring",
          gateways: [
            {
              macAddress: "AA:BB:CC:DD:EE:FF",
              name: "Should Be Ignored",
              description: "This gateway should be ignored"
            }
          ]
        });

      expect(res.status).toBe(201);

      // verify that the network was created without gateways
      const getRes = await request(app)
        .get("/api/v1/networks/nested-ignored-network")
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(getRes.status).toBe(200);
      expect(getRes.body.code).toBe("nested-ignored-network");
      const gateways = getRes.body.gateways || [];
      expect(gateways).toHaveLength(0);
      
      await request(app)
        .delete("/api/v1/networks/nested-ignored-network")
        .set("Authorization", `Bearer ${adminToken}`);
    });
  });

  describe("GET api networks - Get All Networks", () => {
    it("retrieve all networks as admin", async () => {
      const res = await request(app)
        .get("/api/v1/networks")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      
      const codes = res.body.map((network: any) => network.code);
      expect(codes).toContain(networkCode);
      expect(codes).toContain(secondNetworkCode);
    });

    it("retrieve all networks as operator", async () => {
      const res = await request(app)
        .get("/api/v1/networks")
        .set("Authorization", `Bearer ${operatorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it("should retrieve all networks as viewer", async () => {
      const res = await request(app)
        .get("/api/v1/networks")
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it("no authentication token provided", async () => {
      const res = await request(app)
        .get("/api/v1/networks");

      expect(res.status).toBe(401);
    });
  });

  describe("GET api network - Get Specific Network", () => {
    it("retrieve a specific network as admin", async () => {
      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        code: networkCode,
        name: "Test Network",
        description: "A test network for e2e testing",
      });
    });

    it("retrieve a specific network as viewer", async () => {
      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}`)
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(networkCode);
    });

    it("no authentication token provided", async () => {
      const res = await request(app)
        .get(`/api/v1/networks/${networkCode}`);

      expect(res.status).toBe(401);
    });

    it("non-existent network", async () => {
      const res = await request(app)
        .get("/api/v1/networks/non-existent-code")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

  });

  describe("PATCH api network - Update Network", () => {
    it("update a network as admin", async () => {
      const updatedData = {
        code: "updated-test-network",
        name: "Updated Test Network",
        description: "Updated description for testing",
      };

      const res = await request(app)
        .patch(`/api/v1/networks/${networkCode}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updatedData);

      expect(res.status).toBe(204);

      // check
      const getRes = await request(app)
        .get("/api/v1/networks/updated-test-network")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body).toMatchObject(updatedData);
    });

    it("update a network as operator", async () => {
      const updatedData = {
        code: secondNetworkCode,
        name: "Updated Second Network",
        description: "Updated by operator",
      };

      const res = await request(app)
        .patch(`/api/v1/networks/${secondNetworkCode}`)
        .set("Authorization", `Bearer ${operatorToken}`)
        .send(updatedData);

      expect(res.status).toBe(204);
    });

    it("viewer tries to update a network", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${secondNetworkCode}`)
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({
          name: "Viewer Update Attempt",
        });

      expect(res.status).toBe(403);
    });

    it("updating non-existent network", async () => {
      const res = await request(app)
        .patch("/api/v1/networks/non-existent-code")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Name",
          description: "Updated description",
        });

      expect(res.status).toBe(404);
    });

    it("update data violates middleware", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${secondNetworkCode}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "", // condizione minLength 1
          name: "Updated Name",
          description: "Updated description",
        });

      expect(res.status).toBe(400);
    });

    it("updating to an existing network code", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${secondNetworkCode}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "updated-test-network", // code already exists, it's network 1
          name: "Conflict Network",
          description: "This should cause a conflict",
        });

      expect(res.status).toBe(409);
    });

    it("ignore nested gateways in update request", async () => {
      const res = await request(app)
        .patch(`/api/v1/networks/${secondNetworkCode}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: secondNetworkCode,
          name: "Updated with Nested Data",
          description: "Testing nested data ignoring in update",
          gateways: [
            {
              macAddress: "11:22:33:44:55:66",
              name: "Should Be Ignored in Update",
              description: "This gateway should be ignored"
            }
          ]
        });

      expect(res.status).toBe(204);
      
      // check
      const getRes = await request(app)
        .get(`/api/v1/networks/${secondNetworkCode}`)
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(getRes.status).toBe(200);
      expect(getRes.body.name).toBe("Updated with Nested Data");
      const gateways = getRes.body.gateways || [];
      expect(gateways).toHaveLength(0);
    });
  });

  describe("DELETE api network - Delete Network", () => {
    it("viewer tries to delete a network", async () => {
      const res = await request(app)
        .delete(`/api/v1/networks/${secondNetworkCode}`)
        .set("Authorization", `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });

    it("delete a network as operator", async () => {
      const res = await request(app)
        .delete(`/api/v1/networks/${secondNetworkCode}`)
        .set("Authorization", `Bearer ${operatorToken}`);

      expect(res.status).toBe(204);

      const getRes = await request(app)
        .get(`/api/v1/networks/${secondNetworkCode}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });

    it("delete a network as admin", async () => {
      const res = await request(app)
        .delete("/api/v1/networks/updated-test-network")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      const getRes = await request(app)
        .get("/api/v1/networks/updated-test-network")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getRes.status).toBe(404);
    });

    it("deleting non-existent network", async () => {
      const res = await request(app)
        .delete("/api/v1/networks/non-existent-code")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it("no authentication token provided", async () => {
      const res = await request(app)
        .delete("/api/v1/networks/some-network");

      expect(res.status).toBe(401);
    });
  });

});