import request from "supertest";
import { app } from "@app";
import { generateToken } from "@services/authService";
import { beforeAllE2e, afterAllE2e, TEST_USERS } from "@test/e2e/lifecycle";

describe("Sensors API (e2e)", () => {
  let token: string;
  const networkCode = "test-network";
  const gatewayMac = "00:11:22:33:44:55";
  const sensorMac = "71:B1:CE:01:C6:A9";

  beforeAll(async () => {
    await beforeAllE2e();
    token = generateToken(TEST_USERS.admin);

    // Create a network and gateway for testing
    await request(app)
      .post("/api/v1/networks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: networkCode,
        name: "Test Network",
        description: "A test network",
      });

    await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "A test gateway",
      });
  });

  afterAll(async () => {
    await afterAllE2e();
  });

  // Create a sensor
  it("create a sensor", async () => {
    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        macAddress: sensorMac,
        name: "Test Sensor",
        description: "A test sensor",
        variable: "temperature",
        unit: "C",
      });

    expect(res.status).toBe(201);
  });

  it("409 when creating a sensor with a duplicate macAddress", async () => {
    await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        macAddress: sensorMac,
        name: "Duplicate Sensor",
        description: "Duplicate description",
        variable: "temperature",
        unit: "C",
      });

    const res = await request(app)
      .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        macAddress: sensorMac,
        name: "Duplicate Sensor",
        description: "Duplicate description",
        variable: "temperature",
        unit: "C",
      });

    expect(res.status).toBe(409);
  });

  // Retrieve all sensors in a gateway
  it("retrieve all sensors in a gateway", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toMatchObject({
      macAddress: sensorMac,
      name: "Test Sensor",
      description: "A test sensor",
    });
  });

  it("404 for an invalid gatewayMac when retrieving sensors", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/invalid-gateway/sensors`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  // Retrieve a specific sensor by MAC address
  it("retrieve a specific sensor", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      macAddress: sensorMac,
      name: "Test Sensor",
      description: "A test sensor",
    });
  });

  it("404 for a non-existent sensor", async () => {
    const res = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/non-existent-mac`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // Update a sensor
  it("update a sensor", async () => {
    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Updated Sensor",
        description: "Updated description",
        variable: "humidity",
        unit: "%",
      });

    expect(res.status).toBe(204);

    const updatedRes = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/AA:BB:CC:DD:EE:FF`)
      .set("Authorization", `Bearer ${token}`);

    expect(updatedRes.status).toBe(200);
    expect(updatedRes.body).toMatchObject({
      macAddress: "AA:BB:CC:DD:EE:FF",
      name: "Updated Sensor",
      description: "Updated description",
    });
  });

  it("404 when updating a non-existent sensor", async () => {
    const res = await request(app)
      .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/non-existent-mac`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        macAddress: "AA:BB:CC:DD:EE:FF",
        name: "Updated Sensor",
        description: "Updated description",
      });
    expect(res.status).toBe(404);
  });

  // Delete a sensor
  it("delete a sensor", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/AA:BB:CC:DD:EE:FF`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);

    const deletedRes = await request(app)
      .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/AA:BB:CC:DD:EE:FF`)
      .set("Authorization", `Bearer ${token}`);

    expect(deletedRes.status).toBe(404);
  });

  it("should return 404 when deleting a non-existent sensor", async () => {
    const res = await request(app)
      .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/non-existent-mac`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});