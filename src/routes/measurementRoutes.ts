import { CONFIG } from "@config";
import { authenticateUser } from "@middlewares/authMiddleware";
import AppError from "@models/errors/AppError";
import { UserType } from "@models/UserType";
import { Router } from "express";
import { getMeasuramentsByNetwork } from "@controllers/measurementController";


const router = Router();

// Store a measurement for a sensor (Admin & Operator)
router.post( CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements", authenticateUser([UserType.Admin, UserType.Operator]),(req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve measurements for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve statistics for a specific sensor
router.get(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats", (req, res, next) => {
  throw new AppError("Method not implemented", 500);
});

// Retrieve only outliers for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers",
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve measurements for a set of sensors of a specific network
router.get( CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer] ), async (req, res, next) => {
  try{
    const { sensorMacs, startDate, endDate } = req.query;
    
    const sensorMacArray = typeof sensorMacs === "string" ? [sensorMacs] : Array.isArray(sensorMacs) ? sensorMacs as string[] : undefined;

    const measurements = await getMeasuramentsByNetwork(
      req.params.networkCode,
      sensorMacArray,
      startDate as string | undefined,
      endDate as string | undefined
    );

    res.status(200).json(measurements);

  } catch (error) {
    next(error); 
  }
});

// Retrieve statistics for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

export default router;

