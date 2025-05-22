import { CONFIG } from "@config";
import AppError from "@models/errors/AppError";
import { Router } from "express";
import { createMeasurementController, getMeasurementsBySensorController, getMeasurementsBySensorsAndNetworkController, getNetworkOutliersController, getNetworkStatsController, getSensorOutliersController, getSensorStatsController, storeMeasurementsController } from "@controllers/measurementController";
import { authenticateUser } from "@middlewares/authMiddleware";
import { UserType } from "@models/UserType";
import { MeasurementFromJSON } from "@models/dto/Measurement";
import { SensorFromJSON } from "@models/dto/Sensor";

const router = Router();

// Store a measurement for a sensor (Admin & Operator)
router.post(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements",authenticateUser([UserType.Admin, UserType.Operator]),
  async (req, res, next) => {
    try {
      const measurements = req.body.map((measurement: any) => MeasurementFromJSON(measurement));
      await storeMeasurementsController(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, measurements);
      res.status(201).send();
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve measurements for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/measurements", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const measurements = await getMeasurementsBySensorController(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(measurements);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a specific sensor
router.get(CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/stats", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const stats =await getSensorStatsController(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
});

// Retrieve only outliers for a specific sensor
router.get(
  CONFIG.ROUTES.V1_SENSORS + "/:sensorMac/outliers", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async(req, res, next) => {
    try {
      const outliers = await getSensorOutliersController(req.params.networkCode, req.params.gatewayMac, req.params.sensorMac, req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(outliers);
    } catch (error) {
      next(error);
    } 
  }
);

// Retrieve measurements for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/measurements", authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async(req, res, next) => {
    try {
      const measurements = await getMeasurementsBySensorsAndNetworkController(req.params.networkCode, req.query.sensorMacs as string[], req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(measurements);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve statistics for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/stats",authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const stats = await getNetworkStatsController(req.params.networkCode, req.query.sensorMacs as string[], req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// Retrieve only outliers for a set of sensors of a specific network
router.get(
  CONFIG.ROUTES.V1_NETWORKS + "/:networkCode/outliers",authenticateUser([UserType.Admin, UserType.Operator, UserType.Viewer]),
  async (req, res, next) => {
    try {
      const outliers = await getNetworkOutliersController(req.params.networkCode, req.query.sensorMacs as string[], req.query.startDate as string, req.query.endDate as string);
      res.status(200).json(outliers);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
