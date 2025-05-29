import request from "supertest";
import { app } from "@app";
import * as authService from "@services/authService";
import * as networkController from "@controllers/networkController";
import { UserType } from "@models/UserType";
import { Network as NetworkDTO } from "@dto/Network";
import { UnauthorizedError } from "@models/errors/UnauthorizedError";
import { InsufficientRightsError } from "@models/errors/InsufficientRightsError";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

jest.mock("@services/authService");
jest.mock("@controllers/networkController");

describe("Network Routes Integration", () => {
  const token = "Bearer faketoken";
  const networkCode = "test-network";
  const secondNetworkCode = "second-network";

  afterEach(() => {
    jest.clearAllMocks();
  });

  

  describe("GET networks - Get All Networks", () => {
    it("return all networks", async () => {
      const mockNetworks: NetworkDTO[] = [
        { code: "NET1", name: "Network 1", description: "Description 1", gateways: [] },
        { code: "NET2", name: "Network 2", description: "Description 2", gateways: [] }
      ];

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.getAllNetworks as jest.Mock).mockResolvedValue(mockNetworks);

      const response = await request(app)
        .get("/api/v1/networks")
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNetworks);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator, UserType.Viewer
      ]);
      expect(networkController.getAllNetworks).toHaveBeenCalled();
    });

    it("no authentication token provided", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app)
        .get("/api/v1/networks")
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });
  });



  describe("GET network - Get Specific Network", () => {
    it("return specific network", async () => {
      const mockNetwork: NetworkDTO = {
        code: networkCode,
        name: "Test Network",
        description: "A test network",
        gateways: []
      };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.getNetwork as jest.Mock).mockResolvedValue(mockNetwork);

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}`)
        .set("Authorization", token);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNetwork);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator, UserType.Viewer
      ]);
      expect(networkController.getNetwork).toHaveBeenCalledWith(networkCode);
    });

    it("non-existent network", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.getNetwork as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network with code 'non-existent-code' not found");
      });

      const response = await request(app)
        .get("/api/v1/networks/non-existent-code")
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("no authentication token provided", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app)
        .get(`/api/v1/networks/${networkCode}`)
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });
  });



  describe("POST networks - Create Network", () => {
    it("create a network", async () => {
      const networkDto: NetworkDTO = {
        code: networkCode,
        name: "Test Network",
        description: "A test network",
        gateways: []
      };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.createNetwork as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", token)
        .send(networkDto);

      expect(response.status).toBe(201);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator
      ]);
      expect(networkController.createNetwork).toHaveBeenCalledWith(networkDto);
    });

    it("viewer tries to create network", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", token)
        .send({
          code: "viewer-network",
          name: "Viewer Network"
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("creating network with duplicate code", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.createNetwork as jest.Mock).mockImplementation(() => {
        throw new ConflictError(`Network with code '${networkCode}' already exists`);
      });

      const response = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", token)
        .send({
          code: networkCode,
          name: "Duplicate Network"
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/);
    });

    it("required field 'code' is missing", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", token)
        .send({
          name: "Incomplete Network",
          description: "Missing code field"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("required field code is empty string (violates minLength)", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", token)
        .send({
          code: "",
          name: "Empty Code Network"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("network with only required fields - 'code' ", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.createNetwork as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/v1/networks")
        .set("Authorization", token)
        .send({
          code: "minimal-network"
        });

      expect(response.status).toBe(201);
      expect(networkController.createNetwork).toHaveBeenCalledWith({
        code: "minimal-network"
      });
    });

  });


  describe("PATCH network - Update Network", () => {
    it("update network successfully - admin/operator", async () => {
      const updatedData = {
        code: "updated-test-network",
        name: "Updated Test Network",
        description: "Updated description"
      };

      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.updateNetwork as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}`)
        .set("Authorization", token)
        .send(updatedData);

      expect(response.status).toBe(204);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator
      ]);
      expect(networkController.updateNetwork).toHaveBeenCalledWith(networkCode, updatedData);
    });

    it("viewer tries to update network", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}`)
        .set("Authorization", token)
        .send({
          name: "Viewer Update Attempt"
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("updating non-existent network", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network with code 'non-existent-code' not found");
      });

      const response = await request(app)
        .patch("/api/v1/networks/non-existent-code")
        .set("Authorization", token)
        .send({
          name: "Updated Name"
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("pdate data violates validation - empty code", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}`)
        .set("Authorization", token)
        .send({
          code: "", // viola minLength 1
          name: "Updated Name"
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("updating to a network code that already exists", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.updateNetwork as jest.Mock).mockImplementation(() => {
        throw new ConflictError("Network with code 'existing-code' already exists");
      });

      const response = await request(app)
        .patch(`/api/v1/networks/${networkCode}`)
        .set("Authorization", token)
        .send({
          code: "existing-code",
          name: "Conflict Network"
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toMatch(/already exists/);
    });
    
  });

  describe("DELETE network - Delete Network", () => {
    it("delete network successfully - Admin/operator", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.deleteNetwork as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}`)
        .set("Authorization", token);

      expect(response.status).toBe(204);
      expect(authService.processToken).toHaveBeenCalledWith(token, [
        UserType.Admin, UserType.Operator
      ]);
      expect(networkController.deleteNetwork).toHaveBeenCalledWith(networkCode);
    });

    it("viewer tries to delete network", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new InsufficientRightsError("Forbidden: Insufficient rights");
      });

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}`)
        .set("Authorization", token);

      expect(response.status).toBe(403);
      expect(response.body.message).toMatch(/Insufficient rights/);
    });

    it("deleting non-existent network", async () => {
      (authService.processToken as jest.Mock).mockResolvedValue(undefined);
      (networkController.deleteNetwork as jest.Mock).mockImplementation(() => {
        throw new NotFoundError("Network with code 'non-existent-code' not found");
      });

      const response = await request(app)
        .delete("/api/v1/networks/non-existent-code")
        .set("Authorization", token);

      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/);
    });

    it("no authentication token provided", async () => {
      (authService.processToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedError("Unauthorized: No token provided");
      });

      const response = await request(app)
        .delete(`/api/v1/networks/${networkCode}`)
        .set("Authorization", "Bearer invalid");

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Unauthorized/);
    });
  });

});