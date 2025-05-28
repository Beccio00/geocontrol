import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("Gateways API (e2e)", () => {
  let token: string;
  const networkCode = "test-network";
  const gatewayMac = "00:11:22:33:44:55";

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);

    // Create a network for testing
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: networkCode,
        name: "Test Network",
        description: "A test network",
      });
  });

  afterAll(async () => {
    await afterAllE2e();
  });

//create a gateway

  it("create a gateway", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "A test gateway",
      });

    expect(res.status).toBe(201);
  });

    it("409 when creating a gateway with a duplicate macAddress", async () => {
    await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        macAddress: gatewayMac,
        name: "Duplicate Gateway",
        description: "Duplicate description",
      });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        macAddress: gatewayMac,
        name: "Duplicate Gateway",
        description: "Duplicate description",
      });

    expect(res.status).toBe(409);
  });

// Retrieve all gateways in a network

  it("retrieve all gateways in a network", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toMatchObject({
      macAddress: gatewayMac,
      name: "Test Gateway",
      description: "A test gateway",
    });
  });
  
  it("404 for an invalid networkCode when retrieving gateways", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/invalid-network/gateways`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

// Retrieve a specific gateway by MAC address

  it("retrieve a specific gateway", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      macAddress: gatewayMac,
      name: "Test Gateway",
      description: "A test gateway",
    });
  });

    it("404 for a non-existent gateway", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/non-existent-mac`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

// Update a gateway

  it("update a gateway", async () => {
    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Updated Gateway",
        description: "Updated description",
      });

    expect(res.status).toBe(204);

    const updatedRes = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/AA:BB:CC:DD:EE:FF`)
      .set("Authorization", `Bearer ${token}`);

    expect(updatedRes.status).toBe(200);
    expect(updatedRes.body).toMatchObject({
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Updated Gateway",
      description: "Updated description",
    });
  });

  
  it("404 when updating a non-existent gateway", async () => {
    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/non-existent-mac`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Updated Gateway",
        description: "Updated description",
      });
    expect(res.status).toBe(404);
  });

// Delete a gateway

  it("delete a gateway", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/AA:BB:CC:DD:EE:FF`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);

    const deletedRes = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/AA:BB:CC:DD:EE:FF`)
      .set("Authorization", `Bearer ${token}`);

    expect(deletedRes.status).toBe(404);
  });

  it("should return 404 when deleting a non-existent gateway", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/non-existent-mac`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});