import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as sensorController from "@controllers/sensorController";
import { UserType } from "@models/UserType";
import { Sensor as SensorDTO } from "@dto/Sensor";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@services/authService");
jest.mock("@controllers/sensorController");

describe("Sensor Routes Integration", () => {
  const token = "Bearer faketoken";
  const networkCode = "test-network";
  const gatewayMac = "AA:BB:CC:DD:EE:FF";
  const sensorMac = "71:B1:CE:01:C6:A9";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET sensors - Get All Sensors", () => {
    it("return all sensors for a gateway", async () => {
      const mockSensors: SensorDTO[] = [
        { 
          macAddress: "71:B1:CE:01:C6:A9", 
          name: "Temperature Sensor", 
          description: "External temperature sensor",
          variable: "temperature",
          unit: "C"
        },
        { 
          macAddress: "11:22:33:44:55:77", 
          name: "Humidity Sensor", 
          description: "External humidity sensor",
          variable: "humidity",
          unit: "%"
        }
      ];

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.getAllSensor as jest.Mock).mockResolvedValue(mockSensors);

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSensors);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator, UserType.Viewer
      ]);
      expect(sensorController.getAllSensor).toHaveBeenCalledWith(networkCode, gatewayMac);
    });

    it("network not found", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.getAllSensor as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network with code 'non-existent-network' not found");
      });

      const response = await request(app)
        .get("/api/v1/networks/non-existent-network/gateways/some-mac/sensors")
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("gateway not found", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.getAllSensor as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Gateway with MAC 'non-existent-gateway' not found");
      });

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/non-existent-gateway/sensors`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("no authentication token provided", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });
  });

  describe("GET sensor - Get Specific Sensor", () => {
    it("return specific sensor", async () => {
      const mockSensor: SensorDTO = {
        macAddress: sensorMac,
        name: "Temperature Sensor",
        description: "External temperature sensor",
        variable: "temperature",
        unit: "C"
      };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.getSensorByMac as jest.Mock).mockResolvedValue(mockSensor);

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSensor);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator, UserType.Viewer
      ]);
      expect(sensorController.getSensorByMac).toHaveBeenCalledWith(networkCode, gatewayMac, sensorMac);
    });

    it("non-existent sensor", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.getSensorByMac as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Sensor with MAC 'non-existent-mac' not found");
      });

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/non-existent-mac`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("no authentication token provided", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });
  });

  describe("POST sensors - Create Sensor", () => {
    it("create a sensor", async () => {
      const sensorDto: SensorDTO = {
        macAddress: sensorMac,
        name: "Temperature Sensor",
        description: "External temperature sensor",
        variable: "temperature",
        unit: "C"
      };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.createSensor as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token)
        .send(sensorDto);

      expect(response.status).toBe(201);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator
      ]);
      expect(sensorController.createSensor).toHaveBeenCalledWith(networkCode, gatewayMac, sensorDto);
    });

    it("viewer tries to create sensor", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token)
        .send({
          macAddress: "viewer-sensor-mac",
          name: "Viewer Sensor"
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("creating sensor with duplicate MAC address", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.createSensor as jest.Mock).mockImplementation(() => {
        throw new ConflictError(`Sensor with MAC '${sensorMac}' already exists`);
      });

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token)
        .send({
          macAddress: sensorMac,
          name: "Duplicate Sensor"
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/);
    });

    it("required field 'macAddress' is missing", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token)
        .send({
          name: "Incomplete Sensor",
          description: "Missing MAC address field"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("required field macAddress is empty string (violates minLength)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token)
        .send({
          macAddress: "",
          name: "Empty MAC Sensor"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("sensor with only required fields - 'macAddress'", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.createSensor as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors`)
        .set("Authorization", token)
        .send({
          macAddress: "minimal-sensor-mac"
        });

      expect(response.status).toBe(201);
      expect(sensorController.createSensor).toHaveBeenCalledWith(networkCode, gatewayMac, {
        macAddress: "minimal-sensor-mac"
      });
    });

    it("network not found when creating sensor", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.createSensor as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network with code 'non-existent-network' not found");
      });

      const response = await request(app)
        .post("/api/v1/networks/non-existent-network/gateways/some-mac/sensors")
        .set("Authorization", token)
        .send({
          macAddress: sensorMac,
          name: "Test Sensor"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("gateway not found when creating sensor", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.createSensor as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Gateway with MAC 'non-existent-gateway' not found");
      });

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways/non-existent-gateway/sensors`)
        .set("Authorization", token)
        .send({
          macAddress: sensorMac,
          name: "Test Sensor"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });
  });

  describe("PATCH sensor - Update Sensor", () => {
    it("update sensor successfully - admin/operator", async () => {
      const updatedData = {
        macAddress: "updated-sensor-mac",
        name: "Updated Temperature Sensor",
        description: "Updated description",
        variable: "temperature",
        unit: "F"
      };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", token)
        .send(updatedData);

      expect(response.status).toBe(204);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator
      ]);
      expect(sensorController.updateSensor).toHaveBeenCalledWith(networkCode, gatewayMac, sensorMac, updatedData);
    });

    it("viewer tries to update sensor", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", token)
        .send({
          name: "Viewer Update Attempt"
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("updating non-existent sensor", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Sensor with MAC 'non-existent-mac' not found");
      });

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/non-existent-mac`)
        .set("Authorization", token)
        .send({
          name: "Updated Name"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("update data violates validation - empty macAddress", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", token)
        .send({
          macAddress: "", // violates minLength 1
          name: "Updated Name"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("updating to a sensor MAC that already exists", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
        throw new ConflictError("Sensor with MAC 'existing-mac' already exists");
      });

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", token)
        .send({
          macAddress: "existing-mac",
          name: "Conflict Sensor"
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/);
    });

    it("network not found when updating sensor", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network with code 'non-existent-network' not found");
      });

      const response = await request(app)
        .patch("/api/v1/networks/non-existent-network/gateways/some-mac/sensors/some-sensor")
        .set("Authorization", token)
        .send({
          name: "Updated Name"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("gateway not found when updating sensor", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.updateSensor as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Gateway with MAC 'non-existent-gateway' not found");
      });

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/non-existent-gateway/sensors/${sensorMac}`)
        .set("Authorization", token)
        .send({
          name: "Updated Name"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });
  });

  describe("DELETE sensor - Delete Sensor", () => {
    it("delete sensor successfully - Admin/operator", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.deleteSensorByMac as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", token);

      expect(response.status).toBe(204);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator
      ]);
      expect(sensorController.deleteSensorByMac).toHaveBeenCalledWith(networkCode, gatewayMac, sensorMac);
    });

    it("viewer tries to delete sensor", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", token);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("deleting non-existent sensor", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.deleteSensorByMac as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Sensor with MAC 'non-existent-mac' not found");
      });

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/non-existent-mac`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("network not found when deleting sensor", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.deleteSensorByMac as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network with code 'non-existent-network' not found");
      });

      const response = await request(app)
        .delete("/api/v1/networks/non-existent-network/gateways/some-mac/sensors/some-sensor")
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("gateway not found when deleting sensor", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (sensorController.deleteSensorByMac as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Gateway with MAC 'non-existent-gateway' not found");
      });

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/non-existent-gateway/sensors/${sensorMac}`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("no authentication token provided", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}/sensors/${sensorMac}`)
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });
  });

});