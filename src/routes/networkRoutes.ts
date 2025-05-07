import AppError from "@models/errors/AppError";
import { Router } from "express";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import { error } from "console";
import { 
  getAllNetworks
} from "@controllers/networkController"
import { NetworkFromJSON } from "@models/dto/Network";

const router = Router();


// Get all networks (Any authenticated user)
router.get("", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]), async (req, res, next) => {
  try{
    res.status(200).json( await getAllNetworks());
  }catch (error) {
    next(error);
  }
});

// Create a new network (Admin & Operator)
router.post("", authenticateUser([UserType.Admin, UserType.Operator]), (req, res, next) => {
  try {
    await createNetwork(NetworkFromJSON(req.body));
    res.status(201).send()
  } catch (error) {
    next(error);
  }
});

// Get a specific network (Any authenticated user)
router.get("/:networkCode", (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

// Update a network (Admin & Operator)
router.patch("/:networkCode", (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

// Delete a network (Admin & Operator)
router.delete("/:networkCode", (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

export default router;
