import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as gatewayController from "@controllers/gatewayController";
import { UserType } from "@models/UserType";
import { Gateway as GatewayDTO } from "@dto/Gateway";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@services/authService");
jest.mock("@controllers/gatewayController");

describe("Gateway Routes Integration", () => {
  const token = "Bearer faketoken";
  const networkCode = "test-network";
  const gatewayMac = "AA:BB:CC:DD:EE:FF";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET gateways - Get All Gateways", () => {
    it("return all gateways for a network", async () => {
      const mockGateways: GatewayDTO[] = [
        { 
          macAddress: "AA:BB:CC:DD:EE:FF", 
          name: "Gateway 1", 
          description: "First gateway",
          sensors: []
        },
        { 
          macAddress: "11:22:33:44:55:66", 
          name: "Gateway 2", 
          description: "Second gateway",
          sensors: []
        }
      ];

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.getAllGateways as jest.Mock).mockResolvedValue(mockGateways);

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGateways);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator, UserType.Viewer
      ]);
      expect(gatewayController.getAllGateways).toHaveBeenCalledWith(networkCode);
    });

    it("network not found", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.getAllGateways as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network with code 'non-existent-network' not found");
      });

      const response = await request(app)
        .get("/api/v1/networks/non-existent-network/gateways")
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("no authentication token provided", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });
  });

  describe("GET gateway - Get Specific Gateway", () => {
    it("return specific gateway", async () => {
      const mockGateway: GatewayDTO = {
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "A test gateway",
        sensors: []
      };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.getGateway as jest.Mock).mockResolvedValue(mockGateway);

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockGateway);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator, UserType.Viewer
      ]);
      expect(gatewayController.getGateway).toHaveBeenCalledWith(networkCode, gatewayMac);
    });

    it("non-existent gateway", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.getGateway as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Gateway with MAC 'non-existent-mac' not found");
      });

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/non-existent-mac`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("no authentication token provided", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });
  });

  describe("POST gateways - Create Gateway", () => {
    it("create a gateway", async () => {
      const gatewayDto: GatewayDTO = {
        macAddress: gatewayMac,
        name: "Test Gateway",
        description: "A test gateway",
        sensors: []
      };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.createGateway as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send(gatewayDto);

      expect(response.status).toBe(201);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator
      ]);
      expect(gatewayController.createGateway).toHaveBeenCalledWith(networkCode, gatewayDto);
    });

    it("viewer tries to create gateway", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send({
          macAddress: "viewer-gateway-mac",
          name: "Viewer Gateway"
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("creating gateway with duplicate MAC address", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
        throw new ConflictError(`Gateway with MAC '${gatewayMac}' already exists`);
      });

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send({
          macAddress: gatewayMac,
          name: "Duplicate Gateway"
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/);
    });

    it("required field 'macAddress' is missing", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send({
          name: "Incomplete Gateway",
          description: "Missing MAC address field"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("required field macAddress is empty string (violates minLength)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send({
          macAddress: "",
          name: "Empty MAC Gateway"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("gateway with only required fields - 'macAddress'", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.createGateway as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post(`/api/v1/networks/${networkCode}/gateways`)
        .set("Authorization", token)
        .send({
          macAddress: "minimal-gateway-mac"
        });

      expect(response.status).toBe(201);
      expect(gatewayController.createGateway).toHaveBeenCalledWith(networkCode, {
        macAddress: "minimal-gateway-mac"
      });
    });

    it("network not found when creating gateway", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.createGateway as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network with code 'non-existent-network' not found");
      });

      const response = await request(app)
        .post("/api/v1/networks/non-existent-network/gateways")
        .set("Authorization", token)
        .send({
          macAddress: gatewayMac,
          name: "Test Gateway"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });
  });

  describe("PATCH gateway - Update Gateway", () => {
    it("update gateway successfully - admin/operator", async () => {
      const updatedData = {
        macAddress: "updated-gateway-mac",
        name: "Updated Test Gateway",
        description: "Updated description"
      };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.updateGateway as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token)
        .send(updatedData);

      expect(response.status).toBe(204);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator
      ]);
      expect(gatewayController.updateGateway).toHaveBeenCalledWith(networkCode, gatewayMac, updatedData);
    });

    it("viewer tries to update gateway", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token)
        .send({
          name: "Viewer Update Attempt"
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("updating non-existent gateway", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Gateway with MAC 'non-existent-mac' not found");
      });

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/non-existent-mac`)
        .set("Authorization", token)
        .send({
          name: "Updated Name"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("update data violates with empty macAddress", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token)
        .send({
          macAddress: "", // violates minLength 1
          name: "Updated Name"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("updating to a gateway MAC that already exists", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
        throw new ConflictError("Gateway with MAC 'existing-mac' already exists");
      });

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token)
        .send({
          macAddress: "existing-mac",
          name: "Conflict Gateway"
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/);
    });

    it("network not found when updating gateway", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.updateGateway as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network with code 'non-existent-network' not found");
      });

      const response = await request(app)
        .patch("/api/v1/networks/non-existent-network/gateways/some-mac")
        .set("Authorization", token)
        .send({
          name: "Updated Name"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });
  });

  describe("DELETE gateways - Delete Gateway", () => {
    it("delete gateway successfully - Admin/operator", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.deleteGateway as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token);

      expect(response.status).toBe(204);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator
      ]);
      expect(gatewayController.deleteGateway).toHaveBeenCalledWith(networkCode, gatewayMac);
    });

    it("viewer tries to delete gateway", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", token);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("deleting non-existent gateway", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.deleteGateway as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Gateway with MAC 'non-existent-mac' not found");
      });

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/non-existent-mac`)
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("network not found when deleting gateway", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (gatewayController.deleteGateway as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network with code 'non-existent-network' not found");
      });

      const response = await request(app)
        .delete("/api/v1/networks/non-existent-network/gateways/some-mac")
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("no authentication token provided", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}/gateways/${gatewayMac}`)
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });
  });

});