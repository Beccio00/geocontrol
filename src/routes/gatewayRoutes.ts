import AppError from "@models/errors/AppError";
import { Router } from "express";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import { 
  getAllGateways,
  createGateway,
  getGateway,
  updateGateway,
  deleteGateway
} from "@controllers/gatewayController";
import { GatewayFromJSON } from "@models/dto/Gateway";

const router = Router({ mergeParams: true });

// Get all gateways (Any authenticated user)
router.get("", (req, res, next) => {
  try {
    const networkCode = req.params.networkCode;
    getAllGateways(networkCode)
      .then(gateways => res.status(200).json(gateways))
      .catch(error => next(error));
  } catch (error) {
    next(error);
  }
});
/* 
router.get("", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]), async (req, res, next) => {
  try {
    const networkCode = req.params.networkCode;
    res.status(200).json(await getAllGateways(networkCode));
  } catch (error) {
    next(error);
  }
});
 */

// Create a new gateway (Admin & Operator)
router.post("", (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

// Get a specific gateway (Any authenticated user)
router.get("/:gatewayMac", (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

// Update a gateway (Admin & Operator)
router.patch("/:gatewayMac", (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

// Delete a gateway (Admin & Operator)
router.delete("/:gatewayMac", (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

export default router;
