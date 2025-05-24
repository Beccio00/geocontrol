import { CONFIG } from "@config";
import { getMeasurementsBySensor, getOutliersBySensor, getStatisticsBySensor, storeMeasurement } from "@controllers/measurementController";
import { authenticateUser } from "@middlewares/authMiddleware";
import { MeasurementFromJSON } from "@models/dto/Measurement";
import AppError from "@models/errors/AppError";
import { UserType } from "@models/UserType";
import { Router } from "express";
//import { getMeasuramentsByNetwork } from "@controllers/measurementController";


const router = Router();

// Store a measurement for a sensor (Admin & Operator)
router.post( 
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements", 
  authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {      
      await storeMeasurement(
        req.params.networkCode, 
        req.params.gatewayMac, 
        req.params.sensorMac,
        req.body.map((measurement: any) => MeasurementFromJSON(measurement))
      );
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve measurements for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      res.status(200).json(      
        await getMeasurementsBySensor(
          req.params.networkCode,
          req.params.gatewayMac, 
          req.params.sensorMac, 
          req.query.startDate as string, 
          req.query.endDate as string
        )
      );
    } catch (error) {
      next(error);
    }  
  }
);

// Retrieve statistics for a specific sensor
router.get(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
  try {
    res.status(200).json(      
      await getStatisticsBySensor(
        req.params.networkCode,
        req.params.gatewayMac, 
        req.params.sensorMac, 
        req.query.startDate as string, 
        req.query.endDate as string
      )
    );    
  } catch (error) {
    next(error)
  }
});

// Retrieve only outliers for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      res.status(200).json(      
        await getOutliersBySensor(
          req.params.networkCode,
          req.params.gatewayMac, 
          req.params.sensorMac, 
          req.query.startDate as string, 
          req.query.endDate as string
        )
      );
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve measurements for a set of sensors of a specific network
router.get( CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer] ), 
  async (req, res, next) => {
  /* try{
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
  } */
});

// Retrieve statistics for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",
  authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  (req, res, next) => {
    throw new AppError("Method not implemented", 500);
  }
);

export default router;

